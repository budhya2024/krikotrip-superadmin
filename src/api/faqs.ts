import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type FaqScope = 'general' | 'contact'
export type FaqCategory =
  | 'general'
  | 'booking_payments'
  | 'cancellation_refund'
  | 'permits_guidelines'

export interface AdminFaq {
  id: string
  scope: FaqScope
  category: FaqCategory
  question: string
  answer: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFaqInput {
  scope?: FaqScope
  category?: FaqCategory
  question: string
  answer: string
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateFaqInput {
  scope?: FaqScope
  category?: FaqCategory
  question: string
  answer: string
  displayOrder?: number
  isActive?: boolean
}

export interface ListFaqsFilters {
  q?: string
  category?: string
  scope?: string
}

export async function fetchAdminFaqs(filters?: ListFaqsFilters): Promise<AdminFaq[]> {
  const params: Record<string, string> = {}
  if (filters?.q) params.q = filters.q
  if (filters?.category) params.category = filters.category
  if (filters?.scope) params.scope = filters.scope

  const res = (await http.get('/api/v1/admin/faqs', { params })) as {
    data: AdminFaq[]
  }
  return res.data
}

export async function fetchFaqById(id: string): Promise<AdminFaq> {
  const res = (await http.get(`/api/v1/admin/faqs/${id}`)) as {
    data: AdminFaq
  }
  return res.data
}

export async function createFaq(input: CreateFaqInput): Promise<AdminFaq> {
  const res = (await http.post('/api/v1/admin/faqs', input)) as {
    data: AdminFaq
  }
  return res.data
}

export async function updateFaq(
  id: string,
  input: UpdateFaqInput,
): Promise<AdminFaq> {
  const res = (await http.put(`/api/v1/admin/faqs/${id}`, input)) as {
    data: AdminFaq
  }
  return res.data
}

export async function toggleFaqActive(
  id: string,
  isActive: boolean,
): Promise<AdminFaq> {
  const res = (await http.patch(`/api/v1/admin/faqs/${id}/status`, {
    isActive,
  })) as { data: AdminFaq }
  return res.data
}

export async function deleteFaq(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/faqs/${id}`)
}

export async function reorderFaqs(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/faqs/reorder', { items })
}

export function useFaqsQuery(filters?: ListFaqsFilters) {
  return useQuery({
    queryKey: filters ? ['faqs', 'list', filters] : queryKeys.faqs.all,
    queryFn: () => fetchAdminFaqs(filters),
  })
}

export function useCreateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFaqInput) => createFaq(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useUpdateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFaqInput }) =>
      updateFaq(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useToggleFaqActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleFaqActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useDeleteFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useReorderFaqsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderFaqs(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}
