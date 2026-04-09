"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Image,
  ExternalLink,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { Application } from "@/lib/schema";

export function ApplicationsTab() {
  const queryClient = useQueryClient();
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [denyDialogApp, setDenyDialogApp] = useState<number | null>(null);
  const [denyInternalNotes, setDenyInternalNotes] = useState("");
  const [denyPublicReason, setDenyPublicReason] = useState("");

  // Fetch applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    retry: false,
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
      publicReason,
    }: {
      id: number;
      status: string;
      adminNotes?: string;
      publicReason?: string;
    }) => {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes, publicReason }),
      });
      if (!res.ok) throw new Error("Failed to update application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast.success("Application Updated", {
        description: "The application status has been updated successfully.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to update application status.",
      });
    },
  });

  // Delete application mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast.success("Application Deleted", {
        description:
          "Application and associated slides have been deleted successfully.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to delete application.",
      });
    },
  });

  // Upload images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: async ({
      applicationId,
      files,
    }: {
      applicationId: number;
      files: FileList;
    }) => {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
      const res = await fetch(
        `/api/applications/${applicationId}/upload-images`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed to upload images");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast.success("Images Uploaded", {
        description: `Successfully uploaded ${data.imageUrls?.length || 0} image(s).`,
      });
    },
    onError: (error: Error) => {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload images.",
      });
    },
  });

  const handleImageUpload = (
    applicationId: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid File", {
          description: `${file.name} is not an image file.`,
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: `${file.name} exceeds 5MB limit.`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const dt = new DataTransfer();
    validFiles.forEach((file) => dt.items.add(file));
    uploadImagesMutation.mutate({ applicationId, files: dt.files });
  };

  const handleApproveApplication = (id: number) => {
    updateApplicationMutation.mutate({ id, status: "approved" });
  };

  const handleDenyApplication = (id: number) => {
    setDenyDialogApp(id);
    setDenyInternalNotes("");
    setDenyPublicReason("");
  };

  const handleDenyConfirm = () => {
    if (denyDialogApp === null) return;
    updateApplicationMutation.mutate({
      id: denyDialogApp,
      status: "denied",
      adminNotes: denyInternalNotes || undefined,
      publicReason: denyPublicReason || undefined,
    });
    setDenyDialogApp(null);
  };

  const handleCopyCheckoutLink = async (application: Application) => {
    const checkoutUrl = `${window.location.origin}/checkout`;
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      toast.success("Link Copied", {
        description: `Checkout link copied. Send this to ${application.contact_email}`,
      });
    } catch {
      toast.error("Copy Failed", {
        description: "Unable to copy link to clipboard.",
      });
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "approved":
        return "default";
      case "denied":
        return "destructive";
      case "pending":
      case "pending_approval":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <>
    <Dialog open={denyDialogApp !== null} onOpenChange={(open) => { if (!open) setDenyDialogApp(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="deny-internal-notes">Internal Notes <span className="text-gray-400 font-normal">(admin only, never emailed)</span></Label>
            <Textarea
              id="deny-internal-notes"
              placeholder="e.g. competitor, spam account..."
              value={denyInternalNotes}
              onChange={(e) => setDenyInternalNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deny-public-reason">Reason for Applicant <span className="text-gray-400 font-normal">(optional, shown in email)</span></Label>
            <Textarea
              id="deny-public-reason"
              placeholder="e.g. Application does not meet our current advertising guidelines."
              value={denyPublicReason}
              onChange={(e) => setDenyPublicReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDenyDialogApp(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDenyConfirm} disabled={updateApplicationMutation.isPending}>
              Deny Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Card>
      <CardHeader>
        <CardTitle>Business Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applicationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: Application) => (
              <Card key={app.id} className="border-l-4 border-l-blue-600">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">
                        {app.business_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {app.contact_email}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Submitted:{" "}
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
                      <Badge
                        variant={getStatusBadgeVariant(app.status || "pending")}
                        className="self-start sm:self-auto"
                      >
                        {(app.status || "pending").charAt(0).toUpperCase() +
                          (app.status || "pending").slice(1)}
                      </Badge>
                      <div className="flex items-center flex-wrap gap-2">
                        {app.advertisement_image_url ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Image className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Preview
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">
                                  Ad Preview - {app.business_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={app.advertisement_image_url}
                                    alt={`Advertisement for ${app.business_name}`}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>Business:</strong>{" "}
                                      {app.business_name}
                                    </p>
                                    <p>
                                      <strong>Contact:</strong>{" "}
                                      {app.contact_name}
                                    </p>
                                    <p>
                                      <strong>Email:</strong>{" "}
                                      {app.contact_email}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      <strong>Phone:</strong>{" "}
                                      {app.contact_phone}
                                    </p>
                                    <p>
                                      <strong>Duration:</strong>{" "}
                                      {app.display_duration_seconds || 30}s
                                    </p>
                                    <p>
                                      <strong>QR URL:</strong>{" "}
                                      {app.qr_url || "Not provided"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(app.id, e.target.files)
                              }
                              className="hidden"
                              id={`image-upload-${app.id}`}
                              multiple
                            />
                            <label htmlFor={`image-upload-${app.id}`}>
                              <Button variant="outline" size="sm" asChild>
                                <span className="cursor-pointer">
                                  <Upload className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">
                                    Upload Images
                                  </span>
                                </span>
                              </Button>
                            </label>
                            <Badge
                              variant="destructive"
                              className="text-xs whitespace-nowrap"
                            >
                              Missing
                            </Badge>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            deleteApplicationMutation.mutate(app.id)
                          }
                          disabled={deleteApplicationMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedApp(
                              expandedApp === app.id ? null : app.id
                            )
                          }
                        >
                          {expandedApp === app.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Contact:</strong> {app.contact_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {app.contact_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {app.contact_phone}
                    </p>
                  </div>

                  {expandedApp === app.id && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Ad Content
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p>
                            <strong>QR URL:</strong>{" "}
                            {app.qr_url || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {(app.status === "pending" ||
                        app.status === "pending_approval") && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4 pt-4">
                          <Button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={updateApplicationMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleDenyApplication(app.id)}
                            disabled={updateApplicationMutation.isPending}
                            variant="destructive"
                            className="w-full sm:w-auto"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      )}

                      {app.status === "approved" && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Send Checkout Link
                          </h4>
                          <Button
                            onClick={() => handleCopyCheckoutLink(app)}
                            variant="outline"
                            className="w-full justify-center"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Copy Checkout Link for {app.contact_email}
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Customer will checkout securely through Stripe's
                            hosted payment pages
                          </p>
                        </div>
                      )}

                      {app.admin_notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Admin Notes
                          </h4>
                          <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">
                            {app.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
