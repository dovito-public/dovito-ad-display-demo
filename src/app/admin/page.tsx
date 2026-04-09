"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockAuth } from "@/lib/mock-auth";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Eye,
  Settings,
  Globe,
  Tv,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";

import { ApplicationsTab } from "@/components/admin/applications-tab";
import { SlidesTab } from "@/components/admin/slides-tab";
import { WebhooksTab } from "@/components/admin/webhooks-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { ActivityTab } from "@/components/admin/activity-tab";

import type { Application, Slide, DisplayHeartbeat } from "@/lib/schema";

interface ImpressionMetrics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  topSlides: { slide_id: number; business_name: string; count: number; last_displayed: string | null }[];
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check authentication and redirect to login if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        toast.error("Access Denied", {
          description: "Admin privileges required to access this page.",
        });
        router.push("/");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogout = async () => {
    mockAuth.signOut();
    router.push("/login");
  };

  // Fetch applications for dashboard metrics
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    retry: false,
  });

  // Fetch slides for dashboard metrics
  const { data: slides = [] } = useQuery<Slide[]>({
    queryKey: ["/api/slides"],
    queryFn: async () => {
      const res = await fetch("/api/slides");
      if (!res.ok) throw new Error("Failed to fetch slides");
      return res.json();
    },
    retry: false,
  });

  // Fetch impression metrics for dashboard
  const { data: metrics } = useQuery<ImpressionMetrics>({
    queryKey: ["/api/admin/metrics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    retry: false,
  });

  // Fetch display heartbeats for health status card
  const { data: heartbeats = [] } = useQuery<DisplayHeartbeat[]>({
    queryKey: ["/api/display/heartbeat"],
    queryFn: async () => {
      const res = await fetch("/api/display/heartbeat");
      if (!res.ok) throw new Error("Failed to fetch heartbeat");
      return res.json();
    },
    refetchInterval: 30_000,
    retry: false,
  });

  const latestHeartbeat = [...heartbeats].sort(
    (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
  )[0] ?? null;

  const secondsAgo = latestHeartbeat
    ? Math.round((Date.now() - new Date(latestHeartbeat.last_seen).getTime()) / 1000)
    : null;

  const displayStatus =
    secondsAgo === null ? "offline"
    : secondsAgo < 120 ? "online"
    : secondsAgo < 300 ? "delayed"
    : "offline";

  if (isLoading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                <span className="hidden sm:inline">
                  Manage applications, slides, and system settings
                </span>
                <span className="sm:hidden">Manage your content</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Signed in as:
                  </p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">
                    {user.email}
                  </p>
                  <Badge
                    variant={
                      user.role === "super_admin" ? "default" : "secondary"
                    }
                    className="mt-1"
                  >
                    {user.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto p-1 gap-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Applications</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <Tv className="h-3 w-3" />
              <span>Slides</span>
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Webhooks</span>
              <span className="sm:hidden">Web</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Set</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Usr</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center justify-center space-x-1 text-xs px-2 py-2"
            >
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slides Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tv className="h-5 w-5" />
                    <span>Slides Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Total Slides
                        </span>
                        <Tv className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {slides.length}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Visible
                        </span>
                        <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {slides.filter((s) => s.is_visible).length}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Hidden Slides
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {slides.filter((s) => !s.is_visible).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Applications Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          Waiting Approval
                        </span>
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                        {
                          applications.filter(
                            (a) =>
                              a.status === "pending_approval" ||
                              a.status === "pending"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Approved
                          </span>
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {
                            applications.filter(
                              (a) => a.status === "approved"
                            ).length
                          }
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Denied
                          </span>
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                          {
                            applications.filter(
                              (a) => a.status === "denied"
                            ).length
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Applications
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {applications.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Display Status */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tv className="h-5 w-5" />
                    <span>Display Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        displayStatus === "online"
                          ? "bg-green-500"
                          : displayStatus === "delayed"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="font-semibold">
                      {displayStatus === "online"
                        ? "Online"
                        : displayStatus === "delayed"
                        ? "Delayed"
                        : "Offline"}
                    </span>
                  </div>
                  {latestHeartbeat ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Last seen: {secondsAgo}s ago</div>
                      <div>Uptime: {Math.round((latestHeartbeat.uptime_seconds ?? 0) / 60)}m</div>
                      <div>Slides loaded: {latestHeartbeat.slide_count}</div>
                      {latestHeartbeat.last_error && (
                        <div className="text-red-500 text-xs truncate">
                          Error: {latestHeartbeat.last_error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No heartbeat received yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Impression Stats */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Impression Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          All Time
                        </span>
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {metrics?.total ?? 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Today
                        </span>
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {metrics?.today ?? 0}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          This Week
                        </span>
                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {metrics?.thisWeek ?? 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          This Month
                        </span>
                        <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                        {metrics?.thisMonth ?? 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Ads */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Top Performing Ads</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.topSlides && metrics.topSlides.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Rank</TableHead>
                          <TableHead>Business Name</TableHead>
                          <TableHead className="text-right">Impressions</TableHead>
                          <TableHead className="hidden sm:table-cell">Last Displayed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.topSlides.map((row, i) => (
                          <TableRow key={row.slide_id}>
                            <TableCell className="font-medium">{i + 1}</TableCell>
                            <TableCell>{row.business_name}</TableCell>
                            <TableCell className="text-right">{row.count}</TableCell>
                            <TableCell className="hidden sm:table-cell text-gray-500 dark:text-gray-400">
                              {row.last_displayed
                                ? new Date(row.last_displayed).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No impression data yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center space-y-2 p-4"
                      onClick={() => setActiveTab("applications")}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs">Applications</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center space-y-2 p-4"
                      onClick={() => setActiveTab("slides")}
                    >
                      <Tv className="h-5 w-5" />
                      <span className="text-xs">Slides</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center space-y-2 p-4"
                      onClick={() => setActiveTab("webhooks")}
                    >
                      <Globe className="h-5 w-5" />
                      <span className="text-xs">Webhooks</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center space-y-2 p-4"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <ApplicationsTab />
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides">
            <SlidesTab />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <WebhooksTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersTab
              currentUser={
                user
                  ? {
                      id: user.id,
                      email: user.email ?? undefined,
                      role: (user.role as string) ?? "user",
                    }
                  : null
              }
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
