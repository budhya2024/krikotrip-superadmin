import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type TravelType = 'couple' | 'family' | 'honeymoon' | 'leisure' | 'adventure' | 'group'
export type PackageCategory = 'adventure' | 'luxury' | 'honeymoon' | 'family' | 'cultural'
export type PackageStatus = 'draft' | 'published' | 'archived'

export interface AdminPackageItem {
  id: string
  slug: string
  title: string
  destinationId: string
  destinationName: string
  locationLabel: string
  days: number
  nights: number
  travelType: TravelType
  category: PackageCategory
  pricePaise: number
  originalPricePaise: number | null
  seatsAvailable: number | null
  status: PackageStatus
  isFeatured: boolean
  featuredRank: number | null
  badgeLabel: string | null
  coverImageUrl: string | null
  ratingAvg: number
  reviewsCount: number
  themesCount: number
  itineraryDaysCount: number
  createdAt: string
  updatedAt: string
}

export interface ItineraryDayItem {
  id?: string
  dayNumber: number
  title: string
  description: string
  transport?: string | null
  meals?: string | null
  stay?: string | null
  activities?: string[]
  media?: { id: string; url: string; sortOrder: number }[]
  mediaIds?: string[]
}

export interface PackageFaqItem {
  id?: string
  question: string
  answer: string
  sortOrder?: number
}

export interface TripFacts {
  groupSize?: string
  languages?: string
  bestSeason?: string
  startingPoint?: string
  endingPoint?: string
  [key: string]: string | undefined
}

export interface AdminPackageDetail {
  id: string
  slug: string
  title: string
  subtitle: string | null
  destination: {
    id: string
    slug: string
    name: string
    region: string | null
  }
  locationLabel: string
  country: string
  days: number
  nights: number
  travelType: TravelType
  category: PackageCategory
  pricePaise: number
  originalPricePaise: number | null
  seatsAvailable: number | null
  status: PackageStatus
  isFeatured: boolean
  featuredRank: number | null
  badgeLabel: string | null
  shortDescription: string
  overview: string
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  hotel: {
    name: string | null
    stars: number | null
    room: string | null
    amenities: string[] | null
  }
  tripFacts: TripFacts | null
  coverMediaId: string | null
  coverImageUrl: string | null
  galleryMediaIds: string[]
  gallery: { id: string; url: string; sortOrder: number }[]
  itinerary: ItineraryDayItem[]
  faqs: PackageFaqItem[]
  ratingAvg: number
  reviewsCount: number
  ratingDistribution: Record<string, number>
  seo: {
    title: string | null
    metaDescription: string | null
  }
  themeIds: string[]
  themes: { id: string; slug: string; name: string }[]
  publishedAt: string | null
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePackageInput {
  title: string
  slug?: string
  subtitle?: string
  destinationId: string
  locationLabel: string
  country?: string
  days: number
  nights: number
  travelType: TravelType
  category: PackageCategory
  pricePaise: number
  originalPricePaise?: number | null
  seatsAvailable?: number | null
  status?: PackageStatus
  isFeatured?: boolean
  featuredRank?: number | null
  badgeLabel?: string | null
  shortDescription: string
  overview: string
  highlights?: string[]
  inclusions?: string[]
  exclusions?: string[]
  hotelName?: string | null
  hotelStars?: number | null
  hotelRoom?: string | null
  hotelAmenities?: string[]
  tripFacts?: TripFacts | null
  coverMediaId?: string | null
  galleryMediaIds?: string[]
  themeIds?: string[]
  itinerary?: {
    dayNumber: number
    title: string
    description: string
    transport?: string | null
    meals?: string | null
    stay?: string | null
    activities?: string[]
    mediaIds?: string[]
  }[]
  faqs?: {
    question: string
    answer: string
    sortOrder?: number
  }[]
  seoTitle?: string | null
  metaDescription?: string | null
}

export type UpdatePackageInput = CreatePackageInput

export interface ListAdminPackagesParams {
  q?: string
  destinationId?: string
  category?: PackageCategory
  travelType?: TravelType
  status?: 'all' | PackageStatus
  page?: number
  limit?: number
}

export interface ListAdminPackagesResponse {
  data: AdminPackageItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    facets?: {
      status?: Record<string, number>
      destination?: Record<string, number>
      category?: Record<string, number>
    }
  }
}

export async function fetchAdminPackages(
  params?: ListAdminPackagesParams,
): Promise<ListAdminPackagesResponse> {
  const queryParams: Record<string, string> = {}
  if (params?.q) queryParams.q = params.q
  if (params?.destinationId) queryParams.destinationId = params.destinationId
  if (params?.category) queryParams.category = params.category
  if (params?.travelType) queryParams.travelType = params.travelType
  if (params?.status && params.status !== 'all') queryParams.status = params.status
  if (params?.page) queryParams.page = String(params.page)
  if (params?.limit) queryParams.limit = String(params.limit)

  const res = (await http.get('/api/v1/admin/packages', {
    params: queryParams,
  })) as ListAdminPackagesResponse

  return res
}

export async function fetchAdminPackageById(id: string): Promise<AdminPackageDetail> {
  const res = (await http.get(`/api/v1/admin/packages/${id}`)) as {
    data: AdminPackageDetail
  }
  return res.data
}

export async function createPackage(
  input: CreatePackageInput,
): Promise<AdminPackageDetail> {
  const res = (await http.post('/api/v1/admin/packages', input)) as {
    data: AdminPackageDetail
  }
  return res.data
}

export async function updatePackage(
  id: string,
  input: UpdatePackageInput,
): Promise<AdminPackageDetail> {
  const res = (await http.put(`/api/v1/admin/packages/${id}`, input)) as {
    data: AdminPackageDetail
  }
  return res.data
}

export async function patchPackageStatus(
  id: string,
  status: PackageStatus,
): Promise<AdminPackageDetail> {
  const res = (await http.patch(`/api/v1/admin/packages/${id}/status`, { status })) as {
    data: AdminPackageDetail
  }
  return res.data
}

export async function duplicatePackage(id: string): Promise<AdminPackageDetail> {
  const res = (await http.post(`/api/v1/admin/packages/${id}/duplicate`)) as {
    data: AdminPackageDetail
  }
  return res.data
}

export async function deletePackage(id: string): Promise<void> {
  await http.delete(`/api/v1/admin/packages/${id}`)
}

export function useAdminPackagesQuery(params?: ListAdminPackagesParams) {
  return useQuery({
    queryKey: queryKeys.packages.list(params as Record<string, unknown>),
    queryFn: () => fetchAdminPackages(params),
  })
}

export function useAdminPackageQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.packages.detail(id ?? ''),
    queryFn: () => fetchAdminPackageById(id!),
    enabled: Boolean(id),
  })
}

export function useCreatePackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePackageInput) => createPackage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}

export function useUpdatePackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePackageInput }) =>
      updatePackage(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(variables.id) })
    },
  })
}

export function usePatchPackageStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PackageStatus }) =>
      patchPackageStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(variables.id) })
    },
  })
}

export function useDuplicatePackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicatePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}

export function useDeletePackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all })
    },
  })
}
