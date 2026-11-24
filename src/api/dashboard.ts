import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'
import { queryKeys } from '../lib/query-keys'

export type DashboardPeriod = 'all' | 'year' | 'month' | 'week' | 'today'

export interface DashboardSummary {
  period: DashboardPeriod
  totalRevenuePaise: number
  totalRevenue: number
  previousRevenuePaise: number
  revenueChangePercent: number
  activePackages: number
  newEnquiries: number
  pendingQuotes: number
  activeTravelers: number
  previousActiveTravelers: number
  travelersChangePercent: number
}

export interface DashboardRevenueSeriesPoint {
  month: string
  revenuePaise: number
  revenue: number
  bookings: number
  enquiries: number
}

export interface DashboardDestinationBooking {
  destinationId: string
  destinationName: string
  name: string
  bookings: number
  share: number
}

export interface DashboardLeadRatio {
  destinationId: string | null
  destinationName: string
  label: string
  totalLeads: number
  confirmedBookings: number
  inProgressLeads: number
  newLeads: number
  cancelledLeads: number
  revenuePaise: number
  revenue: number
  bookingRatioPercent: number
  insight: string
}

export async function fetchDashboardSummary(
  period: DashboardPeriod = 'month',
): Promise<DashboardSummary> {
  const res = await http.get<{ data: DashboardSummary }>(
    `/admin/dashboard/summary?period=${period}`,
  )
  return res.data.data
}

export async function fetchDashboardRevenueSeries(
  months: number = 6,
): Promise<DashboardRevenueSeriesPoint[]> {
  const res = await http.get<{ data: DashboardRevenueSeriesPoint[] }>(
    `/admin/dashboard/revenue-series?months=${months}`,
  )
  return res.data.data
}

export async function fetchDashboardDestinationBookings(): Promise<
  DashboardDestinationBooking[]
> {
  const res = await http.get<{ data: DashboardDestinationBooking[] }>(
    '/admin/dashboard/destination-bookings',
  )
  return res.data.data
}

export async function fetchDashboardLeadRatio(
  destinationId?: string,
): Promise<DashboardLeadRatio> {
  const query =
    destinationId && destinationId !== 'All'
      ? `?destinationId=${encodeURIComponent(destinationId)}`
      : ''
  const res = await http.get<{ data: DashboardLeadRatio }>(
    `/admin/dashboard/lead-ratio${query}`,
  )
  return res.data.data
}

export function useDashboardSummaryQuery(period: DashboardPeriod = 'month') {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: () => fetchDashboardSummary(period),
  })
}

export function useDashboardRevenueSeriesQuery(months: number = 6) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueSeries(months),
    queryFn: () => fetchDashboardRevenueSeries(months),
  })
}

export function useDashboardDestinationBookingsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.destinationBookings,
    queryFn: fetchDashboardDestinationBookings,
  })
}

export function useDashboardLeadRatioQuery(destinationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.leadRatio(destinationId),
    queryFn: () => fetchDashboardLeadRatio(destinationId),
  })
}
