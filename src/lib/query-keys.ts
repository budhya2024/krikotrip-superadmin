export const queryKeys = {
  health: {
    live: ['health', 'live'] as const,
    ready: ['health', 'ready'] as const,
  },
  session: ['session'] as const,
  dashboard: {
    all: ['dashboard'] as const,
    summary: (period?: string) => ['dashboard', 'summary', period] as const,
    revenueSeries: (months?: number) => ['dashboard', 'revenue-series', months] as const,
    destinationBookings: ['dashboard', 'destination-bookings'] as const,
    leadRatio: (destinationId?: string) => ['dashboard', 'lead-ratio', destinationId] as const,
  },
  packages: {
    all: ['packages'] as const,
    list: (filters?: Record<string, unknown>) => ['packages', 'list', filters] as const,
    detail: (idOrSlug: string) => ['packages', 'detail', idOrSlug] as const,
  },
  destinations: {
    all: ['destinations'] as const,
    list: (featured?: boolean) => ['destinations', 'list', featured] as const,
    admin: (search?: string, isActive?: boolean) => ['destinations', 'admin', search, isActive] as const,
  },
  themes: {
    all: ['themes'] as const,
    admin: () => ['themes', 'admin'] as const,
  },
  enquiries: {
    all: ['enquiries'] as const,
    list: (filters?: Record<string, unknown>) => ['enquiries', 'list', filters] as const,
    detail: (id: string) => ['enquiries', 'detail', id] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    list: (filters?: Record<string, unknown>) => ['vendors', 'list', filters] as const,
    detail: (id: string) => ['vendors', 'detail', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    list: (filters?: Record<string, unknown>) => ['reviews', 'list', filters] as const,
  },
  blogs: {
    all: ['blogs'] as const,
    categories: ['blogs', 'categories'] as const,
    list: (filters?: Record<string, unknown>) => ['blogs', 'list', filters] as const,
    detail: (slug: string) => ['blogs', 'detail', slug] as const,
  },
  gallery: {
    all: ['gallery'] as const,
    categories: ['gallery', 'categories'] as const,
    list: (filters?: Record<string, unknown>) => ['gallery', 'list', filters] as const,
    detail: (id: string) => ['gallery', 'detail', id] as const,
  },
  offers: {
    all: ['offers'] as const,
  },
  videos: {
    all: ['videos'] as const,
  },
  faqs: {
    all: ['faqs'] as const,
    list: (scope?: string) => ['faqs', 'list', scope] as const,
  },
  coupons: {
    all: ['coupons'] as const,
    list: (filters?: Record<string, unknown>) => ['coupons', 'list', filters] as const,
    detail: (id: string) => ['coupons', 'detail', id] as const,
    redemptions: (id: string, filters?: Record<string, unknown>) =>
      ['coupons', 'redemptions', id, filters] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: (filters?: Record<string, unknown>) => ['contacts', 'list', filters] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  newsletter: {
    all: ['newsletter'] as const,
    list: (filters?: Record<string, unknown>) => ['newsletter', 'list', filters] as const,
  },
  settings: ['settings'] as const,
  notifications: {
    all: ['notifications'] as const,
    list: (params?: unknown) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
  },
}
