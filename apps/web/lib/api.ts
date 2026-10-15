const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api/v1" : "http://localhost:8000/api/v1");

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "SUPERADMIN" | "MANAGER" | "EMPLOYEE" | "PLAYER";
}

export interface CourtImage {
  id: string;
  image_url: string;
  is_cover: boolean;
}

export interface Court {
  id: string;
  venue_id: string;
  name: string;
  sport_type: string;
  surface: string;
  is_indoor: boolean;
  default_hourly_rate: number;
  discount_percentage?: number;
  promo_badge?: string | null;
  promo_subtext?: string | null;
  images?: CourtImage[];
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  address_street?: string;
  address_number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  cover_image_url?: string;
  rating_average?: number;
  rating_count?: number;
  courts: Court[];
}

export interface SlotAvailability {
  start_time: string;
  end_time: string;
  is_available: boolean;
  hourly_rate: number;
}

export interface Booking {
  id: string;
  court_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  payment_status: "UNPAID" | "PAID" | "REFUNDED" | "PENDING";
  booking_type: "ONLINE_SINGLE" | "RECURRING_MONTHLY" | "OFFLINE_MANUAL";
  total_amount: number;
  court_name?: string;
  venue_name?: string;
  venue_address?: string;
  sport_type?: string;
  notes?: string;
  payment_method?: string;
  date_label?: string;
  time_label?: string;
  days_away_label?: string;
}


export interface ManagerSlot {
  hour: string;
  end_hour: string;
  status: "AVAILABLE" | "BOOKED";
  color: string;
  booking_id?: string | null;
  customer_name?: string | null;
  booking_type?: string | null;
  label: string;
  total_amount?: number;
  hourly_rate?: number;
}

export interface ManagerCourtTimeline {
  court_id: string;
  court_name: string;
  sport_type: string;
  surface: string;
  is_indoor: boolean;
  slots: ManagerSlot[];
}

export interface ManagerVenueTimeline {
  venue_id: string;
  venue_name: string;
  courts: ManagerCourtTimeline[];
}

export interface ManagerTimelineResponse {
  date: string;
  timeline: ManagerVenueTimeline[];
}

export interface ManagerStats {
  today: string;
  total_bookings_today: number;
  revenue_today: number;
  occupancy_rate_percentage: number;
  active_courts_count: number;
}

export interface AdminMetrics {
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_recurring_revenue: number;
  churn_rate_percentage: number;
  mrr_growth_percentage: number;
}

export interface AdminSubscription {
  id: string;
  organization_name: string;
  document_number?: string;
  plan_name: string;
  plan_tier: string;
  status: "ACTIVE" | "TRIAL" | "CANCELLED" | "PAST_DUE";
  billing_cycle: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  current_period_end: string;
  mrr_amount: number;
}

export interface AdminCourt {
  id: string;
  venue_id: string;
  name: string;
  sport_type: string;
  surface: string;
  is_indoor: boolean;
  default_hourly_rate: number;
  discount_percentage: number;
  final_rate: number;
  promo_badge?: string | null;
  promo_subtext?: string | null;
  is_active: boolean;
  image_url?: string | null;
}

export interface AdminVenue {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  cover_image_url?: string;
  rating_average: number;
  rating_count: number;
  is_active: boolean;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  organization_name?: string;
  subscription_plan?: string;
  subscription_status?: string;
  courts: AdminCourt[];
}

export interface CreateVenueWithOwnerPayload {
  name: string;
  slug?: string;
  description?: string;
  phone?: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  cover_image_url?: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
  owner_phone?: string;
  courts?: {
    name: string;
    sport_type: string;
    surface: string;
    is_indoor?: boolean;
    default_hourly_rate: number;
    discount_percentage?: number;
    promo_badge?: string;
    promo_subtext?: string;
    image_url?: string;
  }[];
}

