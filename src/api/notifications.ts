import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminNotificationItem {
  id: string
  type: 'booking' | 'review' | 'vendor' | 'contact'
  title: string
  body: string
  entityType: string | null
  entityId: string | null
  targetTab: string | null
  readAt: string | null
  createdAt: string
}

export interface AdminNotificationListResult {
  data: AdminNotificationItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ListAdminNotificationsParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export async function fetchAdminNotifications(
  params?: ListAdminNotificationsParams,
): Promise<AdminNotificationListResult> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.unreadOnly !== undefined) query.set('unreadOnly', String(params.unreadOnly))

  const qs = query.toString()
  const path = qs ? `/api/v1/admin/notifications?${qs}` : '/api/v1/admin/notifications'

  const res = (await http.get(path)) as {
    data: AdminNotificationItem[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  return res
}

export async function fetchAdminNotificationUnreadCount(): Promise<number> {
  const res = (await http.get('/api/v1/admin/notifications/unread-count')) as {
    data: { unreadCount: number }
  }
  return res.data.unreadCount
}

export async function markAdminNotificationRead(
  id: string,
): Promise<{ id: string; readAt: string }> {
  const res = (await http.patch(`/api/v1/admin/notifications/${id}/read`)) as {
    data: { id: string; readAt: string }
  }
  return res.data
}

export async function markAllAdminNotificationsRead(): Promise<number> {
  const res = (await http.post('/api/v1/admin/notifications/read-all')) as {
    data: { updatedCount: number }
  }
  return res.data.updatedCount
}

export function useAdminNotificationsQuery(params?: ListAdminNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => fetchAdminNotifications(params),
  })
}

export function useAdminNotificationUnreadCountQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: fetchAdminNotificationUnreadCount,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markAdminNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllAdminNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
