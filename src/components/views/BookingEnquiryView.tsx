import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Mail,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Calculator,
  MapPin,
  RotateCcw,
  Compass,
  X,
  Phone,
  User,
  Copy,
  Check,
  DollarSign,
  Tag,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Star,
} from 'lucide-react';
import type { Vendor } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { calculateAdminQuote } from '../../lib/pricing';
import {
  useAdminEnquiriesQuery,
  useAdminEnquiryQuery,
  useUpdateEnquiryStatusMutation,
  useUpdateEnquiryPricingMutation,
  useUpdateEnquiryTripDetailsMutation,
  useUpdateEnquiryPaymentMutation,
  useDeleteEnquiryMutation,
  exportEnquiriesCsv,
  type AdminEnquiryListItem,
  type AdminEnquiryDetail,
  type EnquiryStatus,
  type EnquirySource,
  type EnquiryPaymentStatus,
} from '../../api/enquiries';
import {
  useVendorsQuery,
  useAssignVendorLeadMutation,
  useRecordVendorLeadResponseMutation,
  useRecordVendorTourFeedbackMutation,
} from '../../api/vendors';
import { useDestinationsQuery } from '../../api/destinations';

export interface BookingEnquiryViewProps {
  vendors?: Vendor[];
  initialEnquiries?: unknown[];
}