export interface WhatsAppContact {
  id: string;
  venue_id?: string | null;
  department: string;
  label?: string | null;
  phone_number: string;
  custom_message?: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWhatsAppContactPayload {
  venue_id?: string | null;
  department: string;
  label?: string;
  phone_number: string;
  custom_message?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface UpdateWhatsAppContactPayload {
  department?: string;
  label?: string;
  phone_number?: string;
  custom_message?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface ManagerVenue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  cover_image_url?: string;
  address_street: string;
  address_number: string;
  neighborhood?: string;
  city: string;
  state: string;
  courts: {
    id: string;
    name: string;
    sport_type: string;
    surface: string;
    default_hourly_rate: number;
    discount_percentage: number;
    promo_badge?: string | null;
    promo_subtext?: string | null;
    is_active: boolean;
  }[];
  whatsapp_contacts: WhatsAppContact[];
}

export interface UpdateCourtPricingPayload {
  default_hourly_rate: number;
  discount_percentage?: number;
  promo_badge?: string;
  promo_subtext?: string;
  image_url?: string;
}

export interface UpdateVenuePayload {
  name?: string;
  description?: string;
  phone?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  cover_image_url?: string;
}

// Token helper
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arenago_token");
}

export function setStoredToken(token: string, role?: string, fullName?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("arenago_token", token);
  if (role) localStorage.setItem("arenago_role", role);
  if (fullName) localStorage.setItem("arenago_name", fullName);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("arenago_token");
  localStorage.removeItem("arenago_role");
  localStorage.removeItem("arenago_name");
}

export function getStoredUser(): { role: string; name: string } | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("arenago_role");
  const name = localStorage.getItem("arenago_name");
  if (!role) return null;
  return { role, name: name || "Usuário" };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = `Erro HTTP ${res.status}`;
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export interface CourtScheduleSlot {
  hour: number;
  start_time: string;
  end_time: string;
  time_label: string;
  is_available: boolean;
  is_booked: boolean;
  hourly_rate: number;
  original_rate: number;
  badge?: string | null;
  has_discount: boolean;
}

export interface CourtSchedule {
  court_id: string;
  court_name: string;
  sport_type: string;
  surface: string;
  is_indoor: boolean;
  default_hourly_rate: number;
  image_url?: string;
  address: string;
  promo_badge?: string;
  promo_subtext?: string;
  slots: CourtScheduleSlot[];
}

export interface VenueScheduleResponse {
  venue_id: string;
  venue_name: string;
  venue_slug: string;
  address_full: string;
  city: string;
  state: string;
  rating_average: number;
  rating_count: number;
  target_date: string;
  courts: CourtSchedule[];
}

// API Methods
export const api = {
  // Auth
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Falha no login. Verifique seu e-mail e senha.");
    }

