import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import type { Tour, ItineraryDay, TourFaq } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ImageUploadField } from '../common/ImageUploadField';
import { useDestinationsQuery } from '../../api/destinations';
import { useThemesQuery } from '../../api/themes';
import {
  useAdminPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  type CreatePackageInput,
  type TravelType,
  type PackageCategory,
  type PackageStatus,
} from '../../api/packages';

const toTravelType = (val: string): TravelType => {
  const normalized = val.toLowerCase();
  if (normalized === 'family' || normalized === 'honeymoon' || normalized === 'leisure' || normalized === 'adventure' || normalized === 'group') {
    return normalized;
  }
  return 'couple';
};

const toPackageCategory = (val: string): PackageCategory => {
  const normalized = val.toLowerCase();
  if (normalized === 'adventure' || normalized === 'honeymoon' || normalized === 'family' || normalized === 'cultural') {
    return normalized;
  }
  return 'luxury';
};

const toPackageStatus = (val: string): PackageStatus => {
  const normalized = val.toLowerCase();
  if (normalized === 'draft' || normalized === 'archived') {
    return normalized;
  }
  return 'published';
};

interface TourPackageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  packageId?: string | null;
  onSave?: (tour: Tour) => void;
  initialTab?: 'basic' | 'about' | 'itinerary' | 'includes' | 'faqs';
}

