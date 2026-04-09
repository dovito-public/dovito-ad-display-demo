"use client";

import { getCollection, getCurrentUserId, setCurrentUserId, insertOne } from "./mock-store";
import type { User } from "./schema";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
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
    const id = getCurrentUserId();
    if (!id) return null;
    const users = getCollection<User>("users");
    return users.find((u) => u.id === id) || null;
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
