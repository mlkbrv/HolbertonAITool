function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const base = raw.replace(/\/$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
    if (raw.includes('.onrender.com')) {
      return `https://${raw.replace(/^https?:\/\//, '')}/api`;
    }
    if (raw.startsWith('/')) return raw.replace(/\/$/, '') || '/api';
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname.includes('giftai-api.onrender.com')) {
      return `${protocol}//${hostname}/api`;
    }
    if (hostname.includes('onrender.com') && !hostname.includes('giftai-api')) {
      return 'https://giftai-api.onrender.com/api';
    }
  }
  return '/api';
}

const API_BASE = resolveApiBase();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json();
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

export const api = {
  health: () => request<{ status: string }>('/health/'),
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
};

export function unwrapList<T>(data: { results?: T[] } | T[]): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}
