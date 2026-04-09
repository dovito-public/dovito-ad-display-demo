"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { DisplaySetting } from "@/lib/schema";

export function SettingsTab() {
  const queryClient = useQueryClient();

  // Fetch display settings
  const { data: displaySettings = [], isLoading: settingsLoading } = useQuery<
    DisplaySetting[]
  >({
    queryKey: ["/api/display-settings"],
    queryFn: async () => {
      const res = await fetch("/api/display-settings");
      if (!res.ok) throw new Error("Failed to fetch display settings");
      return res.json();
    },
    retry: false,
  });

  // Update display setting mutation
  const updateDisplaySettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await fetch("/api/display-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update display setting");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Display setting updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/display-settings"] });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to update display setting",
      });
    },
  });

  const handleUpdateDisplaySetting = (key: string, value: unknown) => {
    updateDisplaySettingMutation.mutate({ key, value });
  };

  const handleDisplaySettingChange = (key: string, value: string) => {
    updateDisplaySettingMutation.mutate({ key, value });
  };

  const getDisplaySettingValue = (key: string, defaultValue: unknown) => {
    const setting = displaySettings.find((s) => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  return (
    <div className="space-y-6">
      {/* Display Customization Section */}
      <Card>
        <CardHeader>
          <CardTitle>Display Customization</CardTitle>
          <p className="text-gray-600">
            Adjust how the display appears on the landing page
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Scale (0.5 - 1.0)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={
                      getDisplaySettingValue("scale", 0.8) as number
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "scale",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Controls the size of the display content
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Padding (1-5)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={
                      getDisplaySettingValue("padding", 2) as number
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "padding",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount of black border around the display
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Radius
                  </label>
                  <select
                    value={
                      getDisplaySettingValue("borderRadius", "lg") as string
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "borderRadius",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Roundness of the display corners
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Width
                  </label>
                  <select
                    value={
                      getDisplaySettingValue("maxWidth", "4xl") as string
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "maxWidth",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="3xl">3XL (768px)</option>
                    <option value="4xl">4XL (896px)</option>
                    <option value="5xl">5XL (1024px)</option>
                    <option value="6xl">6XL (1152px)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum width of the display container
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption Size
                  </label>
                  <select
                    value={
                      getDisplaySettingValue("captionSize", "sm") as string
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "captionSize",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="xs">Extra Small</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Size of the &quot;Live on Main Street&quot; caption
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption Spacing
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={
                      getDisplaySettingValue(
                        "captionSpacing",
                        2
                      ) as number
                    }
                    onChange={(e) =>
                      handleUpdateDisplaySetting(
                        "captionSpacing",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Margin above the caption
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => {
                      handleUpdateDisplaySetting("scale", 0.8);
                      handleUpdateDisplaySetting("padding", 2);
                      handleUpdateDisplaySetting("borderRadius", "lg");
                      handleUpdateDisplaySetting("maxWidth", "4xl");
                      handleUpdateDisplaySetting("captionSize", "sm");
                      handleUpdateDisplaySetting("captionSpacing", 2);
                    }}
                    variant="outline"
                    disabled={updateDisplaySettingMutation.isPending}
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing Calculator Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Calculator Configuration</CardTitle>
          <p className="text-sm text-gray-600">
            These settings affect both the marketing calculator on main pages
            and the live display rotation timing.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Slides in Rotation
              </label>
              <Input
                type="number"
                value={
                  (displaySettings.find(
                    (s) => s.setting_key === "totalSlides"
                  )?.setting_value as string) || "30"
                }
                onChange={(e) =>
                  handleDisplaySettingChange("totalSlides", e.target.value)
                }
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for marketing calculations and determines rotation length
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Time per Slide (seconds)
              </label>
              <Input
                type="number"
                value={
                  (displaySettings.find(
                    (s) => s.setting_key === "slideInterval"
                  )?.setting_value as string) || "30"
                }
                onChange={(e) =>
                  handleDisplaySettingChange("slideInterval", e.target.value)
                }
                min="5"
                max="300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Controls live display timing and calculator estimates
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Operating Hours
              </label>
              <Input
                type="number"
                value={
                  (displaySettings.find(
                    (s) => s.setting_key === "operatingHours"
                  )?.setting_value as string) || "16"
                }
                onChange={(e) =>
                  handleDisplaySettingChange("operatingHours", e.target.value)
                }
                min="1"
                max="24"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hours per day the display operates (for marketing calculations)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Start Time
              </label>
              <Input
                type="time"
                value={
                  (displaySettings.find(
                    (s) => s.setting_key === "operatingStartTime"
                  )?.setting_value as string) || "07:00"
                }
                onChange={(e) =>
                  handleDisplaySettingChange(
                    "operatingStartTime",
                    e.target.value
                  )
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                When daily display operations begin (for scheduling)
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Live Preview:</strong> Changes to slide timing take effect
              immediately on the live display. Calculator values are used across
              all marketing pages.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display URL Section */}
      <Card>
        <CardHeader>
          <CardTitle>Display URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Display URL
              </label>
              <Input
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/display`
                    : "/display"
                }
                readOnly
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use this URL for the TV browser in kiosk mode
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
