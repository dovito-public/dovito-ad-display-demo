// Types-only shim for the static demo. Replaces the drizzle schema.
// All shapes match the original schema.ts field names.

export type UserRole = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  image: string | null;
  password: string | null;
  role: UserRole | string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export type UpsertUser = Partial<
  Pick<
    User,
    "id" | "email" | "first_name" | "last_name" | "profile_image_url" | "role"
  >
>;

export interface Application {
  id: number;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  advertisement_image_url: string | null;
  qr_url: string | null;
  display_duration_seconds: number | null;
  status: string | null;
  admin_notes: string | null;
  public_reason: string | null;
  image_count: number | null;
  image_urls: string | null;
  stripe_customer_id: string | null;
  stripe_setup_intent_id: string | null;
  stripe_payment_method_id: string | null;
  stripe_price_id: string | null;
  stripe_coupon_id: string | null;
  coupon_code: string | null;
  discount_amount: number | null;
  payment_status: string | null;
  user_id: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  onboarding_email_2_sent: boolean | null;
  onboarding_email_3_sent: boolean | null;
}

export type InsertApplication = Omit<
  Application,
  "id" | "created_at" | "reviewed_at" | "status" | "admin_notes"
>;

export interface Slide {
  id: number;
  application_id: number | null;
  advertisement_image_url: string;
  qr_url: string | null;
  business_name: string;
  is_visible: boolean | null;
  duration_seconds: number | null;
  anchor_position: "top" | "bottom" | string | null;
  display_order: number | null;
  schedule_days: number[] | null;
  schedule_hours: { start: number; end: number } | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export type InsertSlide = Omit<Slide, "id" | "created_at" | "updated_at">;

export interface Webhook {
  id: number;
  name: string;
  endpoint_url: string;
  events: string[];
  data_fields: string[];
  is_active: boolean | null;
  created_at: Date | null;
}

export type InsertWebhook = Omit<Webhook, "id" | "created_at">;

export interface DisplaySetting {
  id: number;
  setting_key: string;
  setting_value: unknown;
  updated_at: Date | null;
}

export type InsertDisplaySetting = Omit<DisplaySetting, "id" | "updated_at">;

export interface Impression {
  id: number;
  slide_id: number;
  displayed_at: Date;
  duration_seconds: number;
  display_session_id: string | null;
}

export type InsertImpression = Omit<Impression, "id" | "displayed_at">;

export interface AuditLog {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: Date;
}

export type InsertAuditLog = Omit<AuditLog, "id" | "created_at">;

export interface DisplayHeartbeat {
  id: number;
  session_id: string;
  slide_count: number | null;
  current_slide_id: number | null;
  uptime_seconds: number | null;
  last_error: string | null;
  last_seen: Date;
}

export type InsertHeartbeat = Omit<DisplayHeartbeat, "id" | "last_seen">;

export interface ImageLibraryItem {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: Date;
}
