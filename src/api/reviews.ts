import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type AdminReviewStatus = 'pending' | 'approved' | 'hidden'
export type AdminReviewTripType = 'couple' | 'family' | 'friends' | 'solo'
export type AdminReviewCreatedBy = 'customer' | 'admin'

export interface AdminReviewItem {
  id: string
  packageId: string
  packageTitle: string
  packageSlug: string
  destinationName: string | null
  customerUserId: string | null
  enquiryId: string | null
  authorName: string
  authorLocation: string | null
  authorAvatarUrl: string | null
  tripType: AdminReviewTripType | null
  title: string | null
  comment: string
  rating: number
  status: AdminReviewStatus
  showOnPackage: boolean
  showOnHome: boolean
  verifiedBooking: boolean
  adminReply: string | null
  adminRepliedAt: string | null
  helpfulCount: number
  createdBy: AdminReviewCreatedBy
  allowedTransitions: AdminReviewStatus[]
  createdAt: string
  updatedAt: string
}

export interface AdminReviewsListResponse {
  data: AdminReviewItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  facets: {
    byStatus: Record<string, number>
    total: number
  }
}

export interface ListAdminReviewsParams {
  q?: string
  destinationId?: string
  packageId?: string
  rating?: number
  status?: AdminReviewStatus
  page?: number
  limit?: number
}

export interface CreateAdminReviewInput {
  packageId: string
  authorName: string
  authorLocation?: string | null
  rating: number
  comment: string
  title?: string | null
  tripType?: AdminReviewTripType | null
  status?: AdminReviewStatus
  showOnPackage?: boolean
  showOnHome?: boolean
  verifiedBooking?: boolean
}

export interface UpdateAdminReviewStatusInput {
  status: AdminReviewStatus
  showOnPackage?: boolean
  showOnHome?: boolean
}

export interface ReplyAdminReviewInput {
  reply: string
}

export const useAdminReviews = (params: ListAdminReviewsParams = {}) => {
  return useQuery({
    queryKey: queryKeys.reviews.list(params as Record<string, unknown>),
    queryFn: async (): Promise<AdminReviewsListResponse> => {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.destinationId && params.destinationId !== 'All') query.set('destinationId', params.destinationId)
      if (params.packageId && params.packageId !== 'All') query.set('packageId', params.packageId)
      if (params.rating) query.set('rating', String(params.rating))
      if (params.status && params.status !== ('All' as unknown as AdminReviewStatus)) query.set('status', params.status)
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))

      const qs = query.toString()
      const path = `/admin/reviews${qs ? `?${qs}` : ''}`
      const response = await http.get<AdminReviewsListResponse>(path)
      return response.data
    },
  })
}

export const useAdminReviewDetail = (id: string | null) => {
  return useQuery({
    queryKey: id ? queryKeys.reviews.detail(id) : ['reviews', 'detail', 'null'],
    queryFn: async (): Promise<AdminReviewItem> => {
      const response = await http.get<{ data: AdminReviewItem }>(`/admin/reviews/${id}`)
      return response.data.data
    },
    enabled: Boolean(id),
  })
}

export const useCreateAdminReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateAdminReviewInput): Promise<AdminReviewItem> => {
      const response = await http.post<{ data: AdminReviewItem }>('/admin/reviews', input)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}

export const useUpdateAdminReviewStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateAdminReviewStatusInput & { id: string }): Promise<AdminReviewItem> => {
      const response = await http.patch<{ data: AdminReviewItem }>(`/admin/reviews/${id}/status`, input)
      return response.data.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}

export const useReplyAdminReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      reply,
    }: ReplyAdminReviewInput & { id: string }): Promise<AdminReviewItem> => {
      const response = await http.put<{ data: AdminReviewItem }>(`/admin/reviews/${id}/reply`, { reply })
      return response.data.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(variables.id) })
    },
  })
}

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean }> => {
      const response = await http.delete<{ success: boolean }>(`/admin/reviews/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}
