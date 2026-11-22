import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type EnquiryStatus =
  | 'new'
  | 'pending'
  | 'in_progress'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type EnquirySource =
  | 'package_booking'
  | 'callback_request'
  | 'hero_search'
  | 'admin'
  | 'chatbot'

export type EnquiryPaymentStatus =
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'refunded'

export interface AdminEnquiryListItem {
  id: string
  reference: string
  source: EnquirySource
  packageId: string | null
  packageTitle: string | null
  destinationId: string | null
  destinationName: string | null
  customerUserId: string | null
  customerName: string
  customerEmail: string | null
  phoneCountryCode: string
  phone: string
  travelDate: string | null
  travellers: number
  status: EnquiryStatus
  paymentStatus: EnquiryPaymentStatus
  unitPricePaise: number | null
  estimatePaise: number | null
  couponDiscountPaise: number
  loyaltyPointsReserved: number
  loyaltyDiscountPaise: number
  baseCostPaise: number | null
  markupPercent: number | null
  taxPercent: number | null
  discountPaise: number
  finalPricePaise: number | null
  vendorPayoutPaise: number | null
  agencyMarginPaise: number | null
  amountPaidPaise: number
  paymentMode: string | null
  hotelCategory: string | null
  mealPlan: string | null
  pickupPoint: string | null
  assignedVendorId: string | null
  vendorLeadStatus: string
  confirmedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminEnquiryDetail extends AdminEnquiryListItem {
  message: string | null
  pagePath: string | null
  adminNotes: string | null
  cancelReason: string | null
  inclusionsSnapshot: string[] | null
  allowedTransitions: EnquiryStatus[]
  couponRedemption: {
    code: string
    discountPaise: number
    status: string
  } | null
  statusHistory: Array<{
    id: string
    fromStatus: EnquiryStatus | null
    toStatus: EnquiryStatus
    actorType: string
    actorUserId: string | null
    note: string | null
    createdAt: string
  }>
}

export interface ListAdminEnquiriesParams {
  q?: string
  status?: string
  source?: string
  destinationId?: string
  vendorId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface AdminEnquiriesListResponse {
  data: AdminEnquiryListItem[]
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

export interface AdminEnquiryDetailResponse {
  data: AdminEnquiryDetail
}

export interface UpdateEnquiryStatusInput {
  id: string
  status: EnquiryStatus
  note?: string | null
  cancelReason?: string | null
}

export interface UpdateEnquiryPricingInput {
  id: string
  baseCostPaise: number
  markupPercent: number
  taxPercent: number
  discountPaise?: number
}

export interface UpdateEnquiryTripDetailsInput {
  id: string
  hotelCategory?: string | null
  mealPlan?: string | null
  pickupPoint?: string | null
  travelDate?: string | null
  travellers?: number
  assignedVendorId?: string | null
  adminNotes?: string | null
}

export interface UpdateEnquiryPaymentInput {
  id: string
  paymentStatus: EnquiryPaymentStatus
  amountPaidPaise: number
  paymentMode?: string | null
}

export async function fetchAdminEnquiries(
  params?: ListAdminEnquiriesParams,
): Promise<AdminEnquiriesListResponse> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.source && params.source !== 'all') query.set('source', params.source)
  if (params?.destinationId) query.set('destinationId', params.destinationId)
  if (params?.vendorId) query.set('vendorId', params.vendorId)
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const url = `/api/v1/admin/enquiries${qs ? `?${qs}` : ''}`
  return http.get(url) as unknown as Promise<AdminEnquiriesListResponse>
}

export async function fetchAdminEnquiryById(id: string): Promise<AdminEnquiryDetail> {
  const res = (await http.get(`/api/v1/admin/enquiries/${id}`)) as unknown as AdminEnquiryDetailResponse
  return res.data
}

export async function updateAdminEnquiryStatus(
  input: UpdateEnquiryStatusInput,
): Promise<AdminEnquiryDetail> {
  const res = (await http.patch(`/api/v1/admin/enquiries/${input.id}/status`, {
    status: input.status,
    note: input.note,
    cancelReason: input.cancelReason,
  })) as unknown as AdminEnquiryDetailResponse
  return res.data
}

export async function updateAdminEnquiryPricing(
  input: UpdateEnquiryPricingInput,
): Promise<AdminEnquiryDetail> {
  const res = (await http.put(`/api/v1/admin/enquiries/${input.id}/pricing`, {
    baseCostPaise: input.baseCostPaise,
    markupPercent: input.markupPercent,
    taxPercent: input.taxPercent,
    discountPaise: input.discountPaise ?? 0,
  })) as unknown as AdminEnquiryDetailResponse
  return res.data
}

export async function updateAdminEnquiryTripDetails(
  input: UpdateEnquiryTripDetailsInput,
): Promise<AdminEnquiryDetail> {
  const res = (await http.patch(`/api/v1/admin/enquiries/${input.id}/trip-details`, {
    hotelCategory: input.hotelCategory,
    mealPlan: input.mealPlan,
    pickupPoint: input.pickupPoint,
    travelDate: input.travelDate,
    travellers: input.travellers,
    assignedVendorId: input.assignedVendorId,
    adminNotes: input.adminNotes,
  })) as unknown as AdminEnquiryDetailResponse
  return res.data
}

export async function updateAdminEnquiryPayment(
  input: UpdateEnquiryPaymentInput,
): Promise<AdminEnquiryDetail> {
  const res = (await http.patch(`/api/v1/admin/enquiries/${input.id}/payment`, {
    paymentStatus: input.paymentStatus,
    amountPaidPaise: input.amountPaidPaise,
    paymentMode: input.paymentMode,
  })) as unknown as AdminEnquiryDetailResponse
  return res.data
}

export async function deleteAdminEnquiry(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/enquiries/${id}`)
}

export async function exportEnquiriesCsv(params?: ListAdminEnquiriesParams): Promise<void> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.source && params.source !== 'all') query.set('source', params.source)
  if (params?.destinationId) query.set('destinationId', params.destinationId)
  if (params?.vendorId) query.set('vendorId', params.vendorId)
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)

  const qs = query.toString()
  const url = `/api/v1/admin/enquiries/export${qs ? `?${qs}` : ''}`
  const response = (await http.get(url, { responseType: 'blob' })) as unknown as {
    data?: BlobPart
  }
  const blobData = response?.data ?? (response as unknown as BlobPart)
  const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute(
    'download',
    `krikotrip-enquiries-${new Date().toISOString().slice(0, 10)}.csv`,
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}

export function useAdminEnquiriesQuery(params?: ListAdminEnquiriesParams) {
  return useQuery({
    queryKey: queryKeys.enquiries.list(params as Record<string, unknown> | undefined),
    queryFn: () => fetchAdminEnquiries(params),
  })
}

export function useAdminEnquiryQuery(id?: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.enquiries.detail(id) : ['enquiries', 'detail', 'none'],
    queryFn: () => (id ? fetchAdminEnquiryById(id) : Promise.reject(new Error('No ID provided'))),
    enabled: Boolean(id),
  })
}

export function useUpdateEnquiryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminEnquiryStatus,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all })
      queryClient.setQueryData(queryKeys.enquiries.detail(updated.id), updated)
    },
  })
}

export function useUpdateEnquiryPricingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminEnquiryPricing,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all })
      queryClient.setQueryData(queryKeys.enquiries.detail(updated.id), updated)
    },
  })
}

export function useUpdateEnquiryTripDetailsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminEnquiryTripDetails,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all })
      queryClient.setQueryData(queryKeys.enquiries.detail(updated.id), updated)
    },
  })
}

export function useUpdateEnquiryPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminEnquiryPayment,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all })
      queryClient.setQueryData(queryKeys.enquiries.detail(updated.id), updated)
    },
  })
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all })
    },
  })
}
