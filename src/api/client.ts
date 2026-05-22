const UNIFIED_RENDER_API = 'https://giftai.onrender.com';

const LEGACY_FRONTEND_HOSTS: Record<string, string> = {
  'giftai-frontend.onrender.com': UNIFIED_RENDER_API,
  'giftai-api.onrender.com': UNIFIED_RENDER_API,
};

function normalizeApiBase(originOrPath: string): string {
  const base = originOrPath.replace(/\/$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  const apiOrigin = (import.meta.env.VITE_API_ORIGIN || '').trim();

  if (typeof window !== 'undefined') {
    const legacyApi = LEGACY_FRONTEND_HOSTS[window.location.hostname];
    if (legacyApi) {
      return normalizeApiBase(legacyApi);
    }
    if (apiOrigin) {
      return normalizeApiBase(apiOrigin.startsWith('http') ? apiOrigin : `https://${apiOrigin}`);
    }
    if (!raw || raw === '/api' || raw === '/api/') {
      return normalizeApiBase(window.location.origin);
    }
  }

  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return normalizeApiBase(raw);
    }
    if (raw.includes('.onrender.com')) {
      return normalizeApiBase(`https://${raw.replace(/^https?:\/\//, '')}`);
    }
    if (raw.startsWith('/')) return normalizeApiBase(raw) || '/api';
  }

  if (typeof window !== 'undefined') {
    return normalizeApiBase(window.location.origin);
  }
  return '/api';
}

const API_BASE = resolveApiBase();

function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function parseJsonBody<T>(text: string, url: string, status: number): T {
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    const hint =
      typeof window !== 'undefined' && LEGACY_FRONTEND_HOSTS[window.location.hostname]
        ? ` Use ${UNIFIED_RENDER_API} or delete the old giftai-frontend service on Render.`
        : ' Start Django on port 8000 or open the combined app URL (giftai.onrender.com).';
    throw new Error(`API returned HTML instead of JSON (${status} ${url}).${hint}`);
  }
  if (!trimmed) return {} as T;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`API returned invalid JSON (${status} ${url})`);
  }
}

function apiErrorMessage(data: Record<string, unknown>, status: number): string {
  const detail = data.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]) return String(detail[0]);
  if (status === 403) return 'CSRF or permission denied — refresh the page and try again';
  return `Request failed (${status})`;
}

async function ensureCsrfCookie(): Promise<void> {
  if (getCsrfToken()) return;
  await fetch(`${API_BASE}/health/`, { credentials: 'include' });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await ensureCsrfCookie();
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRFToken'] = csrf;
  }
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });
  const text = await res.text();
  const data = parseJsonBody<Record<string, unknown>>(text, url, res.status);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, res.status) || res.statusText);
  }
  return data as T;
}

export interface Recipient {
  id: number;
  name: string;
  relationship: string;
  avatar_url: string;
}

export interface GiftCategory {
  id: number;
  slug: string;
  name: string;
}

export interface GiftSet {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  image_url: string;
  category: GiftCategory | null;
  edition_label: string;
  match_percent: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_curated: boolean;
  recipient_label: string;
}

export interface Occasion {
  id: number;
  title: string;
  recipient: Recipient | null;
  occasion_type: string;
  date: string;
  status: string;
  progress_percent: number;
  days_until: number;
  month_label: string;
  day_label: string;
}

export interface SavedGift {
  id: number;
  gift_set: GiftSet;
  recipient: Recipient;
  occasion_date: string;
  match_percent: number;
}

export interface Interest {
  id: number;
  name: string;
  level: string;
  score_percent: number;
}

export interface PersonalityProfile {
  id: number;
  recipient: Recipient;
  confidence_percent: number;
  trait: string;
  mood: string;
  interests: Interest[];
  tags: { id: number; label: string }[];
  top_match: { gift_set: GiftSet; match_percent: number } | null;
}

export interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  time_label: string;
  options: string[];
}

export interface DetectiveSession {
  id: number;
  title: string;
  recipient: Recipient;
  messages: ChatMessage[];
}

