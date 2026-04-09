"use client";

import { useSyncExternalStore } from "react";
import { mockAuth } from "@/lib/mock-auth";

export function useAuth() {
  const user = useSyncExternalStore(
    mockAuth.subscribe,
    mockAuth.getSnapshot,
    mockAuth.getServerSnapshot
  );

  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          profileImageUrl: user.profile_image_url,
        }
      : null,
    isLoading: false,
    isAuthenticated: !!user,
  };
}
