import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Users,
  KeyRound,
  Check,
  Copy,
  Star,
  Plus,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  useCreateVendorPayoutMutation,
  useUpdateVendorPortalAccessMutation,
  useVendorCompletedToursQuery,
  useVendorDetailQuery,
  useVendorPayoutsQuery,
  type AdminVendorDetail,
  type VendorPayoutStatus,
} from '../../api/vendors';
import { getDestinationBadgeStyle } from './VendorPortalView';

interface VendorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string | null;
  onOpenDestModal?: (vendor: AdminVendorDetail) => void;
}

export const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  onOpenDestModal,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'completed-tours' | 'payouts'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isRecordPayoutOpen, setIsRecordPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutStatus, setPayoutStatus] = useState<VendorPayoutStatus>('pending');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutDate, setPayoutDate] = useState('');
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const vendorQuery = useVendorDetailQuery(vendorId);
  const vendor = vendorQuery.data;

  const completedToursQuery = useVendorCompletedToursQuery(vendorId);
  const payoutsQuery = useVendorPayoutsQuery(vendorId);

  const togglePortalAccessMutation = useUpdateVendorPortalAccessMutation();
  const createPayoutMutation = useCreateVendorPayoutMutation();

  if (!isOpen || !vendorId) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTogglePortalAccess = () => {
    if (!vendor) return;
    togglePortalAccessMutation.mutate({
      id: vendor.id,
      portalAccess: !vendor.portalAccess,
    });
  };

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || payoutAmount <= 0) {
      setPayoutError('Please enter a valid payout amount greater than zero');
      return;
    }
    setPayoutError(null);
    try {
      await createPayoutMutation.mutateAsync({
        vendorId,
        input: {
          amountPaise: Math.round(payoutAmount * 100),
          status: payoutStatus,
          reference: payoutReference.trim() || null,
          paidAt: payoutDate ? new Date(payoutDate).toISOString() : null,
          notes: payoutNotes.trim() || null,
        },
      });
      setIsRecordPayoutOpen(false);
      setPayoutAmount(0);
      setPayoutReference('');
      setPayoutNotes('');
      setPayoutDate('');
    } catch {
      setPayoutError('Failed to record vendor payout');
    }
  };

  const completedTours = completedToursQuery.data || vendor?.completedTours || [];
  const payoutsList = payoutsQuery.data || vendor?.recentPayouts || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-xl md:max-w-2xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
            }`}
        >
          <div
            className={`p-4 sm:p-5 border-b flex items-start justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
              }`}
          >
            {vendor ? (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-[4px] bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  {vendor.businessName.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {vendor.code}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${vendor.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : vendor.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                    >
                      {vendor.status === 'active'
                        ? 'Active'
                        : vendor.status === 'pending_approval'
                          ? 'Pending Approval'
                          : 'Suspended'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                      {vendor.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-1">
                    {vendor.businessName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: <span className="font-semibold">{vendor.contactPerson}</span> • Ref: {vendor.registrationId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-400">Loading vendor details...</div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className={`flex items-center gap-1 px-4 sm:px-5 border-b shrink-0 ${theme === 'dark'
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-200 bg-white'
              }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Building className="w-3.5 h-3.5" />
              Overview & Staff
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed-tours')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'completed-tours'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed Tours ({vendor?.toursCompleted ?? completedTours.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payouts')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'payouts'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              Payouts ({payoutsList.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {vendor && activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    className={`p-3 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <span className="text-[11px] text-slate-500 block">Tours Completed</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {vendor.toursCompleted}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <span className="text-[11px] text-slate-500 block">Disbursed Payouts</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      ₹{((vendor.totalPayoutDisbursed || 0) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <span className="text-[11px] text-slate-500 block">Rating Avg</span>
                    <span className="text-lg font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {vendor.ratingAvg > 0 ? vendor.ratingAvg.toFixed(1) : 'New'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <span className="text-[11px] text-slate-500 block">Commission</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                      {vendor.commissionPercent}%
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-700">
                    Partner Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Partner Code</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {vendor.code}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Registration ID</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {vendor.registrationId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(vendor.registrationId, 'regId')}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy"
                        >
                          {copiedField === 'regId' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Login Email</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {vendor.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(vendor.email, 'email')}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy"
                        >
                          {copiedField === 'email' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Official Phone</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {vendor.phone}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Physical Base Location</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {vendor.location}
                      </span>
                    </div>

                    {vendor.notes && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px]">Internal Notes</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">
                          {vendor.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                      Destination Territory Access Rights
                    </h4>
                    {onOpenDestModal && (
                      <button
                        type="button"
                        onClick={() => onOpenDestModal(vendor)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Edit Territories
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    This vendor partner is authorized to receive, accept, and service tour booking leads in the following territories:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {vendor.assignedDestinations?.length ? (
                      vendor.assignedDestinations.map((dest) => (
                        <span
                          key={dest}
                          className={`text-xs font-semibold px-3 py-1 rounded-[4px] border ${getDestinationBadgeStyle(
                            dest
                          )}`}
                        >
                          📍 {dest} Territory
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No territories assigned yet.</span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                        Vendor Portal Login Access
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable or disable vendor login authentication for this agency partner
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTogglePortalAccess}
                      disabled={togglePortalAccessMutation.isPending}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] border flex items-center gap-1.5 transition-colors cursor-pointer ${vendor.portalAccess
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{vendor.portalAccess ? 'Access Enabled' : 'Access Suspended'}</span>
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Staff & Portal Members ({vendor.members?.length || 0})
                    </h4>
                  </div>

                  {vendor.members?.length ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                      {vendor.members.map((member) => (
                        <div key={member.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{member.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                              {member.portalRole.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-[4px] ${member.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : member.status === 'invited'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                              {member.status === 'invited' ? 'Invited (Pending)' : member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No members registered yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'completed-tours' && (
              <div className="space-y-3">
                {completedTours.length > 0 ? (
                  completedTours.map((tour) => (
                    <div
                      key={tour.id}
                      className={`p-4 rounded-[4px] border transition-all ${theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {tour.reference}
                            </span>
                            {tour.destinationName && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${getDestinationBadgeStyle(
                                  tour.destinationName
                                )}`}
                              >
                                {tour.destinationName}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mt-1">
                            {tour.customerName}
                          </h4>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Vendor Payout</span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{((tour.vendorPayoutPaise || 0) / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {tour.travelDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {tour.travelDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {tour.travellers} {tour.travellers === 1 ? 'Guest' : 'Guests'}
                        </span>
                        {tour.completedAt && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            Completed on {new Date(tour.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {tour.rating && (
                        <div className="mt-2.5 p-2.5 rounded-[4px] bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
                          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold mb-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{tour.rating} / 5 Stars</span>
                          </div>
                          {tour.feedback && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                              "{tour.feedback}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No completed tours recorded</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tours marked as "Completed" for this partner will appear here with ratings and feedback.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Disbursed & Pending Payouts
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsRecordPayoutOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Payout
                  </button>
                </div>

                {isRecordPayoutOpen && (
                  <form
                    onSubmit={handleRecordPayout}
                    className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        Record New Partner Payout
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsRecordPayoutOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {payoutError && (
                      <div className="p-2 rounded-[4px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {payoutError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Amount (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={payoutAmount || ''}
                          onChange={(e) => setPayoutAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="e.g. 25000"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Status
                        </label>
                        <select
                          value={payoutStatus}
                          onChange={(e) => setPayoutStatus(e.target.value as VendorPayoutStatus)}
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Reference / UTR
                        </label>
                        <input
                          type="text"
                          value={payoutReference}
                          onChange={(e) => setPayoutReference(e.target.value)}
                          placeholder="e.g. UTR-HDFC-998822"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Disbursement Date
                        </label>
                        <input
                          type="date"
                          value={payoutDate}
                          onChange={(e) => setPayoutDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Notes / Description
                        </label>
                        <input
                          type="text"
                          value={payoutNotes}
                          onChange={(e) => setPayoutNotes(e.target.value)}
                          placeholder="e.g. Full settlement for booking #KT-2611-001"
                          className="w-full px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRecordPayoutOpen(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createPayoutMutation.isPending}
                        className="px-4 py-1.5 text-xs font-semibold rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      >
                        {createPayoutMutation.isPending ? 'Saving...' : 'Save Payout'}
                      </button>
                    </div>
                  </form>
                )}

                {payoutsList.length > 0 ? (
                  <div className="space-y-2.5">
                    {payoutsList.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-[4px] border flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              ₹{(p.amountPaise / 100).toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-[4px] capitalize ${p.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          {p.reference && (
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              Ref: {p.reference}
                            </div>
                          )}
                          {p.notes && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                              {p.notes}
                            </div>
                          )}
                        </div>

                        <div className="text-right text-[11px] text-slate-400">
                          {p.paidAt ? (
                            <span>Paid {new Date(p.paidAt).toLocaleDateString()}</span>
                          ) : (
                            <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <IndianRupee className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No payouts recorded yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "Record Payout" above to track settlements and advance payments for this partner.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`p-4 border-t flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
              }`}
          >
            <div className="text-xs text-slate-500">
              Vendor Code: <strong className="text-slate-700 dark:text-slate-300 font-mono">{vendor?.code}</strong>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-[4px] bg-slate-800 text-white dark:bg-slate-700 dark:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
