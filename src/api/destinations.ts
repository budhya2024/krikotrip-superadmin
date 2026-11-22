import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminDestination {
  id: string
  slug: string
  name: string
  region: string
  country: string
  continent: string
  summary: string | null
  heroMediaId: string | null
  heroImageUrl: string | null
  activitiesLabel: string | null
  isFeatured: boolean
  isVendorTerritory: boolean
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDestinationInput {
  name: string
  slug?: string
  region: string
  country?: string
  continent?: string
  summary?: string | null
  heroMediaId?: string | null
  activitiesLabel?: string | null
  isFeatured?: boolean
  isVendorTerritory?: boolean
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateDestinationInput {
  name: string
  slug?: string
  region: string
  country?: string
  continent?: string
  summary?: string | null
  heroMediaId?: string | null
  activitiesLabel?: string | null
  isFeatured?: boolean
  isVendorTerritory?: boolean
  displayOrder?: number
  isActive?: boolean
}

export async function fetchAdminDestinations(
  search?: string,
  isActive?: boolean,
): Promise<AdminDestination[]> {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (isActive !== undefined) params.isActive = String(isActive)

  const res = (await http.get('/api/v1/admin/destinations', { params })) as {
    data: AdminDestination[]
  }
  return res.data
}

export async function fetchDestinationById(id: string): Promise<AdminDestination> {
  const res = (await http.get(`/api/v1/admin/destinations/${id}`)) as {
    data: AdminDestination
  }
  return res.data
}

export async function createDestination(
  input: CreateDestinationInput,
): Promise<AdminDestination> {
  const res = (await http.post('/api/v1/admin/destinations', input)) as {
    data: AdminDestination
  }
  return res.data
}

export async function updateDestination(
  id: string,
  input: UpdateDestinationInput,
): Promise<AdminDestination> {
  const res = (await http.put(`/api/v1/admin/destinations/${id}`, input)) as {
    data: AdminDestination
  }
  return res.data
}

export async function toggleDestinationActive(
  id: string,
  isActive: boolean,
): Promise<AdminDestination> {
  const res = (await http.patch(`/api/v1/admin/destinations/${id}/active`, {
    isActive,
  })) as { data: AdminDestination }
  return res.data
}

export async function deleteDestination(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/destinations/${id}`)
}

export async function reorderDestinations(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/destinations/order', { items })
}

export function useDestinationsQuery(search?: string, isActive?: boolean) {
  return useQuery({
    queryKey: queryKeys.destinations.admin(search, isActive),
    queryFn: () => fetchAdminDestinations(search, isActive),
  })
}

export function useCreateDestinationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDestinationInput) => createDestination(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all })
    },
  })
}

export function useUpdateDestinationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDestinationInput }) =>
      updateDestination(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all })
    },
  })
}

export function useToggleDestinationActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleDestinationActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all })
    },
  })
}

export function useDeleteDestinationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all })
    },
  })
}

export function useReorderDestinationsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderDestinations(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all })
    },
  })
}
