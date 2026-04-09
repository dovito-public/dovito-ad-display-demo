"use client";

import {
  MOCK_USERS,
  MOCK_APPLICATIONS,
  MOCK_SLIDES,
  MOCK_DISPLAY_SETTINGS,
  MOCK_WEBHOOKS,
  MOCK_AUDIT_LOG,
  MOCK_IMPRESSIONS,
  MOCK_IMAGE_LIBRARY,
  MOCK_HEARTBEAT,
} from "./mock-data";

// Bumped to v2 when the demo-image paths were prefixed with basePath; older
// cached stores point at broken /demo-images/ URLs that 404 under GH Pages.
const STORAGE_KEY = "dovito-demo-v2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Store = { [k: string]: any };

function seed(): Store {
  return {
    users: JSON.parse(JSON.stringify(MOCK_USERS)),
    applications: JSON.parse(JSON.stringify(MOCK_APPLICATIONS)),
    slides: JSON.parse(JSON.stringify(MOCK_SLIDES)),
    display_settings: JSON.parse(JSON.stringify(MOCK_DISPLAY_SETTINGS)),
    webhooks: JSON.parse(JSON.stringify(MOCK_WEBHOOKS)),
    audit_log: JSON.parse(JSON.stringify(MOCK_AUDIT_LOG)),
    impressions: JSON.parse(JSON.stringify(MOCK_IMPRESSIONS)),
    image_library: JSON.parse(JSON.stringify(MOCK_IMAGE_LIBRARY)),
    heartbeats: JSON.parse(JSON.stringify(MOCK_HEARTBEAT)),
    currentUserId: null,
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load(): Store {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Store;
  } catch {
    const s = seed();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
    return s;
  }
}

function save(store: Store) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

export function getStore(): Store {
  return load();
}

export function getCollection<T>(name: string): T[] {
  const store = load();
  return ((store[name] as T[]) || []).slice();
}

export function setCollection<T>(name: string, items: T[]): void {
  const store = load();
  store[name] = items as unknown[];
  save(store);
}

export function insertOne<T extends { id?: number | string }>(
  name: string,
  item: T
): T {
  const store = load();
  const items = ((store[name] as T[]) || []).slice();
  if (item.id === undefined) {
    const maxId = items.reduce(
      (m, it) => Math.max(m, typeof it.id === "number" ? it.id : 0),
      0
    );
    (item as T & { id: number }).id = maxId + 1;
  }
  items.push(item);
  store[name] = items as unknown[];
  save(store);
  return item;
}

export function updateOne<T extends { id: number | string }>(
  name: string,
  id: number | string,
  patch: Partial<T>
): T | null {
  const store = load();
  const items = ((store[name] as T[]) || []).slice();
  const idx = items.findIndex((it) => String(it.id) === String(id));
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  store[name] = items as unknown[];
  save(store);
  return items[idx];
}

export function deleteOne<T extends { id: number | string }>(
  name: string,
  id: number | string
): boolean {
  const store = load();
  const items = ((store[name] as T[]) || []).slice();
  const next = items.filter((it) => String(it.id) !== String(id));
  const changed = next.length !== items.length;
  store[name] = next as unknown[];
  save(store);
  return changed;
}

export function findOne<T extends { id: number | string }>(
  name: string,
  id: number | string
): T | null {
  const items = getCollection<T>(name);
  return items.find((it) => String(it.id) === String(id)) || null;
}

export function setCurrentUserId(id: string | null) {
  const store = load();
  store.currentUserId = id;
  save(store);
}

export function getCurrentUserId(): string | null {
  const store = load();
  return (store.currentUserId as string | null) ?? null;
}

export function resetDemo() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
  load();
  if (isBrowser()) {
    window.location.reload();
  }
}
