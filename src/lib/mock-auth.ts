"use client";

import { getCollection, getCurrentUserId, setCurrentUserId, insertOne } from "./mock-store";
import type { User } from "./schema";

type Listener = () => void;
const listeners = new Set<Listener>();

// Cache the snapshot so useSyncExternalStore gets a stable reference between
// notifications. Without this, getSnapshot() returns a new object on every
// call (because getCollection + .find produce new refs) and React enters an
// infinite render loop (error #185).
let cachedSnapshot: User | null = null;
let snapshotDirty = true;

function notify() {
  snapshotDirty = true;
  listeners.forEach((l) => l());
}

function roleFromEmail(email: string): "user" | "admin" | "super_admin" {
  const e = email.toLowerCase();
  if (e.includes("super")) return "super_admin";
  if (e.includes("admin")) return "admin";
  return "user";
}

export const mockAuth = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): User | null {
    if (!snapshotDirty) return cachedSnapshot;
    const id = getCurrentUserId();
    if (!id) {
      cachedSnapshot = null;
    } else {
      const users = getCollection<User>("users");
      cachedSnapshot = users.find((u) => u.id === id) || null;
    }
    snapshotDirty = false;
    return cachedSnapshot;
  },
  getServerSnapshot(): User | null {
    return null;
  },
  signIn(email: string): User {
    const users = getCollection<User>("users");
    let user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      const role = roleFromEmail(email);
      const firstName = email.split("@")[0];
      user = insertOne<User>("users", {
        id: `u_${Date.now()}`,
        name: firstName,
        email,
        emailVerified: new Date(),
        first_name: firstName,
        last_name: null,
        profile_image_url: null,
        image: null,
        password: null,
        role,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: null,
        subscription_plan: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User);
    }
    setCurrentUserId(user.id);
    notify();
    return user;
  },
  signOut() {
    setCurrentUserId(null);
    notify();
  },
};
