import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type VendorCategory =
  | 'tour_operator'
  | 'resort_hotel'
  | 'transport_fleet'
  | 'adventure_guide'

export type VendorStatus = 'pending_approval' | 'active' | 'suspended'

export type VendorPortalRole = 'vendor_admin' | 'vendor_manager' | 'staff'

export type VendorMemberStatus = 'invited' | 'active' | 'disabled'

export type VendorPayoutStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'

export interface VendorTerritoryDestination {
  id: string
  name: string
  slug: string
  region?: string | null
}

export interface AdminVendorItem {
  id: string
  code: string
  registrationId: string
  businessName: string
  contactPerson: string
  email: string
  phone: string
  category: VendorCategory
  location: string
  commissionPercent: number
  status: VendorStatus
  portalAccess: boolean
  ratingAvg: number
  notes: string | null
  territories: VendorTerritoryDestination[]
  assignedDestinations: string[]
  toursCompleted: number
  totalPayoutDisbursed: number
  createdAt: string
  updatedAt: string
}

export interface VendorMemberItem {
  id: string
  vendorId: string
  userId: string | null
  email: string
  name: string
  portalRole: VendorPortalRole
  status: VendorMemberStatus
  inviteExpiresAt: string | null
  lastSeenAt: string | null
  createdAt: string
}

