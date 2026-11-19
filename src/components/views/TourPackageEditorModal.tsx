import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Building,
  Car,
  Utensils,
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type { Tour, ItineraryDay, TourFaq } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS } from './VendorPortalView';
import { ImageUploadField } from '../common/ImageUploadField';

interface TourPackageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null; // null means creating a new tour
  onSave: (tour: Tour) => void;
  initialTab?: 'basic' | 'about' | 'itinerary' | 'includes' | 'faqs';
}

export const TourPackageEditorModal: React.FC<TourPackageEditorModalProps> = ({
  isOpen,
  onClose,
  tour,
  onSave,
  initialTab = 'basic',
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'itinerary' | 'includes' | 'faqs'>(
    initialTab
  );

  // Form State
  const [title, setTitle] = useState(tour?.title || '');
  const [destination, setDestination] = useState(tour?.destination || 'Kashmir');
  const [country, setCountry] = useState(tour?.country || 'India');
  const [category, setCategory] = useState<Tour['category']>(tour?.category || 'Luxury');
  const [duration, setDuration] = useState(tour?.duration || '6 Days / 5 Nights');
  const [price, setPrice] = useState<number>(tour?.price || 850);
  const [seatsAvailable, setSeatsAvailable] = useState<number>(tour?.seatsAvailable || 10);
  const [featuredImage, setFeaturedImage] = useState(
    tour?.featuredImage ||
    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
  );
  const [status, setStatus] = useState<Tour['status']>(tour?.status || 'Published');

  // About Tour & Highlights
  const [description, setDescription] = useState(
    tour?.description ||
    'Experience the pinnacle of travel luxury and adventure. Tailored for discerning explorers, this comprehensive package features handpicked resorts, private chauffeured transfers, guided excursions, and authentic local cultural engagements.'
  );
  const [highlights, setHighlights] = useState<string[]>(
    tour?.highlights || [
      'Private chauffeured airport transfers in premium climate-controlled vehicles',
      'Exclusive boutique heritage stays and 4-star waterfront accommodations',
      'Curated sightseeing itinerary with priority monument entry passes',
      '24/7 dedicated local tour coordinator and concierge support',
    ]
  );
  const [newHighlightInput, setNewHighlightInput] = useState('');

  // Itinerary (Day-by-Day) matching the user reference screenshot
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    tour?.itinerary || [
      {
        dayNumber: 1,
        title: 'Arrival Port Blair & Cellular Jail Memorial',
        description: 'Transfer from airport to hotel. Visit Cellular Jail and attend the national Sound & Light program.',
        transport: 'Car, Flight, Boat',
        activities: 'Airport Pick-up, Cellular Jail',
        meals: 'Dinner Included',
        accommodation: 'Peerless Sarovar Portico, Port Blair',
        highlightPhotos: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        ],
      },
      {
        dayNumber: 2,
        title: 'Island Transfer & Sunset Beach Excursion',
        description: 'Morning private ferry transfer to island resort. Leisure afternoon and evening sunset walk along the coastline.',
        transport: 'High-speed Catamaran & Private AC Cab',
        activities: 'Ferry cruise, Beach stroll, Sunset photography',
        meals: 'Breakfast & Dinner',
        accommodation: 'Seaside Luxury Palms Resort',
        highlightPhotos: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        ],
      },
    ]
  );
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [newPhotoUrl, setNewPhotoUrl] = useState<Record<number, string>>({});

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(
    tour?.inclusions || [
      'Luxury hotel & heritage resort accommodation on twin sharing basis',
      'Daily lavish buffet breakfast & chef-curated regional dinners',
      'Private dedicated air-conditioned tourist vehicle for transfers & sightseeing',
      'Complimentary welcome drinks upon arrival at all participating resorts',
      'All toll taxes, parking charges, driver allowances & permit processing',
    ]
  );
  const [exclusions, setExclusions] = useState<string[]>(
    tour?.exclusions || [
      'Domestic or international flights / train tickets to destination',
      'Personal expenses such as laundry, alcoholic beverages, and minibar usage',
      'Optional adventure activities, water sports gear rentals, and video camera fees',
      'Mandatory 5% GST and applicable TCS',
    ]
  );
  const [newInclusionInput, setNewInclusionInput] = useState('');
  const [newExclusionInput, setNewExclusionInput] = useState('');

  // Tour FAQs
  const [faqs, setFaqs] = useState<TourFaq[]>(
    tour?.faqs || [
      {
        id: 'faq-1',
        question: 'What is the best time of year to book this package?',
        answer: 'Peak travel season runs from October through April with pleasant temperatures, calm waters, and crystal clear skies.',
      },
      {
        id: 'faq-2',
        question: 'Are all inner-line permits and entry passes included?',
        answer: 'Yes! All required tourist permits, environmental fees, and monument entry passes mentioned in the itinerary are fully pre-cleared by our ground team.',
      },
      {
        id: 'faq-3',
        question: 'Can this package be customized for dietary requirements?',
        answer: 'Absolutely. Please inform your travel coordinator after booking to arrange purely vegetarian, vegan, or Jain meals.',
      },
    ]
  );
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({ 'faq-1': true });

  // Tour reviews preserved on tour object (managed via Customer Reviews page)
  const reviews = tour?.reviews || [];

  if (!isOpen) return null;

  // Toggle Day Expand
  const toggleDayExpand = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  // Add Highlight
  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setHighlights([...highlights, newHighlightInput.trim()]);
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  // Add Day Itinerary
  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum}: Sightseeing & Excursion`,
      description: 'Full day guided exploration of prominent scenic viewpoints, cultural landmarks, and local artisan markets.',
      transport: 'Private Tourist Vehicle',
      activities: 'Guided sightseeing, Photo stops, Local market visit',
      meals: 'Breakfast Included',
      accommodation: 'Standard Premium Resort / Hotel',
      highlightPhotos: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      ],
    };
    setItinerary([...itinerary, newDay]);
    setExpandedDays((prev) => ({ ...prev, [nextDayNum]: true }));
  };

  const handleUpdateDay = (idx: number, updatedFields: Partial<ItineraryDay>) => {
    setItinerary(
      itinerary.map((day, i) => (i === idx ? { ...day, ...updatedFields } : day))
    );
  };

  const handleRemoveDay = (dayNum: number) => {
    const filtered = itinerary.filter((d) => d.dayNumber !== dayNum);
    // Renumber days
    const renumbered = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItinerary(renumbered);
  };

  const handleAddDayPhoto = (dayNum: number) => {
    const url = newPhotoUrl[dayNum]?.trim();
    if (!url) return;
    setItinerary(
      itinerary.map((d) =>
        d.dayNumber === dayNum
          ? { ...d, highlightPhotos: [...(d.highlightPhotos || []), url] }
          : d
      )
    );
    setNewPhotoUrl((prev) => ({ ...prev, [dayNum]: '' }));
  };

  const handleRemoveDayPhoto = (dayNum: number, photoIdx: number) => {
    setItinerary(
      itinerary.map((d) =>
        d.dayNumber === dayNum
          ? {
            ...d,
            highlightPhotos: (d.highlightPhotos || []).filter((_, i) => i !== photoIdx),
          }
          : d
      )
    );
  };

  // Inclusions & Exclusions
  const handleAddInclusion = () => {
    if (!newInclusionInput.trim()) return;
    setInclusions([...inclusions, newInclusionInput.trim()]);
    setNewInclusionInput('');
  };

  const handleRemoveInclusion = (idx: number) => {
    setInclusions(inclusions.filter((_, i) => i !== idx));
  };

  const handleAddExclusion = () => {
    if (!newExclusionInput.trim()) return;
    setExclusions([...exclusions, newExclusionInput.trim()]);
    setNewExclusionInput('');
  };

  const handleRemoveExclusion = (idx: number) => {
    setExclusions(exclusions.filter((_, i) => i !== idx));
  };

  // FAQs
  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newFaq: TourFaq = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };
    setFaqs([...faqs, newFaq]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setExpandedFaqs((prev) => ({ ...prev, [newFaq.id]: true }));
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  // Submit full tour package
  const handleSaveAll = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const updatedTour: Tour = {
      id: tour?.id || `TR-${Date.now().toString().slice(-4)}`,
      title: title.trim() || 'New Tour Package',
      destination,
      country,
      category,
      duration,
      price: Number(price),
      seatsAvailable: Number(seatsAvailable),
      featuredImage,
      status,
      rating: tour?.rating ?? (reviews.length > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)) : 5.0),
      reviewsCount: tour?.reviewsCount ?? reviews.length,
      description,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      faqs,
      reviews,
    };

    onSave(updatedTour);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tour Packages</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[320px]">
            {tour ? tour.title : 'New Tour Package'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status selector */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="Published">● Published</option>
            <option value="Draft">○ Draft</option>
          </select>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-1.5 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{tour ? 'Save Changes' : 'Publish Tour Package'}</span>
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div
        className={`w-full rounded-[4px] border shadow-xs overflow-hidden ${theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
          }`}
      >
        {/* Header Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {tour ? `Edit Package: ${tour.title}` : 'Add New Tour Package'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure itinerary, inclusions/exclusions, FAQs & comprehensive descriptions
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div
          className={`flex items-center gap-1 px-4 border-b overflow-x-auto shrink-0 select-none ${theme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-100/60'
            }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'basic'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Destination & Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'about'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>About Tour & Highlights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'itinerary'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day-by-Day Itinerary ({itinerary.length} Days)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('includes')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'includes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Includes & Excludes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'faqs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tour FAQs ({faqs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* TAB 1: BASIC INFO & DESTINATION / CATEGORY */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tour Package Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Andaman Havelock Scuba & Radhanagar Sunset Cruise"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-medium ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>

                {/* Destination Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Destination Territory *
                  </label>
                  <div className="relative">
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold cursor-pointer ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    >
                      {SUPPORTED_DESTINATIONS.map((dest) => (
                        <option key={dest} value={dest}>
                          {dest} Territory
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tour Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tour Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Tour['category'])}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold cursor-pointer ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="Honeymoon">Honeymoon Romantic</option>
                    <option value="Luxury">Luxury Premium</option>
                    <option value="Adventure">Adventure & Scuba</option>
                    <option value="Cultural">Cultural Heritage</option>
                    <option value="Family">Family Vacation</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Country / Region
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tour Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 7 Days / 6 Nights"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                {/* Starting Price */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price per Guest (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className={`w-full pl-8 pr-3 py-2.5 text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>

                {/* Seats Available */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Tour['status'])}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="Published">Published (Live in catalog)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Featured Cover Image Upload */}
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Featured Cover Image *"
                    value={featuredImage}
                    onChange={setFeaturedImage}
                    aspectRatio="16/9"
                    placeholder="Choose Cover Image or Drag & Drop"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT TOUR & HIGHLIGHTS */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  About Tour Description (Comprehensive Overview)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the experience, scenery, accommodations, and unique travel highlights..."
                  className={`w-full p-3 text-sm rounded-[4px] border outline-none leading-relaxed ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tour Key Highlights Bullet Points
                </label>
                <div className="space-y-2 mb-3">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-[4px] border text-xs sm:text-sm font-medium ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add a new highlight (e.g. Scuba diving with certified PADI divemasters)..."
                    className={`flex-1 p-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Highlight</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAY-BY-DAY ITINERARY BUILDER (MATCHING USER'S SCREENSHOT) */}
          {activeTab === 'itinerary' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Detailed Day-by-Day Itinerary Builder
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure day titles, descriptions, transport, activities, meals, accommodations & photo highlights
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Next Day</span>
                </button>
              </div>

              {/* Itinerary Cards matching user reference screenshot */}
              <div className="space-y-4">
                {itinerary.map((day, idx) => {
                  const isExpanded = expandedDays[day.dayNumber] ?? true;
                  return (
                    <div
                      key={day.dayNumber}
                      className={`rounded-[4px] border transition-all ${theme === 'dark'
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                        }`}
                    >
                      {/* Day Header matching image: [MapPin] Day-01   Arrival Port Blair & Cellular Jail Memorial */}
                      <div
                        onClick={() => toggleDayExpand(day.dayNumber)}
                        className={`p-4 flex items-center justify-between cursor-pointer select-none ${isExpanded
                          ? 'border-b border-slate-100 dark:border-slate-800'
                          : ''
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[4px] bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                Day-{String(day.dayNumber).padStart(2, '0')}
                              </span>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {day.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {day.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveDay(day.dayNumber);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-[4px]"
                            title="Delete Day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Day Detailed Content (Editable + Visual Presentation) */}
                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {/* Title & Description inputs */}
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                Day Title
                              </label>
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => handleUpdateDay(idx, { title: e.target.value })}
                                placeholder="e.g. Arrival Port Blair & Cellular Jail Memorial"
                                className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                Day Overview Description
                              </label>
                              <textarea
                                rows={2}
                                value={day.description}
                                onChange={(e) => handleUpdateDay(idx, { description: e.target.value })}
                                placeholder="Transfer from airport to hotel. Visit Cellular Jail and attend the national Sound & Light program."
                                className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>
                          </div>

                          {/* 4 Structured Metadata Rows with Icons matching user screenshot */}
                          <div
                            className={`p-3.5 rounded-[4px] border space-y-2.5 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
                              }`}
                          >
                            {/* Transport */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              <div className="flex items-center gap-2 w-36 shrink-0 font-semibold text-slate-800 dark:text-slate-200">
                                <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Transport</span>
                                <span className="ml-auto">:</span>
                              </div>
                              <input
                                type="text"
                                value={day.transport || ''}
                                onChange={(e) => handleUpdateDay(idx, { transport: e.target.value })}
                                placeholder="Car, Flight, Boat"
                                className={`flex-1 p-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>

                            {/* Activities */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              <div className="flex items-center gap-2 w-36 shrink-0 font-semibold text-slate-800 dark:text-slate-200">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Activities</span>
                                <span className="ml-auto">:</span>
                              </div>
                              <input
                                type="text"
                                value={day.activities || ''}
                                onChange={(e) => handleUpdateDay(idx, { activities: e.target.value })}
                                placeholder="Airport Pick-up, Cellular Jail, Sound & Light Show"
                                className={`flex-1 p-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>

                            {/* Meals */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              <div className="flex items-center gap-2 w-36 shrink-0 font-semibold text-slate-800 dark:text-slate-200">
                                <Utensils className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Meals</span>
                                <span className="ml-auto">:</span>
                              </div>
                              <input
                                type="text"
                                value={day.meals || ''}
                                onChange={(e) => handleUpdateDay(idx, { meals: e.target.value })}
                                placeholder="Dinner Included / Breakfast & Dinner"
                                className={`flex-1 p-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>

                            {/* Accommodation */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              <div className="flex items-center gap-2 w-36 shrink-0 font-semibold text-slate-800 dark:text-slate-200">
                                <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Accommodation</span>
                                <span className="ml-auto">:</span>
                              </div>
                              <input
                                type="text"
                                value={day.accommodation || ''}
                                onChange={(e) => handleUpdateDay(idx, { accommodation: e.target.value })}
                                placeholder="Peerless Sarovar Portico, Port Blair"
                                className={`flex-1 p-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                                  }`}
                              />
                            </div>
                          </div>

                          {/* Day Highlights Photos Slider/Thumbnails matching user screenshot */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Day Highlights Photos
                                </span>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  {(day.highlightPhotos || []).length} Photos
                                </span>
                              </div>
                            </div>

                            {/* Photo Thumbnails Row */}
                            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                              {(day.highlightPhotos || []).map((imgUrl, photoIdx) => (
                                <div
                                  key={photoIdx}
                                  className="relative group shrink-0 w-28 h-20 rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Day ${day.dayNumber} photo ${photoIdx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDayPhoto(day.dayNumber, photoIdx)}
                                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Photo Input */}
                            <div className="flex gap-2 mt-2">
                              <input
                                type="url"
                                value={newPhotoUrl[day.dayNumber] || ''}
                                onChange={(e) =>
                                  setNewPhotoUrl((prev) => ({
                                    ...prev,
                                    [day.dayNumber]: e.target.value,
                                  }))
                                }
                                placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                                className={`flex-1 p-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                                  }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddDayPhoto(day.dayNumber)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px] flex items-center gap-1 shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Photo</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
          {activeTab === 'includes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div
                className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    What's Included (Inclusions)
                  </h4>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {inclusions.map((inc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between gap-2 p-2 rounded-[4px] border text-xs ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/50 border-emerald-100'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{inc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInclusion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newInclusionInput}
                    onChange={(e) => setNewInclusionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInclusion();
                      }
                    }}
                    placeholder="e.g. Daily buffet breakfast & dinner..."
                    className={`flex-1 p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddInclusion}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[4px] shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div
                className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    What's Excluded (Exclusions)
                  </h4>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {exclusions.map((exc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between gap-2 p-2 rounded-[4px] border text-xs ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-rose-50/50 border-rose-100'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{exc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExclusion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newExclusionInput}
                    onChange={(e) => setNewExclusionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExclusion();
                      }
                    }}
                    placeholder="e.g. Domestic flights to destination..."
                    className={`flex-1 p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddExclusion}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-[4px] shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TOUR FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Frequently Asked Questions (Tour FAQs)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add helpful Q&As regarding best seasons, equipment, permits, and cancellation policies
                  </p>
                </div>
              </div>

              {/* FAQs list */}
              <div className="space-y-3">
                {faqs.map((faq) => {
                  const isOpen = expandedFaqs[faq.id] ?? false;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-[4px] border overflow-hidden ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div
                        onClick={() =>
                          setExpandedFaqs((prev) => ({ ...prev, [faq.id]: !isOpen }))
                        }
                        className="p-3 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {faq.question}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFaq(faq.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New FAQ Form */}
              <div
                className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                  + Add New FAQ Item
                </h5>
                <div>
                  <input
                    type="text"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Question (e.g. Are kids and senior citizens suitable for this trek?)"
                    className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Answer with comprehensive travel guidance..."
                    className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px]"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
            }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{itinerary.length} Days Itinerary</span>
            <span>•</span>
            <span>{inclusions.length} Inclusions</span>
            <span>•</span>
            <span>{faqs.length} FAQs</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{tour ? 'Save Package Changes' : 'Publish Tour Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