export interface Dashboard {
  upcoming_occasions: Occasion[];
  curated_gift_sets: GiftSet[];
  corporate_offers: { id: number; title: string; description: string; is_new: boolean }[];
  calendar_insight: { readiness_percent: number; quote: string } | null;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
}

export interface SubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  price_monthly: string;
  description: string;
  features: string[];
  cart_limit: number | null;
}

export interface MeResponse {
  user: AuthUser | null;
  plan: SubscriptionPlan | null;
}

export interface CartItemRow {
  id: number;
  gift_set: GiftSet;
  quantity: number;
  line_total: string;
}

export interface CartData {
  items: CartItemRow[];
  total: string | number;
  item_count: number;
}

export interface OrderRow {
  id: number;
  order_type: string;
  status: string;
  total: string;
  plan_name?: string;
  items: { id: number; gift_set_title: string; quantity: number; unit_price: string }[];
  created_at: string;
}

export const api = {
  health: (groqPing = false) =>
    request<{
      status: string;
      ai_enabled?: boolean;
      groq_ok?: boolean | null;
      groq_error?: string | null;
      groq_model?: string;
    }>(groqPing ? '/health/?groq_ping=1' : '/health/'),
  dashboard: () => request<Dashboard>('/dashboard/'),
  occasionsUpcoming: () => request<{ results?: Occasion[] } | Occasion[]>('/occasions/?upcoming=true'),
  occasionsCalendar: () => request<Occasion[]>('/occasions/calendar/'),
  giftSets: (query = '') =>
    request<{ results?: GiftSet[] } | GiftSet[]>(query ? `/gift-sets/?${query}` : '/gift-sets/'),
  giftSetsCurated: () => request<GiftSet[]>('/gift-sets/curated/'),
  savedGifts: () => request<{ results?: SavedGift[] } | SavedGift[]>('/saved-gifts/'),
  recipients: () => request<{ results?: Recipient[] } | Recipient[]>('/recipients/'),
  profiles: (recipientId?: number) =>
    request<{ results?: PersonalityProfile[] } | PersonalityProfile[]>(
      recipientId ? `/profiles/?recipient=${recipientId}` : '/profiles/'
    ),
  detectiveActive: () => request<DetectiveSession>('/detective/sessions/active/'),
  sendMessage: (sessionId: number, text: string) =>
    request<ChatMessage[]>(`/detective/sessions/${sessionId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  analyzeInstagram: (sessionId: number, url: string) =>
    request<{
      username: string;
      public_hints: string;
      messages: ChatMessage[];
      profile: PersonalityProfile | null;
      suggested_gifts: { gift_set: GiftSet; match_percent: number }[];
    }>(`/detective/sessions/${sessionId}/analyze_instagram/`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  createOccasion: (data: {
    title: string;
    recipient_id?: number;
    occasion_type: string;
    date: string;
  }) =>
    request<Occasion>('/occasions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (email: string, password: string, name?: string) =>
    request<MeResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<MeResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ detail: string }>('/auth/logout/', { method: 'POST' }),
  me: () => request<MeResponse>('/auth/me/'),
  getCart: () => request<CartData>('/cart/'),
  addToCart: (giftSetId: number, quantity = 1) =>
    request<CartData>('/cart/', {
      method: 'POST',
      body: JSON.stringify({ gift_set_id: giftSetId, quantity }),
    }),
  updateCartItem: (itemId: number, quantity: number) =>
    request<CartData>(`/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (itemId: number) =>
    request<CartData>(`/cart/items/${itemId}/`, { method: 'DELETE' }),
  clearCart: () => request<CartData>('/cart/clear/', { method: 'POST' }),
  getPlans: () => request<SubscriptionPlan[]>('/plans/'),
  checkoutGifts: () =>
    request<OrderRow>('/checkout/gifts/', { method: 'POST', body: '{}' }),
  checkoutSubscription: (planSlug: string) =>
    request<{ order: OrderRow; me: MeResponse }>('/checkout/subscription/', {
      method: 'POST',
      body: JSON.stringify({ plan_slug: planSlug }),
    }),
  getOrders: () => request<OrderRow[]>('/orders/'),
};

export function unwrapList<T>(data: { results?: T[] } | T[]): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}
