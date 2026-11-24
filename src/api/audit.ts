import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export interface AdminAuditLog {
  id: string
  actorUserId: string | null
  actorType: 'super_admin' | 'customer' | 'vendor_member' | 'system'
  action: string
  entityType: string
  entityId: string
  changes: Record<string, unknown> | null
  ip: string | null
  userAgent: string | null
  requestId: string | null
  createdAt: string
}

export interface AdminAuditLogsResponse {
  items: AdminAuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminAuditLogsParams {
  page?: number
  limit?: number
  entityType?: string
  entityId?: string
  actorUserId?: string
  actorType?: 'super_admin' | 'customer' | 'vendor_member' | 'system'
}

export async function fetchAdminAuditLogs(
  params?: AdminAuditLogsParams,
): Promise<AdminAuditLogsResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.entityType) query.set('entityType', params.entityType)
  if (params?.entityId) query.set('entityId', params.entityId)
  if (params?.actorUserId) query.set('actorUserId', params.actorUserId)
  if (params?.actorType) query.set('actorType', params.actorType)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const res = await http.get<{ data: AdminAuditLogsResponse }>(
    `/admin/audit-logs${queryString}`,
  )
  return res.data.data
}

export function useAdminAuditLogsQuery(params?: AdminAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => fetchAdminAuditLogs(params),
  })
}
