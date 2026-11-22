import { http } from '../lib/http'

export interface UploadImageResponse {
  id: string
  url: string
  width: number
  height: number
  sizeBytes: number
  mimeType: string
  purpose: string
}

export interface PresignVideoResponse {
  mediaId: string
  uploadUrl: string
  objectKey: string
  publicUrl: string
  expiresInSeconds: number
}

export interface CompleteVideoResponse {
  id: string
  url: string
  status: 'ready'
  sizeBytes: number
  mimeType: string
}

export async function uploadAdminImage(
  file: File,
  purpose: string,
  onProgress?: (percent: number) => void,
): Promise<UploadImageResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)

  const response = (await http.post('/api/v1/admin/media/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
  })) as { data: UploadImageResponse }

  return response.data
}

export async function presignVideoUpload(
  contentType: string,
  sizeBytes: number,
  purpose = 'video',
): Promise<PresignVideoResponse> {
  const response = (await http.post('/api/v1/admin/media/videos/presign', {
    contentType,
    sizeBytes,
    purpose,
  })) as { data: PresignVideoResponse }

  return response.data
}

export async function completeVideoUpload(mediaId: string): Promise<CompleteVideoResponse> {
  const response = (await http.post(`/api/v1/admin/media/${mediaId}/complete`, {})) as {
    data: CompleteVideoResponse
  }

  return response.data
}
