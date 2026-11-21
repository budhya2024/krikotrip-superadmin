import { http } from '../lib/http'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin'
  phone: string | null
  avatarUrl: string | null
}

export interface AdminSessionResponse {
  data: {
    user: AdminUser
  }
}

export async function fetchAdminSession(): Promise<AdminUser> {
  const res = (await http.get('/api/v1/admin/session')) as AdminSessionResponse
  return res.data.user
}

export interface UpdateAdminProfileInput {
  phone?: string | null
  avatarMediaId?: string | null
}

export async function updateAdminProfile(input: UpdateAdminProfileInput): Promise<AdminUser> {
  const res = (await http.patch('/api/v1/admin/profile', input)) as AdminSessionResponse
  return res.data.user
}
