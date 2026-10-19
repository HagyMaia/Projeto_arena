const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api/v1" : "http://localhost:8001/api/v1");

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
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
  payment_status: "UNPAID" | "PAID" | "REFUNDED" | "PENDING" | "EXPIRED";
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
  is_published?: boolean;
  is_deleted?: boolean;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  organization_name?: string;
  subscription_plan?: string;
  subscription_status?: string;
  courts: AdminCourt[];
}

export interface ArenaRequestItem {
  id: string;
  request_number: string;
  arena_name: string;
  responsible_name: string;
  whatsapp: string;
  email: string;
  document_type: "CPF" | "CNPJ";
  document_number: string;
  address_street: string;
  address_number: string;
  address_complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  sports_modalities?: string[] | null;
  court_count: number;
  operating_hours_description?: string | null;
  description?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_notes?: string | null;
  created_venue_id?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArenaRequestCreatePayload {
  arena_name: string;
  responsible_name: string;
  whatsapp: string;
  email: string;
  document_type: "CPF" | "CNPJ";
  document_number: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  sports_modalities?: string[];
  court_count?: number;
  operating_hours_description?: string;
  description?: string;
}

export interface ArenaRequestSubmitResponse {
  request: ArenaRequestItem;
  whatsapp_number: string;
  whatsapp_message: string;
  whatsapp_url: string;
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

export function setStoredToken(token: string, role?: string, fullName?: string, email?: string, userId?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("arenago_token", token);
  if (role) localStorage.setItem("arenago_role", role);
  if (fullName) localStorage.setItem("arenago_name", fullName);
  if (email) localStorage.setItem("arenago_email", email);
  if (userId) localStorage.setItem("arenago_user_id", userId);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("arenago_token");
  localStorage.removeItem("arenago_role");
  localStorage.removeItem("arenago_name");
  localStorage.removeItem("arenago_email");
  localStorage.removeItem("arenago_user_id");
}

export function getStoredUser(): { id?: string; role: string; name: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("arenago_token");
  const role = localStorage.getItem("arenago_role");
  const name = localStorage.getItem("arenago_name");
  const email = localStorage.getItem("arenago_email");
  const id = localStorage.getItem("arenago_user_id") || undefined;
  if (!token || !role) return null;
  return { id, role, name: name || "Usuário", email: email || undefined };
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
    const err: any = new Error(errorDetail);
    err.status = res.status;
    throw err;
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
    setStoredToken(data.access_token, data.role, data.full_name, data.email, data.user_id);
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
    setStoredToken(res.access_token, res.role, res.full_name, res.email || (!isJwt ? credentialOrEmail : undefined), res.user_id);
    return res;
  },

  async loginWithGoogle(email?: string, name?: string) {
    return this.googleLogin(email, name);
  },

  async sendBookingConfirmationEmail(bookingId: string, recipientEmail?: string) {
    return request<{ success: boolean; message: string; recipient: string }>(`/bookings/${bookingId}/send-confirmation-email`, {
      method: "POST",
      body: JSON.stringify({ recipient_email: recipientEmail }),
    });
  },