export interface VendorPayoutItem {
  id: string
  vendorId: string
  enquiryId: string | null
  amountPaise: number
  status: VendorPayoutStatus
  reference: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface VendorCompletedTourItem {
  id: string
  reference: string
  customerName: string
  destinationName: string | null
  travelDate: string | null
  travellers: number
  finalPricePaise: number | null
  vendorPayoutPaise: number | null
  completedAt: string | null
  rating: number | null
  feedback: string | null
  payoutStatus: VendorPayoutStatus | null
  payoutAmountPaise: number | null
}

export interface AdminVendorDetail extends AdminVendorItem {
  allowedTransitions: VendorStatus[]
  members: VendorMemberItem[]
  recentPayouts: VendorPayoutItem[]
  completedTours: VendorCompletedTourItem[]
}

export interface ListAdminVendorsParams {
  search?: string
  status?: VendorStatus
  category?: VendorCategory
  destinationId?: string
  page?: number
  limit?: number
}

export interface ListAdminVendorsResponse {
  items: AdminVendorItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  facets: {
    byStatus: Record<VendorStatus, number>
    byCategory: Record<VendorCategory, number>
  }
  stats: {
    totalVendors: number
    activeCount: number
    pendingApprovalsCount: number
    portalAccessCount: number
  }
}

export interface CreateAdminVendorInput {
  businessName: string
  contactPerson: string
  email: string
  phone: string
  category: VendorCategory
  location: string
  commissionPercent?: number
  status?: VendorStatus
  portalAccess?: boolean
  portalRole?: VendorPortalRole
  destinationIds?: string[]
  notes?: string | null
}

export interface UpdateAdminVendorInput {
  businessName?: string
  contactPerson?: string
  email?: string
  phone?: string
  category?: VendorCategory
  location?: string
  commissionPercent?: number
  notes?: string | null
}

export interface InviteVendorMemberInput {
  email: string
  name: string
  portalRole?: VendorPortalRole
}

export interface CreateVendorPayoutInput {
  enquiryId?: string | null
  amountPaise: number
  status?: VendorPayoutStatus
  reference?: string | null
  paidAt?: string | null
  notes?: string | null
}

export interface UpdateVendorPayoutInput {
  amountPaise?: number
  status?: VendorPayoutStatus
  reference?: string | null
  paidAt?: string | null
  notes?: string | null
}

export interface AssignVendorLeadInput {
  vendorId: string | null
  note?: string | null
}

export interface RecordVendorLeadResponseInput {
  decision: 'accepted' | 'declined'
  note?: string | null
}

export interface RecordVendorTourFeedbackInput {
  rating: number
  feedback?: string | null
}

export async function fetchAdminVendors(
  params: ListAdminVendorsParams = {},
): Promise<ListAdminVendorsResponse> {
  const queryParams: Record<string, string> = {}
  if (params.search) queryParams.search = params.search
  if (params.status) queryParams.status = params.status
  if (params.category) queryParams.category = params.category
  if (params.destinationId) queryParams.destinationId = params.destinationId
  if (params.page !== undefined) queryParams.page = String(params.page)
  if (params.limit !== undefined) queryParams.limit = String(params.limit)

  const res = (await http.get('/api/v1/admin/vendors', {
    params: queryParams,
  })) as ListAdminVendorsResponse
  return res
}

export async function fetchAdminVendorById(id: string): Promise<AdminVendorDetail> {
  const res = (await http.get(`/api/v1/admin/vendors/${id}`)) as {
    data: AdminVendorDetail
  }
  return res.data
}

export async function createAdminVendor(
  input: CreateAdminVendorInput,
): Promise<AdminVendorDetail> {
  const res = (await http.post('/api/v1/admin/vendors', input)) as {
    data: AdminVendorDetail
  }
  return res.data
}

export async function updateAdminVendor(
  id: string,
  input: UpdateAdminVendorInput,
): Promise<AdminVendorDetail> {
  const res = (await http.patch(`/api/v1/admin/vendors/${id}`, input)) as {
    data: AdminVendorDetail
  }
  return res.data
}

export async function updateAdminVendorStatus(
  id: string,
  status: VendorStatus,
): Promise<AdminVendorDetail> {
  const res = (await http.patch(`/api/v1/admin/vendors/${id}/status`, {
    status,
  })) as { data: AdminVendorDetail }
  return res.data
}

export async function updateAdminVendorPortalAccess(
  id: string,
  portalAccess: boolean,
): Promise<AdminVendorDetail> {
  const res = (await http.patch(`/api/v1/admin/vendors/${id}/portal-access`, {
    portalAccess,
  })) as { data: AdminVendorDetail }
  return res.data
}

export async function updateAdminVendorTerritories(
  id: string,
  destinationIds: string[],
): Promise<AdminVendorDetail> {
  const res = (await http.put(`/api/v1/admin/vendors/${id}/territories`, {
    destinationIds,
  })) as { data: AdminVendorDetail }
  return res.data
}

export async function deleteAdminVendor(id: string): Promise<{ success: boolean }> {
  const res = (await http.delete(`/api/v1/admin/vendors/${id}`)) as {
    success: boolean
  }
  return res
}

export async function fetchVendorMembers(
  vendorId: string,
): Promise<VendorMemberItem[]> {
  const res = (await http.get(`/api/v1/admin/vendors/${vendorId}/members`)) as {
    data: VendorMemberItem[]
  }
  return res.data
}

export async function inviteVendorMember(
  vendorId: string,
  input: InviteVendorMemberInput,
): Promise<VendorMemberItem> {
  const res = (await http.post(
    `/api/v1/admin/vendors/${vendorId}/members`,
    input,
  )) as { data: VendorMemberItem }
  return res.data
}

export async function fetchVendorPayouts(
  vendorId: string,
): Promise<VendorPayoutItem[]> {
  const res = (await http.get(`/api/v1/admin/vendors/${vendorId}/payouts`)) as {
    data: VendorPayoutItem[]
  }
  return res.data
}

export async function createVendorPayout(
  vendorId: string,
  input: CreateVendorPayoutInput,
): Promise<VendorPayoutItem> {
  const res = (await http.post(
    `/api/v1/admin/vendors/${vendorId}/payouts`,
    input,
  )) as { data: VendorPayoutItem }
  return res.data
}

export async function updateVendorPayout(
  vendorId: string,
  payoutId: string,
  input: UpdateVendorPayoutInput,
): Promise<VendorPayoutItem> {
  const res = (await http.patch(
    `/api/v1/admin/vendors/${vendorId}/payouts/${payoutId}`,
    input,
  )) as { data: VendorPayoutItem }
  return res.data
}

export async function fetchVendorCompletedTours(
  vendorId: string,
): Promise<VendorCompletedTourItem[]> {
  const res = (await http.get(
    `/api/v1/admin/vendors/${vendorId}/completed-tours`,
  )) as { data: VendorCompletedTourItem[] }
  return res.data
}

export async function assignVendorLead(
  enquiryId: string,
  input: AssignVendorLeadInput,
): Promise<{ id: string; assignedVendorId: string | null; vendorLeadStatus: string }> {
  const res = (await http.put(
    `/api/v1/admin/enquiries/${enquiryId}/vendor-assignment`,
    input,
  )) as { data: { id: string; assignedVendorId: string | null; vendorLeadStatus: string } }
  return res.data
}

export async function recordVendorLeadResponse(
  enquiryId: string,
  input: RecordVendorLeadResponseInput,
): Promise<{
  id: string
  status: string
  vendorLeadStatus: string
  vendorRespondedAt: string | null
}> {
  const res = (await http.put(
    `/api/v1/admin/enquiries/${enquiryId}/vendor-response`,
    input,
  )) as {
    data: {
      id: string
      status: string
      vendorLeadStatus: string
      vendorRespondedAt: string | null
    }
  }
  return res.data
}

export async function recordVendorTourFeedback(
  enquiryId: string,
  input: RecordVendorTourFeedbackInput,
): Promise<{
  id: string
  vendorId: string
  enquiryId: string
  rating: number
  feedback: string | null
}> {
  const res = (await http.put(
    `/api/v1/admin/enquiries/${enquiryId}/vendor-feedback`,
    input,
  )) as {
    data: {
      id: string
      vendorId: string
      enquiryId: string
      rating: number
      feedback: string | null
    }
  }
  return res.data
}

export function useVendorsQuery(params: ListAdminVendorsParams = {}) {
  return useQuery({
    queryKey: queryKeys.vendors.list(params as Record<string, unknown>),
    queryFn: () => fetchAdminVendors(params),
  })
}

export function useVendorDetailQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id || ''),
    queryFn: () => fetchAdminVendorById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateVendorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdminVendorInput) => createAdminVendor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
    },
  })
}

