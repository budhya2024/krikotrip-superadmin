import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminVideo {
  id: string
  title: string
  destinationId: string | null
  destinationName: string | null
  videoMediaId: string | null
  videoUrl: string | null
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  viewsLabel: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVideoInput {
  title: string
  destinationId?: string | null
  videoMediaId?: string | null
  videoUrl?: string | null
  thumbnailMediaId?: string | null
  durationSeconds?: number | null
  viewsLabel?: string | null
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateVideoInput {
  title: string
  destinationId?: string | null
  videoMediaId?: string | null
  videoUrl?: string | null
  thumbnailMediaId?: string | null
  durationSeconds?: number | null
  viewsLabel?: string | null
  displayOrder?: number
  isActive?: boolean
}

export async function fetchAdminVideos(): Promise<AdminVideo[]> {
  const res = (await http.get('/api/v1/admin/videos')) as {
    data: AdminVideo[]
  }
  return res.data
}

export async function fetchVideoById(id: string): Promise<AdminVideo> {
  const res = (await http.get(`/api/v1/admin/videos/${id}`)) as {
    data: AdminVideo
  }
  return res.data
}

export async function createVideo(input: CreateVideoInput): Promise<AdminVideo> {
  const res = (await http.post('/api/v1/admin/videos', input)) as {
    data: AdminVideo
  }
  return res.data
}

export async function updateVideo(
  id: string,
  input: UpdateVideoInput,
): Promise<AdminVideo> {
  const res = (await http.put(`/api/v1/admin/videos/${id}`, input)) as {
    data: AdminVideo
  }
  return res.data
}

export async function toggleVideoActive(
  id: string,
  isActive: boolean,
): Promise<AdminVideo> {
  const res = (await http.patch(`/api/v1/admin/videos/${id}/status`, {
    isActive,
  })) as { data: AdminVideo }
  return res.data
}

export async function deleteVideo(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/videos/${id}`)
}

export async function reorderVideos(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await http.put('/api/v1/admin/videos/reorder', { items })
}

export function useVideosQuery() {
  return useQuery({
    queryKey: queryKeys.videos.all,
    queryFn: () => fetchAdminVideos(),
  })
}

export function useCreateVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateVideoInput) => createVideo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
    },
  })
}

export function useUpdateVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVideoInput }) =>
      updateVideo(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
    },
  })
}

export function useToggleVideoActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleVideoActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
    },
  })
}

export function useDeleteVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
    },
  })
}

export function useReorderVideosMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      reorderVideos(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
    },
  })
}
