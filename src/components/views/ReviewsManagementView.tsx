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
} from 'lucide-react';
import type { TourReview, Tour } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS } from './VendorPortalView';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ReviewsManagementViewProps {
  reviews: TourReview[];
  tours: Tour[];
  onAddReview: (review: TourReview) => void;
  onUpdateReview: (review: TourReview) => void;
  onDeleteReview: (id: string) => void;
  onToggleShowOnPackage: (id: string) => void;
  onToggleShowOnHome: (id: string) => void;
  onUpdateReviewStatus: (id: string, status: TourReview['status']) => void;
  onReplyToReview: (id: string, reply: string) => void;
}

export const ReviewsManagementView: React.FC<ReviewsManagementViewProps> = ({
  reviews,
  tours,
  onAddReview,
  onDeleteReview,
  onToggleShowOnPackage,
  onToggleShowOnHome,
  onUpdateReviewStatus,
  onReplyToReview,
}) => {
  const { theme } = useTheme();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [replyingReview, setReplyingReview] = useState<TourReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteTargetReview, setDeleteTargetReview] = useState<TourReview | null>(null);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<TourReview | null>(null);

  // Add Review Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedTourId, setSelectedTourId] = useState(tours[0]?.id || 'TR-101');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState(true);
  const [showOnPackage, setShowOnPackage] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [status, setStatus] = useState<TourReview['status']>('Approved');

  // Filter Options
  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: reviews.length,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: reviews.filter((r) => r.destination === dest).length,
    })),
  ];

  const ratingOptions = [
    { value: 'All', label: 'All Ratings', badge: reviews.length },
    { value: '5', label: '5 Stars ★★★★★', badge: reviews.filter((r) => r.rating === 5).length },
    { value: '4', label: '4 Stars ★★★★☆', badge: reviews.filter((r) => r.rating === 4).length },
    { value: '3', label: '3 Stars ★★★☆☆', badge: reviews.filter((r) => r.rating === 3).length },
  ];

  // Filtering Logic
  const filteredReviews = reviews.filter((r) => {
    // Destination filter
    if (destinationFilter !== 'All' && r.destination !== destinationFilter) {
      return false;
    }

    // Rating filter
    if (ratingFilter !== 'All' && r.rating !== Number(ratingFilter)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchEmail = (r.customerEmail || '').toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchTour = (r.tourTitle || '').toLowerCase().includes(q);
      const matchDest = (r.destination || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchComment && !matchTour && !matchDest) {
        return false;
      }
    }

    return true;
  });

  const handleOpenReplyModal = (review: TourReview) => {
    setReplyingReview(review);
    setReplyText(review.adminReply || '');
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    onReplyToReview(replyingReview.id, replyText.trim());
    setReplyingReview(null);
    setReplyText('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) return;

    const tour = tours.find((t) => t.id === selectedTourId) || tours[0];
    const newRev: TourReview = {
      id: `rev-${Date.now()}`,
      tourId: tour?.id || 'TR-101',
      tourTitle: tour?.title || 'Tour Package',
      destination: tour?.destination || 'Kashmir',
      customerName,
      customerEmail: customerEmail || undefined,
      rating,
      date: new Date().toISOString().split('T')[0],
      comment,
      verifiedBooking,
      status,
      showOnPackage,
      showOnHome,
    };

    onAddReview(newRev);

    // Reset Form
    setCustomerName('');
    setCustomerEmail('');
    setComment('');
    setRating(5);
    setShowOnPackage(true);
    setShowOnHome(true);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">



      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer name, email, package, or review content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                }`}
            />
          </div>

          {/* Dropdown Filters with Icons */}
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownFilter
              label="Destination"
              value={destinationFilter}
              onChange={setDestinationFilter}
              options={destinationOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            <DropdownFilter
              label="Rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={ratingOptions}
              icon={<Star className="w-4 h-4 text-amber-500" />}
            />

            {(destinationFilter !== 'All' ||
              ratingFilter !== 'All' ||
              searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationFilter('All');
                    setRatingFilter('All');
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

        {/* Active Filter Chips */}
        {(destinationFilter !== 'All' || ratingFilter !== 'All') && (
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
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ratingFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{ratingFilter} Stars</span>
                <button
                  type="button"
                  onClick={() => setRatingFilter('All')}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reviews Table / Card List */}
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
              Customer Feedback & Reviews Log
            </span>

          </div>


        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead
              className={`text-xs uppercase font-semibold border-b ${theme === 'dark'
                ? 'bg-slate-800/60 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
            >
              <tr>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center w-12 text-slate-500 dark:text-slate-400">
                  SL
                </th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Review ID</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Customer / Guest</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Tour package</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Rating</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Review Snippet</th>
                <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
                filteredReviews.map((rev, index) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Serial Number */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>

                    {/* Review ID */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                        #{rev.id}
                      </span>
                    </td>

                    {/* Customer Info (Circular Profile Avatar - No Line Break) */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            rev.customerAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              rev.customerName
                            )}&background=0284c7&color=fff&rounded=true`
                          }
                          alt={rev.customerName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
                        />
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            <span className="truncate max-w-[150px]">{rev.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {rev.date}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tour & Destination */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {rev.destination && (
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                          {rev.destination}
                        </div>
                      )}
                      <div
                        className="font-medium text-xs text-slate-600 dark:text-slate-400 truncate max-w-[180px]"
                        title={rev.tourTitle || rev.tourId}
                      >
                        {rev.tourTitle || `Tour: ${rev.tourId}`}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </td>

                    {/* Review Snippet (No awkward line breaks, click to view full) */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 max-w-[260px]">
                        <span
                          onClick={() => setSelectedReviewForDetails(rev)}
                          className="truncate text-xs text-slate-700 dark:text-slate-300 italic cursor-pointer hover:text-blue-600"
                          title={rev.comment}
                        >
                          "{rev.comment}"
                        </span>
                      </div>
                    </td>

                    {/* Actions: View Details + Delete (Reply Removed) */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewForDetails(rev)}
                          className="p-1.5 rounded-[4px] text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Review Details"
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

        {/* Table Bottom Industrial Pagination / Counter Bar */}
        <div
          className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
        >
          <div className="text-slate-500 text-xs">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredReviews.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredReviews.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{reviews.length}</span> reviews
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

      {/* MODAL 1: ADD CUSTOMER REVIEW (RIGHT SLIDE-OVER DRAWER) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg md:max-w-xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
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
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Customer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh & Anjali Verma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.verma@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>
              </div>

              {/* Tour Package Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  Select Tour Package *
                </label>
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.destination}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Interactive Selector */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300 dark:text-slate-700'
                          }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  Customer Review / Testimonial *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share what the customer loved about their trip, chauffeur, hotel, or scenic experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none resize-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                />
              </div>

              {/* Visibility and Moderation Toggles (Strictly 4px Border Radius) */}
              <div
                className={`p-3 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Review Placement & Visibility Settings
                </div>

                {/* Show on Package Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Active to show on Tour Package Page
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Displays review inside this specific tour package page tab
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showOnPackage}
                    onChange={(e) => setShowOnPackage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-[2px]"
                  />
                </div>

                {/* Show on Home Page Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Show on Home Page (Featured Badge)</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Features review on the main website homepage testimonials section
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-[2px]"
                  />
                </div>

                {/* Verified Customer Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Verified Traveler Booking
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Show green shield badge confirming completed booking
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={verifiedBooking}
                    onChange={(e) => setVerifiedBooking(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-[2px]"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  Moderation Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TourReview['status'])}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                >
                  <option value="Approved">Approved (Publicly Visible)</option>
                  <option value="Pending">Pending (Draft / Needs Check)</option>
                  <option value="Hidden">Hidden (Internal Only)</option>
                </select>
              </div>

                </div>

                {/* Drawer Footer Actions */}
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
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN OFFICIAL REPLY (RIGHT SLIDE-OVER DRAWER) */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setReplyingReview(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold">Reply to {replyingReview.customerName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReply} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
                    "{replyingReview.comment}"
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Official KrikoTrip Response
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Thank the traveler and address any feedback warmly..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none resize-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Reply</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER: VIEW FULL REVIEW DETAILS */}
      {selectedReviewForDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedReviewForDetails(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Slide-over Right Sidebar Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg md:max-w-xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
              {/* Drawer Top Header Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      selectedReviewForDetails.customerAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedReviewForDetails.customerName
                      )}&background=0284c7&color=fff&rounded=true`
                    }
                    alt={selectedReviewForDetails.customerName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedReviewForDetails.customerName}</span>
                      {selectedReviewForDetails.verifiedBooking && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Booking</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedReviewForDetails.customerEmail || 'Verified Guest'} • {selectedReviewForDetails.date}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReviewForDetails(null)}
                  className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Close Details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* Tour & Rating Box */}
                <div
                  className={`p-3.5 rounded-[4px] border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Reviewed Package
                    </span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {selectedReviewForDetails.tourTitle || `Tour ID: ${selectedReviewForDetails.tourId}`}
                    </span>
                    {selectedReviewForDetails.destination && (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">
                        • {selectedReviewForDetails.destination}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedReviewForDetails.rating}.0 / 5</span>
                  </div>
                </div>

                {/* Full Review Comment */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Full Review Feedback:
                  </span>
                  <div
                    className={`p-3.5 rounded-[4px] border italic text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                  >
                    "{selectedReviewForDetails.comment}"
                  </div>
                </div>



                {/* Visibility & Moderation Controls with Toggle Bars */}
                <div className="p-3.5 rounded-[4px] border space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Visibility & Moderation Controls
                  </span>

                  <div className="space-y-2.5">
                    {/* 1. Show on Tour Package Details Toggle Bar */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Show on Tour Package Details
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Display review on public itinerary & tour details tab
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedReviewForDetails.showOnPackage}
                        onClick={() => {
                          onToggleShowOnPackage(selectedReviewForDetails.id);
                          setSelectedReviewForDetails({
                            ...selectedReviewForDetails,
                            showOnPackage: !selectedReviewForDetails.showOnPackage,
                          });
                        }}
                        className="inline-flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <span
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${selectedReviewForDetails.showOnPackage
                            ? 'bg-emerald-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${selectedReviewForDetails.showOnPackage ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[50px] text-left ${selectedReviewForDetails.showOnPackage
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                            }`}
                        >
                          {selectedReviewForDetails.showOnPackage ? 'Active' : 'Hidden'}
                        </span>
                      </button>
                    </div>

                    {/* 2. Show on Home Page Toggle Bar */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Show on Home Page
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Feature this review on the landing page carousel
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedReviewForDetails.showOnHome}
                        onClick={() => {
                          onToggleShowOnHome(selectedReviewForDetails.id);
                          setSelectedReviewForDetails({
                            ...selectedReviewForDetails,
                            showOnHome: !selectedReviewForDetails.showOnHome,
                          });
                        }}
                        className="inline-flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <span
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${selectedReviewForDetails.showOnHome
                            ? 'bg-purple-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${selectedReviewForDetails.showOnHome ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[50px] text-left ${selectedReviewForDetails.showOnHome
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-slate-400'
                            }`}
                        >
                          {selectedReviewForDetails.showOnHome ? 'Home' : 'Off'}
                        </span>
                      </button>
                    </div>

                    {/* 3. Review Approval Status Toggle Bar */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Approval Status
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Only approved reviews can be shown publicly
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedReviewForDetails.status === 'Approved'}
                        onClick={() => {
                          const newStatus =
                            selectedReviewForDetails.status === 'Approved' ? 'Pending' : 'Approved';
                          onUpdateReviewStatus(selectedReviewForDetails.id, newStatus);
                          setSelectedReviewForDetails({
                            ...selectedReviewForDetails,
                            status: newStatus,
                          });
                        }}
                        className="inline-flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <span
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${selectedReviewForDetails.status === 'Approved'
                            ? 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${selectedReviewForDetails.status === 'Approved'
                              ? 'translate-x-4'
                              : 'translate-x-0'
                              }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[50px] text-left ${selectedReviewForDetails.status === 'Approved'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400'
                            }`}
                        >
                          {selectedReviewForDetails.status === 'Approved' ? 'Approved' : 'Pending'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReplyModal(selectedReviewForDetails);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{selectedReviewForDetails.adminReply ? 'Edit Official Reply' : 'Reply to Review'}</span>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetReview}
        onClose={() => setDeleteTargetReview(null)}
        onConfirm={() => {
          if (deleteTargetReview) {
            onDeleteReview(deleteTargetReview.id);
            setDeleteTargetReview(null);
          }
        }}
        itemType="Customer Review"
        itemName={deleteTargetReview ? `${deleteTargetReview.customerName}'s Review` : undefined}
        warningMessage="This review and any associated admin replies will be permanently removed from all packages and the home page."
      />
    </div>
  );
};
