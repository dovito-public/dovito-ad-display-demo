"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string | null;
}

const adminUserSchema = z.object({
  email: z.string().email("Valid email required"),
});

type AdminUserFormData = z.infer<typeof adminUserSchema>;

interface UsersTabProps {
  currentUser: {
    id: string;
    email: string | null | undefined;
    role: string;
  } | null;
}

export function UsersTab({ currentUser }: UsersTabProps) {
  const queryClient = useQueryClient();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);

  const adminUserForm = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      email: "",
    },
  });

  // Fetch all users
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<
    AdminUser[]
  >({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    retry: false,
  });

  // Promote user mutation
  const promoteUserMutation = useMutation({
    mutationFn: async (data: AdminUserFormData) => {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to promote user to admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAdminDialogOpen(false);
      adminUserForm.reset();
      toast.success("Success", {
        description: "User promoted to admin successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  // Demote user mutation
  const demoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin/demote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to demote admin user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast.success("Success", {
        description: "Admin demoted to user successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>User Management</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Manage admin users and their roles
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog
            open={isAdminDialogOpen}
            onOpenChange={setIsAdminDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promote User to Admin</DialogTitle>
              </DialogHeader>
              <Form {...adminUserForm}>
                <form
                  onSubmit={adminUserForm.handleSubmit((data) =>
                    promoteUserMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={adminUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAdminDialogOpen(false);
                        adminUserForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={promoteUserMutation.isPending}
                    >
                      {promoteUserMutation.isPending
                        ? "Promoting..."
                        : "Promote to Admin"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : allUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allUsers.map((user: AdminUser) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.email || "No email"}
                    </p>
                    <Badge
                      variant={
                        user.role === "super_admin"
                          ? "default"
                          : user.role === "admin"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : user.role === "admin"
                          ? "Admin"
                          : "User"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {user.first_name || ""} {user.last_name || ""}
                    {user.created_at &&
                      ` -- Joined ${new Date(user.created_at).toLocaleDateString()}`}
                  </p>
                </div>

                {isSuperAdmin && user.id !== currentUser?.id && (
                  <div className="flex items-center gap-2">
                    {user.role === "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => demoteUserMutation.mutate(user.id)}
                        disabled={demoteUserMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ShieldOff className="h-4 w-4 mr-1" />
                        Demote
                      </Button>
                    ) : user.role !== "super_admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          promoteUserMutation.mutate({
                            email: user.email || "",
                          })
                        }
                        disabled={promoteUserMutation.isPending}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isSuperAdmin && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Only Super Admins can manage user roles. Contact a Super Admin
              to make changes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
