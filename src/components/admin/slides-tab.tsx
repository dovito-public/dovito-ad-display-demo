"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tv,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Slide, DisplaySetting } from "@/lib/schema";

const slideSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  advertisementImageUrl: z.string().optional(),
  qrUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  isVisible: z.boolean().optional().default(true),
  durationSeconds: z.number().min(5).max(300).optional().default(30),
  anchorPosition: z.enum(["top", "bottom"]).optional().default("bottom"),
  scheduleDays: z.array(z.number().min(0).max(6)).optional().default([]),
  scheduleHours: z.object({ start: z.number(), end: z.number() }).nullable().optional().default(null),
});

type SlideFormData = z.input<typeof slideSchema>;

export function SlidesTab() {
  const queryClient = useQueryClient();
  const [isSlideDialogOpen, setIsSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [uploadedAdFile, setUploadedAdFile] = useState<File | null>(null);
  const [adPreview, setAdPreview] = useState<string | null>(null);

  const slideForm = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      businessName: "",
      advertisementImageUrl: "",
      qrUrl: "",
      isVisible: true,
      durationSeconds: 30,
      anchorPosition: "bottom",
      scheduleDays: [],
      scheduleHours: null,
    },
  });

  // Fetch slides
  const { data: slides = [], isLoading: slidesLoading } = useQuery<Slide[]>({
    queryKey: ["/api/slides"],
    queryFn: async () => {
      const res = await fetch("/api/slides");
      if (!res.ok) throw new Error("Failed to fetch slides");
      return res.json();
    },
    retry: false,
  });

  // Fetch display settings (for default duration)
  const { data: displaySettings = [] } = useQuery<DisplaySetting[]>({
    queryKey: ["/api/display-settings"],
    queryFn: async () => {
      const res = await fetch("/api/display-settings");
      if (!res.ok) throw new Error("Failed to fetch display settings");
      return res.json();
    },
    retry: false,
  });

  const getDisplaySettingValue = (key: string, defaultValue: number | string): number | string => {
    const setting = displaySettings.find((s) => s.setting_key === key);
    return setting ? (setting.setting_value as number | string) : defaultValue;
  };

  // Create manual slide mutation
  const createSlideMutation = useMutation({
    mutationFn: async (data: SlideFormData) => {
      const formData = new FormData();
      formData.append("businessName", data.businessName);
      formData.append("durationSeconds", (data.durationSeconds ?? 30).toString());
      if (data.qrUrl) formData.append("qrUrl", data.qrUrl);
      if (uploadedAdFile) {
        formData.append("advertisementImage", uploadedAdFile);
      }
      if (data.advertisementImageUrl) {
        formData.append("imageUrl", data.advertisementImageUrl);
      }
      formData.append("scheduleDays", JSON.stringify(data.scheduleDays ?? []));
      formData.append("scheduleHours", JSON.stringify(data.scheduleHours ?? null));

      const res = await fetch("/api/slides/manual", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create slide");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast.success("Slide Created", {
        description: "Manual slide has been created successfully.",
      });
      setIsSlideDialogOpen(false);
      slideForm.reset();
      setUploadedAdFile(null);
      setAdPreview(null);
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to create slide.",
      });
    },
  });

  // Update slide mutation
  const updateSlideMutation = useMutation({
    mutationFn: async (
      data: { id: number } & Record<string, unknown>
    ) => {
      const { id, ...updateData } = data;
      const res = await fetch(`/api/slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update slide");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      setIsSlideDialogOpen(false);
      setEditingSlide(null);
      slideForm.reset();
      setUploadedAdFile(null);
      setAdPreview(null);
      toast.success("Slide Updated", {
        description: "The slide has been updated successfully.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to update slide.",
      });
    },
  });

  // Slide reordering mutation
  const reorderSlidesMutation = useMutation({
    mutationFn: async (
      slideOrderUpdates: { id: number; display_order: number }[]
    ) => {
      const res = await fetch("/api/slides/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideOrderUpdates }),
      });
      if (!res.ok) throw new Error("Failed to reorder slides");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast.success("Success", {
        description: "Slides reordered successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const handleMoveSlide = (slideId: number, direction: "up" | "down") => {
    if (!slides || slides.length === 0) return;
    const slideIndex = slides.findIndex((slide) => slide.id === slideId);
    if (slideIndex === -1) return;
    const newIndex = direction === "up" ? slideIndex - 1 : slideIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[slideIndex], newSlides[newIndex]] = [
      newSlides[newIndex],
      newSlides[slideIndex],
    ];

    const slideOrderUpdates = newSlides.map((slide, index) => ({
      id: slide.id,
      display_order: index + 1,
    }));

    reorderSlidesMutation.mutate(slideOrderUpdates);
  };

  const handleSlideFormSubmit = (data: SlideFormData) => {
    if (editingSlide) {
      const updateData: Record<string, unknown> = {
        businessName: data.businessName,
        qrUrl: data.qrUrl,
        durationSeconds: data.durationSeconds,
        isVisible: data.isVisible,
        anchorPosition: data.anchorPosition,
        scheduleDays: data.scheduleDays ?? [],
        scheduleHours: data.scheduleHours ?? null,
      };

      if (uploadedAdFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("businessName", data.businessName);
        formData.append("qrUrl", data.qrUrl || "");
        formData.append("durationSeconds", (data.durationSeconds ?? 30).toString());
        formData.append("isVisible", (data.isVisible ?? true).toString());
        formData.append("anchorPosition", data.anchorPosition ?? "bottom");
        formData.append("scheduleDays", JSON.stringify(data.scheduleDays ?? []));
        formData.append("scheduleHours", JSON.stringify(data.scheduleHours ?? null));
        formData.append("advertisementImage", uploadedAdFile);

        fetch(`/api/slides/${editingSlide.id}`, {
          method: "PATCH",
          body: formData,
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
          setIsSlideDialogOpen(false);
          setEditingSlide(null);
          slideForm.reset();
          setUploadedAdFile(null);
          setAdPreview(null);
          toast.success("Slide Updated", {
            description: "The slide has been updated successfully.",
          });
        });
      } else {
        updateSlideMutation.mutate({ id: editingSlide.id, ...updateData });
      }
    } else {
      createSlideMutation.mutate(data);
    }
  };

  const resetSlideForm = () => {
    setEditingSlide(null);
    slideForm.reset({
      businessName: "",
      advertisementImageUrl: "",
      qrUrl: "",
      isVisible: true,
      durationSeconds: 30,
      anchorPosition: "bottom",
      scheduleDays: [],
      scheduleHours: null,
    });
    setUploadedAdFile(null);
    setAdPreview(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <CardTitle>Advertising Slides</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            <span className="hidden sm:inline">
              Manage slide display order with up/down arrows -- Visible slides
              appear in the live display
            </span>
            <span className="sm:hidden">Manage slide order and visibility</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Dialog
            open={isSlideDialogOpen}
            onOpenChange={setIsSlideDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetSlideForm}>
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Create Slide</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  {editingSlide ? "Edit Slide" : "Create Manual Slide"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <Form {...slideForm}>
                  <form
                    onSubmit={slideForm.handleSubmit(handleSlideFormSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={slideForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter business name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slideForm.control}
                      name="durationSeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              max="300"
                              value={
                                field.value ||
                                getDisplaySettingValue("slideInterval", 30)
                              }
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 30)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slideForm.control}
                      name="qrUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>QR Code URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourbusiness.com"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Advertisement Image Upload */}
                    <div className="space-y-4">
                      <FormLabel>
                        Advertisement Image (16:9 aspect ratio recommended)
                      </FormLabel>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Upload advertisement image
                              </span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setUploadedAdFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      setAdPreview(
                                        ev.target?.result as string
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-500">
                        -- OR --
                      </div>

                      <FormField
                        control={slideForm.control}
                        name="advertisementImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  if (e.target.value) {
                                    setUploadedAdFile(null);
                                    setAdPreview(null);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(adPreview ||
                        (editingSlide &&
                          editingSlide.advertisement_image_url) ||
                        slideForm.getValues("advertisementImageUrl")) && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Preview:
                          </p>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-md">
                            <img
                              src={
                                adPreview ||
                                slideForm.getValues(
                                  "advertisementImageUrl"
                                ) ||
                                editingSlide?.advertisement_image_url ||
                                ""
                              }
                              alt="Advertisement preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={slideForm.control}
                      name="anchorPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dovito Pill Position</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              {...field}
                            >
                              <option value="bottom">Bottom (Default)</option>
                              <option value="top">Top</option>
                            </select>
                          </FormControl>
                          <div className="text-xs text-muted-foreground mt-1">
                            Position of the &quot;explore the community with
                            dovito&quot; pill
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Schedule (optional) */}
                    <div className="space-y-3">
                      <FormLabel>Schedule (optional)</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Leave blank to show 24/7. Select days and/or hours to restrict display time.
                      </div>

                      {/* Day toggles */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Days</div>
                        <div className="flex gap-1">
                          {[
                            { label: "S", day: 0 },
                            { label: "M", day: 1 },
                            { label: "T", day: 2 },
                            { label: "W", day: 3 },
                            { label: "T", day: 4 },
                            { label: "F", day: 5 },
                            { label: "S", day: 6 },
                          ].map(({ label, day }) => {
                            const days = slideForm.watch("scheduleDays") ?? [];
                            const active = days.includes(day);
                            return (
                              <Button
                                key={day}
                                type="button"
                                variant={active ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0 text-xs"
                                onClick={() => {
                                  const current = slideForm.getValues("scheduleDays") ?? [];
                                  slideForm.setValue(
                                    "scheduleDays",
                                    active
                                      ? current.filter((d) => d !== day)
                                      : [...current, day].sort((a, b) => a - b)
                                  );
                                }}
                              >
                                {label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hour range */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Hours (0–23)</div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={23}
                            placeholder="Start"
                            className="w-20 h-8 text-sm"
                            value={slideForm.watch("scheduleHours")?.start ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                slideForm.setValue("scheduleHours", null);
                              } else {
                                const current = slideForm.getValues("scheduleHours");
                                slideForm.setValue("scheduleHours", {
                                  start: parseInt(val),
                                  end: current?.end ?? 17,
                                });
                              }
                            }}
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="number"
                            min={0}
                            max={23}
                            placeholder="End"
                            className="w-20 h-8 text-sm"
                            value={slideForm.watch("scheduleHours")?.end ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                slideForm.setValue("scheduleHours", null);
                              } else {
                                const current = slideForm.getValues("scheduleHours");
                                slideForm.setValue("scheduleHours", {
                                  start: current?.start ?? 8,
                                  end: parseInt(val),
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsSlideDialogOpen(false);
                          resetSlideForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createSlideMutation.isPending ||
                          updateSlideMutation.isPending
                        }
                      >
                        {editingSlide
                          ? updateSlideMutation.isPending
                            ? "Updating..."
                            : "Update Slide"
                          : createSlideMutation.isPending
                            ? "Creating..."
                            : "Create Slide"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {slidesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading slides...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-8">
            <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No slides yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide: Slide) => (
              <Card key={slide.id} className="border-l-4 border-l-purple-600">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold truncate">
                            {slide.business_name || `Slide ${slide.id}`}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1 sm:mb-2 truncate">
                            {slide.qr_url
                              ? `QR: ${slide.qr_url}`
                              : "No QR code"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Duration: {slide.duration_seconds}s --{" "}
                            {slide.application_id
                              ? "From Application"
                              : "Manual Slide"}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          {/* Reordering Controls */}
                          <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMoveSlide(slide.id, "up")
                              }
                              disabled={
                                slides.findIndex(
                                  (s) => s.id === slide.id
                                ) === 0 ||
                                reorderSlidesMutation.isPending
                              }
                              className="p-1 h-8 w-8"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMoveSlide(slide.id, "down")
                              }
                              disabled={
                                slides.findIndex(
                                  (s) => s.id === slide.id
                                ) ===
                                  slides.length - 1 ||
                                reorderSlidesMutation.isPending
                              }
                              className="p-1 h-8 w-8"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Preview Thumbnail */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="relative cursor-pointer group border-2 border-gray-200 rounded-lg overflow-hidden">
                                {slide.advertisement_image_url ? (
                                  <div className="relative">
                                    <img
                                      src={slide.advertisement_image_url}
                                      alt={`Slide for ${slide.business_name}`}
                                      className="w-20 h-12 sm:w-24 sm:h-14 object-cover group-hover:opacity-80 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                                      <ExternalLink className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-20 h-12 sm:w-24 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium group-hover:opacity-80 transition-opacity">
                                    <div className="text-center">
                                      <div className="truncate text-[8px] font-bold">
                                        {slide.business_name}
                                      </div>
                                      <div className="truncate text-[6px]">
                                        No Image
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Slide Preview - {slide.business_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {slide.advertisement_image_url ? (
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={slide.advertisement_image_url}
                                      alt={`Slide for ${slide.business_name}`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                    <div className="text-center">
                                      <h2 className="text-4xl font-bold mb-2">
                                        {slide.business_name}
                                      </h2>
                                      <p className="text-xl mb-4">
                                        No advertisement image uploaded
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>Business:</strong>{" "}
                                      {slide.business_name}
                                    </p>
                                    <p>
                                      <strong>Duration:</strong>{" "}
                                      {slide.duration_seconds}s
                                    </p>
                                    <p>
                                      <strong>QR URL:</strong>{" "}
                                      {slide.qr_url || "Not provided"}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      {slide.application_id
                                        ? "From Application"
                                        : "Manual Slide"}
                                    </p>
                                    <p>
                                      <strong>Visible:</strong>{" "}
                                      {slide.is_visible ? "Yes" : "No"}
                                    </p>
                                    <p>
                                      <strong>Created:</strong>{" "}
                                      {slide.created_at
                                        ? new Date(
                                            slide.created_at
                                          ).toLocaleDateString()
                                        : "Unknown"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Visible</span>
                        <Switch
                          checked={slide.is_visible ?? false}
                          onCheckedChange={(checked) => {
                            fetch(`/api/slides/${slide.id}/visibility`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ isVisible: checked }),
                            }).then(() => {
                              queryClient.invalidateQueries({
                                queryKey: ["/api/slides"],
                              });
                              toast.success("Slide updated", {
                                description: `Slide ${checked ? "shown" : "hidden"} successfully`,
                              });
                            });
                          }}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSlide(slide);
                          slideForm.reset({
                            businessName: slide.business_name || "",
                            advertisementImageUrl:
                              slide.advertisement_image_url || "",
                            qrUrl: slide.qr_url || "",
                            isVisible: slide.is_visible ?? false,
                            durationSeconds: slide.duration_seconds || 30,
                            anchorPosition:
                              (slide.anchor_position as "top" | "bottom") ||
                              "bottom",
                            scheduleDays: (slide.schedule_days as number[]) ?? [],
                            scheduleHours: (slide.schedule_hours as { start: number; end: number } | null) ?? null,
                          });
                          setIsSlideDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this slide?"
                            )
                          ) {
                            fetch(`/api/slides/${slide.id}`, {
                              method: "DELETE",
                            }).then(() => {
                              queryClient.invalidateQueries({
                                queryKey: ["/api/slides"],
                              });
                              toast.success("Slide deleted", {
                                description: "Slide removed successfully",
                              });
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