export function useUpdateVendorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminVendorInput }) =>
      updateAdminVendor(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
      queryClient.setQueryData(queryKeys.vendors.detail(data.id), data)
    },
  })
}

export function useUpdateVendorStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) =>
      updateAdminVendorStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
      queryClient.setQueryData(queryKeys.vendors.detail(data.id), data)
    },
  })
}

export function useUpdateVendorPortalAccessMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, portalAccess }: { id: string; portalAccess: boolean }) =>
      updateAdminVendorPortalAccess(id, portalAccess),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
      queryClient.setQueryData(queryKeys.vendors.detail(data.id), data)
    },
  })
}

export function useUpdateVendorTerritoriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      destinationIds,
    }: {
      id: string
      destinationIds: string[]
    }) => updateAdminVendorTerritories(id, destinationIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
      queryClient.setQueryData(queryKeys.vendors.detail(data.id), data)
    },
  })
}

export function useDeleteVendorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all })
    },
  })
}

export function useVendorMembersQuery(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.members(vendorId || ''),
    queryFn: () => fetchVendorMembers(vendorId!),
    enabled: Boolean(vendorId),
  })
}

export function useInviteVendorMemberMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      input,
    }: {
      vendorId: string
      input: InviteVendorMemberInput
    }) => inviteVendorMember(vendorId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.members(variables.vendorId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.detail(variables.vendorId),
      })
    },
  })
}

export function useVendorPayoutsQuery(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.payouts(vendorId || ''),
    queryFn: () => fetchVendorPayouts(vendorId!),
    enabled: Boolean(vendorId),
  })
}

export function useCreateVendorPayoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      input,
    }: {
      vendorId: string
      input: CreateVendorPayoutInput
    }) => createVendorPayout(vendorId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.payouts(variables.vendorId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.detail(variables.vendorId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.all,
      })
    },
  })
}

export function useUpdateVendorPayoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      payoutId,
      input,
    }: {
      vendorId: string
      payoutId: string
      input: UpdateVendorPayoutInput
    }) => updateVendorPayout(vendorId, payoutId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.payouts(variables.vendorId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.detail(variables.vendorId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.all,
      })
    },
  })
}

export function useVendorCompletedToursQuery(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.completedTours(vendorId || ''),
    queryFn: () => fetchVendorCompletedTours(vendorId!),
    enabled: Boolean(vendorId),
  })
}

export function useAssignVendorLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      enquiryId,
      input,
    }: {
      enquiryId: string
      input: AssignVendorLeadInput
    }) => assignVendorLead(enquiryId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.enquiries.detail(variables.enquiryId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.enquiries.all,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.all,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })
}

export function useRecordVendorLeadResponseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      enquiryId,
      input,
    }: {
      enquiryId: string
      input: RecordVendorLeadResponseInput
    }) => recordVendorLeadResponse(enquiryId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.enquiries.detail(variables.enquiryId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.enquiries.all,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.all,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })
}

export function useRecordVendorTourFeedbackMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      enquiryId,
      input,
    }: {
      enquiryId: string
      input: RecordVendorTourFeedbackInput
    }) => recordVendorTourFeedback(enquiryId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.enquiries.detail(variables.enquiryId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.all,
      })
    },
  })
}
