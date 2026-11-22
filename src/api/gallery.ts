import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminGalleryCategory {
  id: string
  slug: string
  name: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminGalleryItem {
  id: string
  title: string
  location: string | null
  categoryId: string
  category: {
    id: string
    slug: string
    name: string
  }
  imageMediaId: string
  imageUrl: string
  aspect: 'landscape' | 'portrait' | 'wide'
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateGalleryCategoryInput {
  name: string
  slug?: string
  displayOrder?: number
}

export interface UpdateGalleryCategoryInput {
  name: string
  slug?: string
  displayOrder?: number
}

export interface CreateGalleryItemInput {
  title: string
  location?: string | null
  categoryId: string
  imageMediaId: string
  aspect?: 'landscape' | 'portrait' | 'wide'
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateGalleryItemInput {
  title: string
  location?: string | null
  categoryId: string
  imageMediaId: string
  aspect?: 'landscape' | 'portrait' | 'wide'
  displayOrder?: number
  isActive?: boolean
}

export interface ListAdminGalleryParams {
  q?: string
  categoryId?: string
  isActive?: 'true' | 'false'
  page?: number
  limit?: number
}

export interface AdminGalleryListResult {
  data: AdminGalleryItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function fetchGalleryCategories(): Promise<AdminGalleryCategory[]> {
  const res = (await http.get('/api/v1/admin/gallery/categories')) as {
    data: AdminGalleryCategory[]
  }
  return res.data
}

export async function createGalleryCategory(
  input: CreateGalleryCategoryInput,
): Promise<AdminGalleryCategory> {
  const res = (await http.post('/api/v1/admin/gallery/categories', input)) as {
    data: AdminGalleryCategory
  }
  return res.data
}

export async function updateGalleryCategory(
  id: string,
  input: UpdateGalleryCategoryInput,
): Promise<AdminGalleryCategory> {
  const res = (await http.put(`/api/v1/admin/gallery/categories/${id}`, input)) as {
    data: AdminGalleryCategory
  }
  return res.data
}

export async function deleteGalleryCategory(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/gallery/categories/${id}`)
}

export async function reorderGalleryCategories(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/gallery/categories/reorder', { items })
}

export async function fetchGalleryItems(
  params?: ListAdminGalleryParams,
): Promise<AdminGalleryListResult> {
  const queryParams = new URLSearchParams()
  if (params?.q) queryParams.set('q', params.q)
  if (params?.categoryId) queryParams.set('categoryId', params.categoryId)
  if (params?.isActive !== undefined) queryParams.set('isActive', params.isActive)
  if (params?.page) queryParams.set('page', String(params.page))
  if (params?.limit) queryParams.set('limit', String(params.limit))

  const qs = queryParams.toString()
  const path = qs ? `/api/v1/admin/gallery?${qs}` : '/api/v1/admin/gallery'
  const res = (await http.get(path)) as AdminGalleryListResult
  return res
}

export async function fetchGalleryItemById(id: string): Promise<AdminGalleryItem> {
  const res = (await http.get(`/api/v1/admin/gallery/${id}`)) as {
    data: AdminGalleryItem
  }
  return res.data
}

export async function createGalleryItem(
  input: CreateGalleryItemInput,
): Promise<AdminGalleryItem> {
  const res = (await http.post('/api/v1/admin/gallery', input)) as {
    data: AdminGalleryItem
  }
  return res.data
}

export async function updateGalleryItem(
  id: string,
  input: UpdateGalleryItemInput,
): Promise<AdminGalleryItem> {
  const res = (await http.put(`/api/v1/admin/gallery/${id}`, input)) as {
    data: AdminGalleryItem
  }
  return res.data
}

export async function toggleGalleryItemStatus(
  id: string,
  isActive: boolean,
): Promise<AdminGalleryItem> {
  const res = (await http.patch(`/api/v1/admin/gallery/${id}/status`, {
    isActive,
  })) as { data: AdminGalleryItem }
  return res.data
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/gallery/${id}`)
}

export async function reorderGalleryItems(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/gallery/reorder', { items })
}

export function useGalleryCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.gallery.categories,
    queryFn: () => fetchGalleryCategories(),
  })
}

export function useCreateGalleryCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGalleryCategoryInput) => createGalleryCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useUpdateGalleryCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGalleryCategoryInput }) =>
      updateGalleryCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useDeleteGalleryCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGalleryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useReorderGalleryCategoriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderGalleryCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useGalleryItemsQuery(params?: ListAdminGalleryParams) {
  return useQuery({
    queryKey: queryKeys.gallery.list(params as Record<string, unknown> | undefined),
    queryFn: () => fetchGalleryItems(params),
  })
}

export function useCreateGalleryItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGalleryItemInput) => createGalleryItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useUpdateGalleryItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGalleryItemInput }) =>
      updateGalleryItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useToggleGalleryItemStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleGalleryItemStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useDeleteGalleryItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}

export function useReorderGalleryItemsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderGalleryItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all })
    },
  })
}
