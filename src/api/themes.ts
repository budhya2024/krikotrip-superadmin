import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminTheme {
  id: string
  slug: string
  name: string
  photoMediaId: string | null
  photoUrl: string | null
  linkUrl: string | null
  effectiveLinkUrl: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateThemeInput {
  name: string
  slug?: string
  photoMediaId?: string | null
  linkUrl?: string | null
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateThemeInput {
  name: string
  slug?: string
  photoMediaId?: string | null
  linkUrl?: string | null
  displayOrder?: number
  isActive?: boolean
}

export async function fetchAdminThemes(): Promise<AdminTheme[]> {
  const res = (await http.get('/api/v1/admin/themes')) as {
    data: AdminTheme[]
  }
  return res.data
}

export async function fetchThemeById(id: string): Promise<AdminTheme> {
  const res = (await http.get(`/api/v1/admin/themes/${id}`)) as {
    data: AdminTheme
  }
  return res.data
}

export async function createTheme(input: CreateThemeInput): Promise<AdminTheme> {
  const res = (await http.post('/api/v1/admin/themes', input)) as {
    data: AdminTheme
  }
  return res.data
}

export async function updateTheme(
  id: string,
  input: UpdateThemeInput,
): Promise<AdminTheme> {
  const res = (await http.put(`/api/v1/admin/themes/${id}`, input)) as {
    data: AdminTheme
  }
  return res.data
}

export async function toggleThemeActive(
  id: string,
  isActive: boolean,
): Promise<AdminTheme> {
  const res = (await http.patch(`/api/v1/admin/themes/${id}/active`, {
    isActive,
  })) as { data: AdminTheme }
  return res.data
}

export async function deleteTheme(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/themes/${id}`)
}

export async function reorderThemes(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/themes/order', { items })
}

export function useThemesQuery() {
  return useQuery({
    queryKey: queryKeys.themes.admin(),
    queryFn: () => fetchAdminThemes(),
  })
}

export function useCreateThemeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateThemeInput) => createTheme(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all })
    },
  })
}

export function useUpdateThemeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateThemeInput }) =>
      updateTheme(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all })
    },
  })
}

export function useToggleThemeActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleThemeActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all })
    },
  })
}

export function useDeleteThemeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all })
    },
  })
}

export function useReorderThemesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderThemes(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all })
    },
  })
}
