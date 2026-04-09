import type {
  User,
  Application,
  Slide,
  Webhook,
  DisplaySetting,
  AuditLog,
  Impression,
  DisplayHeartbeat,
  ImageLibraryItem,
} from "./schema";

const now = new Date("2026-04-09T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

// Prepend the Next.js basePath to static public assets so that plain <img>
// tags resolve correctly under GitHub Pages (where the site is served from
// /dovito-ad-display-demo/, not the origin root). next/image handles this
// automatically; plain <img src="/foo"> does not.
const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/dovito-ad-display-demo" : "";
const asset = (p: string) => `${BASE_PATH}${p}`;

export const MOCK_USERS: User[] = [
  {
    id: "u_superadmin",
    name: "Super Admin",
    email: "super@dovito.com",
    emailVerified: daysAgo(90),
    first_name: "Super",
    last_name: "Admin",
    profile_image_url: null,
    image: null,
    password: null,
    role: "super_admin",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: null,
    subscription_plan: null,
    created_at: daysAgo(120),
    updated_at: daysAgo(1),
  },
  {
    id: "u_admin",
    name: "Admin User",
    email: "admin@dovito.com",
    emailVerified: daysAgo(80),
    first_name: "Sam",
    last_name: "Reyes",
    profile_image_url: null,
    image: null,
    password: null,
    role: "admin",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: null,
    subscription_plan: null,
    created_at: daysAgo(110),
    updated_at: daysAgo(2),
  },
  {
    id: "u_user_1",
    name: "Rosa Martinez",
    email: "rosa@rosasbakery.com",
    emailVerified: daysAgo(40),
    first_name: "Rosa",
    last_name: "Martinez",
    profile_image_url: null,
    image: null,
    password: null,
    role: "user",
    stripe_customer_id: "cus_demo_rosa",
    stripe_subscription_id: "sub_demo_rosa",
    subscription_status: "active",
    subscription_plan: "monthly",
    created_at: daysAgo(60),
    updated_at: daysAgo(3),
  },
  {
    id: "u_user_2",
    name: "Dave Kim",
    email: "dave@kimscorner.com",
    emailVerified: daysAgo(30),
    first_name: "Dave",
    last_name: "Kim",
    profile_image_url: null,
    image: null,
    password: null,
    role: "user",
    stripe_customer_id: "cus_demo_dave",
    stripe_subscription_id: "sub_demo_dave",
    subscription_status: "active",
    subscription_plan: "monthly",
    created_at: daysAgo(45),
    updated_at: daysAgo(4),
  },
  {
    id: "u_user_3",
    name: "Priya Patel",
    email: "priya@patelauto.com",
    emailVerified: null,
    first_name: "Priya",
    last_name: "Patel",
    profile_image_url: null,
    image: null,
    password: null,
    role: "user",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: "pending",
    subscription_plan: null,
    created_at: daysAgo(15),
    updated_at: daysAgo(5),
  },
];

const businesses = [
  "Rosa's Bakery",
  "Kim's Corner Market",
  "Patel Auto Repair",
  "Blue Heron Cafe",
  "Westside Dental",
  "Maple Leaf Florist",
  "Iron Forge Gym",
  "Sunrise Yoga Studio",
  "Green Thumb Landscaping",
  "Northstar Real Estate",
  "Pinewood Pet Grooming",
  "Harbor Tide Seafood",
];

const statuses = [
  "pending_approval",
  "approved",
  "rejected",
  "approved",
  "pending_payment",
  "approved",
  "pending_approval",
  "active",
  "approved",
  "pending_approval",
  "active",
  "rejected",
];

export const MOCK_APPLICATIONS: Application[] = businesses.map((name, i) => ({
  id: i + 1,
  business_name: name,
  contact_name: ["Alex", "Jordan", "Taylor", "Casey", "Morgan"][i % 5] + " " + name.split(" ")[0],
  contact_email: `contact${i + 1}@example.com`,
  contact_phone: `555-010${(i + 10).toString().padStart(2, "0")}`,
  advertisement_image_url: asset(`/demo-images/ad-${(i % 8) + 1}.svg`),
  qr_url: `https://example.com/${i + 1}`,
  display_duration_seconds: 30,
  status: statuses[i] || "pending_approval",
  admin_notes: i % 3 === 0 ? "Reviewed and approved by team." : null,
  public_reason: statuses[i] === "rejected" ? "Image quality below standards." : null,
  image_count: 1,
  image_urls: null,
  stripe_customer_id: `cus_demo_${i + 1}`,
  stripe_setup_intent_id: null,
  stripe_payment_method_id: null,
  stripe_price_id: "price_demo_monthly",
  stripe_coupon_id: null,
  coupon_code: i === 2 ? "LAUNCH20" : null,
  discount_amount: i === 2 ? 2000 : null,
  payment_status: statuses[i] === "approved" || statuses[i] === "active" ? "paid" : "pending_approval",
  user_id: i < 5 ? `u_user_${(i % 3) + 1}` : null,
  created_at: daysAgo(30 - i * 2),
  reviewed_at: statuses[i] !== "pending_approval" ? daysAgo(25 - i * 2) : null,
  onboarding_email_2_sent: i % 2 === 0,
  onboarding_email_3_sent: i % 3 === 0,
}));

export const MOCK_SLIDES: Slide[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  application_id: i + 1,
  advertisement_image_url: asset(`/demo-images/ad-${i + 1}.svg`),
  qr_url: `https://example.com/${i + 1}`,
  business_name: businesses[i],
  is_visible: i < 6,
  duration_seconds: 30,
  anchor_position: i % 2 === 0 ? "bottom" : "top",
  display_order: i,
  schedule_days: null,
  schedule_hours: null,
  created_at: daysAgo(30 - i),
  updated_at: daysAgo(i),
}));

