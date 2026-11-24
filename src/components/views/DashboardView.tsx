import React, { useState } from 'react';
import {
  Plane,
  CalendarCheck2,
  IndianRupee,
  TrendingUp,
  Users,
  Star,
  Building2,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Sparkles,
  MapPin,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { NavigationKey, Tour, BookingEnquiry } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DropdownFilter } from '../common/DropdownFilter';
import {
  useDashboardDestinationBookingsQuery,
  useDashboardLeadRatioQuery,
  useDashboardRevenueSeriesQuery,
  useDashboardSummaryQuery,
  type DashboardPeriod,
} from '../../api/dashboard';
import { useDestinationsQuery } from '../../api/destinations';
import { AuditLogsModal } from './AuditLogsModal';

interface DashboardViewProps {
  tours: Tour[];
  enquiries: BookingEnquiry[];
  onNavigate: (tab: NavigationKey) => void;
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  tours,
  enquiries,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'bookings'>('revenue');
  const [chartMonths, setChartMonths] = useState<number>(6);
  const [selectedDestinationFilter, setSelectedDestinationFilter] =
    useState<string>('All');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const { data: summaryData } = useDashboardSummaryQuery(selectedPeriod);
  const { data: revenueSeriesData } = useDashboardRevenueSeriesQuery(chartMonths);
  const { data: destinationBookingsData } = useDashboardDestinationBookingsQuery();
  const { data: destinationsData } = useDestinationsQuery();
  const { data: leadRatioData } = useDashboardLeadRatioQuery(
    selectedDestinationFilter === 'All' ? undefined : selectedDestinationFilter,
  );

  const totalLeads = leadRatioData?.totalLeads ?? 0;
  const bookingsCount = leadRatioData?.confirmedBookings ?? 0;
  const inProgressCount = leadRatioData?.inProgressLeads ?? 0;
  const newLeadsCountState = leadRatioData?.newLeads ?? 0;
  const cancelledCount = leadRatioData?.cancelledLeads ?? 0;
  const bookingRatioPercent = (leadRatioData?.bookingRatioPercent ?? 0).toFixed(1);
  const territoryRevenue = leadRatioData?.revenue ?? 0;
  const territoryInsight =
    leadRatioData?.insight ??
    'Select a territory to analyze booking conversion trends.';
  const territoryLabel = leadRatioData?.label ?? 'All Destinations Combined';

  const circleChartData = [
    { name: 'Confirmed Bookings', value: bookingsCount, color: '#2563eb' },
    {
      name: 'In Progress (With Vendor)',
      value: inProgressCount,
      color: '#0284c7',
    },
    { name: 'New Inquiries', value: newLeadsCountState, color: '#6366f1' },
    { name: 'Declined / Cancelled', value: cancelledCount, color: '#f43f5e' },
  ];

