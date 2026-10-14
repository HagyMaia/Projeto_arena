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
  images?: CourtImage[];
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
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
  payment_status: "UNPAID" | "PAID" | "REFUNDED";
  booking_type: "ONLINE_SINGLE" | "RECURRING_MONTHLY" | "OFFLINE_MANUAL";
  total_amount: number;
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

  async getCourtSlots(courtId: string, dateStr?: string): Promise<SlotAvailability[]> {
    const qs = dateStr ? `?target_date=${dateStr}` : "";
    return request<SlotAvailability[]>(`/venues/courts/${courtId}/slots${qs}`);
  },

  // Bookings
  async createBooking(courtId: string, startTime: string, endTime: string, bookingType: string = "ONLINE_SINGLE"): Promise<Booking> {
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        booking_type: bookingType,
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
};
