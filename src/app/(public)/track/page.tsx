"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Building, Mail } from "lucide-react";
import { getCollection } from "@/lib/mock-store";
import type { Application } from "@/lib/schema";

function normalizeStatus(s: string): "approved" | "pending" | "denied" | "active" {
  const n = s.toLowerCase();
  if (n === "approved") return "approved";
  if (n === "active") return "active";
  if (n === "rejected" || n === "denied") return "denied";
  return "pending";
}

export default function Track() {
  // On a static demo site, we skip the API round-trip and read mock
  // applications directly. The whole point is to show examples — not to
  // test a free-form email input that most demo viewers won't know how
  // to fill correctly.
  const allApps = useMemo(
    () => getCollection<Application>("applications"),
    []
  );

  // Pick six representative applications across statuses
  const examples = useMemo(() => {
    const byEmail = new Map<string, Application>();
    for (const a of allApps) {
      if (!a.contact_email) continue;
      if (!byEmail.has(a.contact_email)) byEmail.set(a.contact_email, a);
    }
    return Array.from(byEmail.values()).slice(0, 6);
  }, [allApps]);

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const matchedApps = useMemo(() => {
    if (!selectedEmail) return [];
    return allApps.filter((a) => a.contact_email === selectedEmail);
  }, [allApps, selectedEmail]);

  const getStatusBadgeVariant = (status: string) => {
    const n = normalizeStatus(status);
    if (n === "approved" || n === "active") return "default";
    if (n === "denied") return "destructive";
    return "secondary";
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Application Status
          </h1>
          <p className="text-xl text-gray-600">
            In the live product, applicants enter their email to check status. Since this is a demo, click any example below to see a real record from the mock dataset.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Example applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examples.map((a) => {
                const s = normalizeStatus(a.status || "pending");
                const isActive = selectedEmail === a.contact_email;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedEmail(a.contact_email)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold text-gray-900 truncate">
                          <Building className="h-4 w-4 text-gray-500 shrink-0" />
                          <span className="truncate">{a.business_name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.contact_email}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(a.status || "pending")} className="shrink-0">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedEmail && matchedApps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Applications for {selectedEmail}
            </h2>
            {matchedApps.map((app) => {
              const s = normalizeStatus(app.status || "pending");
              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>{app.business_name}</span>
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(app.status || "pending")}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(app.created_at as unknown as string | Date)}</span>
                      </div>
                      {app.reviewed_at && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Reviewed: {formatDate(app.reviewed_at as unknown as string | Date)}</span>
                        </div>
                      )}
                      <div className="mt-4">
                        {s === "pending" && (
                          <p className="text-sm text-gray-600">
                            This application is under review. Typical turnaround is 24 hours.
                          </p>
                        )}
                        {(s === "approved" || s === "active") && (
                          <p className="text-sm text-green-600">
                            Approved. The ad is live on the Main Street display.
                          </p>
                        )}
                        {s === "denied" && (
                          <p className="text-sm text-red-600">
                            Not approved — {app.public_reason || "see admin notes"}.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have questions about your application status or need assistance, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> support@dovito.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
