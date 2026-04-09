"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format, isAfter, subHours } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, Activity } from "lucide-react";

interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
}

function getActionBadgeClass(action: string): string {
  if (action.endsWith(".approved") || action.endsWith(".created") || action.endsWith(".promoted")) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }
  if (action.endsWith(".denied") || action.endsWith(".deleted") || action.endsWith(".demoted")) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
  if (action.startsWith("stripe.") || action.startsWith("payment.")) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  }
  if (action.endsWith(".updated") || action.endsWith(".changed") || action.endsWith(".visibility_changed")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  if (isAfter(date, subHours(new Date(), 24))) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d, yyyy HH:mm");
}

const ACTION_FILTERS = [
  { value: "all", label: "All Actions" },
  { value: "application", label: "application.*" },
  { value: "slide", label: "slide.*" },
  { value: "stripe", label: "stripe.*" },
  { value: "user", label: "user.*" },
];

const LIMIT = 25;

export function ActivityTab() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<AuditLogResponse>({
    queryKey: ["/api/audit-log", page, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (actionFilter !== "all") params.set("action", actionFilter);
      const res = await fetch(`/api/audit-log?${params}`);
      if (!res.ok) throw new Error("Failed to fetch audit log");
      return res.json();
    },
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  function handleFilterChange(value: string) {
    setActionFilter(value);
    setPage(1);
    setExpandedId(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Log</span>
          </CardTitle>
          <Select value={actionFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
        {isError && (
          <p className="text-center text-red-500 py-8">Failed to load audit log.</p>
        )}
        {!isLoading && !isError && entries.length === 0 && (
          <p className="text-center text-gray-500 py-8">No audit log entries found.</p>
        )}
        {!isLoading && !isError && entries.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6"></TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <>
                      <TableRow
                        key={entry.id}
                        className={entry.details ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}
                        onClick={() => {
                          if (!entry.details) return;
                          setExpandedId(expandedId === entry.id ? null : entry.id);
                        }}
                      >
                        <TableCell className="pr-0">
                          {entry.details ? (
                            expandedId === entry.id ? (
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(entry.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.actor_email ?? "System"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionBadgeClass(entry.action)}`}
                          >
                            {entry.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.entity_type}
                          {entry.entity_id ? (
                            <span className="text-gray-400 dark:text-gray-500 ml-1">
                              #{entry.entity_id}
                            </span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                      {expandedId === entry.id && entry.details && (
                        <TableRow key={`${entry.id}-details`}>
                          <TableCell />
                          <TableCell colSpan={4} className="bg-gray-50 dark:bg-gray-800/30 py-2">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all font-mono">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages} &mdash; {total} total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
