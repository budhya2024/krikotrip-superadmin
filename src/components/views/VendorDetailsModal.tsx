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
  Sparkles,
} from 'lucide-react';
import type { Vendor, VendorCompletedTour } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getDestinationBadgeStyle } from './VendorPortalView';

interface VendorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onTogglePortalAccess: (vendorId: string) => void;
  onOpenDestModal: (vendor: Vendor) => void;
}

export const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onTogglePortalAccess,
  onOpenDestModal,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'completed-tours' | 'overview'>('completed-tours');
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !vendor) return null;

  const completedTours: VendorCompletedTour[] = vendor.completedToursList || [];
  const completedCount = vendor.toursCompleted ?? completedTours.length;
  const totalPayout =
    vendor.totalPayoutDisbursed ||
    completedTours.reduce((acc, t) => acc + (t.payoutAmount || 0), 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over Right Sidebar Drawer / Details Page */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-xl md:max-w-2xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
            }`}
        >
          {/* Header Bar */}
          <div
            className={`p-4 sm:p-5 border-b flex items-start justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-[4px] bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                {vendor.businessName.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {vendor.id}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${vendor.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : vendor.status === 'Pending Approval'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                  >
                    {vendor.status}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {vendor.category}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  {vendor.businessName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contact: <span className="font-semibold">{vendor.contactPerson}</span> • Joined {vendor.createdAt}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar: Tours Completed highlight */}
          <div
            className={`p-4 border-b grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
              }`}
          >
            {/* Metric 1: Tours Completed */}
            <div className="p-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Tours Completed</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {completedCount}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Successfully executed
              </span>
            </div>

            {/* Metric 2: Total Payout */}
            <div className="p-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Payout</span>
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ₹{totalPayout.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Disbursed net cost</span>
            </div>

            {/* Metric 3: Commission */}
            <div className="p-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Commission</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {vendor.commissionRate}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Platform agreement</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className={`flex items-center gap-1 px-4 border-b shrink-0 select-none ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('completed-tours')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'completed-tours'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed Tours List ({completedTours.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Vendor Profile & Territories</span>
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {/* VIEW 1: COMPLETED TOURS LIST SHOWING DETAILS */}
            {activeTab === 'completed-tours' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Completed Tours History
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tours fulfilled and serviced by {vendor.businessName}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    • {completedCount} Completed
                  </span>
                </div>

                {completedTours.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h5 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      No tours recorded yet
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Completed tour bookings dispatched to this partner will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTours.map((t) => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-[4px] border transition-all ${theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-blue-200 shadow-2xs'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {t.destination}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="font-mono text-slate-400 font-medium">{t.id}</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                Completed
                              </span>
                            </div>

                            <div className="pt-1">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                Tour Package Name
                              </span>
                              <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                                {t.tourTitle}
                              </h5>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-slate-400 block font-medium">Payout</span>
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{t.payoutAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Details Row: Customer, Passengers, Date */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Lead Guest</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                              <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{t.customerName}</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">Party Size</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                              {t.passengers} Guests
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">Fulfilled On</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {t.completedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: VENDOR PROFILE & DESTINATION TERRITORIES */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Contact Information */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                    Partner Contact Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Primary Contact Person</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {vendor.contactPerson}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Portal Role</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                        {vendor.portalRole}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Email Address</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline font-semibold">
                          {vendor.email}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(vendor.email)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                          title="Copy Email"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${vendor.phone}`} className="font-semibold hover:underline">
                          {vendor.phone}
                        </a>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Physical Base Location</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {vendor.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Destination Territory Access */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                      Destination Territory Access Rights
                    </h4>
                    <button
                      type="button"
                      onClick={() => onOpenDestModal(vendor)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit Territories
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    This vendor partner is authorized to receive, accept, and service tour booking leads in the following territories:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {vendor.assignedDestinations?.map((dest) => (
                      <span
                        key={dest}
                        className={`text-xs font-semibold px-3 py-1 rounded-[4px] border ${getDestinationBadgeStyle(
                          dest
                        )}`}
                      >
                        📍 {dest} Territory
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portal Access Control */}
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
                      onClick={() => onTogglePortalAccess(vendor.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] border flex items-center gap-1.5 transition-colors ${vendor.portalAccess
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{vendor.portalAccess ? 'Access Enabled' : 'Access Suspended'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Bottom Footer Actions */}
          <div
            className={`p-4 border-t flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
              }`}
          >
            <div className="text-xs text-slate-500">
              Authorized Partner: <strong className="text-slate-700 dark:text-slate-300">{vendor.businessName}</strong>
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
