"use client";

import {
  getCollection,
  insertOne,
  updateOne,
  deleteOne,
  findOne,
} from "./mock-store";
import { MOCK_METRICS } from "./mock-data";
import type {
  Slide,
  Application,
  DisplaySetting,
  Webhook,
  AuditLog,
  User,
  DisplayHeartbeat,
  ImageLibraryItem,
  Impression,
} from "./schema";

const DELAY_MS = 150;
const delay = () => new Promise((r) => setTimeout(r, DELAY_MS));

function stripQuery(url: string): string {
  const qIdx = url.indexOf("?");
  return qIdx === -1 ? url : url.slice(0, qIdx);
}

function parseQuery(url: string): Record<string, string> {
  const qIdx = url.indexOf("?");
  if (qIdx === -1) return {};
  const result: Record<string, string> = {};
  const qs = url.slice(qIdx + 1);
  qs.split("&").forEach((p) => {
    const [k, v] = p.split("=");
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v || "");
  });
  return result;
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

function route(
  method: Method,
  url: string,
  data: any
): any {
  const path = stripQuery(url);
  const query = parseQuery(url);

  // --- SLIDES ---
  if (path === "/api/slides" && method === "GET") {
    return getCollection<Slide>("slides").sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
  }
  if (path === "/api/slides" && method === "POST") {
    return insertOne<Slide>("slides", {
      id: 0,
      application_id: null,
      advertisement_image_url: data?.advertisement_image_url || "/demo-images/ad-1.svg",
      qr_url: data?.qr_url || null,
      business_name: data?.business_name || "New Slide",
      is_visible: false,
      duration_seconds: data?.duration_seconds ?? 30,
      anchor_position: data?.anchor_position || "bottom",
      display_order: getCollection<Slide>("slides").length,
      schedule_days: data?.schedule_days ?? null,
      schedule_hours: data?.schedule_hours ?? null,
      created_at: new Date(),
      updated_at: new Date(),
      ...data,
    } as Slide);
  }
  if (path === "/api/slides/manual" && method === "POST") {
    return insertOne<Slide>("slides", {
      id: 0,
      application_id: null,
      advertisement_image_url: data?.advertisement_image_url || "/demo-images/ad-1.svg",
      qr_url: data?.qr_url || null,
      business_name: data?.business_name || "Manual Slide",
      is_visible: false,
      duration_seconds: data?.duration_seconds ?? 30,
      anchor_position: data?.anchor_position || "bottom",
      display_order: getCollection<Slide>("slides").length,
      schedule_days: null,
      schedule_hours: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as Slide);
  }
  if (path === "/api/slides/visible" && method === "GET") {
    return getCollection<Slide>("slides")
      .filter((s) => s.is_visible)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }
  if (path === "/api/slides/reorder" && method === "POST") {
    const ids: number[] = data?.slideIds || data?.ids || [];
    ids.forEach((id, idx) => updateOne<Slide>("slides", id, { display_order: idx }));
    return { success: true };
  }
  {
    const m = path.match(/^\/api\/slides\/(\d+)\/visibility$/);
    if (m) {
      const id = parseInt(m[1], 10);
      const slide = findOne<Slide>("slides", id);
      if (!slide) return { error: "not found" };
      return updateOne<Slide>("slides", id, {
        is_visible: data?.is_visible ?? !slide.is_visible,
      });
    }
  }
  {
    const m = path.match(/^\/api\/slides\/(\d+)$/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (method === "PATCH" || method === "PUT")
        return updateOne<Slide>("slides", id, { ...data, updated_at: new Date() });
      if (method === "DELETE") return { success: deleteOne<Slide>("slides", id) };
      if (method === "GET") return findOne<Slide>("slides", id);
    }
  }

  // --- DISPLAY SETTINGS ---
  if (path === "/api/display-settings" && method === "GET") {
    return getCollection<DisplaySetting>("display_settings");
  }
  if (path === "/api/display-settings" && method === "POST") {
    const key = data?.key;
    const value = data?.value;
    const existing = getCollection<DisplaySetting>("display_settings").find(
      (s) => s.setting_key === key
    );
    if (existing) {
      return updateOne<DisplaySetting>("display_settings", existing.id, {
        setting_value: value,
        updated_at: new Date(),
      });
    }
    return insertOne<DisplaySetting>("display_settings", {
      id: 0,
      setting_key: key,
      setting_value: value,
      updated_at: new Date(),
    } as DisplaySetting);
  }
  {
    const m = path.match(/^\/api\/display-settings\/([^/]+)$/);
    if (m) {
      const key = decodeURIComponent(m[1]);
      if (method === "GET") {
        return (
          getCollection<DisplaySetting>("display_settings").find(
            (s) => s.setting_key === key
          ) || null
        );
      }
      if (method === "PATCH" || method === "POST") {
        const existing = getCollection<DisplaySetting>("display_settings").find(
          (s) => s.setting_key === key
        );
        if (existing) {
          return updateOne<DisplaySetting>("display_settings", existing.id, {
            setting_value: data?.value ?? data,
            updated_at: new Date(),
          });
        }
        return insertOne<DisplaySetting>("display_settings", {
          id: 0,
          setting_key: key,
          setting_value: data?.value ?? data,
          updated_at: new Date(),
        } as DisplaySetting);
      }
    }
  }

  // --- APPLICATIONS ---
  if (path === "/api/applications" && method === "GET") {
    return getCollection<Application>("applications");
  }
  if (path === "/api/applications" && method === "POST") {
    return insertOne<Application>("applications", {
      id: 0,
      business_name: data?.business_name || "New Business",
      contact_name: data?.contact_name || "",
      contact_email: data?.contact_email || "",
      contact_phone: data?.contact_phone || "",
      advertisement_image_url: data?.advertisement_image_url || "/demo-images/ad-1.svg",
      qr_url: data?.qr_url || null,
      display_duration_seconds: data?.display_duration_seconds || 30,
      status: "pending_approval",
      admin_notes: null,
      public_reason: null,
      image_count: 1,
      image_urls: null,
      stripe_customer_id: null,
      stripe_setup_intent_id: null,
      stripe_payment_method_id: null,
      stripe_price_id: null,
      stripe_coupon_id: null,
      coupon_code: data?.coupon_code || null,
      discount_amount: null,
      payment_status: "pending_approval",
      user_id: null,
      created_at: new Date(),
      reviewed_at: null,
      onboarding_email_2_sent: false,
      onboarding_email_3_sent: false,
    } as Application);
  }
  if (path === "/api/applications/create-draft" && method === "POST") {
    return { id: Math.floor(Math.random() * 10000) + 100, success: true };
  }
  if (path === "/api/applications/upload-images" && method === "POST") {
    return { success: true, urls: ["/demo-images/ad-1.svg"] };
  }
  if (path === "/api/applications/submit-with-payment" && method === "POST") {
    return { success: true, id: Math.floor(Math.random() * 10000) + 100 };
  }
  if (path === "/api/applications/after-checkout" && method === "POST") {
    return { success: true };
  }
  if (path === "/api/applications/resubmit-image" && method === "POST") {
    return { success: true };
  }
  {
    const m = path.match(/^\/api\/applications\/status\/(.+)$/);
    if (m) {
      const email = decodeURIComponent(m[1]);
      return getCollection<Application>("applications").filter(
        (a) => a.contact_email?.toLowerCase() === email.toLowerCase()
      );
    }
  }
  {
    const m = path.match(/^\/api\/applications\/missing-images\/(.+)$/);
    if (m) {
      const email = decodeURIComponent(m[1]);
      return getCollection<Application>("applications").filter(
        (a) =>
          a.contact_email?.toLowerCase() === email.toLowerCase() &&
          !a.advertisement_image_url
      );
    }
  }
  {
    const m = path.match(/^\/api\/applications\/(\d+)\/status$/);
    if (m) {
      const id = parseInt(m[1], 10);
      return updateOne<Application>("applications", id, {
        status: data?.status,
        admin_notes: data?.admin_notes ?? null,
        reviewed_at: new Date(),
      });
    }
  }
  {
    const m = path.match(/^\/api\/applications\/(\d+)\/upload-images$/);
    if (m) return { success: true };
  }
  {
    const m = path.match(/^\/api\/applications\/(\d+)\/charge$/);
    if (m) return { success: true, charged: true };
  }
  {
    const m = path.match(/^\/api\/applications\/(\d+)$/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (method === "GET") return findOne<Application>("applications", id);
      if (method === "PATCH" || method === "PUT")
        return updateOne<Application>("applications", id, data);
      if (method === "DELETE")
        return { success: deleteOne<Application>("applications", id) };
    }
  }

  // --- ADMIN USERS / METRICS ---
  if (path === "/api/admin/users" && method === "GET") {
    return getCollection<User>("users");
  }
  if (path === "/api/admin/metrics" && method === "GET") {
    return MOCK_METRICS;
  }
  if (path === "/api/admin/promote" && method === "POST") {
    const uid = data?.userId;
    return updateOne<User>("users", uid, { role: "admin" });
  }
  if (path === "/api/admin/demote" && method === "POST") {
    const uid = data?.userId;
    return updateOne<User>("users", uid, { role: "user" });
  }
  if (path === "/api/admin/create-backup" && method === "POST") {
    return { success: true, url: "#" };
  }
  if (path === "/api/admin/image-audit" && method === "GET") {
    return { orphaned: [], missing: [], total: 0 };
  }
  {
    const m = path.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      if (method === "PATCH") return updateOne<User>("users", id, data);
      if (method === "DELETE") return { success: deleteOne<User>("users", id) };
    }
  }
  {
    const m = path.match(/^\/api\/users\/([^/]+)\/promote$/);
    if (m) return updateOne<User>("users", decodeURIComponent(m[1]), { role: "admin" });
  }
  {
    const m = path.match(/^\/api\/users\/([^/]+)\/demote$/);
    if (m) return updateOne<User>("users", decodeURIComponent(m[1]), { role: "user" });
  }
  if (path === "/api/users" && method === "GET") {
    return getCollection<User>("users");
  }

  // --- DISPLAY / HEARTBEAT ---
  if (path === "/api/display/heartbeat" && method === "GET") {
    return getCollection<DisplayHeartbeat>("heartbeats");
  }
  if (path === "/api/display/heartbeat" && method === "POST") {
    return { success: true };
  }

  // --- AUDIT LOG ---
  if (path === "/api/audit-log" && method === "GET") {
    const items = getCollection<AuditLog>("audit_log").sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    const page = parseInt(query.page || "1", 10);
    const perPage = parseInt(query.perPage || "20", 10);
    const action = query.action;
    const filtered = action && action !== "all" ? items.filter((i) => i.action === action) : items;
    return {
      items: filtered.slice((page - 1) * perPage, page * perPage),
      total: filtered.length,
      page,
      perPage,
    };
  }

  // --- WEBHOOKS ---
  if (path === "/api/webhooks" && method === "GET") {
    return getCollection<Webhook>("webhooks");
  }
  if (path === "/api/webhooks" && method === "POST") {
    return insertOne<Webhook>("webhooks", {
      id: 0,
      name: data?.name || "New Webhook",
      endpoint_url: data?.endpoint_url || "",
      events: data?.events || [],
      data_fields: data?.data_fields || [],
      is_active: data?.is_active ?? true,
      created_at: new Date(),
    } as Webhook);
  }
  {
    const m = path.match(/^\/api\/webhooks\/(\d+)\/test$/);
    if (m) return { success: true, status: 200, response: "OK (demo)" };
  }
  {
    const m = path.match(/^\/api\/webhooks\/(\d+)$/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (method === "PATCH") return updateOne<Webhook>("webhooks", id, data);
      if (method === "DELETE") return { success: deleteOne<Webhook>("webhooks", id) };
    }
  }

  // --- USER-SCOPED ---
  if (path === "/api/user/slides" && method === "GET") {
    return getCollection<Slide>("slides");
  }
  if (path === "/api/user/applications" && method === "GET") {
    return getCollection<Application>("applications");
  }
  if (path === "/api/user/analytics" && method === "GET") {
    return MOCK_METRICS;
  }
  if (path === "/api/user/billing-portal" && method === "POST") {
    return { url: "#demo-billing-portal" };
  }
  {
    const m = path.match(/^\/api\/user\/slides\/(\d+)\/toggle$/);
    if (m) {
      const id = parseInt(m[1], 10);
      const slide = findOne<Slide>("slides", id);
      return updateOne<Slide>("slides", id, { is_visible: !slide?.is_visible });
    }
  }
  {
    const m = path.match(/^\/api\/user\/slides\/(\d+)$/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (method === "PATCH") return updateOne<Slide>("slides", id, data);
      if (method === "DELETE") return { success: deleteOne<Slide>("slides", id) };
    }
  }

  // --- IMPRESSIONS / IMAGE LIBRARY ---
  if (path === "/api/impressions" && method === "POST") {
    return insertOne<Impression>("impressions", {
      id: 0,
      slide_id: data?.slide_id || 1,
      displayed_at: new Date(),
      duration_seconds: data?.duration_seconds || 30,
      display_session_id: data?.display_session_id || null,
    } as Impression);
  }
  if (path === "/api/impressions/summary" && method === "GET") {
    return MOCK_METRICS.impressionsBySlide;
  }
  if (path === "/api/image-library" && method === "GET") {
    return getCollection<ImageLibraryItem>("image_library");
  }

  // --- AUTH ENDPOINTS (stubs) ---
  if (path === "/api/auth/register" && method === "POST") {
    return { success: true };
  }
  if (path === "/api/auth/forgot-password" && method === "POST") {
    return { success: true };
  }
  if (path === "/api/auth/reset-password" && method === "POST") {
    return { success: true };
  }
  if (path.startsWith("/api/auth/verify-email")) {
    return { success: true, verified: true };
  }

  // --- STRIPE / PAYMENTS STUBS ---
  if (path === "/api/create-checkout-session" && method === "POST") {
    return { sessionId: "cs_demo_123", url: "/collect-payment/success/" };
  }
  if (path === "/api/create-payment-intent" && method === "POST") {
    return { clientSecret: "pi_demo_secret" };
  }
  if (path === "/api/create-subscription" && method === "POST") {
    return { subscriptionId: "sub_demo_123" };
  }
  if (path === "/api/validate-coupon" && method === "POST") {
    const code = (data?.code || "").toUpperCase();
    if (code === "LAUNCH20") {
      return { valid: true, discount: 2000, code };
    }
    return { valid: false };
  }
  if (path === "/api/process-checkout-session" && method === "POST") {
    return { success: true };
  }
  if (path === "/api/upload-images-temp" && method === "POST") {
    return { success: true, urls: ["/demo-images/ad-1.svg"] };
  }
  if (path === "/api/slides/create-examples" && method === "POST") {
    return { success: true, count: 0 };
  }

  // Fallback
  return { success: true, demo: true, path, method };
}

export async function mockGet<T = any>(url: string): Promise<T> {
  await delay();
  return route("GET", url, undefined) as T;
}

export async function mockMutate<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  await delay();
  return route(method.toUpperCase() as Method, url, data) as T;
}