function getSourceBadge(source: EnquirySource) {
  switch (source) {
    case 'package_booking':
      return {
        label: 'Package Booking',
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };
    case 'callback_request':
      return {
        label: 'Callback Request',
        className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      };
    case 'hero_search':
      return {
        label: 'Hero Search',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    case 'chatbot':
      return {
        label: 'Chatbot Lead',
        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      };
    case 'admin':
    default:
      return {
        label: 'Direct / Admin',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
  }
}

function getStatusBadge(status: EnquiryStatus) {
  switch (status) {
    case 'new':
      return {
        label: 'New Lead',
        className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        icon: <Clock className="w-3 h-3 text-sky-500" />,
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <Clock className="w-3 h-3 text-amber-500" />,
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: <Clock className="w-3 h-3 text-indigo-500" />,
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: <ShieldCheck className="w-3 h-3 text-blue-500" />,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: <XCircle className="w-3 h-3 text-rose-500" />,
      };
  }
}

export const BookingEnquiryView: React.FC<BookingEnquiryViewProps> = ({ vendors: propVendors = [] }) => {
  const { theme } = useTheme();

  const vendorsQuery = useVendorsQuery({ limit: 100 });
  const destinationsQuery = useDestinationsQuery();
  const allVendors = vendorsQuery.data?.items || propVendors;
  const destinationsList = destinationsQuery.data || [];

  const assignVendorMutation = useAssignVendorLeadMutation();
  const recordVendorResponseMutation = useRecordVendorLeadResponseMutation();
  const recordVendorFeedbackMutation = useRecordVendorTourFeedbackMutation();

  const [tourFeedbackRating, setTourFeedbackRating] = useState<number>(5);
  const [tourFeedbackText, setTourFeedbackText] = useState<string>('');
  const [vendorActionError, setVendorActionError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: enquiriesData, isLoading, isError, refetch } = useAdminEnquiriesQuery({
    q: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    page,
    limit,
  });

  const enquiriesList = enquiriesData?.data || [];
  const meta = enquiriesData?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const facets = enquiriesData?.facets || { byStatus: {}, total: 0 };

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const { data: selectedEnquiryDetail, isLoading: isLoadingDetail } = useAdminEnquiryQuery(selectedEnquiryId);

  const [pricingEnquiry, setPricingEnquiry] = useState<AdminEnquiryListItem | AdminEnquiryDetail | null>(null);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [markupPercent, setMarkupPercent] = useState<number>(15);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [deleteTargetEnquiry, setDeleteTargetEnquiry] = useState<AdminEnquiryListItem | null>(null);
  const [cancelModalEnquiryId, setCancelModalEnquiryId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [tripForm, setTripForm] = useState({
    hotelCategory: '',
    mealPlan: '',
    pickupPoint: '',
    travelDate: '',
    travellers: 1,
    assignedVendorId: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: 'unpaid' as EnquiryPaymentStatus,
    amountPaid: 0,
    paymentMode: '',
  });

  const [adminNotesText, setAdminNotesText] = useState('');

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const updateStatusMutation = useUpdateEnquiryStatusMutation();
  const updatePricingMutation = useUpdateEnquiryPricingMutation();
  const updateTripDetailsMutation = useUpdateEnquiryTripDetailsMutation();
  const updatePaymentMutation = useUpdateEnquiryPaymentMutation();
  const deleteMutation = useDeleteEnquiryMutation();

  useEffect(() => {
    if (selectedEnquiryDetail) {
      setTripForm({
        hotelCategory: selectedEnquiryDetail.hotelCategory || '',
        mealPlan: selectedEnquiryDetail.mealPlan || '',
        pickupPoint: selectedEnquiryDetail.pickupPoint || '',
        travelDate: selectedEnquiryDetail.travelDate || '',
        travellers: selectedEnquiryDetail.travellers || 1,
        assignedVendorId: selectedEnquiryDetail.assignedVendorId || '',
      });

      setPaymentForm({
        paymentStatus: selectedEnquiryDetail.paymentStatus,
        amountPaid: (selectedEnquiryDetail.amountPaidPaise || 0) / 100,
        paymentMode: selectedEnquiryDetail.paymentMode || '',
      });

      setAdminNotesText(selectedEnquiryDetail.adminNotes || '');
    }
  }, [selectedEnquiryDetail]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportEnquiriesCsv({
        q: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      });
      setFeedbackMessage('CSV export downloaded successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to export CSV. Please try again.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const openPricingModal = (enq: AdminEnquiryListItem | AdminEnquiryDetail) => {
    setPricingEnquiry(enq);
    const initialBase = (enq.baseCostPaise ?? 400000) / 100;
    const initialMarkup = enq.markupPercent ?? 15;
    const initialTax = enq.taxPercent ?? 5;
    const prefillDiscount =
      enq.discountPaise > 0
        ? enq.discountPaise / 100
        : (enq.couponDiscountPaise + enq.loyaltyDiscountPaise) / 100;

    setBaseCost(initialBase);
    setMarkupPercent(initialMarkup);
    setTaxPercent(initialTax);
    setDiscountAmount(prefillDiscount);
  };

  const liveQuote = calculateAdminQuote({
    baseCostPaise: Math.round(baseCost * 100),
    markupPercent,
    taxPercent,
    discountPaise: Math.round(discountAmount * 100),
  });

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingEnquiry) return;

    try {
      await updatePricingMutation.mutateAsync({
        id: pricingEnquiry.id,
        baseCostPaise: Math.round(baseCost * 100),
        markupPercent,
        taxPercent,
        discountPaise: Math.round(discountAmount * 100),
      });
      setPricingEnquiry(null);
      setFeedbackMessage('Pricing quote saved successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to save pricing. Please check values.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleStatusTransition = async (status: EnquiryStatus, note?: string) => {
    if (!selectedEnquiryDetail) return;

    if (status === 'cancelled') {
      setCancelModalEnquiryId(selectedEnquiryDetail.id);
      setCancelReason('');
      setCancelError(null);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedEnquiryDetail.id,
        status,
        note,
      });
      setFeedbackMessage(`Status updated to ${status}!`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to update enquiry status.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalEnquiryId) return;
    if (!cancelReason.trim()) {
      setCancelError('Cancellation reason is required.');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: cancelModalEnquiryId,
        status: 'cancelled',
        cancelReason: cancelReason.trim(),
      });
      setCancelModalEnquiryId(null);
      setCancelReason('');
      setFeedbackMessage('Enquiry has been cancelled and reservations released.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setCancelError('Failed to cancel enquiry. Please try again.');
    }
  };

  const handleSaveTripDetails = async () => {
    if (!selectedEnquiryDetail) return;
    try {
      await updateTripDetailsMutation.mutateAsync({
        id: selectedEnquiryDetail.id,
        hotelCategory: tripForm.hotelCategory || null,
        mealPlan: tripForm.mealPlan || null,
        pickupPoint: tripForm.pickupPoint || null,
        travelDate: tripForm.travelDate || null,
        travellers: tripForm.travellers,
        assignedVendorId: tripForm.assignedVendorId || null,
      });
      setFeedbackMessage('Trip details updated successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to update trip details.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleSavePayment = async () => {
    if (!selectedEnquiryDetail) return;
    try {
      await updatePaymentMutation.mutateAsync({
        id: selectedEnquiryDetail.id,
        paymentStatus: paymentForm.paymentStatus,
        amountPaidPaise: Math.round(paymentForm.amountPaid * 100),
        paymentMode: paymentForm.paymentMode || null,
      });
      setFeedbackMessage('Payment records updated successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to update payment records.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleAssignVendor = async () => {
    if (!selectedEnquiryDetail) return;
    try {
      setVendorActionError(null);
      await assignVendorMutation.mutateAsync({
        enquiryId: selectedEnquiryDetail.id,
        input: {
          vendorId: tripForm.assignedVendorId || null,
        },
      });
      setFeedbackMessage('Vendor partner assignment updated successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setVendorActionError('Failed to assign vendor partner.');
    }
  };

  const handleRecordVendorResponse = async (decision: 'accepted' | 'declined') => {
    if (!selectedEnquiryDetail) return;
    try {
      setVendorActionError(null);
      await recordVendorResponseMutation.mutateAsync({
        enquiryId: selectedEnquiryDetail.id,
        input: {
          decision,
          note: `Admin recorded response on behalf of partner (${decision})`,
        },
      });
      setFeedbackMessage(
        decision === 'accepted'
          ? 'Lead accepted! Booking moved to In Progress.'
          : 'Lead declined by partner vendor.'
      );
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setVendorActionError('Failed to record partner lead response.');
    }
  };

  const handleSubmitTourFeedback = async () => {
    if (!selectedEnquiryDetail) return;
    try {
      setVendorActionError(null);
      await recordVendorFeedbackMutation.mutateAsync({
        enquiryId: selectedEnquiryDetail.id,
        input: {
          rating: tourFeedbackRating,
          feedback: tourFeedbackText.trim() || null,
        },
      });
      setFeedbackMessage('Vendor tour feedback recorded successfully!');
      setTimeout(() => setFeedbackMessage(null), 3000);
      setTourFeedbackText('');
    } catch {
      setVendorActionError('Failed to record tour feedback.');
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedEnquiryDetail) return;
    try {
      await updateTripDetailsMutation.mutateAsync({
        id: selectedEnquiryDetail.id,
        adminNotes: adminNotesText || null,
      });
      setFeedbackMessage('Internal admin notes saved!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to save notes.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!deleteTargetEnquiry) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetEnquiry.id);
      if (selectedEnquiryId === deleteTargetEnquiry.id) {
        setSelectedEnquiryId(null);
      }
      setDeleteTargetEnquiry(null);
      setFeedbackMessage('Enquiry record deleted.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Failed to delete enquiry.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const filteredEnquiries = destinationFilter === 'All'
    ? enquiriesList
    : enquiriesList.filter((e) => e.destinationName === destinationFilter);

  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: enquiriesList.length,
    },
    ...destinationsList.map((dest) => ({
      value: dest.name,
      label: dest.name,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: enquiriesList.filter((e) => e.destinationName === dest.name).length,
    })),
  ];

  const sourceTabs = [
    { key: 'all', label: 'All Sources' },
    { key: 'package_booking', label: 'Tour Bookings' },
    { key: 'callback_request', label: 'Callback Requests' },
    { key: 'hero_search', label: 'Hero Search' },
    { key: 'chatbot', label: 'Chatbot Leads' },
    { key: 'admin', label: 'Admin Direct' },
  ];

  return (
    <div className="space-y-4">
      {feedbackMessage && (
        <div className="px-4 py-2.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        className={`p-3 rounded-[4px] border flex items-center gap-1.5 overflow-x-auto text-xs ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>All Leads &amp; Bookings</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-bold">
            {facets.total ?? meta.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('new');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'new'
              ? 'bg-sky-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>New</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">
            {facets.byStatus?.new ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('pending');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
            {facets.byStatus?.pending ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('in_progress');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'in_progress'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
            {facets.byStatus?.in_progress ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('confirmed');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'confirmed'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            {facets.byStatus?.confirmed ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('completed');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Completed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
            {facets.byStatus?.completed ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('cancelled');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            statusFilter === 'cancelled'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
            {facets.byStatus?.cancelled ?? 0}
          </span>
        </button>
      </div>

      <div
        className={`p-3.5 rounded-[4px] border space-y-3 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, guest name, phone, package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DropdownFilter
              label="Destination"
              value={destinationFilter}
              onChange={setDestinationFilter}
              options={destinationOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Export enquiries to CSV"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span>Export CSV</span>
            </button>

            {(statusFilter !== 'all' || sourceFilter !== 'all' || destinationFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSourceFilter('all');
                  setDestinationFilter('All');
                  setSearchQuery('');
                  setPage(1);
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

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Source:
          </span>
          {sourceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSourceFilter(tab.key);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-colors ${
                sourceFilter === tab.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`rounded-[4px] border overflow-hidden shadow-xs ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${
            theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Enquiries &amp; Bookings Registry
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Showing {filteredEnquiries.length} of {meta.total} records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs px-1">
              Page {meta.page} / {meta.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= meta.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading enquiries registry...</p>
            </div>
          ) : isError ? (
            <div className="p-10 text-center space-y-3">
              <AlertCircle className="w-7 h-7 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-600 font-semibold">Failed to load enquiries from server.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-3 py-1.5 rounded-[4px] bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Enquiries Found</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No booking requests or enquiries match your active search and filter criteria.
              </p>
            </div>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-800/60 text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <th className="py-3.5 pl-4 pr-2 font-semibold whitespace-nowrap text-left w-12">#</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">REFERENCE</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">SOURCE</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">GUEST DETAILS</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">REQUESTED ITEM</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">TRAVEL DATE</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">GUESTS</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">AMOUNT</th>
                  <th className="py-3.5 px-3 font-semibold whitespace-nowrap text-left">STATUS</th>
                  <th className="py-3.5 pl-3 pr-4 font-semibold whitespace-nowrap text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredEnquiries.map((enq, index) => {
                  const sourceBadge = getSourceBadge(enq.source);
                  const statusBadge = getStatusBadge(enq.status);
                  const displayAmountPaise = enq.finalPricePaise ?? enq.estimatePaise ?? 0;
                  const displayAmount = displayAmountPaise / 100;
                  const isFinal = enq.finalPricePaise !== null && enq.finalPricePaise !== undefined;

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 pl-4 pr-2 whitespace-nowrap text-xs font-mono text-slate-400 dark:text-slate-500">
                        {(page - 1) * limit + index + 1}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiryId(enq.id)}
                          className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          #{enq.reference}
                        </button>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${sourceBadge.className}`}
                        >
                          {sourceBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div
                          onClick={() => setSelectedEnquiryId(enq.id)}
                          className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {enq.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                          {enq.phoneCountryCode} {enq.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap max-w-[240px]">
                        <div
                          onClick={() => setSelectedEnquiryId(enq.id)}
                          className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate cursor-pointer hover:text-blue-600 transition-colors"
                          title={enq.packageTitle || 'Custom Callback Request'}
                        >
                          {enq.packageTitle || 'Custom Callback Request'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span>{enq.destinationName || 'General Enquiry'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                        {enq.travelDate || 'Flexible'}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                        {enq.travellers} {enq.travellers === 1 ? 'Guest' : 'Guests'}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          ₹{displayAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {isFinal ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">(Final Quoted)</span>
                          ) : (
                            <span>(Initial Est.)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs font-semibold border ${statusBadge.className}`}
                        >
                          {statusBadge.icon}
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 pl-3 pr-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiryId(enq.id)}
                            className="p-1.5 rounded-[4px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View full enquiry & timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openPricingModal(enq)}
                            className="p-1.5 rounded-[4px] text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Pricing & Profit Calculator"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetEnquiry(enq)}
                            className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEnquiryId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedEnquiryId(null)}
          />

          <div
            className={`relative w-full max-w-2xl shadow-2xl flex flex-col h-full border-l overflow-y-auto ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {isLoadingDetail || !selectedEnquiryDetail ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                <div
                  className={`p-4 border-b flex items-center justify-between sticky top-0 z-10 ${
                    theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      #{selectedEnquiryDetail.reference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                        getSourceBadge(selectedEnquiryDetail.source).className
                      }`}
                    >
                      {getSourceBadge(selectedEnquiryDetail.source).label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTargetEnquiry(selectedEnquiryDetail)}
                      className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete this record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiryId(null)}
                      className="p-1.5 rounded-[4px] text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      title="Close drawer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5 flex-1">
                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Customer Information
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(selectedEnquiryDetail.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block mt-0.5">
                          {selectedEnquiryDetail.customerName}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Phone Number</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {selectedEnquiryDetail.phoneCountryCode} {selectedEnquiryDetail.phone}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${selectedEnquiryDetail.phoneCountryCode}${selectedEnquiryDetail.phone}`)}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Copy Phone"
                          >
                            {copiedText === `${selectedEnquiryDetail.phoneCountryCode}${selectedEnquiryDetail.phone}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <a
                            href={`tel:${selectedEnquiryDetail.phoneCountryCode}${selectedEnquiryDetail.phone}`}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                        </div>
                      </div>

                      {selectedEnquiryDetail.customerEmail && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Email Address</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {selectedEnquiryDetail.customerEmail}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedEnquiryDetail.customerEmail || '')}
                              className="p-1 hover:text-blue-600 transition-colors"
                              title="Copy Email"
                            >
                              {copiedText === selectedEnquiryDetail.customerEmail ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                            <a
                              href={`mailto:${selectedEnquiryDetail.customerEmail}`}
                              className="p-1 hover:text-blue-600 transition-colors"
                              title="Email customer"
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedEnquiryDetail.customerUserId && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Account Type</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Registered Customer
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedEnquiryDetail.message && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">
                          Message / Customer Notes:
                        </span>
                        <p className="p-2.5 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          &ldquo;{selectedEnquiryDetail.message}&rdquo;
                        </p>
                      </div>
                    )}

                    {selectedEnquiryDetail.pagePath && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-slate-500" />
                        <span>Source URL: {selectedEnquiryDetail.pagePath}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Status Workflow Transitions
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-[4px] border ${
                          getStatusBadge(selectedEnquiryDetail.status).className
                        }`}
                      >
                        Current: {getStatusBadge(selectedEnquiryDetail.status).label}
                      </span>
                    </div>

                    {selectedEnquiryDetail.allowedTransitions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        This enquiry is in a terminal status ({selectedEnquiryDetail.status}). No further transitions allowed.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Permitted Next Steps:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedEnquiryDetail.allowedTransitions.map((nextStatus) => {
                            const isCancel = nextStatus === 'cancelled';
                            const isConfirm = nextStatus === 'confirmed';
                            const isComplete = nextStatus === 'completed';

                            return (
                              <button
                                key={nextStatus}
                                type="button"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => handleStatusTransition(nextStatus)}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isCancel
                                    ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                                    : isConfirm
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : isComplete
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90'
                                }`}
                              >
                                {isCancel ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : isConfirm ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5" />
                                )}
                                <span>Move to {getStatusBadge(nextStatus).label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedEnquiryDetail.cancelReason && (
                      <div className="p-2.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                        <span className="font-bold block">Cancellation Reason:</span>
                        <span>{selectedEnquiryDetail.cancelReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Price &amp; Margin Breakdown
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPricingModal(selectedEnquiryDetail)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                          ₹{((selectedEnquiryDetail.finalPricePaise ?? selectedEnquiryDetail.estimatePaise ?? 0) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                          Agency Net Margin
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          +₹{((selectedEnquiryDetail.agencyMarginPaise ?? 0) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Vendor Base Payout</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          ₹{((selectedEnquiryDetail.baseCostPaise ?? 0) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Agency Markup</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {selectedEnquiryDetail.markupPercent ?? 15}%
                        </span>
                      </div>
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Taxes / GST</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {selectedEnquiryDetail.taxPercent ?? 5}%
                        </span>
                      </div>
                      <div className="p-2 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Total Discount</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{(selectedEnquiryDetail.discountPaise / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {(selectedEnquiryDetail.couponDiscountPaise > 0 || selectedEnquiryDetail.loyaltyPointsReserved > 0) && (
                      <div className="p-2.5 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                        <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px] uppercase tracking-wider">
                          Redeemed Incentives:
                        </span>
                        {selectedEnquiryDetail.couponDiscountPaise > 0 && (
                          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" />
                              <span>Coupon ({selectedEnquiryDetail.couponRedemption?.code || 'Applied'}):</span>
                            </span>
                            <span className="font-bold">-₹{(selectedEnquiryDetail.couponDiscountPaise / 100).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedEnquiryDetail.loyaltyPointsReserved > 0 && (
                          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Loyalty Points ({selectedEnquiryDetail.loyaltyPointsReserved} pts):</span>
                            </span>
                            <span className="font-bold">-₹{(selectedEnquiryDetail.loyaltyDiscountPaise / 100).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Trip Details &amp; Vendor Assignment
                        </h4>
                      </div>
                      <button
                        type="button"
                        disabled={updateTripDetailsMutation.isPending}
                        onClick={handleSaveTripDetails}
                        className="px-2.5 py-1 rounded-[4px] bg-blue-600 text-white font-semibold hover:bg-blue-700 text-xs disabled:opacity-50"
                      >
                        {updateTripDetailsMutation.isPending ? 'Saving...' : 'Save Trip Details'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Hotel / Stay Category
                        </label>
                        <input
                          type="text"
                          value={tripForm.hotelCategory}
                          onChange={(e) => setTripForm({ ...tripForm, hotelCategory: e.target.value })}
                          placeholder="e.g. 4-Star Luxury Resort"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Meal Plan
                        </label>
                        <input
                          type="text"
                          value={tripForm.mealPlan}
                          onChange={(e) => setTripForm({ ...tripForm, mealPlan: e.target.value })}
                          placeholder="e.g. MAP (Breakfast & Dinner)"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Pickup Point / Transfers
                        </label>
                        <input
                          type="text"
                          value={tripForm.pickupPoint}
                          onChange={(e) => setTripForm({ ...tripForm, pickupPoint: e.target.value })}
                          placeholder="e.g. Airport Arrival Terminal"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Assigned Vendor Partner
                          </label>
                          <button
                            type="button"
                            disabled={assignVendorMutation.isPending}
                            onClick={handleAssignVendor}
                            className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {assignVendorMutation.isPending ? 'Assigning...' : 'Assign / Save Partner'}
                          </button>
                        </div>

                        <select
                          value={tripForm.assignedVendorId}
                          onChange={(e) => setTripForm({ ...tripForm, assignedVendorId: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="">No vendor assigned</option>
                          {(() => {
                            const enquiryDest = (selectedEnquiryDetail?.destinationName || '').toLowerCase();
                            const authorized = allVendors.filter(
                              (v) =>
                                v.status === 'active' &&
                                (v.assignedDestinations || []).some(
                                  (d) =>
                                    d.toLowerCase().includes(enquiryDest) ||
                                    (enquiryDest && enquiryDest.includes(d.toLowerCase()))
                                )
                            );
                            const others = allVendors.filter((v) => !authorized.some((av) => av.id === v.id));

                            return (
                              <>
                                {authorized.length > 0 && (
                                  <optgroup label="Authorized Partners (covers this territory)">
                                    {authorized.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        ★ {v.businessName} ({(v.assignedDestinations || []).join(', ')})
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                <optgroup label="Other Partners">
                                  {others.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.businessName} ({(v.assignedDestinations || []).join(', ')})
                                    </option>
                                  ))}
                                </optgroup>
                              </>
                            );
                          })()}
                        </select>
                      </div>

                      {selectedEnquiryDetail?.assignedVendorId && (
                        <div className="sm:col-span-2 p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500">
                              Vendor Lead Status:
                            </span>
                            {(() => {
                              const leadStatus = (selectedEnquiryDetail.vendorLeadStatus || 'unassigned').toLowerCase().replace(/ /g, '_');
                              if (leadStatus === 'accepted') {
                                return (
                                  <span className="px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Accepted by Partner
                                  </span>
                                );
                              }
                              if (leadStatus === 'declined') {
                                return (
                                  <span className="px-2 py-0.5 rounded-[4px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold text-[10px] flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    Declined by Partner (Please Reassign)
                                  </span>
                                );
                              }
                              if (leadStatus === 'sent_to_vendor') {
                                return (
                                  <span className="px-2 py-0.5 rounded-[4px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[10px] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Sent to Partner (Awaiting Acceptance)
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                                  Unassigned
                                </span>
                              );
                            })()}
                          </div>

                          {(selectedEnquiryDetail.vendorLeadStatus || '').toLowerCase().replace(/ /g, '_') === 'sent_to_vendor' && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[11px] text-slate-500">
                                Record response on behalf of partner:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={recordVendorResponseMutation.isPending}
                                  onClick={() => handleRecordVendorResponse('accepted')}
                                  className="px-2.5 py-1 rounded-[4px] bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                                >
                                  Accept on Behalf
                                </button>
                                <button
                                  type="button"
                                  disabled={recordVendorResponseMutation.isPending}
                                  onClick={() => handleRecordVendorResponse('declined')}
                                  className="px-2.5 py-1 rounded-[4px] bg-rose-600 text-white font-semibold text-[10px] hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                                >
                                  Decline on Behalf
                                </button>
                              </div>
                            </div>
                          )}

                          {vendorActionError && (
                            <div className="text-[11px] text-rose-600 dark:text-rose-400">
                              {vendorActionError}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedEnquiryDetail?.status === 'completed' && selectedEnquiryDetail?.assignedVendorId && (
                        <div className="sm:col-span-2 p-3 rounded-[4px] bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              Vendor Partner Tour Feedback
                            </span>
                            <button
                              type="button"
                              disabled={recordVendorFeedbackMutation.isPending}
                              onClick={handleSubmitTourFeedback}
                              className="px-2.5 py-1 rounded-[4px] bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-700 cursor-pointer disabled:opacity-50"
                            >
                              {recordVendorFeedbackMutation.isPending ? 'Saving...' : 'Submit Tour Rating'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500 mr-2">Tour Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setTourFeedbackRating(star)}
                                className="cursor-pointer"
                              >
                                <Star
                                  className={`w-4 h-4 ${star <= tourFeedbackRating
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                />
                              </button>
                            ))}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={tourFeedbackText}
                              onChange={(e) => setTourFeedbackText(e.target.value)}
                              placeholder="Tour feedback comments (e.g. Excellent driver and punctual pickup)"
                              className="w-full px-2.5 py-1.5 rounded-[4px] border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Payment Status &amp; Records
                        </h4>
                      </div>
                      <button
                        type="button"
                        disabled={updatePaymentMutation.isPending}
                        onClick={handleSavePayment}
                        className="px-2.5 py-1 rounded-[4px] bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-xs disabled:opacity-50"
                      >
                        {updatePaymentMutation.isPending ? 'Saving...' : 'Save Payment'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Payment Status
                        </label>
                        <select
                          value={paymentForm.paymentStatus}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              paymentStatus: e.target.value as EnquiryPaymentStatus,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partially_paid">Partially Paid</option>
                          <option value="paid">Paid in Full</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Amount Received (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={paymentForm.amountPaid}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              amountPaid: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Payment Mode
                        </label>
                        <input
                          type="text"
                          value={paymentForm.paymentMode}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                          placeholder="e.g. UPI / Net Banking"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Audit Trail &amp; Status Timeline
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {selectedEnquiryDetail.statusHistory?.length || 0} entries
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedEnquiryDetail.statusHistory?.map((h) => (
                        <div
                          key={h.id}
                          className="p-2.5 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{h.fromStatus ? getStatusBadge(h.fromStatus).label : 'Submitted'}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {getStatusBadge(h.toStatus).label}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>
                            )}
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Actor: {h.actorType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(h.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Internal Admin Notes
                        </h4>
                      </div>
                      <button
                        type="button"
                        disabled={updateTripDetailsMutation.isPending}
                        onClick={handleSaveAdminNotes}
                        className="px-2.5 py-1 rounded-[4px] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs disabled:opacity-50"
                      >
                        {updateTripDetailsMutation.isPending ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      placeholder="Add private staff notes, customer preferences, or call follow-ups..."
                      className="w-full p-2.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none resize-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {pricingEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setPricingEnquiry(null)}
          />

          <div
            className={`relative w-full max-w-xl rounded-[4px] shadow-2xl p-5 border space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pricing &amp; Profit Margin Formula
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPricingEnquiry(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Vendor Base Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={baseCost}
                    onChange={(e) => setBaseCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Net vendor payout obligation</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Agency Markup (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="500"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Agency profit multiplier</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Taxes / GST (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard GST rate on subtotal</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Discount Deduction (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Prefilled from coupon + loyalty</span>
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Formula Breakdown Preview
                </span>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal (Base + Markup):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{(liveQuote.subtotalPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Taxes ({taxPercent}%):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    +₹{(liveQuote.taxPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Discount:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    -₹{(liveQuote.discountPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-bold">
                  <span className="text-blue-700 dark:text-blue-400">Final Quoted Price:</span>
                  <span className="text-xl text-blue-700 dark:text-blue-400">
                    ₹{(liveQuote.finalPricePaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Net Agency Margin:</span>
                  <span>+₹{(liveQuote.agencyMarginPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPricingEnquiry(null)}
                  className="px-4 py-2 rounded-[4px] border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePricingMutation.isPending}
                  className="px-4 py-2 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {updatePricingMutation.isPending ? 'Saving...' : 'Save & Update Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModalEnquiryId && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setCancelModalEnquiryId(null)}
          />

          <div
            className={`relative w-full max-w-md rounded-[4px] shadow-2xl p-5 border space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel Booking Enquiry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalEnquiryId(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cancelling this enquiry will automatically release any reserved coupons and loyalty points back to the customer. A valid cancellation reason is required.
            </p>

            {cancelError && (
              <div className="p-2.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer decided on alternate destination, pricing non-alignment, etc."
                className="w-full p-2.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCancelModalEnquiryId(null)}
                className="px-3.5 py-1.5 rounded-[4px] border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={handleConfirmCancellation}
                className="px-3.5 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetEnquiry && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTargetEnquiry)}
          onClose={() => setDeleteTargetEnquiry(null)}
          onConfirm={handleDeleteEnquiry}
          title="Delete Enquiry Record"
          itemName={`#${deleteTargetEnquiry.reference} (${deleteTargetEnquiry.customerName})`}
          itemType="Booking Enquiry"
          warningMessage="Are you sure you want to delete this enquiry record? It will be permanently removed from the active registry."
        />
      )}
    </div>
  );
};
