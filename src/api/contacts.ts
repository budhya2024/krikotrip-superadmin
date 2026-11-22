import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface ContactReplyItem {
  id: string
  contactMessageId: string
  body: string
  sentByUserId: string
  emailOutboxId: string | null
  createdAt: string
}

export interface ContactMessageItem {
  id: string
  name: string
  email: string
  phoneCountryCode: string
  phone: string
  subject: string
  message: string
  consentAt: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  readAt: string | null
  lastRepliedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactMessageDetail extends ContactMessageItem {
  replies: ContactReplyItem[]
}

export interface ListContactMessagesParams {
  q?: string
  status?: string
  page?: number
  limit?: number
}

export interface ContactMessageListResult {
  data: ContactMessageItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    unreadCount: number
  }
}

export async function fetchContactMessages(
  params?: ListContactMessagesParams,
): Promise<ContactMessageListResult> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const path = qs ? `/api/v1/admin/contact-messages?${qs}` : '/api/v1/admin/contact-messages'

  const res = (await http.get(path)) as {
    data: ContactMessageItem[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
      unreadCount: number
    }
  }
  return res
}

export function useContactMessagesQuery(params?: ListContactMessagesParams) {
  return useQuery({
    queryKey: queryKeys.contacts.list(params as Record<string, unknown>),
    queryFn: () => fetchContactMessages(params),
  })
}

export async function fetchContactMessageDetail(id: string): Promise<ContactMessageDetail> {
  const res = (await http.get(`/api/v1/admin/contact-messages/${id}`)) as {
    data: ContactMessageDetail
  }
  return res.data
}

export function useContactMessageDetailQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.contacts.detail(id) : ['contacts', 'detail', 'null'],
    queryFn: () => (id ? fetchContactMessageDetail(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  })
}

export function useUpdateContactMessageStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'unread' | 'read' | 'replied' | 'archived'
    }) => {
      const res = (await http.patch(`/api/v1/admin/contact-messages/${id}/status`, {
        status,
      })) as { data: ContactMessageDetail }
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      queryClient.setQueryData(queryKeys.contacts.detail(data.id), (old: ContactMessageDetail | undefined) => {
        if (!old) return data
        return {
          ...old,
          status: data.status,
          readAt: data.readAt,
        }
      })
    },
  })
}

export function useSendContactReplyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const res = (await http.post(`/api/v1/admin/contact-messages/${id}/replies`, {
        body,
      })) as { data: ContactReplyItem }
      return res.data
    },
    onSuccess: (reply) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(reply.contactMessageId) })
    },
  })
}

export function useDeleteContactMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/api/v1/admin/contact-messages/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
    },
  })
}
