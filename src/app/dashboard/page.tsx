"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import type { Application, Slide } from "@/lib/schema";

function formatSchedule(slide: Slide): string {
  const days = slide.schedule_days as number[] | null;
  const hours = slide.schedule_hours as { start: number; end: number } | null;

  if (!days && !hours) return "Showing 24/7";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let daysStr = "";
  if (days && days.length > 0) {
    const sorted = [...days].sort((a, b) => a - b);
    if (sorted.length === 7) {
      daysStr = "Every day";
    } else if (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5])) {
      daysStr = "Weekdays";
    } else if (JSON.stringify(sorted) === JSON.stringify([0, 6])) {
      daysStr = "Weekends";
    } else {
      daysStr = sorted.map((d) => dayNames[d]).join(", ");
    }
  }

  let hoursStr = "";
  if (hours) {
    const fmt = (h: number) => {
      const period = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:00 ${period}`;
    };
    hoursStr = `${fmt(hours.start)} – ${fmt(hours.end)}`;
  }

  return [daysStr, hoursStr].filter(Boolean).join(", ");
}

function statusBadgeVariant(status: string) {
  if (status === "approved") return "default";
  if (status === "denied") return "destructive";
  return "secondary";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SlideCardProps {
  slide: Slide;
  applicationId: number;
}

function SlideCard({ slide }: SlideCardProps) {
  const queryClient = useQueryClient();
  const [editingQr, setEditingQr] = useState(false);
  const [qrValue, setQrValue] = useState(slide.qr_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMutation = useMutation({
    mutationFn: async (isVisible: boolean) => {
      const res = await fetch(`/api/user/slides/${slide.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update visibility");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/slides"] });
      toast.success("Slide visibility updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateQrMutation = useMutation({
    mutationFn: async (qr_url: string) => {
      const res = await fetch(`/api/user/slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update QR URL");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/slides"] });
      setEditingQr(false);
      toast.success("QR URL updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const replaceImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/user/slides/${slide.id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to replace image");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/slides"] });
      toast.success("Image replaced successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Slide #{slide.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{slide.is_visible ? "Visible" : "Hidden"}</span>
          <Switch
            checked={slide.is_visible ?? false}
            onCheckedChange={(checked) => toggleMutation.mutate(checked)}
            disabled={toggleMutation.isPending}
          />
        </div>
      </div>

      {slide.advertisement_image_url && (
        <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
          <Image
            src={slide.advertisement_image_url}
            alt="Ad image"
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) replaceImageMutation.mutate(file);
            e.target.value = "";
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={replaceImageMutation.isPending}
        >
          {replaceImageMutation.isPending ? "Uploading..." : "Replace Image"}
        </Button>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-gray-500">Schedule</span>
        <span className="text-sm text-gray-700">{formatSchedule(slide)}</span>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-gray-500">QR URL</span>
        {editingQr ? (
          <div className="flex gap-2">
            <Input
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="h-8 text-sm"
              placeholder="https://..."
            />
            <Button
              size="sm"
              onClick={() => updateQrMutation.mutate(qrValue)}
              disabled={updateQrMutation.isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQrValue(slide.qr_url || "");
                setEditingQr(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 truncate flex-1">
              {slide.qr_url || <span className="text-gray-400 italic">No QR URL set</span>}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingQr(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["/api/user/applications"],
    queryFn: async () => {
      const res = await fetch("/api/user/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: slides = [], isLoading: slidesLoading } = useQuery<Slide[]>({
    queryKey: ["/api/user/slides"],
    queryFn: async () => {
      const res = await fetch("/api/user/slides");
      if (!res.ok) throw new Error("Failed to fetch slides");
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: analytics } = useQuery<{
    total: number;
    bySlide: { slide_id: number; business_name: string; count: number }[];
    daily: { date: string; count: number }[];
  }>({
    queryKey: ["/api/user/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/user/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || appsLoading || slidesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const slidesByApp = (appId: number) => slides.filter((s) => s.application_id === appId);

  const [billingLoading, setBillingLoading] = useState(false);

  const handleBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/user/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Unable to open billing portal");
      }
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your ad applications and slides</p>
          </div>
          <Button variant="outline" onClick={handleBillingPortal} disabled={billingLoading}>
            {billingLoading ? "Loading..." : "Manage Billing"}
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No applications yet.</p>
              <Link href="/apply">
                <Button>Apply Now</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{app.business_name}</CardTitle>
                    <Badge variant={statusBadgeVariant(app.status ?? "")}>
                      {statusLabel(app.status ?? "unknown")}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mt-1">
                    <p>Submitted: {app.created_at ? format(new Date(app.created_at), "MMM d, yyyy") : "—"}</p>
                    {app.reviewed_at && (
                      <p>Reviewed: {format(new Date(app.reviewed_at), "MMM d, yyyy")}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {app.advertisement_image_url && (
                    <div className="relative w-48 h-28 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={app.advertisement_image_url}
                        alt={`${app.business_name} ad`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {slidesByApp(app.id).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Slides</h3>
                      <div className="space-y-3">
                        {slidesByApp(app.id).map((slide) => (
                          <SlideCard key={slide.id} slide={slide} applicationId={app.id} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics</h2>
          {!analytics || analytics.total === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No data yet. Impressions will appear here once your ads are displayed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Impressions</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{analytics.total.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Impressions by Slide</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Slide</th>
                        <th className="pb-2 font-medium">Business</th>
                        <th className="pb-2 font-medium text-right">Impressions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.bySlide.map((row) => (
                        <tr key={row.slide_id} className="border-b last:border-0">
                          <td className="py-2">#{row.slide_id}</td>
                          <td className="py-2 text-gray-700">{row.business_name}</td>
                          <td className="py-2 text-right font-medium">{row.count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Impressions (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const maxCount = Math.max(...analytics.daily.map((d) => d.count), 1);
                    return (
                      <div className="flex items-end gap-1 h-32">
                        {analytics.daily.map((d) => (
                          <div
                            key={d.date}
                            className="flex-1 flex flex-col items-center"
                            title={`${d.date}: ${d.count}`}
                          >
                            <div
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: `${Math.round((d.count / maxCount) * 100)}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <p className="text-xs text-gray-400 mt-2">Each bar = one day. Hover for details.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
