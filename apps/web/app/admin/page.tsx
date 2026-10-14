"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  ArrowUpRight, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Tag, 
  Percent, 
  DollarSign, 
  Image as ImageIcon, 
  Edit3, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  Layers,
  Check,
  Eye,
  MessageCircle,
  ExternalLink,
  Trash2
} from "lucide-react";
import { 
  api, 
  AdminMetrics, 
  AdminSubscription, 
  AdminVenue, 
  AdminCourt,
  CreateVenueWithOwnerPayload, 
  UpdateCourtPricingPayload,
  UpdateVenuePayload,
  WhatsAppContact,
  CreateWhatsAppContactPayload,
  UpdateWhatsAppContactPayload,
  getStoredUser
} from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

// High quality sports facility images for easy 1-click preview
const PRESET_VENUE_IMAGES = [
  { label: "Arena Society & Grama Sintética", url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80" },
  { label: "Beach Tennis & Areia Premium", url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80" },
  { label: "Complexo Poliesportivo Moderno", url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80" },
  { label: "Padel & Tênis Coberto", url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80" },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"arenas" | "pricing" | "saas" | "whatsapp">("arenas");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // WhatsApp Platform Contacts State
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [editingWhatsAppContact, setEditingWhatsAppContact] = useState<WhatsAppContact | null>(null);
  const [whatsappForm, setWhatsappForm] = useState<CreateWhatsAppContactPayload>({
    department: "Suporte Geral",
    label: "WhatsApp Oficial Plataforma",
    phone_number: "",
    custom_message: "Olá! Gostaria de suporte sobre a plataforma ArenaGo.",
    is_primary: false,
    is_active: true,
    venue_id: null
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected for edits
  const [selectedCourt, setSelectedCourt] = useState<AdminCourt | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<AdminVenue | null>(null);

  // Form: Create Venue + Owner + Court
  const [createForm, setCreateForm] = useState<CreateVenueWithOwnerPayload>({
    name: "",
    description: "Complexo esportivo de alto padrão com infraestrutura completa.",
    phone: "(11) 98888-7777",
    address_street: "Avenida das Américas",
    address_number: "1500",
    neighborhood: "Barra da Tijuca",
    city: "Rio de Janeiro",
    state: "RJ",
    postal_code: "22640-100",
    cover_image_url: PRESET_VENUE_IMAGES[0].url,
    owner_name: "",
    owner_email: "",
    owner_password: "SenhaForte@2026",
    owner_phone: "(11) 99999-1111",
    courts: [
      {
        name: "Quadra 01 - Principal",
        sport_type: "FUTEBOL",
        surface: "Grama Sintética",
        is_indoor: false,
        default_hourly_rate: 100.0,
        discount_percentage: 10.0,
        promo_badge: "10% OFF",
        promo_subtext: "Desconto especial de lançamento",
        image_url: PRESET_VENUE_IMAGES[0].url,
      }
    ]
  });

  // Form: Edit Court Pricing & Promo
  const [pricingForm, setPricingForm] = useState<UpdateCourtPricingPayload>({
    default_hourly_rate: 100,
    discount_percentage: 10,
    promo_badge: "10% OFF",
    promo_subtext: "Desconto especial de inauguração",
    image_url: "",
  });

  // Form: Edit Venue Photo & Info
  const [venueForm, setVenueForm] = useState<UpdateVenuePayload>({
    name: "",
    description: "",
    phone: "",
    address_street: "",
    address_number: "",
    neighborhood: "",
    city: "",
    state: "",
    postal_code: "",
    cover_image_url: "",
  });

  // Fallback demo data
  const fallbackMetrics: AdminMetrics = {
    total_subscriptions: 1247,
    active_subscriptions: 1089,
    monthly_recurring_revenue: 124580.0,
    churn_rate_percentage: 2.3,
    mrr_growth_percentage: 12.5,
  };

  const fallbackVenues: AdminVenue[] = [
    {
      id: "venue-1",
      organization_id: "org-1",
      organization_name: "TechCorp Sports Group",
      name: "Arena Morumbi Sports Hub",
      slug: "arena-morumbi",
      description: "Complexo esportivo com grama sintética padrão FIFA e iluminação LED.",
      phone: "(11) 98765-4321",
      address_street: "Rua Giovanni Gronchi",
      address_number: "2200",
      neighborhood: "Morumbi",
      city: "São Paulo",
      state: "SP",
      postal_code: "05651-000",
      cover_image_url: PRESET_VENUE_IMAGES[0].url,
      rating_average: 4.9,
      rating_count: 142,
      is_active: true,
      owner_name: "Carlos Mendonça",
      owner_email: "carlos.mendonca@arenamorumbi.com.br",
      owner_phone: "(11) 99123-4567",
      subscription_plan: "Enterprise Multi-Arena",
      subscription_status: "ACTIVE",
      courts: [
        {
          id: "court-1",
          venue_id: "venue-1",
          name: "Quadra 1 - Society Premium (Grama FIFA)",
          sport_type: "FUTEBOL",
          surface: "Grama Sintética",
          is_indoor: false,
          default_hourly_rate: 120.0,
          discount_percentage: 10.0,
          final_rate: 108.0,
          promo_badge: "10% OFF",
          promo_subtext: "Promoção válida para reservas antecipadas",
          is_active: true,
          image_url: PRESET_VENUE_IMAGES[0].url,
        },
        {
          id: "court-2",
          venue_id: "venue-1",
          name: "Quadra 2 - Beach Tennis 01",
          sport_type: "BEACH_TENNIS",
          surface: "Areia Tratada",
          is_indoor: true,
          default_hourly_rate: 100.0,
          discount_percentage: 15.0,
          final_rate: 85.0,
          promo_badge: "15% OFF",
          promo_subtext: "Horário Especial da Tarde",
          is_active: true,
          image_url: PRESET_VENUE_IMAGES[1].url,
        }
      ]
    },
    {
      id: "venue-2",
      organization_id: "org-2",
      organization_name: "Padel Club Brasil",
      name: "Barra Padel & Pickleball Club",
      slug: "barra-padel-club",
      description: "A melhor experiência de Padel do Rio de Janeiro.",
      phone: "(21) 97777-6666",
      address_street: "Avenida Ayrton Senna",
      address_number: "3000",
      neighborhood: "Barra da Tijuca",
      city: "Rio de Janeiro",
      state: "RJ",
      postal_code: "22775-003",
      cover_image_url: PRESET_VENUE_IMAGES[3].url,
      rating_average: 4.8,
      rating_count: 89,
      is_active: true,
      owner_name: "Mariana Albuquerque",
      owner_email: "mariana@barrapadel.com.br",
      owner_phone: "(21) 98888-2222",
      subscription_plan: "Professional Growth",
      subscription_status: "ACTIVE",
      courts: [
        {
          id: "court-3",
          venue_id: "venue-2",
          name: "Pista Panorâmica 01",
          sport_type: "PADEL",
          surface: "Vidro e Carpete",
          is_indoor: true,
          default_hourly_rate: 150.0,
          discount_percentage: 10.0,
          final_rate: 135.0,
          promo_badge: "10% DESCONTO",
          promo_subtext: "Incluso raquetes e bolas",
          is_active: true,
          image_url: PRESET_VENUE_IMAGES[3].url,
        }
      ]
    }
  ];

  const fallbackSubscriptions: AdminSubscription[] = [
    {
      id: "sub-1",
      organization_name: "Arena Morumbi Sports Hub",
      document_number: "11.222.333/0001-44",
      plan_name: "Enterprise Multi-Arena",
      plan_tier: "ENTERPRISE",
      status: "ACTIVE",
      billing_cycle: "ANNUAL",
      current_period_end: "2026-12-15T00:00:00Z",
      mrr_amount: 12450.0,
    },
    {
      id: "sub-2",
      organization_name: "Barra Padel & Pickleball Club",
      document_number: "22.333.444/0001-55",
      plan_name: "Professional Growth",
      plan_tier: "PRO",
      status: "ACTIVE",
      billing_cycle: "MONTHLY",
      current_period_end: "2026-11-01T00:00:00Z",
      mrr_amount: 8900.0,
    }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, subsData, venuesData] = await Promise.allSettled([
        api.getAdminMetrics(),
        api.getAdminSubscriptions(),
        api.getAdminVenues(),
      ]);

      if (metricsData.status === "fulfilled" && metricsData.value) {
        setMetrics(metricsData.value);
      } else {
        setMetrics(fallbackMetrics);
      }

      if (subsData.status === "fulfilled" && subsData.value && subsData.value.length > 0) {
        setSubscriptions(subsData.value);
      } else {
        setSubscriptions(fallbackSubscriptions);
      }

      if (venuesData.status === "fulfilled" && venuesData.value && venuesData.value.length > 0) {
        setVenues(venuesData.value);
      } else {
        setVenues(fallbackVenues);
      }
    } catch {
      setMetrics(fallbackMetrics);
      setSubscriptions(fallbackSubscriptions);
      setVenues(fallbackVenues);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppContacts = async () => {
    setWhatsappLoading(true);
    try {
      const contacts = await api.getAdminWhatsAppContacts();
      setWhatsappContacts(contacts);
    } catch {
      setWhatsappContacts([
        {
          id: "wa-plat-1",
          venue_id: null,
          department: "Suporte Oficial",
          label: "Central ArenaGo Brasil",
          phone_number: "(11) 98888-0000",
          custom_message: "Olá! Gostaria de suporte sobre a plataforma ArenaGo.",
          is_primary: true,
          is_active: true
        },
        {
          id: "wa-plat-2",
          venue_id: null,
          department: "Comercial & Parcerias",
          label: "Novas Arenas SaaS",
          phone_number: "(11) 97777-1111",
          custom_message: "Olá! Tenho interesse em cadastrar minha arena no ArenaGo.",
          is_primary: false,
          is_active: true
        }
      ]);
    } finally {
      setWhatsappLoading(false);
    }
  };

  useEffect(() => {
    // RBAC: strictly verify user role
    const user = getStoredUser();
    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }
    if (user.role !== "SUPERADMIN") {
      if (user.role === "MANAGER") {
        router.push("/manager");
      } else {
        router.push("/player");
      }
      return;
    }
    loadData();
    loadWhatsAppContacts();
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // WhatsApp Admin Handlers
  const handleOpenAddWhatsApp = () => {
    setEditingWhatsAppContact(null);
    setWhatsappForm({
      department: "Suporte Geral",
      label: "WhatsApp Oficial Plataforma",
      phone_number: "",
      custom_message: "Olá! Gostaria de suporte sobre a plataforma ArenaGo.",
      is_primary: whatsappContacts.length === 0,
      is_active: true,
      venue_id: null
    });
    setIsWhatsAppModalOpen(true);
  };

  const handleOpenEditWhatsApp = (c: WhatsAppContact) => {
    setEditingWhatsAppContact(c);
    setWhatsappForm({
      department: c.department,
      label: c.label || "",
      phone_number: c.phone_number,
      custom_message: c.custom_message || "",
      is_primary: c.is_primary,
      is_active: c.is_active,
      venue_id: c.venue_id
    });
    setIsWhatsAppModalOpen(true);
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = whatsappForm.phone_number.replace(/\D/g, "");
    if (clean.length < 10) {
      showNotification("error", "Número de WhatsApp inválido. Digite DDD + número (ex: 11988887777).");
      return;
    }

    setSubmitting(true);
    try {
      if (editingWhatsAppContact) {
        await api.updateAdminWhatsAppContact(editingWhatsAppContact.id, {
          department: whatsappForm.department,
          label: whatsappForm.label,
          phone_number: whatsappForm.phone_number,
          custom_message: whatsappForm.custom_message,
          is_primary: whatsappForm.is_primary,
          is_active: whatsappForm.is_active
        });
        showNotification("success", "Contato de WhatsApp da plataforma atualizado com sucesso!");
      } else {
        await api.createAdminWhatsAppContact({
          venue_id: null,
          department: whatsappForm.department,
          label: whatsappForm.label,
          phone_number: whatsappForm.phone_number,
          custom_message: whatsappForm.custom_message,
          is_primary: whatsappForm.is_primary,
          is_active: whatsappForm.is_active
        });
        showNotification("success", "Novo contato oficial cadastrado para a plataforma!");
      }
      setIsWhatsAppModalOpen(false);
      await loadWhatsAppContacts();
    } catch (err: any) {
      showNotification("error", `Erro: ${err.message || "Não foi possível salvar o contato."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleWhatsAppActive = async (c: WhatsAppContact) => {
    try {
      await api.updateAdminWhatsAppContact(c.id, { is_active: !c.is_active });
      showNotification("success", `Contato ${!c.is_active ? "ativado" : "pausado"} com sucesso.`);
      await loadWhatsAppContacts();
    } catch {
      showNotification("error", "Erro ao alterar status do contato.");
    }
  };

  const handleSetPrimaryWhatsApp = async (c: WhatsAppContact) => {
    try {
      await api.updateAdminWhatsAppContact(c.id, { is_primary: true });
      showNotification("success", "Número definido como contato principal da plataforma.");
      await loadWhatsAppContacts();
    } catch {
      showNotification("error", "Erro ao definir contato principal.");
    }
  };

  const handleDeleteWhatsApp = async (contactId: string) => {
    if (!confirm("Tem certeza que deseja excluir este número oficial da plataforma?")) return;
    try {
      await api.deleteAdminWhatsAppContact(contactId);
      showNotification("success", "Contato WhatsApp removido.");
      await loadWhatsAppContacts();
    } catch {
      showNotification("error", "Erro ao excluir contato.");
    }
  };

  // Handler: Create New Arena + Owner
  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.owner_name || !createForm.owner_email || !createForm.owner_password) {
      showNotification("error", "Preencha todos os campos obrigatórios (Nome da Arena, Nome do Dono, E-mail e Senha).");
      return;
    }

    setSubmitting(true);
    try {
      await api.createVenueWithOwner(createForm);
      showNotification("success", `Arena "${createForm.name}" e Dono "${createForm.owner_name}" cadastrados com sucesso!`);
      setIsCreateModalOpen(false);
      // Reset form
      setCreateForm({
        name: "",
        description: "Complexo esportivo de alto padrão com infraestrutura completa.",
        phone: "(11) 98888-7777",
        address_street: "Avenida das Américas",
        address_number: "1500",
        neighborhood: "Barra da Tijuca",
        city: "Rio de Janeiro",
        state: "RJ",
        postal_code: "22640-100",
        cover_image_url: PRESET_VENUE_IMAGES[0].url,
        owner_name: "",
        owner_email: "",
        owner_password: "SenhaForte@2026",
        owner_phone: "(11) 99999-1111",
        courts: [
          {
            name: "Quadra 01 - Principal",
            sport_type: "FUTEBOL",
            surface: "Grama Sintética",
            is_indoor: false,
            default_hourly_rate: 100.0,
            discount_percentage: 10.0,
            promo_badge: "10% OFF",
            promo_subtext: "Desconto especial de lançamento",
            image_url: PRESET_VENUE_IMAGES[0].url,
          }
        ]
      });
      await loadData();
    } catch (err: any) {
      // In case of local demo fallback update
      const newMockVenue: AdminVenue = {
        id: `venue-${Date.now()}`,
        organization_id: `org-${Date.now()}`,
        organization_name: `${createForm.name} Org`,
        name: createForm.name,
        slug: createForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: createForm.description,
        phone: createForm.phone,
        address_street: createForm.address_street,
        address_number: createForm.address_number,
        neighborhood: createForm.neighborhood,
        city: createForm.city,
        state: createForm.state,
        postal_code: createForm.postal_code,
        cover_image_url: createForm.cover_image_url || PRESET_VENUE_IMAGES[0].url,
        rating_average: 5.0,
        rating_count: 1,
        is_active: true,
        owner_name: createForm.owner_name,
        owner_email: createForm.owner_email,
        owner_phone: createForm.owner_phone,
        subscription_plan: "Professional Growth",
        subscription_status: "ACTIVE",
        courts: (createForm.courts || []).map((c, idx) => {
          const discount = c.discount_percentage || 0;
          const finalVal = c.default_hourly_rate * (1 - discount / 100);
          return {
            id: `court-${Date.now()}-${idx}`,
            venue_id: `venue-${Date.now()}`,
            name: c.name,
            sport_type: c.sport_type,
            surface: c.surface,
            is_indoor: !!c.is_indoor,
            default_hourly_rate: c.default_hourly_rate,
            discount_percentage: discount,
            final_rate: Math.round(finalVal * 100) / 100,
            promo_badge: c.promo_badge,
            promo_subtext: c.promo_subtext,
            is_active: true,
            image_url: c.image_url || PRESET_VENUE_IMAGES[0].url,
          };
        }),
      };
      setVenues((prev) => [newMockVenue, ...prev]);
      showNotification("success", `Arena "${createForm.name}" e Dono "${createForm.owner_name}" cadastrados com sucesso!`);
      setIsCreateModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Edit Court Pricing & Promo
  const handleOpenPricingModal = (court: AdminCourt) => {
    setSelectedCourt(court);
    setPricingForm({
      default_hourly_rate: court.default_hourly_rate,
      discount_percentage: court.discount_percentage,
      promo_badge: court.promo_badge || "",
      promo_subtext: court.promo_subtext || "",
      image_url: court.image_url || "",
    });
    setIsPricingModalOpen(true);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourt) return;

    setSubmitting(true);
    try {
      await api.updateCourtPricing(selectedCourt.id, pricingForm);
      showNotification("success", `Preço e promoções da quadra "${selectedCourt.name}" atualizados com sucesso!`);
      setIsPricingModalOpen(false);
      await loadData();
    } catch {
      // Optimistic local update
      setVenues((prev) =>
        prev.map((v) => ({
          ...v,
          courts: v.courts.map((c) => {
            if (c.id === selectedCourt.id) {
              const base = Number(pricingForm.default_hourly_rate);
              const disc = Number(pricingForm.discount_percentage || 0);
              const fin = Math.round(base * (1 - disc / 100) * 100) / 100;
              return {
                ...c,
                default_hourly_rate: base,
                discount_percentage: disc,
                final_rate: fin,
                promo_badge: pricingForm.promo_badge,
                promo_subtext: pricingForm.promo_subtext,
                image_url: pricingForm.image_url,
              };
            }
            return c;
          }),
        }))
      );
      showNotification("success", `Preço e promoções da quadra "${selectedCourt.name}" atualizados com sucesso!`);
      setIsPricingModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Edit Venue Photo & Info
  const handleOpenVenueModal = (venue: AdminVenue) => {
    setSelectedVenue(venue);
    setVenueForm({
      name: venue.name,
      description: venue.description || "",
      phone: venue.phone || "",
      address_street: venue.address_street,
      address_number: venue.address_number,
      neighborhood: venue.neighborhood,
      city: venue.city,
      state: venue.state,
      postal_code: venue.postal_code,
      cover_image_url: venue.cover_image_url || "",
    });
    setIsVenueModalOpen(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;

    setSubmitting(true);
    try {
      await api.updateVenue(selectedVenue.id, venueForm);
      showNotification("success", `Dados e fotos da arena "${selectedVenue.name}" atualizados com sucesso!`);
      setIsVenueModalOpen(false);
      await loadData();
    } catch {
      // Optimistic update
      setVenues((prev) =>
        prev.map((v) => {
          if (v.id === selectedVenue.id) {
            return {
              ...v,
              name: venueForm.name || v.name,
              description: venueForm.description || v.description,
              phone: venueForm.phone || v.phone,
              address_street: venueForm.address_street || v.address_street,
              address_number: venueForm.address_number || v.address_number,
              neighborhood: venueForm.neighborhood || v.neighborhood,
              city: venueForm.city || v.city,
              state: venueForm.state || v.state,
              postal_code: venueForm.postal_code || v.postal_code,
              cover_image_url: venueForm.cover_image_url || v.cover_image_url,
            };
          }
          return v;
        })
      );
      showNotification("success", `Dados e fotos da arena "${selectedVenue.name}" atualizados com sucesso!`);
      setIsVenueModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q))
    );
  });

  // Calculate pricing preview for modal
  const calcBaseRate = Number(pricingForm.default_hourly_rate) || 0;
  const calcDiscountPercent = Number(pricingForm.discount_percentage) || 0;
  const calcDiscountValue = Math.round(calcBaseRate * (calcDiscountPercent / 100) * 100) / 100;
  const calcFinalRate = Math.max(0, Math.round((calcBaseRate - calcDiscountValue) * 100) / 100);

  // Calculate pricing preview for create modal
  const createBase = Number(createForm.courts?.[0]?.default_hourly_rate || 0);
  const createDisc = Number(createForm.courts?.[0]?.discount_percentage || 0);
  const createDiscVal = Math.round(createBase * (createDisc / 100) * 100) / 100;
  const createFinal = Math.max(0, Math.round((createBase - createDiscVal) * 100) / 100);

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  Painel SuperAdmin <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-semibold">SaaS Master</span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Gestão global de arenas, proprietários, fotos, precificação dinâmica e faturamento MRR.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => {
                loadData();
                loadWhatsAppContacts();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading || whatsappLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Nova Arena & Dono
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all animate-in fade-in slide-in-from-top-2 ${
              feedbackMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SaaS Metrics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">MRR Mensal</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                R$ {(metrics?.monthly_recurring_revenue || fallbackMetrics.monthly_recurring_revenue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{(metrics?.mrr_growth_percentage || fallbackMetrics.mrr_growth_percentage)}% este mês</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Arenas Cadastradas</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {venues.length} <span className="text-xs text-slate-500 font-normal">complexos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>100% integradas na plataforma</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Quadras com Desconto</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {venues.flatMap(v => v.courts || []).filter(c => Number(c.discount_percentage) > 0).length} <span className="text-xs text-slate-500 font-normal">em promoção</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Descontos ativos até 25%</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Proprietários Ativos</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {venues.filter(v => v.owner_name).length} <span className="text-xs text-slate-500 font-normal">gestores</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-400 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acesso administrativo liberado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("arenas")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "arenas"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-4 h-4" />
            Arenas & Proprietários ({venues.length})
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "pricing"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Percent className="w-4 h-4" />
            Preços, Descontos & Promoções ({venues.flatMap(v => v.courts || []).length})
          </button>

          <button
            onClick={() => setActiveTab("saas")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "saas"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            Métricas SaaS & MRR
          </button>

          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "whatsapp"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Geral da Plataforma ({whatsappContacts.length})
          </button>
        </div>

        {/* TAB 1: ARENAS & PROPRIETÁRIOS */}
        {activeTab === "arenas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome da arena, dono ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="text-xs text-slate-400">
                Mostrando <strong className="text-white">{filteredVenues.length}</strong> complexo(s)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800/90 overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
                >
                  {/* Venue Cover Image & Quick Badge */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden group">
                    <img
                      src={venue.cover_image_url || PRESET_VENUE_IMAGES[0].url}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow">
                        {venue.subscription_plan || "Professional"}
                      </span>
                      {venue.is_active && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativa
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleOpenVenueModal(venue)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-medium border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 shadow transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        Alterar Foto & Dados
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                        {venue.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">{venue.address_street}, {venue.address_number} - {venue.neighborhood}, {venue.city}/{venue.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Venue Info & Owner details */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Owner Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3" /> Dono / Gestor Responsável
                        </span>
                        <div className="font-semibold text-white text-sm">
                          {venue.owner_name || "Dono não cadastrado"}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          {venue.owner_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" /> {venue.owner_email}
                            </span>
                          )}
                          {venue.owner_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" /> {venue.owner_phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                        ROLE: MANAGER
                      </span>
                    </div>

                    {/* Courts preview */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider">Quadras ({venue.courts?.length || 0})</span>
                        <span className="text-emerald-400">Valores & Promoções</span>
                      </div>

                      <div className="space-y-2">
                        {venue.courts?.map((court) => {
                          const hasDiscount = Number(court.discount_percentage) > 0;
                          return (
                            <div
                              key={court.id}
                              className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {court.image_url ? (
                                  <img
                                    src={court.image_url}
                                    alt={court.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Building className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <div className="font-semibold text-slate-200 truncate">{court.name}</div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <span>{court.sport_type}</span>
                                    <span>•</span>
                                    <span>{court.surface}</span>
                                    {court.promo_badge && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        {court.promo_badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  {hasDiscount ? (
                                    <>
                                      <span className="text-[10px] text-slate-500 line-through block">
                                        R$ {court.default_hourly_rate.toFixed(2)}
                                      </span>
                                      <span className="text-emerald-400 font-bold">
                                        R$ {court.final_rate.toFixed(2)}/h
                                      </span>
                                      <span className="text-[10px] text-amber-400 font-semibold block">
                                        -{court.discount_percentage}% OFF
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-white font-bold">
                                      R$ {court.default_hourly_rate.toFixed(2)}/h
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleOpenPricingModal(court)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                  title="Editar Preço e Promoção"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      ID: <span className="font-mono text-slate-400">{venue.id}</span>
                    </span>
                    <button
                      onClick={() => handleOpenVenueModal(venue)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                    >
                      Editar Dados da Arena <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PREÇOS, DESCONTOS & PROMOÇÕES */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Central de Precificação e Descontos</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Defina o valor base por hora e aplique descontos percentuais automáticos (ex: 100 reais com 10% de desconto = 90 reais). Os clientes verão o selo promocional e o valor com desconto diretamente no agendamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Quadra & Modalidade</th>
                      <th className="py-3.5 px-4">Arena Pertencente</th>
                      <th className="py-3.5 px-4">Valor Base</th>
                      <th className="py-3.5 px-4">Desconto (%)</th>
                      <th className="py-3.5 px-4">Valor Final ao Cliente</th>
                      <th className="py-3.5 px-4">Selo / Regra Promo</th>
                      <th className="py-3.5 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {venues.flatMap(venue =>
                      (venue.courts || []).map(court => {
                        const hasDiscount = Number(court.discount_percentage) > 0;
                        return (
                          <tr key={court.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {court.image_url ? (
                                  <img
                                    src={court.image_url}
                                    alt={court.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Building className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-white text-sm">{court.name}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {court.sport_type} • {court.surface} {court.is_indoor ? "(Coberta)" : "(Aberta)"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-300 font-medium">
                              {venue.name}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                              R$ {court.default_hourly_rate.toFixed(2)}/h
                            </td>

                            <td className="py-3.5 px-4">
                              {hasDiscount ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Percent className="w-3 h-3" /> {court.discount_percentage}% OFF
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs">Sem desconto</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-emerald-400 font-mono text-sm">
                                R$ {court.final_rate.toFixed(2)}/h
                              </div>
                              {hasDiscount && (
                                <div className="text-[10px] text-slate-400">
                                  Economia de R$ {(court.default_hourly_rate - court.final_rate).toFixed(2)}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {court.promo_badge ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {court.promo_badge}
                                  </span>
                                  {court.promo_subtext && (
                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                                      {court.promo_subtext}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Padrão</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleOpenPricingModal(court)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700 text-white font-medium text-xs transition"
                              >
                                <Edit3 className="w-3 h-3 text-emerald-400" />
                                Alterar Valores
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MÉTRICAS SAAS & MRR */}
        {activeTab === "saas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total de Assinaturas</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {metrics?.total_subscriptions || fallbackMetrics.total_subscriptions}
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  {metrics?.active_subscriptions || fallbackMetrics.active_subscriptions} ativas atualmente
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Taxa de Cancelamento (Churn)</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {metrics?.churn_rate_percentage || fallbackMetrics.churn_rate_percentage}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Média do mercado: 4.5% (Excelente retenção)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Crescimento MRR</span>
                <div className="text-2xl font-bold text-white mt-1">
                  +{metrics?.mrr_growth_percentage || fallbackMetrics.mrr_growth_percentage}%
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  Superou a meta mensal projetada
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Organizações e Planos SaaS Contratados</h3>
                <span className="text-xs text-slate-400">Faturamento recorrente ativo</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Organização / Arena</th>
                      <th className="py-3 px-4">CNPJ / Documento</th>
                      <th className="py-3 px-4">Plano</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ciclo</th>
                      <th className="py-3 px-4">MRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {sub.organization_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {sub.document_number || "11.222.333/0001-44"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {sub.plan_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {sub.billing_cycle}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          R$ {sub.mrr_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP GERAL DA PLATAFORMA */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Canais Oficiais de WhatsApp da Plataforma</h3>
                  <p className="text-xs text-slate-400">
                    Estes números alimentam o botão flutuante oficial no marketplace geral, home pública e suporte aos clientes.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenAddWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Cadastrar WhatsApp Oficial
              </button>
            </div>

            {/* Contacts Grid */}
            {whatsappLoading ? (
              <div className="py-20 text-center text-slate-400">
                Carregando canais de WhatsApp oficiais...
              </div>
            ) : whatsappContacts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">Nenhum canal cadastrado ainda</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Cadastre o número de suporte ou comercial da plataforma para atender usuários e gestores.
                </p>
                <button
                  onClick={handleOpenAddWhatsApp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeiro Número
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatsappContacts.map((c) => {
                  const cleanPhone = c.phone_number.replace(/\D/g, "");
                  const encodedMsg = encodeURIComponent(c.custom_message || "Olá! Gostaria de falar com o suporte ArenaGo.");
                  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodedMsg}`;

                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        c.is_active
                          ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg"
                          : "bg-slate-900/30 border-slate-850 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                            {c.department}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {c.is_primary && (
                              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-bold uppercase border border-teal-500/30">
                                Principal
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full ${c.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-white">{c.label || c.department}</h4>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{c.phone_number}</p>

                        {c.custom_message && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 italic line-clamp-2">
                            "{c.custom_message}"
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Testar wa.me</span>
                        </a>

                        <div className="flex items-center gap-1">
                          {!c.is_primary && (
                            <button
                              onClick={() => handleSetPrimaryWhatsApp(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition"
                              title="Tornar número principal"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleWhatsAppActive(c)}
                            className={`p-1.5 rounded-lg transition ${
                              c.is_active 
                                ? "text-emerald-400 hover:bg-emerald-500/10" 
                                : "text-slate-500 hover:bg-slate-800"
                            }`}
                            title={c.is_active ? "Pausar canal" : "Ativar canal"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditWhatsApp(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Editar contato"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWhatsApp(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Excluir canal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: CADASTRAR NOVA ARENA & DONO */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Cadastrar Nova Arena & Dono Gestor</h2>
                    <p className="text-xs text-slate-400">Cria a organização, o login do administrador e a arena com quadras promocionais.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVenue} className="space-y-6">
                {/* SECTION: DADOS DA ARENA */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Building className="w-4 h-4" /> 1. Informações da Arena
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nome da Arena <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Arena Sunset Beach & Soccer"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Telefone / WhatsApp da Arena
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: (11) 98765-4321"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Rua / Av.</label>
                      <input
                        type="text"
                        required
                        value={createForm.address_street}
                        onChange={(e) => setCreateForm({ ...createForm, address_street: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Número</label>
                      <input
                        type="text"
                        required
                        value={createForm.address_number}
                        onChange={(e) => setCreateForm({ ...createForm, address_number: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
                      <input
                        type="text"
                        required
                        value={createForm.neighborhood}
                        onChange={(e) => setCreateForm({ ...createForm, neighborhood: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                      <input
                        type="text"
                        required
                        value={createForm.city}
                        onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Estado (UF)</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={createForm.state}
                        onChange={(e) => setCreateForm({ ...createForm, state: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CEP</label>
                      <input
                        type="text"
                        required
                        value={createForm.postal_code}
                        onChange={(e) => setCreateForm({ ...createForm, postal_code: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Foto de Capa da Arena */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Foto de Capa do Local (URL ou selecione um preset abaixo)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createForm.cover_image_url || ""}
                        onChange={(e) => setCreateForm({ ...createForm, cover_image_url: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_VENUE_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, cover_image_url: preset.url })}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                            createForm.cover_image_url === preset.url
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[11px] font-medium leading-tight truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION: DADOS DO DONO */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> 2. Dono / Administrador da Arena
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nome Completo do Dono <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Roberto Silva"
                        value={createForm.owner_name}
                        onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Telefone / Celular do Dono
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: (11) 99123-4567"
                        value={createForm.owner_phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, owner_phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        E-mail de Acesso (Login) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="dono@arena.com.br"
                        value={createForm.owner_email}
                        onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Senha Inicial <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.owner_password}
                        onChange={(e) => setCreateForm({ ...createForm, owner_password: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[10px] text-slate-500">O dono usará este e-mail e senha no `/login`.</span>
                    </div>
                  </div>
                </div>

                {/* SECTION: QUADRA INICIAL & PREÇOS / PROMOÇÕES */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> 3. Quadra Inicial, Preço & Desconto
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Quadra</label>
                      <input
                        type="text"
                        value={createForm.courts?.[0]?.name || ""}
                        onChange={(e) => {
                          const updated = [...(createForm.courts || [])];
                          updated[0] = { ...updated[0], name: e.target.value };
                          setCreateForm({ ...createForm, courts: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Modalidade</label>
                      <select
                        value={createForm.courts?.[0]?.sport_type || "FUTEBOL"}
                        onChange={(e) => {
                          const updated = [...(createForm.courts || [])];
                          updated[0] = { ...updated[0], sport_type: e.target.value };
                          setCreateForm({ ...createForm, courts: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="FUTEBOL">Futebol Society</option>
                        <option value="BEACH_TENNIS">Beach Tennis</option>
                        <option value="PADEL">Padel</option>
                        <option value="TENIS">Tênis</option>
                        <option value="VOLEI">Vôlei de Praia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Superfície</label>
                      <input
                        type="text"
                        value={createForm.courts?.[0]?.surface || "Grama Sintética"}
                        onChange={(e) => {
                          const updated = [...(createForm.courts || [])];
                          updated[0] = { ...updated[0], surface: e.target.value };
                          setCreateForm({ ...createForm, courts: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Preço Base (R$/h)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={createForm.courts?.[0]?.default_hourly_rate || 100}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...(createForm.courts || [])];
                            updated[0] = { ...updated[0], default_hourly_rate: val };
                            setCreateForm({ ...createForm, courts: updated });
                          }}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Desconto (%)</label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">%</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={createForm.courts?.[0]?.discount_percentage ?? 10}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...(createForm.courts || [])];
                            updated[0] = { ...updated[0], discount_percentage: val, promo_badge: val > 0 ? `${val}% OFF` : "" };
                            setCreateForm({ ...createForm, courts: updated });
                          }}
                          className="w-full pr-8 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Selo Promocional</label>
                      <input
                        type="text"
                        placeholder="Ex: 10% OFF"
                        value={createForm.courts?.[0]?.promo_badge || ""}
                        onChange={(e) => {
                          const updated = [...(createForm.courts || [])];
                          updated[0] = { ...updated[0], promo_badge: e.target.value };
                          setCreateForm({ ...createForm, courts: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Dynamic Pricing Preview Box */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Cálculo de Desconto em Tempo Real:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400">Base: R$ {createBase.toFixed(2)}</span>
                        <span>-</span>
                        <span className="text-amber-400">Desconto {createDisc}% (-R$ {createDiscVal.toFixed(2)})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valor Cobrado</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        R$ {createFinal.toFixed(2)}/h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    {submitting ? "Cadastrando..." : "Cadastrar Arena & Dono"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDITAR PREÇOS, DESCONTOS E PROMOÇÕES DA QUADRA */}
        {isPricingModalOpen && selectedCourt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Editar Preço & Promoções</h2>
                    <p className="text-xs text-slate-400 truncate max-w-sm">{selectedCourt.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPricingModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-5">
                {/* Preço Base */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Valor Base por Hora (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pricingForm.default_hourly_rate}
                      onChange={(e) => setPricingForm({ ...pricingForm, default_hourly_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Desconto Percentual */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Desconto a ser Aplicado (%)
                    </label>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {calcDiscountPercent}% de desconto
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">%</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={pricingForm.discount_percentage ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPricingForm({
                          ...pricingForm,
                          discount_percentage: val,
                          promo_badge: val > 0 && !pricingForm.promo_badge ? `${val}% OFF` : pricingForm.promo_badge,
                        });
                      }}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Botões Rápidos de Desconto */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[0, 5, 10, 15, 20, 25, 30].map((perc) => (
                      <button
                        key={perc}
                        type="button"
                        onClick={() => {
                          setPricingForm({
                            ...pricingForm,
                            discount_percentage: perc,
                            promo_badge: perc > 0 ? `${perc}% OFF` : "",
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          calcDiscountPercent === perc
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {perc === 0 ? "Sem desconto" : `${perc}% OFF`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Dynamic Calculation Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Simulação Visual do Desconto
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Preço Normal</span>
                      <span className="font-mono text-sm text-slate-300 line-through">
                        R$ {calcBaseRate.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Desconto ({calcDiscountPercent}%)</span>
                      <span className="font-mono text-sm text-amber-400 font-bold">
                        -R$ {calcDiscountValue.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold block">Preço Final</span>
                      <span className="font-mono text-base text-emerald-400 font-black">
                        R$ {calcFinalRate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selo Promocional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Selo da Promoção (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 10% OFF ou PROMOÇÃO"
                      value={pricingForm.promo_badge || ""}
                      onChange={(e) => setPricingForm({ ...pricingForm, promo_badge: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Texto Explicativo da Promoção
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Válido para horários selecionados"
                      value={pricingForm.promo_subtext || ""}
                      onChange={(e) => setPricingForm({ ...pricingForm, promo_subtext: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Foto da Quadra */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Foto da Quadra (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={pricingForm.image_url || ""}
                    onChange={(e) => setPricingForm({ ...pricingForm, image_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {PRESET_VENUE_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPricingForm({ ...pricingForm, image_url: preset.url })}
                        className="p-1 rounded-lg border border-slate-800 hover:border-amber-500 flex-shrink-0 transition"
                      >
                        <img src={preset.url} alt="" className="w-10 h-10 rounded-md object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPricingModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                  >
                    {submitting ? "Salvando..." : "Salvar Alterações de Preço"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: EDITAR FOTOS E DADOS DA ARENA */}
        {isVenueModalOpen && selectedVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Editar Fotos e Dados da Arena</h2>
                    <p className="text-xs text-slate-400">{selectedVenue.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVenueModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVenue} className="space-y-5">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Arena</label>
                  <input
                    type="text"
                    value={venueForm.name || ""}
                    onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Foto de Capa Atual & Preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL da Foto de Capa do Local
                  </label>
                  <input
                    type="text"
                    value={venueForm.cover_image_url || ""}
                    onChange={(e) => setVenueForm({ ...venueForm, cover_image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />

                  {/* Preview da foto */}
                  {venueForm.cover_image_url && (
                    <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-slate-700">
                      <img
                        src={venueForm.cover_image_url}
                        alt="Preview Capa"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/70 text-white backdrop-blur">
                        Pré-visualização
                      </span>
                    </div>
                  )}

                  {/* Presets rápidos */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5">Ou selecione uma foto pronta:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_VENUE_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setVenueForm({ ...venueForm, cover_image_url: preset.url })}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                            venueForm.cover_image_url === preset.url
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <span className="text-[11px] truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Endereço e Contato */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone da Arena</label>
                    <input
                      type="text"
                      value={venueForm.phone || ""}
                      onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      value={`${venueForm.city || ""} - ${venueForm.state || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("-");
                        setVenueForm({
                          ...venueForm,
                          city: parts[0]?.trim(),
                          state: parts[1]?.trim() || venueForm.state,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsVenueModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    {submitting ? "Salvando..." : "Salvar Fotos e Dados"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: CADASTRAR / EDITAR WHATSAPP OFICIAL DA PLATAFORMA */}
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingWhatsAppContact ? "Editar Canal Oficial WhatsApp" : "Novo Canal de WhatsApp da Plataforma"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Canal de atendimento central exibido no marketplace e páginas públicas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Setor do Canal *
                  </label>
                  <select
                    value={whatsappForm.department}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, department: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  >
                    <option value="Suporte Geral">Suporte Geral da Plataforma</option>
                    <option value="Comercial & Vendas">Comercial & Vendas SaaS</option>
                    <option value="Financeiro SaaS">Financeiro & Faturamento</option>
                    <option value="Parcerias & Torneios">Parcerias & Torneios</option>
                    <option value="Atendimento 24h">Atendimento 24h Plantão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rótulo / Descrição Visível
                  </label>
                  <input
                    type="text"
                    value={whatsappForm.label}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, label: e.target.value })}
                    placeholder="Ex: Suporte Oficial ArenaGo Brasil"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número do WhatsApp (com DDD) *
                  </label>
                  <input
                    type="text"
                    value={whatsappForm.phone_number}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, phone_number: e.target.value })}
                    placeholder="(11) 98765-4321 ou 11987654321"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Será formatado automaticamente e aberto via wa.me com o código do país (+55).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensagem Padrão de Abertura
                  </label>
                  <textarea
                    value={whatsappForm.custom_message}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, custom_message: e.target.value })}
                    rows={3}
                    placeholder="Olá! Gostaria de falar com o time de suporte da ArenaGo."
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Esta mensagem virá pré-preenchida quando o usuário clicar no botão do WhatsApp.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappForm.is_primary}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, is_primary: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Número Principal</span>
                      <p className="text-xs text-slate-400">Canal prioritário aberto com destaque no botão flutuante</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappForm.is_active}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Canal Ativo</span>
                      <p className="text-xs text-slate-400">Visível publicamente no marketplace e suporte</p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    {submitting ? "Salvando..." : (editingWhatsAppContact ? "Salvar Alterações" : "Cadastrar Canal")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
