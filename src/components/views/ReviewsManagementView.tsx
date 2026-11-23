import React, { useState } from 'react';
import {
  Star,
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Trash2,
  RotateCcw,
  Globe,
  X,
  Send,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS } from './VendorPortalView';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  useAdminReviews,
  useCreateAdminReview,
  useUpdateAdminReviewStatus,
  useReplyAdminReview,
  useDeleteAdminReview,
  type AdminReviewItem,
  type AdminReviewStatus,
  type AdminReviewTripType,
} from '../../api/reviews';
import { useAdminPackagesQuery } from '../../api/packages';

export interface ReviewsManagementViewProps {}

export const ReviewsManagementView: React.FC<ReviewsManagementViewProps> = () => {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | AdminReviewStatus>('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: packagesRes } = useAdminPackagesQuery({ limit: 100 });
  const packagesList = packagesRes?.data || [];

  const { data: reviewsRes, isLoading } = useAdminReviews({
    q: searchQuery.trim() || undefined,
    status: selectedStatusTab !== 'All' ? selectedStatusTab : undefined,
    rating: ratingFilter !== 'All' ? Number(ratingFilter) : undefined,
    destinationId: destinationFilter !== 'All' ? destinationFilter : undefined,
    page,
    limit,
  });

  const reviews = reviewsRes?.data || [];
  const meta = reviewsRes?.meta || { page: 1, limit, total: 0, totalPages: 1 };
  const facets = reviewsRes?.facets || { byStatus: {}, total: 0 };

  const createReviewMutation = useCreateAdminReview();
  const updateStatusMutation = useUpdateAdminReviewStatus();
  const replyMutation = useReplyAdminReview();
  const deleteMutation = useDeleteAdminReview();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<AdminReviewItem | null>(null);
  const [deleteTargetReview, setDeleteTargetReview] = useState<AdminReviewItem | null>(null);

  const [replyText, setReplyText] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replyNotice, setReplyNotice] = useState<string | null>(null);

  const [addPackageId, setAddPackageId] = useState('');
  const [addAuthorName, setAddAuthorName] = useState('');
  const [addAuthorLocation, setAddAuthorLocation] = useState('');
  const [addRating, setAddRating] = useState(5);
  const [addTitle, setAddTitle] = useState('');
  const [addComment, setAddComment] = useState('');
  const [addTripType, setAddTripType] = useState<AdminReviewTripType>('family');
  const [addStatus, setAddStatus] = useState<AdminReviewStatus>('approved');
  const [addShowOnPackage, setAddShowOnPackage] = useState(true);
  const [addShowOnHome, setAddShowOnHome] = useState(false);
  const [addVerifiedBooking, setAddVerifiedBooking] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);

  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: facets.total,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
    })),
  ];

  const ratingOptions = [
    { value: 'All', label: 'All Ratings', badge: facets.total },
    { value: '5', label: '5 Stars ★★★★★' },
    { value: '4', label: '4 Stars ★★★★☆' },
    { value: '3', label: '3 Stars ★★★☆☆' },
    { value: '2', label: '2 Stars ★★☆☆☆' },
    { value: '1', label: '1 Star ★☆☆☆☆' },
  ];

  const handleOpenDetails = (review: AdminReviewItem) => {
    setSelectedReviewForDetails(review);
    setReplyText(review.adminReply || '');
    setReplyNotice(null);
  };

  const handleStatusChange = async (newStatus: AdminReviewStatus) => {
    if (!selectedReviewForDetails) return;
    const isApproved = newStatus === 'approved';
    const nextShowOnPackage = isApproved ? selectedReviewForDetails.showOnPackage : false;
    const nextShowOnHome = isApproved ? selectedReviewForDetails.showOnHome : false;

    try {
      const updated = await updateStatusMutation.mutateAsync({
        id: selectedReviewForDetails.id,
        status: newStatus,
        showOnPackage: nextShowOnPackage,
        showOnHome: nextShowOnHome,
      });
      setSelectedReviewForDetails(updated);
    } catch {
    }
  };

  const handleToggleShowOnPackage = async () => {
    if (!selectedReviewForDetails || selectedReviewForDetails.status !== 'approved') return;
    const nextVal = !selectedReviewForDetails.showOnPackage;
    try {
      const updated = await updateStatusMutation.mutateAsync({
        id: selectedReviewForDetails.id,
        status: selectedReviewForDetails.status,
        showOnPackage: nextVal,
        showOnHome: selectedReviewForDetails.showOnHome,
      });
      setSelectedReviewForDetails(updated);
    } catch {
    }
  };

  const handleToggleShowOnHome = async () => {
    if (!selectedReviewForDetails || selectedReviewForDetails.status !== 'approved') return;
    const nextVal = !selectedReviewForDetails.showOnHome;
    try {
      const updated = await updateStatusMutation.mutateAsync({
        id: selectedReviewForDetails.id,
        status: selectedReviewForDetails.status,
        showOnPackage: selectedReviewForDetails.showOnPackage,
        showOnHome: nextVal,
      });
      setSelectedReviewForDetails(updated);
    } catch {
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForDetails) return;
    setIsSavingReply(true);
    setReplyNotice(null);
    try {
      const updated = await replyMutation.mutateAsync({
        id: selectedReviewForDetails.id,
        reply: replyText.trim(),
      });
      setSelectedReviewForDetails(updated);
      setReplyNotice('Official reply saved successfully.');
      setTimeout(() => setReplyNotice(null), 4000);
    } catch {
      setReplyNotice('Failed to save reply.');
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleClearReply = async () => {
    if (!selectedReviewForDetails) return;
    setIsSavingReply(true);
    try {
      const updated = await replyMutation.mutateAsync({
        id: selectedReviewForDetails.id,
        reply: '',
      });
      setSelectedReviewForDetails(updated);
      setReplyText('');
      setReplyNotice('Reply removed.');
      setTimeout(() => setReplyNotice(null), 3000);
    } catch {
      setReplyNotice('Failed to remove reply.');
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAuthorName.trim() || !addComment.trim() || !addPackageId) {
      setAddError('Package, Author Name, and Review Comment are required.');
      return;
    }

    setAddError(null);
    try {
      await createReviewMutation.mutateAsync({
        packageId: addPackageId,
        authorName: addAuthorName.trim(),
        authorLocation: addAuthorLocation.trim() || null,
        rating: addRating,
        title: addTitle.trim() || null,
        comment: addComment.trim(),
        tripType: addTripType,
        status: addStatus,
        showOnPackage: addStatus === 'approved' ? addShowOnPackage : false,
        showOnHome: addStatus === 'approved' ? addShowOnHome : false,
        verifiedBooking: addVerifiedBooking,
      });

      setAddAuthorName('');
      setAddAuthorLocation('');
      setAddTitle('');
      setAddComment('');
      setAddRating(5);
      setAddStatus('approved');
      setAddShowOnPackage(true);
      setAddShowOnHome(false);
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      setAddError((err as { message?: string })?.message || 'Failed to create review');
    }
  };

  const pendingCount = facets.byStatus?.pending || 0;
  const approvedCount = facets.byStatus?.approved || 0;
  const hiddenCount = facets.byStatus?.hidden || 0;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Reviews & Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Moderate traveler reviews, feature home testimonials, and publish official responses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (packagesList.length > 0 && !addPackageId) {
              setAddPackageId(packagesList[0]?.id || '');
            }
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none text-xs">
        {[
          { key: 'All', label: 'All Reviews', count: facets.total },
          { key: 'pending', label: 'Pending Moderation', count: pendingCount },
          { key: 'approved', label: 'Approved', count: approvedCount },
          { key: 'hidden', label: 'Hidden', count: hiddenCount },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setSelectedStatusTab(tab.key as 'All' | AdminReviewStatus);
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedStatusTab === tab.key
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                selectedStatusTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div
        className={`p-4 rounded-[4px] border space-y-3 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer name, package title, or review text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
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
              onChange={(val) => {
                setDestinationFilter(val);
                setPage(1);
              }}
              options={destinationOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            <DropdownFilter
              label="Rating"
              value={ratingFilter}
              onChange={(val) => {
                setRatingFilter(val);
                setPage(1);
              }}
              options={ratingOptions}
              icon={<Star className="w-4 h-4 text-amber-500" />}
            />

            {(destinationFilter !== 'All' || ratingFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDestinationFilter('All');
                  setRatingFilter('All');
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
      </div>

      <div
        className={`rounded-[4px] border overflow-hidden shadow-xs ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead
              className={`text-xs uppercase font-semibold border-b ${
                theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center w-12">SL</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Customer / Guest</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Tour Package</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Rating</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Review Snippet</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Placement</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Loading customer reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Star className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-base text-slate-600 dark:text-slate-300">
                      No customer reviews found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search terms or filters
                    </p>
                  </td>
                </tr>
              ) : (
                reviews.map((rev, index) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {((page - 1) * limit + index + 1).toString().padStart(2, '0')}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            rev.authorAvatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              rev.authorName,
                            )}&background=0284c7&color=fff&rounded=true`
                          }
                          alt={rev.authorName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
                        />
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">{rev.authorName}</span>
                            {rev.verifiedBooking && (
                              <span title="Verified Booking" className="inline-flex">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDate(rev.createdAt)}
                            {rev.authorLocation && ` • ${rev.authorLocation}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {rev.destinationName && (
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                          {rev.destinationName}
                        </div>
                      )}
                      <div
                        className="font-medium text-xs text-slate-600 dark:text-slate-400 truncate max-w-[180px]"
                        title={rev.packageTitle}
                      >
                        {rev.packageTitle}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 max-w-[240px]">
                        <span
                          onClick={() => handleOpenDetails(rev)}
                          className="truncate text-xs text-slate-700 dark:text-slate-300 italic cursor-pointer hover:text-blue-600"
                          title={rev.comment}
                        >
                          "{rev.comment}"
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          rev.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : rev.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rev.showOnPackage && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Package
                          </span>
                        )}
                        {rev.showOnHome && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Home
                          </span>
                        )}
                        {!rev.showOnPackage && !rev.showOnHome && (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(rev)}
                          className="p-1.5 rounded-[4px] text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Moderate Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetReview(rev)}
                          className="p-1.5 rounded-[4px] text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 text-xs">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{reviews.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(page * limit, meta.total)}
            </span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{meta.total}</span> reviews
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 text-xs font-semibold cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-slate-600 dark:text-slate-400">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
              className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 text-xs font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg md:max-w-xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-base sm:text-lg font-semibold">Add Customer Review</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                  {addError && (
                    <div className="p-3 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{addError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Select Tour Package *
                    </label>
                    <select
                      required
                      value={addPackageId}
                      onChange={(e) => setAddPackageId(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    >
                      <option value="">-- Choose a package --</option>
                      {packagesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.destinationName}] {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh & Anjali Verma"
                        value={addAuthorName}
                        onChange={(e) => setAddAuthorName(e.target.value)}
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Author Location (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kolkata, India"
                        value={addAuthorLocation}
                        onChange={(e) => setAddAuthorLocation(e.target.value)}
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Trip Type
                      </label>
                      <select
                        value={addTripType}
                        onChange={(e) => setAddTripType(e.target.value as AdminReviewTripType)}
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      >
                        <option value="family">Family</option>
                        <option value="couple">Couple</option>
                        <option value="friends">Friends</option>
                        <option value="solo">Solo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Rating (1 to 5 Stars) *
                      </label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setAddRating(s)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= addRating
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
                          {addRating}★
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Review Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unforgettable Kashmir experience with seamless transfers"
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Customer Review / Testimonial *
                    </label>
                    <textarea
                      rows={4}
                      required
                      minLength={10}
                      placeholder="Share what the customer loved about their trip..."
                      value={addComment}
                      onChange={(e) => setAddComment(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none resize-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Moderation Status
                    </label>
                    <select
                      value={addStatus}
                      onChange={(e) => {
                        const next = e.target.value as AdminReviewStatus;
                        setAddStatus(next);
                        if (next !== 'approved') {
                          setAddShowOnPackage(false);
                          setAddShowOnHome(false);
                        }
                      }}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    >
                      <option value="approved">Approved (Publicly Visible)</option>
                      <option value="pending">Pending Moderation</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  <div
                    className={`p-3 rounded-[4px] border space-y-3 ${
                      theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Visibility & Badging Settings
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Show on Tour Package Page
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {addStatus !== 'approved'
                            ? 'Requires Approved status to enable'
                            : 'Displays review inside this tour package reviews section'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        disabled={addStatus !== 'approved'}
                        checked={addShowOnPackage}
                        onChange={(e) => setAddShowOnPackage(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded-[2px] disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Show on Home Page (Testimonial)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {addStatus !== 'approved'
                            ? 'Requires Approved status to enable'
                            : 'Features review on homepage testimonials marquee'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        disabled={addStatus !== 'approved'}
                        checked={addShowOnHome}
                        onChange={(e) => setAddShowOnHome(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded-[2px] disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Verified Traveler Booking
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Displays green verified traveller shield
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={addVerifiedBooking}
                        onChange={(e) => setAddVerifiedBooking(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded-[2px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-[4px] transition-colors shadow-xs cursor-pointer"
                  >
                    {createReviewMutation.isPending ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedReviewForDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedReviewForDetails(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg md:max-w-xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      selectedReviewForDetails.authorAvatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedReviewForDetails.authorName,
                      )}&background=0284c7&color=fff&rounded=true`
                    }
                    alt={selectedReviewForDetails.authorName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedReviewForDetails.authorName}</span>
                      {selectedReviewForDetails.verifiedBooking && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Traveller</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedReviewForDetails.authorLocation || 'Guest'} • {formatDate(selectedReviewForDetails.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReviewForDetails(null)}
                  className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div
                  className={`p-3.5 rounded-[4px] border flex items-center justify-between ${
                    theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Reviewed Package
                    </span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {selectedReviewForDetails.packageTitle}
                    </span>
                    {selectedReviewForDetails.destinationName && (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">
                        • {selectedReviewForDetails.destinationName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedReviewForDetails.rating}.0 / 5</span>
                  </div>
                </div>

                {selectedReviewForDetails.title && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Review Title:
                    </span>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">
                      {selectedReviewForDetails.title}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Full Review Feedback:
                  </span>
                  <div
                    className={`p-3.5 rounded-[4px] border italic text-xs sm:text-sm leading-relaxed ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    "{selectedReviewForDetails.comment}"
                  </div>
                </div>

                <div className="p-3.5 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Visibility & Moderation Controls
                  </span>

                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Moderation Status:
                        </span>
                        <div className="flex items-center gap-1">
                          {(['approved', 'pending', 'hidden'] as AdminReviewStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(st)}
                              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold capitalize transition-colors cursor-pointer ${
                                selectedReviewForDetails.status === st
                                  ? st === 'approved'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-700 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Show on Tour Package Details
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {selectedReviewForDetails.status !== 'approved'
                            ? 'Requires Approved status to enable'
                            : 'Display review on package reviews section'}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        disabled={selectedReviewForDetails.status !== 'approved'}
                        aria-checked={selectedReviewForDetails.showOnPackage}
                        onClick={handleToggleShowOnPackage}
                        className="inline-flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            selectedReviewForDetails.showOnPackage ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                              selectedReviewForDetails.showOnPackage ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[50px] text-left ${
                            selectedReviewForDetails.showOnPackage
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {selectedReviewForDetails.showOnPackage ? 'Active' : 'Off'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Show on Home Page Testimonials
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {selectedReviewForDetails.status !== 'approved'
                            ? 'Requires Approved status to enable'
                            : 'Feature this review on the landing page carousel'}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        disabled={selectedReviewForDetails.status !== 'approved'}
                        aria-checked={selectedReviewForDetails.showOnHome}
                        onClick={handleToggleShowOnHome}
                        className="inline-flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            selectedReviewForDetails.showOnHome ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                              selectedReviewForDetails.showOnHome ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[50px] text-left ${
                            selectedReviewForDetails.showOnHome
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {selectedReviewForDetails.showOnHome ? 'Home' : 'Off'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-[4px] border space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>Official Agency Response</span>
                    </span>
                    {selectedReviewForDetails.adminRepliedAt && (
                      <span className="text-[11px] text-slate-400">
                        Replied on {formatDate(selectedReviewForDetails.adminRepliedAt)}
                      </span>
                    )}
                  </div>

                  {replyNotice && (
                    <div className="p-2 rounded bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{replyNotice}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveReply} className="space-y-2.5">
                    <textarea
                      rows={3}
                      placeholder="Thank the traveler and address any feedback warmly..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none resize-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      {selectedReviewForDetails.adminReply ? (
                        <button
                          type="button"
                          onClick={handleClearReply}
                          disabled={isSavingReply}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                        >
                          Remove Response
                        </button>
                      ) : (
                        <div />
                      )}
                      <button
                        type="submit"
                        disabled={isSavingReply || !replyText.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-[4px] shadow-xs cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSavingReply ? 'Saving...' : 'Save Response'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetReview(selectedReviewForDetails);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReviewForDetails(null)}
                  className="px-5 py-2 text-xs font-semibold rounded-[4px] bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 transition-colors shadow-xs cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetReview)}
        onClose={() => setDeleteTargetReview(null)}
        onConfirm={async () => {
          if (deleteTargetReview) {
            await deleteMutation.mutateAsync(deleteTargetReview.id);
            if (selectedReviewForDetails?.id === deleteTargetReview.id) {
              setSelectedReviewForDetails(null);
            }
            setDeleteTargetReview(null);
          }
        }}
        itemType="Customer Review"
        itemName={deleteTargetReview ? `${deleteTargetReview.authorName}'s Review` : undefined}
        warningMessage="This review and any associated admin replies will be soft deleted and immediately removed from public package and home pages."
      />
    </div>
  );
};