export const MOCK_DISPLAY_SETTINGS: DisplaySetting[] = [
  { id: 1, setting_key: "scale", setting_value: 0.8, updated_at: daysAgo(10) },
  { id: 2, setting_key: "padding", setting_value: 2, updated_at: daysAgo(10) },
  { id: 3, setting_key: "borderRadius", setting_value: "lg", updated_at: daysAgo(10) },
  { id: 4, setting_key: "maxWidth", setting_value: "4xl", updated_at: daysAgo(10) },
  { id: 5, setting_key: "captionSize", setting_value: "sm", updated_at: daysAgo(10) },
  { id: 6, setting_key: "captionSpacing", setting_value: 2, updated_at: daysAgo(10) },
  { id: 7, setting_key: "totalSlides", setting_value: "30", updated_at: daysAgo(10) },
  { id: 8, setting_key: "slideInterval", setting_value: "30", updated_at: daysAgo(10) },
  { id: 9, setting_key: "operatingHours", setting_value: "16", updated_at: daysAgo(10) },
  { id: 10, setting_key: "operatingStartTime", setting_value: "07:00", updated_at: daysAgo(10) },
];

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 1,
    name: "Slack — New Applications",
    endpoint_url: "https://hooks.slack.com/services/T00/B00/XXX",
    events: ["application.created", "application.approved"],
    data_fields: ["business_name", "contact_email", "status"],
    is_active: true,
    created_at: daysAgo(30),
  },
  {
    id: 2,
    name: "Zapier — Slide Activity",
    endpoint_url: "https://hooks.zapier.com/hooks/catch/123/abc/",
    events: ["slide.created", "slide.visibility_changed"],
    data_fields: ["business_name", "is_visible"],
    is_active: true,
    created_at: daysAgo(20),
  },
  {
    id: 3,
    name: "Legacy CRM",
    endpoint_url: "https://legacy.example.com/webhook",
    events: ["application.created"],
    data_fields: ["business_name", "contact_email"],
    is_active: false,
    created_at: daysAgo(60),
  },
];

const auditActions = [
  "user.login",
  "application.created",
  "application.approved",
  "application.rejected",
  "slide.created",
  "slide.updated",
  "slide.visibility_changed",
  "slide.deleted",
  "display_setting.updated",
  "webhook.created",
  "webhook.tested",
  "user.promoted",
];

export const MOCK_AUDIT_LOG: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  actor_id: i % 2 === 0 ? "u_admin" : "u_user_1",
  actor_email: i % 2 === 0 ? "admin@dovito.com" : "rosa@rosasbakery.com",
  action: auditActions[i % auditActions.length],
  entity_type: auditActions[i % auditActions.length].split(".")[0],
  entity_id: String((i % 8) + 1),
  details: { note: `Automated audit entry #${i + 1}` },
  created_at: daysAgo(i),
}));

export const MOCK_IMPRESSIONS: Impression[] = (() => {
  const list: Impression[] = [];
  let idCounter = 1;
  for (let d = 0; d < 30; d++) {
    for (let s = 1; s <= 8; s++) {
      const count = 50 + Math.floor(Math.random() * 250);
      // One summary row per (day, slide) with aggregated count as duration for brevity.
      list.push({
        id: idCounter++,
        slide_id: s,
        displayed_at: daysAgo(d),
        duration_seconds: count,
        display_session_id: `sess_${d}_${s}`,
      });
    }
  }
  return list;
})();

export const MOCK_IMAGE_LIBRARY: ImageLibraryItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `img_${i + 1}`,
  name: `demo-image-${i + 1}.jpg`,
  url: asset(`/demo-images/ad-${(i % 8) + 1}.svg`),
  size: 250_000 + i * 10_000,
  created_at: daysAgo(i * 2),
}));

export const MOCK_METRICS = {
  totalImpressions: MOCK_IMPRESSIONS.reduce((s, i) => s + i.duration_seconds, 0),
  totalSlides: MOCK_SLIDES.length,
  visibleSlides: MOCK_SLIDES.filter((s) => s.is_visible).length,
  totalApplications: MOCK_APPLICATIONS.length,
  pendingApplications: MOCK_APPLICATIONS.filter((a) => a.status === "pending_approval").length,
  approvedApplications: MOCK_APPLICATIONS.filter((a) => a.status === "approved" || a.status === "active").length,
  impressionsBySlide: MOCK_SLIDES.map((s) => ({
    slide_id: s.id,
    business_name: s.business_name,
    impressions: MOCK_IMPRESSIONS.filter((i) => i.slide_id === s.id).reduce(
      (sum, i) => sum + i.duration_seconds,
      0
    ),
  })),
  impressionsByDay: Array.from({ length: 30 }, (_, d) => ({
    date: daysAgo(29 - d).toISOString().split("T")[0],
    impressions: MOCK_IMPRESSIONS.filter(
      (i) =>
        i.displayed_at.toISOString().split("T")[0] ===
        daysAgo(29 - d).toISOString().split("T")[0]
    ).reduce((sum, i) => sum + i.duration_seconds, 0),
  })),
};

export const MOCK_HEARTBEAT: DisplayHeartbeat[] = [
  {
    id: 1,
    session_id: "display_kiosk_01",
    slide_count: 6,
    current_slide_id: 3,
    uptime_seconds: 86400 * 5,
    last_error: null,
    last_seen: now,
  },
  {
    id: 2,
    session_id: "display_kiosk_02",
    slide_count: 6,
    current_slide_id: 5,
    uptime_seconds: 86400 * 2,
    last_error: null,
    last_seen: new Date(now.getTime() - 120_000),
  },
];
