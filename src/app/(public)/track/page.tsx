"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Calendar, Building } from "lucide-react";

type ApplicationStatus = {
  id: number;
  businessName: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
};

export default function Track() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: applications = [], isLoading, error } = useQuery<ApplicationStatus[]>({
    queryKey: [`/api/applications/status/${searchEmail}`],
    enabled: !!searchEmail,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSearchEmail(email.trim());
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "denied":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            Enter your email address to check the status of your advertising applications.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter the email used for your application"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Searching..." : "Search Applications"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Unable to fetch applications. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {searchEmail && !isLoading && applications.length === 0 && !error && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                <p>No applications found for email: <strong>{searchEmail}</strong></p>
                <p className="mt-2 text-sm">
                  Make sure you entered the correct email address used when submitting your application.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {applications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Applications for {searchEmail}
            </h2>
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>{app.businessName}</span>
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {formatDate(app.createdAt)}</span>
                    </div>
                    {app.reviewedAt && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Reviewed: {formatDate(app.reviewedAt)}</span>
                      </div>
                    )}
                    <div className="mt-4">
                      {app.status === 'pending' && (
                        <p className="text-sm text-gray-600">
                          Your application is currently under review. We typically review applications within 24 hours.
                        </p>
                      )}
                      {app.status === 'approved' && (
                        <p className="text-sm text-green-600">
                          Congratulations! Your application has been approved. Your ad will start displaying on our Main Street screen.
                        </p>
                      )}
                      {app.status === 'denied' && (
                        <p className="text-sm text-red-600">
                          Your application was not approved at this time. Please contact us for more information.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
