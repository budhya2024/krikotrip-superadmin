import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type LoyaltyTier = 'silver_explorer' | 'gold_explorer' | 'platinum_elite'
export type LoyaltyEntryType = 'reserve' | 'release' | 'commit' | 'earn' | 'adjust' | 'expire'

export interface LoyaltyLedgerItem {
  id: string
  customerUserId: string
  enquiryId: string | null
  entryType: LoyaltyEntryType
  points: number
  balanceAfter: number
  note: string | null
  createdByUserId: string | null
  createdAt: string
}

export interface AdminCustomerListItem {
  id: string
  name: string
  email: string
  phone: string | null
  location: string | null
  avatarUrl: string | null
  pointsBalance: number
  pointsLifetime: number
  tier: LoyaltyTier
  totalBookings: number
  createdAt: string
}

export interface AdminCustomerDetail {
  id: string
  name: string
  email: string
  phone: string | null
  location: string | null
  bio: string | null
  avatarUrl: string | null
  marketingOptIn: boolean
  pointsBalance: number
  pointsLifetime: number
  tier: LoyaltyTier
  totalBookings: number
  createdAt: string
  updatedAt: string
  recentTransactions: LoyaltyLedgerItem[]
}

export interface FetchCustomersParams {
  q?: string
  tier?: 'all' | LoyaltyTier
  page?: number
  limit?: number
}

interface CustomersListEnvelope {
  data: AdminCustomerListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CustomerDetailEnvelope {
  data: AdminCustomerDetail
}

export async function fetchAdminCustomers(
  params?: FetchCustomersParams,
): Promise<CustomersListEnvelope> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.tier && params.tier !== 'all') query.set('tier', params.tier)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const url = qs ? `/api/v1/admin/customers?${qs}` : '/api/v1/admin/customers'
  return (await http.get(url)) as CustomersListEnvelope
}

export async function fetchAdminCustomerById(userId: string): Promise<AdminCustomerDetail> {
  const res = (await http.get(`/api/v1/admin/customers/${userId}`)) as CustomerDetailEnvelope
  return res.data
}

export async function adjustCustomerLoyalty(
  userId: string,
  input: { points: number; note: string },
): Promise<AdminCustomerDetail> {
  const res = (await http.post(
    `/api/v1/admin/customers/${userId}/loyalty-adjustments`,
    input,
  )) as CustomerDetailEnvelope
  return res.data
}

export function useAdminCustomersQuery(params?: FetchCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params as Record<string, unknown>),
    queryFn: () => fetchAdminCustomers(params),
  })
}

export function useAdminCustomerQuery(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.customers.detail(userId ?? ''),
    queryFn: () => fetchAdminCustomerById(userId!),
    enabled: Boolean(userId),
  })
}

export function useAdjustLoyaltyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, points, note }: { userId: string; points: number; note: string }) =>
      adjustCustomerLoyalty(userId, { points, note }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.customers.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
    },
  })
}
