import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface HomeStatItem {
  id?: string
  label: string
  value: string
  number?: string
  icon?: string
}

export interface AdminSettings {
  id: number
  superAdminUserId: string | null
  agencyName: string
  tagline: string | null
  contactEmail: string
  supportPhone: string
  whatsappNumber: string | null
  address: string | null
  mapEmbedUrl: string | null
  currency: string
  timezone: string
  bookingAutoConfirm: boolean
  emailNotifications: boolean
  smsAlerts: boolean
  socialLinks: Record<string, string>
  homeStats: HomeStatItem[]
  loyaltyConfig: Record<string, unknown>
  reviewConfig: {
    autoApproveVerified: boolean
  }
  updatedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateAdminSettingsInput {
  agencyName?: string
  tagline?: string | null
  contactEmail?: string
  supportPhone?: string
  whatsappNumber?: string | null
  address?: string | null
  mapEmbedUrl?: string | null
  currency?: string
  timezone?: string
  bookingAutoConfirm?: boolean
  emailNotifications?: boolean
  smsAlerts?: boolean
  socialLinks?: Record<string, string>
  homeStats?: HomeStatItem[]
  loyaltyConfig?: Record<string, unknown>
  reviewConfig?: {
    autoApproveVerified: boolean
  }
}

interface AdminSettingsEnvelope {
  data: AdminSettings
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const res = (await http.get('/api/v1/admin/settings')) as AdminSettingsEnvelope
  return res.data
}

export async function updateAdminSettings(
  input: UpdateAdminSettingsInput,
): Promise<AdminSettings> {
  const res = (await http.put('/api/v1/admin/settings', input)) as AdminSettingsEnvelope
  return res.data
}

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchAdminSettings,
  })
}

export function useUpdateAdminSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings, updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}
