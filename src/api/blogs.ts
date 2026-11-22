import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminBlogCategory {
  id: string
  slug: string
  name: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminBlogListItem {
  id: string
  slug: string
  title: string
  excerpt: string
  coverUrl: string
  coverAlt: string | null
  category: {
    id: string
    slug: string
    name: string
  }
  destination: {
    id: string
    slug: string
    name: string
  } | null
  locationLabel: string | null
  badgeLabel: string | null
  tags: string[]
  author: {
    name: string
    role: string
    avatarUrl: string | null
  }
  readTimeMinutes: number
  status: 'draft' | 'scheduled' | 'published'
  publishedAt: string | null
  viewsCount: number
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  focusKeywords: string[]
  createdAt: string
  updatedAt: string
}

export interface AdminBlogDetail extends AdminBlogListItem {
  coverMediaId: string
  authorAvatarMediaId: string | null
  contentMarkdown: string
}

export interface CreateBlogCategoryInput {
  name: string
  slug?: string
  displayOrder?: number
}

export interface UpdateBlogCategoryInput {
  name?: string
  slug?: string
  displayOrder?: number
}

export interface ReorderBlogCategoryItem {
  id: string
  displayOrder: number
}

export interface CreateBlogPostInput {
  title: string
  slug?: string
  excerpt: string
  contentMarkdown: string
  coverMediaId: string
  coverAlt?: string | null
  categoryId: string
  destinationId?: string | null
  locationLabel?: string | null
  badgeLabel?: string | null
  tags?: string[]
  authorName?: string
  authorRole?: string
  authorAvatarMediaId?: string | null
  status?: 'draft' | 'scheduled' | 'published'
  publishedAt?: string | null
  seoTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  focusKeywords?: string[]
}

export interface UpdateBlogPostInput {
  title?: string
  slug?: string
  excerpt?: string
  contentMarkdown?: string
  coverMediaId?: string
  coverAlt?: string | null
  categoryId?: string
  destinationId?: string | null
  locationLabel?: string | null
  badgeLabel?: string | null
  tags?: string[]
  authorName?: string
  authorRole?: string
  authorAvatarMediaId?: string | null
  status?: 'draft' | 'scheduled' | 'published'
  publishedAt?: string | null
  seoTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  focusKeywords?: string[]
}

export interface PatchBlogStatusInput {
  status: 'draft' | 'scheduled' | 'published'
  publishedAt?: string | null
}

export interface ListAdminBlogsParams {
  q?: string
  status?: 'draft' | 'scheduled' | 'published'
  categoryId?: string
  destinationId?: string
  page?: number
  limit?: number
}

export interface AdminBlogListResult {
  data: AdminBlogListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function fetchAdminBlogCategories(): Promise<AdminBlogCategory[]> {
  const res = (await http.get('/api/v1/admin/blog-categories')) as {
    data: AdminBlogCategory[]
  }
  return res.data
}

export async function createAdminBlogCategory(
  input: CreateBlogCategoryInput,
): Promise<AdminBlogCategory> {
  const res = (await http.post('/api/v1/admin/blog-categories', input)) as {
    data: AdminBlogCategory
  }
  return res.data
}

export async function updateAdminBlogCategory(
  id: string,
  input: UpdateBlogCategoryInput,
): Promise<AdminBlogCategory> {
  const res = (await http.put(`/api/v1/admin/blog-categories/${id}`, input)) as {
    data: AdminBlogCategory
  }
  return res.data
}

export async function deleteAdminBlogCategory(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/blog-categories/${id}`)
}

export async function reorderAdminBlogCategories(
  items: ReorderBlogCategoryItem[],
): Promise<void> {
  await http.put('/api/v1/admin/blog-categories/reorder', { items })
}

export async function fetchAdminBlogs(
  params?: ListAdminBlogsParams,
): Promise<AdminBlogListResult> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.status) query.set('status', params.status)
  if (params?.categoryId) query.set('categoryId', params.categoryId)
  if (params?.destinationId) query.set('destinationId', params.destinationId)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const path = qs ? `/api/v1/admin/blogs?${qs}` : '/api/v1/admin/blogs'

  const res = (await http.get(path)) as {
    data: AdminBlogListItem[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  return res
}

export async function fetchAdminBlogById(id: string): Promise<AdminBlogDetail> {
  const res = (await http.get(`/api/v1/admin/blogs/${id}`)) as {
    data: AdminBlogDetail
  }
  return res.data
}

export async function createAdminBlog(
  input: CreateBlogPostInput,
): Promise<AdminBlogDetail> {
  const res = (await http.post('/api/v1/admin/blogs', input)) as {
    data: AdminBlogDetail
  }
  return res.data
}

export async function updateAdminBlog(
  id: string,
  input: UpdateBlogPostInput,
): Promise<AdminBlogDetail> {
  const res = (await http.put(`/api/v1/admin/blogs/${id}`, input)) as {
    data: AdminBlogDetail
  }
  return res.data
}

export async function patchAdminBlogStatus(
  id: string,
  input: PatchBlogStatusInput,
): Promise<AdminBlogDetail> {
  const res = (await http.patch(`/api/v1/admin/blogs/${id}/status`, input)) as {
    data: AdminBlogDetail
  }
  return res.data
}

export async function deleteAdminBlog(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/blogs/${id}`)
}

export function useAdminBlogCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.blogs.categories,
    queryFn: fetchAdminBlogCategories,
    staleTime: 60_000,
  })
}

export function useCreateBlogCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.categories })
    },
  })
}

export function useUpdateBlogCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogCategoryInput }) =>
      updateAdminBlogCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.categories })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
    },
  })
}

export function useDeleteBlogCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.categories })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
    },
  })
}

export function useReorderBlogCategoriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderAdminBlogCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.categories })
    },
  })
}

export function useAdminBlogsQuery(params?: ListAdminBlogsParams) {
  return useQuery({
    queryKey: queryKeys.blogs.list(params as Record<string, unknown>),
    queryFn: () => fetchAdminBlogs(params),
    staleTime: 30_000,
  })
}

export function useAdminBlogDetailQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(id ?? ''),
    queryFn: () => fetchAdminBlogById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
    },
  })
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogPostInput }) =>
      updateAdminBlog(id, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(vars.id) })
    },
  })
}

export function usePatchBlogStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatchBlogStatusInput }) =>
      patchAdminBlogStatus(id, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(vars.id) })
    },
  })
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
    },
  })
}