export const TourPackageEditorModal: React.FC<TourPackageEditorModalProps> = ({
  isOpen,
  onClose,
  tour,
  packageId,
  onSave,
  initialTab = 'basic',
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'itinerary' | 'includes' | 'faqs'>(
    initialTab
  );

  const { data: destinationsData } = useDestinationsQuery();
  const { data: themesData } = useThemesQuery();

  const effectiveId = packageId || (tour && !tour.id.startsWith('TR-') ? tour.id : null);
  const { data: packageDetail } = useAdminPackageQuery(effectiveId);

  const createMutation = useCreatePackageMutation();
  const updateMutation = useUpdatePackageMutation();

  const [title, setTitle] = useState(tour?.title || '');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [destination, setDestination] = useState(tour?.destination || '');
  const [locationLabel, setLocationLabel] = useState('');
  const [country, setCountry] = useState(tour?.country || 'India');
  const [category, setCategory] = useState<Tour['category']>(tour?.category || 'Luxury');
  const [travelType, setTravelType] = useState<string>('couple');
  const [duration, setDuration] = useState(tour?.duration || '6 Days / 5 Nights');
  const [price, setPrice] = useState<number>(tour?.price || 25000);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [seatsAvailable, setSeatsAvailable] = useState<number>(tour?.seatsAvailable || 10);
  const [featuredImage, setFeaturedImage] = useState(
    tour?.featuredImage ||
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
  );
  const [status, setStatus] = useState<Tour['status']>(tour?.status || 'Published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredRank, setFeaturedRank] = useState(1);
  const [badgeLabel, setBadgeLabel] = useState('');
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);

  const [description, setDescription] = useState(
    tour?.description ||
    'Experience the pinnacle of travel luxury and adventure with KrikoTrip.'
  );
  const [overview, setOverview] = useState('');
  const [highlights, setHighlights] = useState<string[]>(
    tour?.highlights || [
      'Private chauffeured airport transfers in premium climate-controlled vehicles',
      'Exclusive boutique heritage stays and 4-star waterfront accommodations',
      'Curated sightseeing itinerary with priority monument entry passes',
      '24/7 dedicated local tour coordinator and concierge support',
    ]
  );
  const [newHighlightInput, setNewHighlightInput] = useState('');

  const [hotelName, setHotelName] = useState('');
  const [hotelStars, setHotelStars] = useState(4);
  const [hotelRoom, setHotelRoom] = useState('');
  const [hotelAmenities, setHotelAmenities] = useState<string[]>([]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  const [groupSize, setGroupSize] = useState('2-12 travelers');
  const [languages, setLanguages] = useState('English, Hindi');
  const [bestSeason, setBestSeason] = useState('Oct - May');
  const [startingPoint, setStartingPoint] = useState('');
  const [endingPoint, setEndingPoint] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    tour?.itinerary || [
      {
        dayNumber: 1,
        title: 'Arrival & Welcome Reception',
        description: 'Meet our tour chauffeur at airport, check into resort, and relax.',
        transport: 'Private Luxury Vehicle',
        activities: 'Airport Pick-up, Check-in, Sunset walk',
        meals: 'Dinner Included',
        accommodation: 'Premium Beach Resort',
        highlightPhotos: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        ],
      },
    ]
  );
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [newPhotoUrl, setNewPhotoUrl] = useState<Record<number, string>>({});

  const [inclusions, setInclusions] = useState<string[]>(
    tour?.inclusions || [
      'Luxury hotel & heritage resort accommodation on twin sharing basis',
      'Daily lavish buffet breakfast & chef-curated regional dinners',
      'Private dedicated air-conditioned tourist vehicle for transfers & sightseeing',
      'All toll taxes, parking charges, driver allowances & permit processing',
    ]
  );
  const [exclusions, setExclusions] = useState<string[]>(
    tour?.exclusions || [
      'Domestic or international flights / train tickets to destination',
      'Personal expenses such as laundry, alcoholic beverages, and minibar usage',
      'Optional adventure activities and water sports gear rentals',
      'Mandatory 5% GST surcharge at final check-out',
    ]
  );
  const [newInclusionInput, setNewInclusionInput] = useState('');
  const [newExclusionInput, setNewExclusionInput] = useState('');

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
    ]
  );
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({ 'faq-1': true });

  useEffect(() => {
    if (destinationsData && destinationsData.length > 0 && !destinationId) {
      if (destination) {
        const matching = destinationsData.find(
          (d) => d.name.toLowerCase() === destination.toLowerCase() || d.slug.toLowerCase() === destination.toLowerCase()
        );
        if (matching) {
          setDestinationId(matching.id);
        } else {
          setDestinationId(destinationsData[0]!.id);
        }
      } else {
        setDestinationId(destinationsData[0]!.id);
        setDestination(destinationsData[0]!.name);
      }
    }
  }, [destinationsData, destination, destinationId]);

  useEffect(() => {
    if (packageDetail) {
      setTitle(packageDetail.title);
      setSlug(packageDetail.slug);
      setSubtitle(packageDetail.subtitle || '');
      setDestinationId(packageDetail.destination.id);
      setDestination(packageDetail.destination.name);
      setLocationLabel(packageDetail.locationLabel);
      setCountry(packageDetail.country);
      setCategory(
        (packageDetail.category.charAt(0).toUpperCase() + packageDetail.category.slice(1)) as Tour['category']
      );
      setTravelType(packageDetail.travelType);
      setDuration(`${packageDetail.days} Days / ${packageDetail.nights} Nights`);
      setPrice(Math.round(packageDetail.pricePaise / 100));
      setOriginalPrice(
        packageDetail.originalPricePaise ? Math.round(packageDetail.originalPricePaise / 100) : 0
      );
      setSeatsAvailable(packageDetail.seatsAvailable ?? 10);
      setFeaturedImage(packageDetail.coverImageUrl || '');
      setStatus(
        packageDetail.status === 'published'
          ? 'Published'
          : packageDetail.status === 'draft'
          ? 'Draft'
          : 'Archived'
      );
      setIsFeatured(packageDetail.isFeatured);
      setFeaturedRank(packageDetail.featuredRank || 1);
      setBadgeLabel(packageDetail.badgeLabel || '');
      setSelectedThemeIds(packageDetail.themeIds || []);
      setDescription(packageDetail.shortDescription);
      setOverview(packageDetail.overview);
      setHighlights(packageDetail.highlights || []);
      setInclusions(packageDetail.inclusions || []);
      setExclusions(packageDetail.exclusions || []);
      if (packageDetail.hotel) {
        setHotelName(packageDetail.hotel.name || '');
        setHotelStars(packageDetail.hotel.stars || 4);
        setHotelRoom(packageDetail.hotel.room || '');
        setHotelAmenities(packageDetail.hotel.amenities || []);
      }
      if (packageDetail.tripFacts) {
        setGroupSize(packageDetail.tripFacts.groupSize || '2-12 travelers');
        setLanguages(packageDetail.tripFacts.languages || 'English, Hindi');
        setBestSeason(packageDetail.tripFacts.bestSeason || 'Oct - May');
        setStartingPoint(packageDetail.tripFacts.startingPoint || '');
        setEndingPoint(packageDetail.tripFacts.endingPoint || '');
      }
      if (packageDetail.seo) {
        setSeoTitle(packageDetail.seo.title || '');
        setMetaDescription(packageDetail.seo.metaDescription || '');
      }
      if (packageDetail.itinerary && packageDetail.itinerary.length > 0) {
        setItinerary(
          packageDetail.itinerary.map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            description: d.description,
            transport: d.transport || '',
            activities: Array.isArray(d.activities) ? d.activities.join(', ') : '',
            meals: d.meals || '',
            accommodation: d.stay || '',
            highlightPhotos: (d.media || []).map((m) => m.url),
          }))
        );
      }
      if (packageDetail.faqs && packageDetail.faqs.length > 0) {
        setFaqs(
          packageDetail.faqs.map((f, i) => ({
            id: f.id || `faq-${i}`,
            question: f.question,
            answer: f.answer,
          }))
        );
      }
    }
  }, [packageDetail]);

  if (!isOpen) return null;

  const toggleDayExpand = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setHighlights([...highlights, newHighlightInput.trim()]);
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleAddAmenity = () => {
    if (!newAmenityInput.trim()) return;
    setHotelAmenities([...hotelAmenities, newAmenityInput.trim()]);
    setNewAmenityInput('');
  };

  const handleRemoveAmenity = (idx: number) => {
    setHotelAmenities(hotelAmenities.filter((_, i) => i !== idx));
  };

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

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const selectedDest = destinationsData?.find((d) => d.id === destinationId) || destinationsData?.[0];
    if (!selectedDest) {
      toast.error('Please select a valid destination');
      return;
    }

    const daysMatch = duration.match(/(\d+)\s*Days?/i);
    const parsedDays = daysMatch ? parseInt(daysMatch[1]!, 10) : itinerary.length > 0 ? itinerary.length : 5;
    const nightsMatch = duration.match(/(\d+)\s*Nights?/i);
    const parsedNights = nightsMatch ? parseInt(nightsMatch[1]!, 10) : Math.max(0, parsedDays - 1);

    const payload: CreatePackageInput = {
      title: title.trim() || 'New Tour Package',
      slug: slug.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      destinationId: selectedDest.id,
      locationLabel: locationLabel.trim() || `${selectedDest.name}, ${country}`,
      country: country.trim() || 'India',
      days: parsedDays,
      nights: parsedNights,
      travelType: toTravelType(travelType),
      category: toPackageCategory(category),
      pricePaise: Math.round(Number(price) * 100),
      originalPricePaise: originalPrice ? Math.round(Number(originalPrice) * 100) : null,
      seatsAvailable: Number(seatsAvailable) || 10,
      status: toPackageStatus(status),
      isFeatured,
      featuredRank: isFeatured ? Number(featuredRank) : null,
      badgeLabel: badgeLabel.trim() || null,
      shortDescription: description.trim() || title,
      overview: overview.trim() || description.trim() || title,
      highlights: highlights.filter(Boolean),
      inclusions: inclusions.filter(Boolean),
      exclusions: exclusions.filter(Boolean),
      hotelName: hotelName.trim() || null,
      hotelStars: Number(hotelStars) || 4,
      hotelRoom: hotelRoom.trim() || null,
      hotelAmenities: hotelAmenities.filter(Boolean),
      tripFacts: {
        groupSize,
        languages,
        bestSeason,
        startingPoint,
        endingPoint,
      },
      coverMediaId: null,
      galleryMediaIds: [],
      themeIds: selectedThemeIds,
      itinerary: itinerary.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title,
        description: d.description,
        transport: d.transport || null,
        meals: d.meals || null,
        stay: d.accommodation || null,
        activities: d.activities
          ? d.activities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      })),
      faqs: faqs.map((f, idx) => ({
        question: f.question,
        answer: f.answer,
        sortOrder: idx + 1,
      })),
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
    };

    try {
      if (effectiveId) {
        await updateMutation.mutateAsync({ id: effectiveId, input: payload });
        toast.success('Tour package updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Tour package created successfully');
      }

      if (onSave) {
        onSave({
          id: effectiveId || `TR-${Date.now().toString().slice(-4)}`,
          title: title.trim(),
          destination: selectedDest.name,
          country,
          duration: `${parsedDays} Days / ${parsedNights} Nights`,
          price: Number(price),
          rating: 5,
          reviewsCount: 0,
          featuredImage,
          category,
          status,
          seatsAvailable: Number(seatsAvailable),
          description,
          highlights,
          itinerary,
          inclusions,
          exclusions,
          faqs,
        });
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save package';
      toast.error(msg);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
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
            {title || 'New Tour Package'}
          </span>
        </div>

        <div className="flex items-center gap-2">
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
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-5 py-1.5 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : effectiveId ? 'Save Changes' : 'Publish Tour Package'}</span>
          </button>
        </div>
      </div>

      <div
        className={`w-full rounded-[4px] border shadow-xs overflow-hidden ${theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
          }`}
      >
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
                {effectiveId ? `Edit Package: ${title}` : 'Add New Tour Package'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure itinerary, inclusions/exclusions, hotel & comprehensive descriptions
              </p>
            </div>
          </div>
        </div>

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
            <span>Overview, Hotel & Facts</span>
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

        <div className="flex-1 p-5 overflow-y-auto space-y-5">
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Auto-generated from title if blank"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Short catchy tag line"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Destination Territory *
                  </label>
                  <select
                    value={destinationId}
                    onChange={(e) => {
                      setDestinationId(e.target.value);
                      const found = destinationsData?.find((d) => d.id === e.target.value);
                      if (found) setDestination(found.name);
                    }}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold cursor-pointer ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    {(destinationsData || []).map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name} ({dest.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Location Label *
                  </label>
                  <input
                    type="text"
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="e.g. Port Blair & Havelock Island, Andaman"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

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
                    <option value="Luxury">Luxury Premium</option>
                    <option value="Honeymoon">Honeymoon Romantic</option>
                    <option value="Adventure">Adventure & Trek</option>
                    <option value="Cultural">Cultural Heritage</option>
                    <option value="Family">Family Vacation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Travel Type *
                  </label>
                  <select
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold cursor-pointer ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="honeymoon">Honeymoon</option>
                    <option value="leisure">Leisure</option>
                    <option value="adventure">Adventure</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tour Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Days / 5 Nights"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price per Guest (₹ INR) *
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Original Strike Price (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      value={originalPrice || ''}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      placeholder="Optional crossed out price"
                      className={`w-full pl-8 pr-3 py-2.5 text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>

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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={(e) => setBadgeLabel(e.target.value)}
                    placeholder="e.g. Bestseller, Couple Special"
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isFeaturedToggle"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isFeaturedToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Feature on Home & Catalog Bento Grid
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Associated Travel Themes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(themesData || []).map((t) => {
                      const isSelected = selectedThemeIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedThemeIds(selectedThemeIds.filter((id) => id !== t.id));
                            } else {
                              setSelectedThemeIds([...selectedThemeIds, t.id]);
                            }
                          }}
                          className={`px-3 py-1 rounded-[4px] text-xs font-semibold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

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

          {activeTab === 'about' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Short Description (Card previews)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short 1-2 sentence preview..."
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none leading-relaxed ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Comprehensive Overview (Full detail page)
                </label>
                <textarea
                  rows={4}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Detailed multi-paragraph description..."
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none leading-relaxed ${theme === 'dark'
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
                    placeholder="Add a new highlight..."
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

              <div className="p-4 rounded-[4px] border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Hotel & Accommodation Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Hotel Name</label>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder="e.g. Sea Shell Resort & Spa"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Stars (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={hotelStars}
                      onChange={(e) => setHotelStars(Number(e.target.value))}
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Room Category</label>
                    <input
                      type="text"
                      value={hotelRoom}
                      onChange={(e) => setHotelRoom(e.target.value)}
                      placeholder="e.g. Deluxe Ocean View Villa"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Hotel Amenities</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hotelAmenities.map((amenity, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {amenity}
                        <button type="button" onClick={() => handleRemoveAmenity(idx)} className="text-slate-400 hover:text-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAmenityInput}
                      onChange={(e) => setNewAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                      placeholder="Add amenity (e.g. Swimming Pool, Free Wi-Fi, Spa)..."
                      className={`flex-1 p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[4px] border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Trip Facts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Group Size</label>
                    <input
                      type="text"
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      placeholder="e.g. 2-12 travelers"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Languages</label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="e.g. English, Hindi"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Best Season</label>
                    <input
                      type="text"
                      value={bestSeason}
                      onChange={(e) => setBestSeason(e.target.value)}
                      placeholder="e.g. Oct - May"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Starting Point</label>
                    <input
                      type="text"
                      value={startingPoint}
                      onChange={(e) => setStartingPoint(e.target.value)}
                      placeholder="e.g. Port Blair Airport"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Ending Point</label>
                    <input
                      type="text"
                      value={endingPoint}
                      onChange={(e) => setEndingPoint(e.target.value)}
                      placeholder="e.g. Port Blair Airport"
                      className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Detailed Day-by-Day Itinerary Builder
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure day titles, descriptions, transport, activities, meals & accommodations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Next Day</span>
                </button>
              </div>

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
                      <div
                        onClick={() => toggleDayExpand(day.dayNumber)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer border-b transition-colors select-none ${theme === 'dark'
                          ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                          : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/60'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[4px] bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            D{day.dayNumber}
                          </span>
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {day.title || `Day ${day.dayNumber}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDay(day.dayNumber);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Day"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Day Title *
                            </label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => handleUpdateDay(idx, { title: e.target.value })}
                              placeholder="e.g. Arrival in Port Blair & Cellular Jail Memorial"
                              className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Day Activity Description
                            </label>
                            <textarea
                              rows={3}
                              value={day.description}
                              onChange={(e) => handleUpdateDay(idx, { description: e.target.value })}
                              placeholder="Describe activities, transfer details, visits..."
                              className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none leading-relaxed ${theme === 'dark'
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                            />
                          </div>

                          <div
                            className={`p-3.5 rounded-[4px] border space-y-2.5 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
                              }`}
                          >
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

          {activeTab === 'includes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-3">
                {faqs.map((faq) => {
                  const isFaqOpen = expandedFaqs[faq.id] ?? false;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-[4px] border overflow-hidden ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div
                        onClick={() =>
                          setExpandedFaqs((prev) => ({ ...prev, [faq.id]: !isFaqOpen }))
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
                          {isFaqOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isFaqOpen && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

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
              disabled={isSaving}
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : effectiveId ? 'Save Package Changes' : 'Publish Tour Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
