import React, { useState } from 'react';
import {
  Search,
  Eye,
  Mail,
  Trash2,
  Building2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Calculator,
  MapPin,
  Filter,
  RotateCcw,
  Compass,
  X,
  Phone,
  User,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react';
import type { BookingEnquiry, Vendor } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS, getDestinationBadgeStyle } from './VendorPortalView';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface BookingEnquiryViewProps {
  enquiries: BookingEnquiry[];
  vendors: Vendor[];
  onUpdateStatus: (id: string, status: BookingEnquiry['status']) => void;
  onDeleteEnquiry: (id: string) => void;
  onAssignVendor: (enquiryId: string, vendorId: string, vendorName: string) => void;
  onUpdatePricing: (
    enquiryId: string,
    pricing: {
      baseCost: number;
      markupPercent: number;
      taxPercent: number;
      discountAmount: number;
      finalQuotedPrice: number;
      vendorPayout: number;
      agencyMargin: number;
    }
  ) => void;
}

export const BookingEnquiryView: React.FC<BookingEnquiryViewProps> = ({
  enquiries,
  vendors,
  onUpdateStatus,
  onDeleteEnquiry,
  onAssignVendor,
  onUpdatePricing,
}) => {
  const { theme } = useTheme();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<BookingEnquiry | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [deleteTargetEnquiry, setDeleteTargetEnquiry] = useState<BookingEnquiry | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Price Management Modal State
  const [pricingEnquiry, setPricingEnquiry] = useState<BookingEnquiry | null>(null);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [markupPercent, setMarkupPercent] = useState<number>(15);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Lead Assign Modal State
  const [assignEnquiry, setAssignEnquiry] = useState<BookingEnquiry | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');

  // Destination Dropdown Options with individual icons and count badges
  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: enquiries.length,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: enquiries.filter((e) => e.destination === dest).length,
    })),
  ];

  // Status Dropdown Options with individual status icons and colors
  const statusOptions = [
    {
      value: 'All',
      label: 'All Statuses',
      icon: <Filter className="w-4 h-4 text-slate-400" />,
      badge: enquiries.length,
    },
    {
      value: 'Pending',
      label: 'Pending',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badge: enquiries.filter((e) => e.status === 'Pending').length,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      value: 'New',
      label: 'New Leads',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      badge: enquiries.filter((e) => e.status === 'New').length,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badge: enquiries.filter((e) => e.status === 'In Progress').length,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      value: 'Confirmed',
      label: 'Confirmed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      badge: enquiries.filter((e) => e.status === 'Confirmed').length,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      value: 'Cancelled',
      label: 'Cancelled',
      icon: <XCircle className="w-4 h-4 text-rose-500" />,
      badge: enquiries.filter((e) => e.status === 'Cancelled').length,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
  ];

  const filtered = enquiries.filter((enq) => {
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    const matchesDest =
      destinationFilter === 'All' || enq.destination === destinationFilter;
    const matchesSearch =
      enq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.customerPhone && enq.customerPhone.includes(searchQuery)) ||
      (enq.id && enq.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (enq.destination && enq.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (enq.assignedVendorName && enq.assignedVendorName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesDest && matchesSearch;
  });

  // Calculate live price preview
  const subtotalWithMarkup = baseCost + (baseCost * markupPercent) / 100;
  const taxVal = (subtotalWithMarkup * taxPercent) / 100;
  const calculatedFinalPrice = Math.max(0, subtotalWithMarkup + taxVal - discountAmount);
  const calculatedAgencyMargin = calculatedFinalPrice - baseCost - taxVal;

  const openPricingModal = (enq: BookingEnquiry) => {
    setPricingEnquiry(enq);
    setBaseCost(enq.baseCost || 4000);
    setMarkupPercent(enq.markupPercent || 15);
    setTaxPercent(enq.taxPercent || 5);
    setDiscountAmount(enq.discountAmount || 0);
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingEnquiry) return;

    onUpdatePricing(pricingEnquiry.id, {
      baseCost,
      markupPercent,
      taxPercent,
      discountAmount,
      finalQuotedPrice: Math.round(calculatedFinalPrice),
      vendorPayout: baseCost,
      agencyMargin: Math.round(calculatedAgencyMargin),
    });

    setPricingEnquiry(null);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEnquiry) return;

    const vendor = vendors.find((v) => v.id === selectedVendorId);
    if (vendor) {
      onAssignVendor(assignEnquiry.id, vendor.id, vendor.businessName);
    }
    setAssignEnquiry(null);
  };

  return (
    <div className="space-y-5">
      {/* Control Bar: Search with Destination & Status Dropdown Filters with Icons */}
      <div
        className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search input with icon */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, vendors, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                }`}
            />
          </div>

          {/* Right: Dropdown Filters for Destination & Status with Icons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Destination Dropdown Filter */}
            <DropdownFilter
              label="Destination"
              value={destinationFilter}
              onChange={setDestinationFilter}
              options={destinationOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            {/* Status Dropdown Filter */}
            <DropdownFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              icon={<Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            {/* Reset Filters Button */}
            {(destinationFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDestinationFilter('All');
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips for Quick Glance & Removal */}
        {(destinationFilter !== 'All' || statusFilter !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
              Active Filters:
            </span>
            {destinationFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Destination: {destinationFilter}</span>
                <button
                  type="button"
                  onClick={() => setDestinationFilter('All')}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                  title="Clear destination filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span>Status: {statusFilter}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                  title="Clear status filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Enquiries & Lead Dispatch Table - Industrial Structure */}
      <div
        className={`rounded-[4px] border overflow-hidden shadow-xs ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        {/* Table Top Header Bar */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Booking Enquiries Log
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {filtered.length} Records
            </span>
          </div>


        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase tracking-wider ${theme === 'dark'
                  ? 'border-slate-800 bg-slate-800/60 text-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
              >
                <th className="py-3.5 pl-4 pr-3 font-semibold whitespace-nowrap text-left w-16">SL. NO.</th>
                <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">BOOKING ID</th>
                <th className="py-3.5 px-3.5 font-semibold whitespace-nowrap text-left">GUEST DETAILS</th>
                <th className="py-3.5 px-3.5 font-semibold whitespace-nowrap text-left">SELECTED PACKAGE</th>
                <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">TRAVEL DATE</th>
                <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">GUESTS</th>
                <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">AMOUNT</th>
                <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">STATUS</th>
                <th className="py-3.5 pl-3 pr-4 font-semibold whitespace-nowrap text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filtered.map((enq, index) => {
                const finalPrice = enq.finalQuotedPrice || (enq.budget ? Number(enq.budget.replace(/[^0-9]/g, '')) : 4600);

                return (
                  <tr
                    key={enq.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* 1. SL. NO. */}
                    <td className="py-3.5 pl-4 pr-3 whitespace-nowrap text-xs font-medium text-slate-400 dark:text-slate-500">
                      #{index + 1}
                    </td>

                    {/* 2. BOOKING ID */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(enq)}
                        className="font-mono font-semibold text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
                        title="Click to view details"
                      >
                        {enq.id}
                      </button>
                    </td>

                    {/* 3. GUEST DETAILS */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div
                        onClick={() => setSelectedEnquiry(enq)}
                        className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {enq.customerName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                        {enq.customerPhone || 'N/A'}
                      </div>
                    </td>

                    {/* 4. SELECTED PACKAGE */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap max-w-[280px]">
                      <div
                        onClick={() => setSelectedEnquiry(enq)}
                        className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
                        title={enq.tourName}
                      >
                        {enq.tourName}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                        {enq.id.startsWith('HSB') ? 'Hotel Resort' : 'Tour Package'}
                      </div>
                    </td>

                    {/* 5. TRAVEL DATE */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                      {enq.travelDate || 'Flexible'}
                    </td>

                    {/* 6. GUESTS */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                      {enq.passengers} Pers.
                    </td>

                    {/* 7. AMOUNT */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* 8. STATUS (No Dropdown, Clean Text) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold ${enq.status === 'Pending' || enq.status === 'New'
                          ? 'text-amber-600 dark:text-amber-400'
                          : enq.status === 'Confirmed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : enq.status === 'In Progress'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                      >
                        {enq.status}
                      </span>
                    </td>

                    {/* 9. ACTIONS (View Icon) */}
                    <td className="py-3.5 pl-3 pr-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(enq)}
                        className="p-1.5 rounded-[4px] text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Industrial Pagination / Counter Bar */}
        <div
          className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
        >
          <div className="text-slate-500 text-xs">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{enquiries.length}</span> enquiries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 text-xs font-semibold cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-2.5 py-1 rounded-[4px] bg-blue-600 text-white text-xs font-semibold shadow-xs cursor-pointer">
              1
            </button>
            <button
              disabled
              className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 text-xs font-semibold cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: BOOKING PRICE MANAGEMENT MODAL */}
      {pricingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-lg rounded-[4px] border p-6 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  Price & Margin Management
                </span>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  {pricingEnquiry.tourName}
                </h3>
                <p className="text-xs text-slate-500">Guest: {pricingEnquiry.customerName}</p>
              </div>
              <button
                onClick={() => setPricingEnquiry(null)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block font-semibold mb-1">
                    Vendor Net Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(Number(e.target.value))}
                    className={`w-full p-2 rounded-[4px] border outline-none font-medium ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <span className="text-[11px] text-slate-400">Paid to vendor</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Agency Markup (%)
                  </label>
                  <input
                    type="number"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className={`w-full p-2 rounded-[4px] border outline-none font-medium ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <span className="text-[11px] text-slate-400">Profit percentage</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block font-semibold mb-1">
                    Taxes / VAT (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className={`w-full p-2 rounded-[4px] border outline-none font-medium ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <span className="text-[11px] text-slate-400">Government taxes</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Promo Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className={`w-full p-2 rounded-[4px] border outline-none font-medium ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <span className="text-[11px] text-slate-400">Direct deduction</span>
                </div>
              </div>

              {/* Price Calculation Summary Card */}
              <div className="p-3.5 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Net Cost:</span>
                  <span className="font-semibold">₹{baseCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agency Profit Margin:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +₹{Math.round(calculatedAgencyMargin).toLocaleString('en-IN')} ({markupPercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxes ({taxPercent}%):</span>
                  <span>+₹{Math.round(taxVal).toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Final Quoted Selling Price:
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{Math.round(calculatedFinalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPricingEnquiry(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px]"
                >
                  Save & Apply Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN LEAD TO VENDOR MODAL */}
      {assignEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-md rounded-[4px] border p-6 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-base">Send Lead to Partner Vendor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Dispatches customer tour enquiry to vendor portal</p>
              </div>
              <button
                onClick={() => setAssignEnquiry(null)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Target Lead Destination Territory */}
            <div
              className={`mt-3 p-2.5 rounded-[4px] border flex items-center justify-between text-xs font-semibold ${getDestinationBadgeStyle(
                assignEnquiry.destination
              )}`}
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  Lead Territory: <strong>{assignEnquiry.destination}</strong>
                </span>
              </div>
              <span className="font-semibold">Territory Match Recommended</span>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-3.5 text-sm">
              <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {assignEnquiry.tourName}
                </div>
                <div className="text-xs text-slate-500">
                  Guest: {assignEnquiry.customerName} • {assignEnquiry.passengers} Pax • Date: {assignEnquiry.travelDate}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Registered Vendor Partner
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-medium ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <optgroup label={`Authorized ${assignEnquiry.destination} Partners`}>
                    {vendors
                      .filter((v) =>
                        v.assignedDestinations?.includes(assignEnquiry.destination)
                      )
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          ⭐ {v.businessName} ({v.category}) - Authorized
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Other Regional Partners">
                    {vendors
                      .filter(
                        (v) =>
                          !v.assignedDestinations?.includes(assignEnquiry.destination)
                      )
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.businessName} ({v.assignedDestinations?.join(', ') || 'General'})
                        </option>
                      ))}
                  </optgroup>
                </select>
                <span className="text-xs text-slate-400 mt-1 block">
                  The selected vendor will receive this lead in their portal to Accept or Decline.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignEnquiry(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Lead to Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIGHT SIDEBAR DRAWER - VIEW ALL ENQUIRY DETAILS */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dimmed backdrop with fade */}
          <div
            onClick={() => setSelectedEnquiry(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Right Slide-over Sidebar Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg md:max-w-xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
              {/* Drawer Top Header */}
              <div
                className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
                  }`}
              >
                <div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-1">
                    Booking Enquiry Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Logged on {selectedEnquiry.createdAt}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-2 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Close right sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body - Scrollable */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5">
                {/* 1. Client / Traveler Profile */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/70 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Guest Information
                      </h4>
                    </div>

                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {selectedEnquiry.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {selectedEnquiry.customerName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${selectedEnquiry.customerEmail}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            {selectedEnquiry.customerEmail}
                          </a>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(selectedEnquiry.customerEmail)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-0.5"
                          title="Copy email"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${selectedEnquiry.customerPhone}`} className="hover:underline">
                          {selectedEnquiry.customerPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {selectedEnquiry.notes && (
                    <div className="mt-2 p-3 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                        Guest Special Requests / Notes:
                      </span>
                      "{selectedEnquiry.notes}"
                    </div>
                  )}
                </div>

                {/* 2. Tour Package & Schedule */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/70 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Requested Package
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-[4px] border ${getDestinationBadgeStyle(
                        selectedEnquiry.destination
                      )}`}
                    >
                      {selectedEnquiry.destination}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {selectedEnquiry.tourName}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[11px]">Travel Date</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {selectedEnquiry.travelDate}
                        </span>
                      </div>
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[11px]">Party Size</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          {selectedEnquiry.passengers} Adults
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pricing & Financial Margin Analysis */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/70 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Price & Margin Breakdown
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPricingModal(selectedEnquiry)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Adjust Calculator</span>
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between p-3 rounded-[4px] bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                    <div>
                      <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">
                        Final Quoted Selling Price
                      </span>
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedEnquiry.finalQuotedPrice
                          ? `₹${selectedEnquiry.finalQuotedPrice.toLocaleString('en-IN')}`
                          : selectedEnquiry.budget}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                        Agency Net Margin
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +₹{(selectedEnquiry.agencyMargin || Math.round((selectedEnquiry.baseCost || 4000) * 0.15)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Vendor Base Payout</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{(selectedEnquiry.baseCost || 4000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Agency Markup</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {selectedEnquiry.markupPercent || 15}%
                      </span>
                    </div>
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Taxes / VAT</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedEnquiry.taxPercent || 5}%
                      </span>
                    </div>
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Discount</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{(selectedEnquiry.discountAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Vendor Partner Dispatch & Lead Response Status */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/70 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Vendor Partner Dispatch
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignEnquiry(selectedEnquiry);
                        if (selectedEnquiry.assignedVendorId) setSelectedVendorId(selectedEnquiry.assignedVendorId);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedEnquiry.assignedVendorName ? 'Reassign Vendor' : 'Assign Vendor'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Assigned Partner</span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        {selectedEnquiry.assignedVendorName || 'No Vendor Assigned'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Vendor Lead Status</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs font-semibold mt-0.5 ${selectedEnquiry.vendorLeadStatus === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : selectedEnquiry.vendorLeadStatus === 'Sent to Vendor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : selectedEnquiry.vendorLeadStatus === 'Declined'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                      >
                        {selectedEnquiry.vendorLeadStatus === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {selectedEnquiry.vendorLeadStatus === 'Sent to Vendor' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                        {selectedEnquiry.vendorLeadStatus === 'Declined' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{selectedEnquiry.vendorLeadStatus}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Booking Lifecycle Status Quick Updater */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/70 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Booking Status Lifecycle
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(['New', 'In Progress', 'Confirmed', 'Cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          onUpdateStatus(selectedEnquiry.id, st);
                          setSelectedEnquiry({ ...selectedEnquiry, status: st });
                        }}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold border transition-colors cursor-pointer ${selectedEnquiry.status === st
                          ? st === 'Confirmed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'In Progress'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : st === 'Cancelled'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Footer Actions */}
              <div
                className={`p-4 border-t flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedEnquiry.customerEmail}?subject=Regarding Your KrikoTrip Tour Enquiry: ${selectedEnquiry.tourName}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Guest</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetEnquiry(selectedEnquiry)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(selectedEnquiry.id, 'Confirmed');
                      setSelectedEnquiry({ ...selectedEnquiry, status: 'Confirmed' });
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[4px] shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Booking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetEnquiry}
        onClose={() => setDeleteTargetEnquiry(null)}
        onConfirm={() => {
          if (deleteTargetEnquiry) {
            onDeleteEnquiry(deleteTargetEnquiry.id);
            setDeleteTargetEnquiry(null);
          }
        }}
        itemType="Booking Enquiry"
        itemName={deleteTargetEnquiry ? `${deleteTargetEnquiry.customerName} (${deleteTargetEnquiry.tourName})` : undefined}
        warningMessage="This enquiry record, customer contact notes, vendor quotes, and markup computations will be permanently deleted."
      />
    </div>
  );
};
