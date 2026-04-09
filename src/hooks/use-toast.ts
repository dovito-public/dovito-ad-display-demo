"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const message = title || description || "";
      if (variant === "destructive") {
        sonnerToast.error(message, { description: title ? description : undefined });
      } else {
        sonnerToast.success(message, { description: title ? description : undefined });
      }
    },
  };
}