  async getBookingEmailPreview(bookingId: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/email-preview`);
    if (!res.ok) throw new Error("Falha ao carregar preview do e-mail");
    return res.text();
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
  async checkAvailability(courtId: string, startTime: string, endTime: string): Promise<{
    available: boolean;
    court_id: string;
    start_time: string;
    end_time: string;
    reason?: string;
  }> {
    return request<{
      available: boolean;
      court_id: string;
      start_time: string;
      end_time: string;
      reason?: string;
    }>("/bookings/check-availability", {
      method: "POST",
      body: JSON.stringify({
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
      }),
    });
  },

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

  async updateAdminVenueStatus(venueId: string, payload: { is_active?: boolean; is_published?: boolean }): Promise<any> {
    return request(`/admin/venues/${venueId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminVenue(venueId: string, permanent: boolean = false): Promise<any> {
    const qs = permanent ? "?permanent=true" : "";
    return request(`/admin/venues/${venueId}${qs}`, {
      method: "DELETE",
    });
  },

  // Arena Requests (Público e Super Admin)
  async createArenaRequest(payload: ArenaRequestCreatePayload): Promise<ArenaRequestSubmitResponse> {
    return request<ArenaRequestSubmitResponse>("/arena-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAdminArenaRequests(statusFilter?: string): Promise<ArenaRequestItem[]> {
    const qs = statusFilter && statusFilter !== "ALL" ? `?status_filter=${statusFilter}` : "";
    return request<ArenaRequestItem[]>(`/arena-requests${qs}`);
  },

  async getAdminArenaRequest(requestId: string): Promise<ArenaRequestItem> {
    return request<ArenaRequestItem>(`/arena-requests/${requestId}`);
  },

  async approveArenaRequest(requestId: string, payload?: { 
    decision_notes?: string; 
    admin_notes?: string; 
    courts_hourly_rate?: number; 
    default_hourly_rate?: number; 
    manager_password?: string;
    temporary_password?: string;
  }): Promise<any> {
    const bodyPayload = {
      decision_notes: payload?.decision_notes || payload?.admin_notes,
      courts_hourly_rate: payload?.courts_hourly_rate ?? payload?.default_hourly_rate,
      manager_password: payload?.manager_password || payload?.temporary_password,
    };
    return request(`/arena-requests/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify(bodyPayload),
    });
  },

  async rejectArenaRequest(requestId: string, payload?: { decision_notes?: string; admin_notes?: string }): Promise<any> {
    const bodyPayload = {
      decision_notes: payload?.decision_notes || payload?.admin_notes,
    };
    return request(`/arena-requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify(bodyPayload),
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

  // Mercado Pago & Sistema de Pagamentos
  async createPaymentIntent(payload: {
    court_id: string;
    start_time: string;
    end_time: string;
    booking_type?: string;
    payment_method: "PIX" | "CREDIT_CARD";
    notes?: string;
    card_token?: string;
    card_brand?: string;
    card_last_four?: string;
  }): Promise<PaymentIntentResponse> {
    return request<PaymentIntentResponse>("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPaymentStatus(bookingId: string): Promise<PaymentStatusResponse> {
    return request<PaymentStatusResponse>(`/payments/status/${bookingId}`);
  },

  async refundPayment(bookingId: string): Promise<{ success: boolean; message: string; refunded_amount: number }> {
    return request<{ success: boolean; message: string; refunded_amount: number }>(`/payments/${bookingId}/refund`, {
      method: "POST",
    });
  },

  async getManagerPaymentAccount(venueId?: string): Promise<ManagerPaymentAccount> {
    const qs = venueId ? `?venue_id=${venueId}` : "";
    return request<ManagerPaymentAccount>(`/payments/manager/account${qs}`);
  },

  async connectManagerPaymentAccount(venueId: string, code?: string): Promise<{ success: boolean; message: string; account_email?: string }> {
    return request<{ success: boolean; message: string; account_email?: string }>("/payments/manager/connect", {
      method: "POST",
      body: JSON.stringify({ venue_id: venueId, code, test_mode: true }),
    });
  },

  async disconnectManagerPaymentAccount(venueId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/payments/manager/disconnect?venue_id=${venueId}`, {
      method: "DELETE",
    });
  },

  async getManagerFinancialOverview(venueId?: string, statusFilter?: string): Promise<ManagerFinancialOverview> {
    const params = new URLSearchParams();
    if (venueId) params.append("venue_id", venueId);
    if (statusFilter) params.append("status_filter", statusFilter);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<ManagerFinancialOverview>(`/payments/manager/financial-overview${qs}`);
  },

  async getAdminFinancialOverview(): Promise<{ gmv_volume: number; platform_fee_revenue: number; total_paid_orders: number; connected_venues_count: number; payment_gateway: string }> {
    return request<{ gmv_volume: number; platform_fee_revenue: number; total_paid_orders: number; connected_venues_count: number; payment_gateway: string }>("/payments/admin/overview");
  },
};

export interface PaymentIntentResponse {
  booking_id: string;
  payment_id: string;
  amount: number;
  status: string;
  payment_method: string;
  pix_qr_code?: string;
  pix_code?: string;
  expires_at?: string;
  venue_name: string;
  court_name: string;
  date_formatted: string;
  time_range: string;
}

export interface PaymentStatusResponse {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  is_confirmed: boolean;
  amount: number;
  payment_method?: string;
  pix_code?: string;
  pix_qr_code?: string;
  expires_at?: string;
  paid_at?: string;
  voucher_code?: string;
}

export interface ManagerFinancialOverview {
  metrics: {
    gross_revenue: number;
    net_revenue: number;
    platform_fees: number;
    count_paid: number;
    count_pending: number;
    count_refunded: number;
    total_transactions: number;
  };
  transactions: {
    payment_id: string;
    booking_id: string;
    booking_code: string;
    amount: number;
    platform_fee: number;
    net_amount: number;
    payment_method: string;
    status: string;
    payer_name: string;
    payer_email: string;
    court_name: string;
    start_time: string;
    end_time: string;
    paid_at?: string;
    created_at: string;
    mp_payment_id?: string;
  }[];
}

export interface ManagerPaymentAccount {
  venue_id?: string;
  venue_name?: string;
  connected: boolean;
  status?: string;
  account_email?: string;
  account_name?: string;
  public_key?: string;
  live_mode?: boolean;
  connected_at?: string;
  auth_url?: string;
}