  const destinationDropdownOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: `${totalLeads} Leads`,
    },
    ...(destinationsData ?? []).map((dest) => ({
      value: dest.id,
      label: dest.name,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: dest.region || undefined,
    })),
  ];

  const revenueDisplay = summaryData
    ? `₹${summaryData.totalRevenue.toLocaleString('en-IN')}`
    : '₹0';
  const activeToursDisplay = String(
    summaryData?.activePackages ??
      tours.filter((t) => t.status === 'Published').length,
  );
  const newEnquiriesDisplay = String(
    summaryData?.newEnquiries ??
      enquiries.filter((e) => e.status === 'New').length,
  );
  const activeTravelersDisplay = summaryData
    ? summaryData.activeTravelers.toLocaleString('en-IN')
    : '0';

  const revenueChangeText =
    selectedPeriod === 'all'
      ? 'All time gross'
      : `${(summaryData?.revenueChangePercent ?? 0) >= 0 ? '+' : ''}${
          summaryData?.revenueChangePercent ?? 0
        }% vs prev period`;

  const travelersChangeText = `${
    (summaryData?.travelersChangePercent ?? 0) >= 0 ? '+' : ''
  }${summaryData?.travelersChangePercent ?? 0}% (12m)`;

  const stats = [
    {
      title: 'Total Revenue',
      value: revenueDisplay,
      change: revenueChangeText,
      icon: IndianRupee,
    },
    {
      title: 'Active Tour Packages',
      value: activeToursDisplay,
      change: 'Catalog active',
      icon: Plane,
    },
    {
      title: 'New Booking Enquiries',
      value: newEnquiriesDisplay,
      change: `${summaryData?.pendingQuotes ?? 0} needing quotes`,
      icon: CalendarCheck2,
    },
    {
      title: 'Total Active Travelers',
      value: activeTravelersDisplay,
      change: travelersChangeText,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[4px] overflow-x-auto">
          {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((periodKey) => (
            <button
              key={periodKey}
              onClick={() => setSelectedPeriod(periodKey)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPeriod === periodKey
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {PERIOD_LABELS[periodKey]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Audit Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-[4px] border ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {stat.title}
                </span>
                <div className="w-9 h-9 rounded-[4px] bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className={`lg:col-span-2 rounded-[4px] border p-5 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Revenue & Booking Performance Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly revenue generated from tour reservations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[4px]">
                <button
                  onClick={() => setChartMonths(6)}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors ${
                    chartMonths === 6
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  6M
                </button>
                <button
                  onClick={() => setChartMonths(12)}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors ${
                    chartMonths === 12
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  12M
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[4px]">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-colors ${
                    chartMetric === 'revenue'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setChartMetric('bookings')}
                  className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-colors ${
                    chartMetric === 'bookings'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Bookings Count
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueSeriesData ?? []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) =>
                    chartMetric === 'revenue'
                      ? `₹${(val / 100000).toFixed(1)}L`
                      : `${val}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  }}
                  formatter={(value: any) => [
                    chartMetric === 'revenue'
                      ? `₹${Number(value).toLocaleString('en-IN')}`
                      : `${value} bookings`,
                    chartMetric === 'revenue' ? 'Monthly Revenue' : 'Bookings',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={`rounded-[4px] border p-5 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              Top Destination Demand
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tour reservations by location
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={destinationBookingsData ?? []}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                />
                <XAxis
                  type="number"
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  }}
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} Booked (${item?.payload?.share ?? 0}% share)`,
                    'Volume',
                  ]}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div
        className={`rounded-[4px] border p-5 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[4px] bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Total Leads vs Confirmed Bookings Ratio
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Circle Graph
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Analyze inquiry conversion performance across individual destination
              territories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownFilter
              label="Territory"
              value={selectedDestinationFilter}
              onChange={setSelectedDestinationFilter}
              options={destinationDropdownOptions}
              icon={
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              }
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                    formatter={(val: any, name: any) => [
                      `${val} leads (${
                        totalLeads > 0
                          ? ((Number(val) / totalLeads) * 100).toFixed(1)
                          : '0.0'
                      }%)`,
                      name,
                    ]}
                  />
                  <Pie
                    data={circleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {circleChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                  {bookingRatioPercent}%
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Booking Ratio
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {bookingsCount} of {totalLeads} Leads
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              {circleChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-[2px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-600 dark:text-slate-400 truncate block">
                      {item.name}: <strong>{item.value}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Lead Conversion Funnel ({territoryLabel})
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {bookingRatioPercent}% Converted
                </span>
              </div>

              <div className="h-4 w-full rounded-[4px] overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div
                  style={{
                    width: `${
                      totalLeads > 0 ? (bookingsCount / totalLeads) * 100 : 0
                    }%`,
                  }}
                  className="bg-blue-600 h-full transition-all duration-300"
                  title={`Confirmed Bookings: ${bookingsCount} (${bookingRatioPercent}%)`}
                />
                <div
                  style={{
                    width: `${
                      totalLeads > 0 ? (inProgressCount / totalLeads) * 100 : 0
                    }%`,
                  }}
                  className="bg-sky-500 h-full transition-all duration-300"
                  title={`In Progress / With Vendor: ${inProgressCount}`}
                />
                <div
                  style={{
                    width: `${
                      totalLeads > 0 ? (newLeadsCountState / totalLeads) * 100 : 0
                    }%`,
                  }}
                  className="bg-indigo-500 h-full transition-all duration-300"
                  title={`New Inquiries: ${newLeadsCountState}`}
                />
                <div
                  style={{
                    width: `${
                      totalLeads > 0 ? (cancelledCount / totalLeads) * 100 : 0
                    }%`,
                  }}
                  className="bg-rose-500 h-full transition-all duration-300"
                  title={`Declined / Cancelled: ${cancelledCount}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                <span>0 Leads</span>
                <span>{bookingsCount} Bookings Secured</span>
                <span>{totalLeads} Total Inquiries</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 block">Total Inquiries</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {totalLeads} Leads
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  100% Demand
                </span>
              </div>

              <div className="p-3 rounded-[4px] border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
                <span className="text-blue-700 dark:text-blue-300 block font-semibold">
                  Confirmed Bookings
                </span>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                  {bookingsCount} Won
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {bookingRatioPercent}% Ratio
                </span>
              </div>

              <div className="p-3 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 block">Active in Pipeline</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {inProgressCount + newLeadsCountState} Leads
                </span>
                <span className="text-[11px] text-slate-500">With Vendors</span>
              </div>

              <div className="p-3 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 block">Territory Value</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white block mt-0.5">
                  ₹{territoryRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500">Gross Sales</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Territory Performance Note:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  {territoryInsight}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className={`lg:col-span-2 rounded-[4px] border p-5 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Recent Booking Enquiries & Vendor Leads
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leads dispatched to partner vendors and customer quotations
              </p>
            </div>
            <button
              onClick={() => onNavigate('booking-enquiries')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Leads & Pricing</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-2">Customer / Tour</th>
                  <th className="py-3 px-2">Assigned Vendor</th>
                  <th className="py-3 px-2">Vendor Lead</th>
                  <th className="py-3 px-2">Quoted Price</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {enquiries.slice(0, 4).map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => onNavigate('booking-enquiries')}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {enq.customerName}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[190px]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          [{enq.destination}]
                        </span>{' '}
                        {enq.tourName}
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-xs">
                      {enq.assignedVendorName ? (
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{enq.assignedVendorName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-[4px] text-xs font-semibold ${
                          enq.vendorLeadStatus === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : enq.vendorLeadStatus === 'Sent to Vendor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : enq.vendorLeadStatus === 'Declined'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {enq.vendorLeadStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white text-sm">
                      {enq.finalQuotedPrice
                        ? `₹${enq.finalQuotedPrice.toLocaleString('en-IN')}`
                        : enq.budget}
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-[4px] text-xs font-semibold ${
                          enq.status === 'New'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : enq.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : enq.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`rounded-[4px] border p-5 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Featured Tours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top booked holiday packages
              </p>
            </div>
            <button
              onClick={() => onNavigate('manage-tours')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {tours.slice(0, 3).map((tour) => (
              <div
                key={tour.id}
                onClick={() => onNavigate('manage-tours')}
                className="flex items-center gap-3 p-2.5 rounded-[4px] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <img
                  src={tour.featuredImage}
                  alt={tour.title}
                  className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {tour.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {tour.destination}, {tour.country}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      ₹{tour.price.toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tour.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate('manage-tours')}
              className="w-full py-2 px-3 rounded-[4px] text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700/80 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View All Tour Packages</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
