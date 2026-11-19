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
import { mockMonthlyChartData, mockDestinationChartData } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS } from './VendorPortalView';
import { DropdownFilter } from '../common/DropdownFilter';

interface DashboardViewProps {
  tours: Tour[];
  enquiries: BookingEnquiry[];
  onNavigate: (tab: NavigationKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tours,
  enquiries,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const [chartMetric, setChartMetric] = useState<'revenue' | 'bookings'>('revenue');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('All');

  // Destination baseline statistics for historical + live ratio calculations
  const destinationRatioData: Record<
    string,
    {
      label: string;
      totalLeads: number;
      confirmedBookings: number;
      inProgressLeads: number;
      newLeads: number;
      cancelledLeads: number;
      revenue: number;
      insight: string;
    }
  > = {
    All: {
      label: 'All Destinations Combined',
      totalLeads: 56,
      confirmedBookings: 36,
      inProgressLeads: 12,
      newLeads: 5,
      cancelledLeads: 3,
      revenue: 4285000,
      insight: 'Across all destination territories, 64.3% of incoming inquiries successfully convert into confirmed vendor bookings.',
    },
    Kashmir: {
      label: 'Kashmir Territory',
      totalLeads: 16,
      confirmedBookings: 11,
      inProgressLeads: 3,
      newLeads: 1,
      cancelledLeads: 1,
      revenue: 1375000,
      insight: 'Kashmir leads have the highest conversion ratio (68.8%) driven by Dal Lake luxury houseboats and Gulmarg Gondola demand.',
    },
    Andaman: {
      label: 'Andaman Territory',
      totalLeads: 13,
      confirmedBookings: 8,
      inProgressLeads: 3,
      newLeads: 1,
      cancelledLeads: 1,
      revenue: 1065000,
      insight: 'Andaman leads convert at 61.5% with high average booking order value on private catamaran ferry & scuba tours.',
    },
    Kerala: {
      label: 'Kerala Territory',
      totalLeads: 11,
      confirmedBookings: 7,
      inProgressLeads: 2,
      newLeads: 1,
      cancelledLeads: 1,
      revenue: 860000,
      insight: 'Kerala houseboats and Munnar tea retreat leads show a strong 63.6% conversion with rapid vendor turnaround.',
    },
    Sundarban: {
      label: 'Sundarban Territory',
      totalLeads: 8,
      confirmedBookings: 5,
      inProgressLeads: 2,
      newLeads: 1,
      cancelledLeads: 0,
      revenue: 470000,
      insight: 'Sundarban mangrove delta tours achieve 62.5% booking ratio with zero cancellations this month.',
    },
    Gangtok: {
      label: 'Gangtok Territory',
      totalLeads: 8,
      confirmedBookings: 5,
      inProgressLeads: 2,
      newLeads: 1,
      cancelledLeads: 0,
      revenue: 515000,
      insight: 'Gangtok & Nathula Pass leads convert at 62.5% with high seasonal booking velocity.',
    },
  };

  const currentRatioData =
    destinationRatioData[selectedDestinationFilter] || destinationRatioData.All;

  const totalLeads = currentRatioData.totalLeads;
  const bookingsCount = currentRatioData.confirmedBookings;
  const inProgressCount = currentRatioData.inProgressLeads;
  const newLeadsCountState = currentRatioData.newLeads;
  const cancelledCount = currentRatioData.cancelledLeads;

  const bookingRatioPercent = ((bookingsCount / totalLeads) * 100).toFixed(1);

  const circleChartData = [
    { name: 'Confirmed Bookings', value: bookingsCount, color: '#2563eb' },
    { name: 'In Progress (With Vendor)', value: inProgressCount, color: '#0284c7' },
    { name: 'New Inquiries', value: newLeadsCountState, color: '#6366f1' },
    { name: 'Declined / Cancelled', value: cancelledCount, color: '#f43f5e' },
  ];

  const destinationDropdownOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: `${destinationRatioData.All.totalLeads} Leads`,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: `${destinationRatioData[dest]?.totalLeads || 0} Leads`,
    })),
  ];

  const totalRevenue = '₹42,85,000';
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const activeToursCount = tours.filter((t) => t.status === 'Published').length;

  const stats = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      change: '+18.4% this month',
      icon: IndianRupee,
    },
    {
      title: 'Active Tour Packages',
      value: activeToursCount.toString(),
      change: '+4 destinations',
      icon: Plane,
    },
    {
      title: 'New Booking Enquiries',
      value: newEnquiriesCount.toString(),
      change: '14 needing quotes',
      icon: CalendarCheck2,
    },
    {
      title: 'Total Active Travelers',
      value: '1,280',
      change: '+22.6% growth',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-[4px] border ${theme === 'dark'
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


      {/* DASHBOARD GRAPH CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Monthly Revenue & Bookings Area Chart */}
        <div
          className={`lg:col-span-2 rounded-[4px] border p-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
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

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[4px]">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-colors ${chartMetric === 'revenue'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('bookings')}
                className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-colors ${chartMetric === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                Bookings Count
              </button>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockMonthlyChartData}
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
                    chartMetric === 'revenue' ? `₹${(val / 100000).toFixed(1)}L` : `${val}`
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
                    chartMetric === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : `${value} bookings`,
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

        {/* Right 1 Col: Destination Bookings Distribution Bar Chart */}
        <div
          className={`rounded-[4px] border p-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
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
                data={mockDestinationChartData}
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
                  formatter={(val: any) => [`${val} Booked`, 'Volume']}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: CIRCULAR GRAPH CHART - TOTAL LEADS VS BOOKINGS RATIO WITH DESTINATION FILTER */}
      <div
        className={`rounded-[4px] border p-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        {/* Header & Destination-Wise Filter Bar */}
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
              Analyze inquiry conversion performance across individual destination territories
            </p>
          </div>

          {/* Destination Territory Dropdown Filter with Icon */}
          <div className="flex items-center gap-2">
            <DropdownFilter
              label="Territory"
              value={selectedDestinationFilter}
              onChange={setSelectedDestinationFilter}
              options={destinationDropdownOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />
          </div>
        </div>

        {/* Chart & Performance Breakdown */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Circle Donut Graph Chart */}
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
                      `${val} leads (${((Number(val) / totalLeads) * 100).toFixed(1)}%)`,
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

              {/* Center Ratio Display */}
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

            {/* Slices Legend */}
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

          {/* Right: Key Ratios & Conversion Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Funnel Ratio Bar */}
            <div className="p-4 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Lead Conversion Funnel ({currentRatioData.label})
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {bookingRatioPercent}% Converted
                </span>
              </div>

              {/* Stacked Ratio Progress Bar */}
              <div className="h-4 w-full rounded-[4px] overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div
                  style={{ width: `${(bookingsCount / totalLeads) * 100}%` }}
                  className="bg-blue-600 h-full transition-all duration-300"
                  title={`Confirmed Bookings: ${bookingsCount} (${bookingRatioPercent}%)`}
                />
                <div
                  style={{ width: `${(inProgressCount / totalLeads) * 100}%` }}
                  className="bg-sky-500 h-full transition-all duration-300"
                  title={`In Progress / With Vendor: ${inProgressCount}`}
                />
                <div
                  style={{ width: `${(newLeadsCountState / totalLeads) * 100}%` }}
                  className="bg-indigo-500 h-full transition-all duration-300"
                  title={`New Inquiries: ${newLeadsCountState}`}
                />
                <div
                  style={{ width: `${(cancelledCount / totalLeads) * 100}%` }}
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

            {/* 4 Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 block">Total Inquiries</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {totalLeads} Leads
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">100% Demand</span>
              </div>

              <div className="p-3 rounded-[4px] border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
                <span className="text-blue-700 dark:text-blue-300 block font-semibold">Confirmed Bookings</span>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                  {bookingsCount} Won
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">{bookingRatioPercent}% Ratio</span>
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
                  ₹{currentRatioData.revenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500">Gross Sales</span>
              </div>
            </div>

            {/* Territory Insight Card */}
            <div className="p-3.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Territory Performance Note:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  {currentRatioData.insight}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column: Recent Enquiries with Lead Status & Price & Featured Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Booking Enquiries Table */}
        <div
          className={`lg:col-span-2 rounded-[4px] border p-5 ${theme === 'dark'
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
                        <span className="font-semibold text-blue-600 dark:text-blue-400">[{enq.destination}]</span> {enq.tourName}
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
                        className={`inline-block px-2 py-0.5 rounded-[4px] text-xs font-semibold ${enq.vendorLeadStatus === 'Accepted'
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
                      {enq.finalQuotedPrice ? `₹${enq.finalQuotedPrice.toLocaleString('en-IN')}` : enq.budget}
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-[4px] text-xs font-semibold ${enq.status === 'New'
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

        {/* Featured Tours List */}
        <div
          className={`rounded-[4px] border p-5 ${theme === 'dark'
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
    </div>
  );
};
