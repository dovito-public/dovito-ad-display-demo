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
import { Globe, Plus, Edit, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import type { Webhook } from "@/lib/schema";

interface TypedWebhook extends Omit<Webhook, 'events' | 'data_fields'> {
  events: string[];
  data_fields: string[];
}

const webhookSchema = z.object({
  name: z.string().min(1, "Webhook name is required"),
  endpointUrl: z.string().url("Valid URL required"),
  events: z.array(z.string()).min(1, "At least one event must be selected"),
  dataFields: z.array(z.string()).min(1, "At least one data field must be selected"),
  isActive: z.boolean().optional().default(true),
});

type WebhookFormData = z.input<typeof webhookSchema>;

const availableEvents = [
  { value: "application.submitted", label: "Application Submitted" },
  { value: "application.approved", label: "Application Approved" },
  { value: "application.denied", label: "Application Denied" },
  { value: "slide.created", label: "Slide Created" },
  { value: "slide.updated", label: "Slide Updated" },
  { value: "payment.completed", label: "Payment Completed" },
  { value: "payment.failed", label: "Payment Failed" },
];

const availableDataFields = [
  { value: "application.businessName", label: "Business Name" },
  { value: "application.contactName", label: "Contact Name" },
  { value: "application.email", label: "Email Address" },
  { value: "application.phone", label: "Phone Number" },
  { value: "application.address", label: "Business Address" },
  { value: "application.website", label: "Website URL" },
  { value: "application.description", label: "Business Description" },
  { value: "application.status", label: "Application Status" },
  { value: "application.submittedAt", label: "Submission Date" },
  { value: "application.adminNotes", label: "Admin Notes" },
  { value: "slide.id", label: "Slide ID" },
  { value: "slide.businessName", label: "Slide Business Name" },
  { value: "slide.isVisible", label: "Slide Visibility" },
  { value: "slide.advertisementImageUrl", label: "Advertisement Image URL" },
  { value: "slide.qrUrl", label: "QR Code URL" },
  { value: "user.email", label: "User Email" },
  { value: "user.firstName", label: "User First Name" },
  { value: "user.lastName", label: "User Last Name" },
  { value: "checkout.link", label: "Checkout Page Link" },
  { value: "payment.amount", label: "Payment Amount" },
  { value: "payment.plan", label: "Selected Plan" },
  { value: "payment.billingInterval", label: "Billing Interval" },
  { value: "timestamp", label: "Event Timestamp" },
];

export function WebhooksTab() {
  const queryClient = useQueryClient();
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<TypedWebhook | null>(null);

  const webhookForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      endpointUrl: "",
      events: [],
      dataFields: [],
      isActive: true,
    },
  });

  // Fetch webhooks
  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery<
    TypedWebhook[]
  >({
    queryKey: ["/api/webhooks"],
    queryFn: async () => {
      const res = await fetch("/api/webhooks");
      if (!res.ok) throw new Error("Failed to fetch webhooks");
      return res.json();
    },
    retry: false,
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create webhook");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsWebhookDialogOpen(false);
      setEditingWebhook(null);
      webhookForm.reset();
      toast.success("Success", {
        description: "Webhook created successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<WebhookFormData>) => {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update webhook");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsWebhookDialogOpen(false);
      setEditingWebhook(null);
      webhookForm.reset();
      toast.success("Success", {
        description: "Webhook updated successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete webhook");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast.success("Success", {
        description: "Webhook deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", { description: error.message });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const res = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to send test webhook");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Test Webhook Sent", {
        description: "Test webhook payload has been sent to the endpoint.",
      });
    },
    onError: (error: Error) => {
      toast.error("Test Failed", {
        description: "Failed to send test webhook: " + error.message,
      });
    },
  });

  const handleEditWebhook = (webhook: TypedWebhook) => {
    setEditingWebhook(webhook);
    webhookForm.reset({
      name: webhook.name,
      endpointUrl: webhook.endpoint_url,
      events: (webhook.events as string[]) || [],
      dataFields: (webhook.data_fields as string[]) || [],
      isActive: webhook.is_active ?? true,
    });
    setIsWebhookDialogOpen(true);
  };

  const onSubmitWebhook = (data: WebhookFormData) => {
    if (editingWebhook) {
      updateWebhookMutation.mutate({ id: editingWebhook.id, ...data });
    } else {
      createWebhookMutation.mutate(data);
    }
  };

  const WebhookFormContent = () => (
    <Form {...webhookForm}>
      <form
        onSubmit={webhookForm.handleSubmit(onSubmitWebhook)}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={webhookForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Webhook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={webhookForm.control}
            name="endpointUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endpoint URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.yourdomain.com/webhooks"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={webhookForm.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <div className="text-sm text-gray-500">
                    Enable this webhook to receive events
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Event Selection */}
        <div>
          <FormLabel className="text-base font-medium">
            Events to Send
          </FormLabel>
          <p className="text-sm text-gray-500 mb-3">
            Select which events trigger this webhook
          </p>
          <div className="space-y-2">
            {availableEvents.map((event) => (
              <FormField
                key={event.value}
                control={webhookForm.control}
                name="events"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value?.includes(event.value)}
                        onChange={(e) => {
                          const updatedEvents = e.target.checked
                            ? [...(field.value || []), event.value]
                            : (field.value || []).filter(
                                (v) => v !== event.value
                              );
                          field.onChange(updatedEvents);
                        }}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {event.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Data Fields Selection */}
        <div>
          <FormLabel className="text-base font-medium">
            Data to Include
          </FormLabel>
          <p className="text-sm text-gray-500 mb-3">
            Select which data fields to send with each webhook
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
            {availableDataFields.map((dataField) => (
              <FormField
                key={dataField.value}
                control={webhookForm.control}
                name="dataFields"
                render={({ field: formField }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={formField.value?.includes(dataField.value)}
                        onChange={(e) => {
                          const updatedFields = e.target.checked
                            ? [...(formField.value || []), dataField.value]
                            : (formField.value || []).filter(
                                (v) => v !== dataField.value
                              );
                          formField.onChange(updatedFields);
                        }}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal">
                      {dataField.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsWebhookDialogOpen(false);
              setEditingWebhook(null);
              webhookForm.reset();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createWebhookMutation.isPending ||
              updateWebhookMutation.isPending
            }
          >
            {createWebhookMutation.isPending ||
            updateWebhookMutation.isPending
              ? "Saving..."
              : editingWebhook
                ? "Update Webhook"
                : "Create Webhook"}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Configuration</CardTitle>
        <div className="text-sm text-gray-600">
          <p>Real-time event notifications for external systems</p>
        </div>
      </CardHeader>
      <CardContent>
        {webhooksLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading webhooks...</p>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No webhooks configured</p>
            <Dialog
              open={isWebhookDialogOpen}
              onOpenChange={setIsWebhookDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingWebhook ? "Edit Webhook" : "Add New Webhook"}
                  </DialogTitle>
                </DialogHeader>
                <WebhookFormContent />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Configuration Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                n8n Configuration Guide
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>1.</strong> In n8n, create a new workflow with an
                  HTTP Request node
                </p>
                <p>
                  <strong>2.</strong> Set Method to{" "}
                  <code className="bg-blue-100 px-1 rounded">POST</code>
                </p>
                <p>
                  <strong>3.</strong> Use your webhook URL as the endpoint
                </p>
                <p>
                  <strong>4.</strong> Add header:{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    Content-Type: application/json
                  </code>
                </p>
                <p>
                  <strong>5.</strong> Use the Test button below to verify
                  your webhook receives data
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configured Webhooks</h3>
              <Dialog
                open={isWebhookDialogOpen}
                onOpenChange={setIsWebhookDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingWebhook(null);
                      webhookForm.reset();
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingWebhook ? "Edit Webhook" : "Add New Webhook"}
                    </DialogTitle>
                  </DialogHeader>
                  <WebhookFormContent />
                </DialogContent>
              </Dialog>
            </div>

            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {webhook.name}
                        </h3>
                        <Badge
                          variant={
                            webhook.is_active ? "default" : "secondary"
                          }
                        >
                          {webhook.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {webhook.endpoint_url}
                        </code>
                      </p>

                      {/* Configuration Help */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-blue-800 font-medium mb-1">
                          n8n Setup:
                        </p>
                        <p className="text-xs text-blue-700">
                          1. HTTP Request node -- Method: POST
                          <br />
                          2. URL: Use endpoint above
                          <br />
                          3. Headers: Content-Type: application/json
                          <br />
                          4. Click Test button to verify connection
                        </p>
                      </div>

                      {webhook.events &&
                        (webhook.events as string[]).length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">
                              Events:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(webhook.events as string[]).map(
                                (event, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {availableEvents.find(
                                      (e) => e.value === event
                                    )?.label || event}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {webhook.data_fields &&
                        (webhook.data_fields as string[]).length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Data Fields (
                              {(webhook.data_fields as string[]).length}):
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(webhook.data_fields as string[])
                                .slice(0, 3)
                                .map(
                                  (field) =>
                                    availableDataFields.find(
                                      (f) => f.value === field
                                    )?.label || field
                                )
                                .join(", ")}
                              {(webhook.data_fields as string[]).length >
                                3 &&
                                ` +${(webhook.data_fields as string[]).length - 3} more`}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          testWebhookMutation.mutate(webhook.id)
                        }
                        disabled={testWebhookMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWebhook(webhook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          deleteWebhookMutation.mutate(webhook.id)
                        }
                        disabled={deleteWebhookMutation.isPending}
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