    const data = await res.json();
    setStoredToken(data.access_token, data.role, data.full_name);
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>("/auth/me");
  },

  // Venues
  async getVenues(params?: { sport?: string; city?: string; max_price?: number }): Promise<Venue[]> {
    const query = new URLSearchParams();
    if (params?.sport) query.append("sport", params.sport);
    if (params?.city) query.append("city", params.city);
    if (params?.max_price) query.append("max_price", params.max_price.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<Venue[]>(`/venues${qs}`);
  },

  async getVenue(idOrSlug: string): Promise<Venue> {
    return request<Venue>(`/venues/${idOrSlug}`);
  },

  async getVenueSchedule(idOrSlug: string, dateStr?: string): Promise<VenueScheduleResponse> {
    const qs = dateStr ? `?target_date=${dateStr}` : "";
    return request<VenueScheduleResponse>(`/venues/${idOrSlug}/schedule${qs}`);
  },

  async googleLogin(credentialOrEmail?: string, name?: string) {
    const isJwt = credentialOrEmail && credentialOrEmail.includes(".") && credentialOrEmail.length > 50;
    const bodyPayload = isJwt
      ? { credential: credentialOrEmail }
      : { email: credentialOrEmail, name };

    const res = await request<any>("/auth/google", {
      method: "POST",
      body: JSON.stringify(bodyPayload),
    });
    setStoredToken(res.access_token, res.role, res.full_name);
    return res;
  },

  async forgotPassword(email: string) {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async getCourtSlots(courtId: string, dateStr?: string): Promise<SlotAvailability[]> {
    const qs = dateStr ? `?target_date=${dateStr}` : "";
    return request<SlotAvailability[]>(`/venues/courts/${courtId}/slots${qs}`);
  },

  // Bookings
  async createBooking(courtId: string, startTime: string, endTime: string, bookingType: string = "ONLINE_SINGLE", notes?: string): Promise<Booking> {
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        booking_type: bookingType,
        notes: notes,
      }),
    });
  },

  async getMyBookings(): Promise<Booking[]> {
    return request<Booking[]>("/bookings/me");
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    return request<Booking>(`/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
  },

  // Manager
  async getManagerTimeline(dateStr?: string): Promise<ManagerTimelineResponse> {
    const qs = dateStr ? `?target_date=${dateStr}` : "";
    return request<ManagerTimelineResponse>(`/manager/timeline${qs}`);
  },

  async getManagerStats(): Promise<ManagerStats> {
    return request<ManagerStats>("/manager/stats");
  },

  // Admin SaaS
  async getAdminMetrics(): Promise<AdminMetrics> {
    return request<AdminMetrics>("/admin/metrics");
  },

  async getAdminSubscriptions(status?: string, planTier?: string): Promise<AdminSubscription[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (planTier) query.append("plan_tier", planTier);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<AdminSubscription[]>(`/admin/subscriptions${qs}`);
  },

  async getAdminVenues(): Promise<AdminVenue[]> {
    return request<AdminVenue[]>("/admin/venues");
  },

  async createVenueWithOwner(payload: CreateVenueWithOwnerPayload): Promise<any> {
    return request("/admin/venues", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateVenue(venueId: string, payload: UpdateVenuePayload): Promise<any> {
    return request(`/admin/venues/${venueId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateCourtPricing(courtId: string, payload: UpdateCourtPricingPayload): Promise<any> {
    return request(`/admin/courts/${courtId}/pricing`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async addCourtToVenue(venueId: string, payload: UpdateCourtPricingPayload & { name: string; sport_type: string; surface: string; is_indoor?: boolean }): Promise<any> {
    const qs = new URLSearchParams({
      name: payload.name,
      sport_type: payload.sport_type,
      surface: payload.surface,
      is_indoor: String(payload.is_indoor || false),
    }).toString();
    return request(`/admin/venues/${venueId}/courts?${qs}`, {
      method: "POST",
      body: JSON.stringify({
        default_hourly_rate: payload.default_hourly_rate,
        discount_percentage: payload.discount_percentage,
        promo_badge: payload.promo_badge,
        promo_subtext: payload.promo_subtext,
        image_url: payload.image_url,
      }),
    });
  },

  // WhatsApp Contacts
  async getPlatformWhatsAppContacts(): Promise<WhatsAppContact[]> {
    return request<WhatsAppContact[]>("/venues/platform/whatsapp-contacts");
  },

  async getVenueWhatsAppContacts(venueIdOrSlug: string): Promise<WhatsAppContact[]> {
    return request<WhatsAppContact[]>(`/venues/${venueIdOrSlug}/whatsapp-contacts`);
  },

  // Manager Venues & WhatsApp
  async getManagerVenues(): Promise<ManagerVenue[]> {
    return request<ManagerVenue[]>("/manager/venues");
  },

  async createManagerWhatsAppContact(venueId: string, payload: CreateWhatsAppContactPayload): Promise<WhatsAppContact> {
    return request<WhatsAppContact>(`/manager/venues/${venueId}/whatsapp-contacts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateManagerWhatsAppContact(contactId: string, payload: UpdateWhatsAppContactPayload): Promise<WhatsAppContact> {
    return request<WhatsAppContact>(`/manager/whatsapp-contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteManagerWhatsAppContact(contactId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/manager/whatsapp-contacts/${contactId}`, {
      method: "DELETE",
    });
  },

  // Admin WhatsApp
  async getAdminWhatsAppContacts(venueId?: string): Promise<WhatsAppContact[]> {
    const qs = venueId ? `?venue_id=${venueId}` : "";
    return request<WhatsAppContact[]>(`/admin/whatsapp-contacts${qs}`);
  },

  async createAdminWhatsAppContact(payload: CreateWhatsAppContactPayload): Promise<WhatsAppContact> {
    return request<WhatsAppContact>("/admin/whatsapp-contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminWhatsAppContact(contactId: string, payload: UpdateWhatsAppContactPayload): Promise<WhatsAppContact> {
    return request<WhatsAppContact>(`/admin/whatsapp-contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminWhatsAppContact(contactId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/admin/whatsapp-contacts/${contactId}`, {
      method: "DELETE",
    });
  },
};

