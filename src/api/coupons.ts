import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type CouponDiscountType = 'percent' | 'fixed'
export type CouponAppliesTo = 'all' | 'selected_packages'
export type CouponRedemptionStatus = 'reserved' | 'committed' | 'released'

export interface AdminCoupon {
  id: string
  code: string
  description: string | null
  discountType: CouponDiscountType
  discountValue: number
  maxDiscountPaise: number | null
  minOrderPaise: number | null
  validFrom: string | null
  validUntil: string | null
  usageLimit: number | null
  perUserLimit: number | null
  usedCount: number
  isPublic: boolean
  isActive: boolean
  appliesTo: CouponAppliesTo
  packageIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CouponRedemption {
  id: string
  couponId: string
  enquiryId: string | null
  customerUserId: string | null
  discountPaise: number
  status: CouponRedemptionStatus
  createdAt: string
}

export interface ListCouponsFilters {
  q?: string
  isActive?: 'true' | 'false' | 'all'
  page?: number
  limit?: number
}

export interface CouponListResponse {
  data: AdminCoupon[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CouponRedemptionsResponse {
  data: CouponRedemption[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateCouponInput {
  code: string
  description?: string | null
  discountType: CouponDiscountType
  discountValue: number
  maxDiscountPaise?: number | null
  minOrderPaise?: number | null
  validFrom?: string | null
  validUntil?: string | null
  usageLimit?: number | null
  perUserLimit?: number | null
  isPublic?: boolean
  isActive?: boolean
  appliesTo?: CouponAppliesTo
  packageIds?: string[]
}

export interface UpdateCouponInput {
  code?: string
  description?: string | null
  discountType?: CouponDiscountType
  discountValue?: number
  maxDiscountPaise?: number | null
  minOrderPaise?: number | null
  validFrom?: string | null
  validUntil?: string | null
  usageLimit?: number | null
  perUserLimit?: number | null
  isPublic?: boolean
  isActive?: boolean
  appliesTo?: CouponAppliesTo
  packageIds?: string[]
}

export async function fetchAdminCoupons(
  filters?: ListCouponsFilters,
): Promise<CouponListResponse> {
  const params: Record<string, string> = {}
  if (filters?.q) params.q = filters.q
  if (filters?.isActive && filters.isActive !== 'all') params.isActive = filters.isActive
  if (filters?.page) params.page = String(filters.page)
  if (filters?.limit) params.limit = String(filters.limit)

  const res = (await http.get('/api/v1/admin/coupons', { params })) as CouponListResponse
  return res
}

export async function fetchAdminCouponById(id: string): Promise<AdminCoupon> {
  const res = (await http.get(`/api/v1/admin/coupons/${id}`)) as { data: AdminCoupon }
  return res.data
}

export async function createAdminCoupon(input: CreateCouponInput): Promise<AdminCoupon> {
  const res = (await http.post('/api/v1/admin/coupons', input)) as { data: AdminCoupon }
  return res.data
}

export async function updateAdminCoupon(
  id: string,
  input: UpdateCouponInput,
): Promise<AdminCoupon> {
  const res = (await http.put(`/api/v1/admin/coupons/${id}`, input)) as { data: AdminCoupon }
  return res.data
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<AdminCoupon> {
  const res = (await http.patch(`/api/v1/admin/coupons/${id}/active`, {
    isActive,
  })) as { data: AdminCoupon }
  return res.data
}

export async function deleteCoupon(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/coupons/${id}`)
}

export async function fetchCouponRedemptions(
  id: string,
  page: number = 1,
  limit: number = 20,
): Promise<CouponRedemptionsResponse> {
  const res = (await http.get(`/api/v1/admin/coupons/${id}/redemptions`, {
    params: { page: String(page), limit: String(limit) },
  })) as CouponRedemptionsResponse
  return res
}

export function useAdminCouponsQuery(filters?: ListCouponsFilters) {
  return useQuery({
    queryKey: queryKeys.coupons.list(filters as Record<string, unknown>),
    queryFn: () => fetchAdminCoupons(filters),
  })
}

export function useAdminCouponQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.coupons.detail(id ?? ''),
    queryFn: () => fetchAdminCouponById(id!),
    enabled: Boolean(id),
  })
}

export function useCouponRedemptionsQuery(id?: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.coupons.redemptions(id ?? '', { page, limit }),
    queryFn: () => fetchCouponRedemptions(id!, page, limit),
    enabled: Boolean(id),
  })
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCouponInput) => createAdminCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) =>
      updateAdminCoupon(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useToggleCouponActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCouponActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}
