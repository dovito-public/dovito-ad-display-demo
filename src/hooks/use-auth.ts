"use client";

import { useMemo, useSyncExternalStore } from "react";
import { mockAuth } from "@/lib/mock-auth";

export function useAuth() {
  const rawUser = useSyncExternalStore(
    mockAuth.subscribe,
    mockAuth.getSnapshot,
    mockAuth.getServerSnapshot
  );

  // Memoise the adapted user shape so that consumers with [user] in effect
  // deps don't re-run every render. rawUser is already a stable reference
  // (cached in mockAuth), so keying on it is enough.
  return useMemo(
    () => ({
      user: rawUser
        ? {
            id: rawUser.id,
            email: rawUser.email,
            firstName: rawUser.first_name,
            lastName: rawUser.last_name,
            role: rawUser.role,
            profileImageUrl: rawUser.profile_image_url,
          }
        : null,
      isLoading: false,
      isAuthenticated: !!rawUser,
    }),
    [rawUser]
  );
}
