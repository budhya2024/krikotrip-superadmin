import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminOffer {
  id: string
  title: string
  badgeLabel: string | null
  photoMediaId: string
  photoUrl: string | null
  linkUrl: string
  validFrom: string | null
  validUntil: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateOfferInput {
  title: string
  badgeLabel?: string | null
  photoMediaId: string
  linkUrl: string
  validFrom?: string | null
  validUntil?: string | null
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateOfferInput {
  title: string
  badgeLabel?: string | null
  photoMediaId: string
  linkUrl: string
  validFrom?: string | null
  validUntil?: string | null
  displayOrder?: number
  isActive?: boolean
}

export async function fetchAdminOffers(): Promise<AdminOffer[]> {
  const res = (await http.get('/api/v1/admin/offers')) as {
    data: AdminOffer[]
  }
  return res.data
}

export async function fetchOfferById(id: string): Promise<AdminOffer> {
  const res = (await http.get(`/api/v1/admin/offers/${id}`)) as {
    data: AdminOffer
  }
  return res.data
}

export async function createOffer(input: CreateOfferInput): Promise<AdminOffer> {
  const res = (await http.post('/api/v1/admin/offers', input)) as {
    data: AdminOffer
  }
  return res.data
}

export async function updateOffer(
  id: string,
  input: UpdateOfferInput,
): Promise<AdminOffer> {
  const res = (await http.put(`/api/v1/admin/offers/${id}`, input)) as {
    data: AdminOffer
  }
  return res.data
}

export async function toggleOfferActive(
  id: string,
  isActive: boolean,
): Promise<AdminOffer> {
  const res = (await http.patch(`/api/v1/admin/offers/${id}/status`, {
    isActive,
  })) as { data: AdminOffer }
  return res.data
}

export async function deleteOffer(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/offers/${id}`)
}

export async function reorderOffers(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/offers/reorder', { items })
}

export function useOffersQuery() {
  return useQuery({
    queryKey: queryKeys.offers.all,
    queryFn: () => fetchAdminOffers(),
  })
}

export function useCreateOfferMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOfferInput) => createOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useUpdateOfferMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOfferInput }) =>
      updateOffer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useToggleOfferActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleOfferActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useDeleteOfferMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useReorderOffersMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderOffers(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}
