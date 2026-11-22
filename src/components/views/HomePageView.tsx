import React, { useState } from 'react';
import {
  Tag,
  Film,
  Palmtree,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  X,
  Play,
  MapPin,
  ArrowUp,
  ArrowDown,
  Ticket,
  Copy,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { ImageUploadField } from '../common/ImageUploadField';
import {
  useAdminCouponsQuery,
  useToggleCouponActiveMutation,
  useDeleteCouponMutation,
  type AdminCoupon,
} from '../../api/coupons';
import { CouponEditorModal } from './CouponEditorModal';
import { CouponRedemptionsDrawer } from './CouponRedemptionsDrawer';
import {
  useDestinationsQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useToggleDestinationActiveMutation,
  useDeleteDestinationMutation,
  useReorderDestinationsMutation,
  type AdminDestination,
} from '../../api/destinations';
import {
  useThemesQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useToggleThemeActiveMutation,
  useDeleteThemeMutation,
  useReorderThemesMutation,
  type AdminTheme,
} from '../../api/themes';
import {
  useOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useToggleOfferActiveMutation,
  useDeleteOfferMutation,
  useReorderOffersMutation,
  type AdminOffer,
} from '../../api/offers';
import {
  useVideosQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useToggleVideoActiveMutation,
  useDeleteVideoMutation,
  useReorderVideosMutation,
  type AdminVideo,
} from '../../api/videos';
import {
  useFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useToggleFaqActiveMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
  type AdminFaq,
  type FaqScope,
  type FaqCategory,
} from '../../api/faqs';

const formatFaqCategory = (cat: FaqCategory): string => {
  switch (cat) {
    case 'booking_payments':
      return 'Booking & Payments';
    case 'cancellation_refund':
      return 'Cancellation & Refund';
    case 'permits_guidelines':
      return 'Permits & Travel Guidelines';
    case 'general':
    default:
      return 'General';
  }
};

const mapFaqCategoryFilter = (cat: string): FaqCategory | undefined => {
  switch (cat) {
    case 'General':
      return 'general';
    case 'Booking & Payments':
      return 'booking_payments';
    case 'Cancellation & Refund':
      return 'cancellation_refund';
    case 'Permits & Travel Guidelines':
      return 'permits_guidelines';
    default:
      return undefined;
  }
};

const parseDurationToSeconds = (dur: string): number | null => {
  const trimmed = dur.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':').map((p) => Number(p));
  if (parts.length === 2 && !isNaN(parts[0]!) && !isNaN(parts[1]!)) {
    return parts[0]! * 60 + parts[1]!;
  }
  const num = Number(trimmed);
  return !isNaN(num) && num > 0 ? num : null;
};

const formatSecondsToDuration = (sec: number | null | undefined): string => {
  if (sec === null || sec === undefined || sec <= 0) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const HomePageView: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'offers' | 'videos' | 'destinations' | 'themes' | 'faqs' | 'coupons'>('destinations');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');
  const [faqScopeFilter, setFaqScopeFilter] = useState<'All' | 'general' | 'contact'>('All');

  const { data: destinations = [], isLoading: isDestinationsLoading } = useDestinationsQuery();
  const createDestinationMutation = useCreateDestinationMutation();
  const updateDestinationMutation = useUpdateDestinationMutation();
  const toggleDestinationActiveMutation = useToggleDestinationActiveMutation();
  const deleteDestinationMutation = useDeleteDestinationMutation();
  const reorderDestinationsMutation = useReorderDestinationsMutation();

  const { data: themes = [], isLoading: isThemesLoading } = useThemesQuery();
  const createThemeMutation = useCreateThemeMutation();
  const updateThemeMutation = useUpdateThemeMutation();
  const toggleThemeActiveMutation = useToggleThemeActiveMutation();
  const deleteThemeMutation = useDeleteThemeMutation();
  const reorderThemesMutation = useReorderThemesMutation();

  const { data: offers = [], isLoading: isOffersLoading } = useOffersQuery();
  const createOfferMutation = useCreateOfferMutation();
  const updateOfferMutation = useUpdateOfferMutation();
  const toggleOfferActiveMutation = useToggleOfferActiveMutation();
  const deleteOfferMutation = useDeleteOfferMutation();
  const reorderOffersMutation = useReorderOffersMutation();

  const { data: videos = [], isLoading: isVideosLoading } = useVideosQuery();
  const createVideoMutation = useCreateVideoMutation();
  const updateVideoMutation = useUpdateVideoMutation();
  const toggleVideoActiveMutation = useToggleVideoActiveMutation();
  const deleteVideoMutation = useDeleteVideoMutation();
  const reorderVideosMutation = useReorderVideosMutation();

  const { data: faqs = [], isLoading: isFaqsLoading } = useFaqsQuery({
    q: searchQuery.trim() || undefined,
    category: mapFaqCategoryFilter(faqCategoryFilter),
    scope: faqScopeFilter !== 'All' ? faqScopeFilter : undefined,
  });
  const createFaqMutation = useCreateFaqMutation();
  const updateFaqMutation = useUpdateFaqMutation();
  const toggleFaqActiveMutation = useToggleFaqActiveMutation();
  const deleteFaqMutation = useDeleteFaqMutation();
  const reorderFaqsMutation = useReorderFaqsMutation();

  const [couponSearch, setCouponSearch] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [couponPage, setCouponPage] = useState(1);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [isRedemptionsOpen, setIsRedemptionsOpen] = useState(false);
  const [selectedRedemptionCoupon, setSelectedRedemptionCoupon] = useState<AdminCoupon | null>(null);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  const { data: couponsData, isLoading: isCouponsLoading } = useAdminCouponsQuery({
    q: couponSearch.trim() || undefined,
    isActive: couponStatusFilter !== 'all' ? couponStatusFilter : undefined,
    page: couponPage,
    limit: 15,
  });
  const coupons = couponsData?.data ?? [];
  const couponsMeta = couponsData?.meta;
  const toggleCouponActiveMutation = useToggleCouponActiveMutation();
  const deleteCouponMutation = useDeleteCouponMutation();

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerBadgeLabel, setOfferBadgeLabel] = useState('');
  const [offerPhoto, setOfferPhoto] = useState('');
  const [offerPhotoMediaId, setOfferPhotoMediaId] = useState('');
  const [offerLink, setOfferLink] = useState('');
  const [offerValidFrom, setOfferValidFrom] = useState('');
  const [offerValidUntil, setOfferValidUntil] = useState('');
  const [offerIsActive, setOfferIsActive] = useState(true);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDestinationId, setVideoDestinationId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumb, setVideoThumb] = useState('');
  const [videoThumbMediaId, setVideoThumbMediaId] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoViewsLabel, setVideoViewsLabel] = useState('');
  const [videoIsActive, setVideoIsActive] = useState(true);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<AdminDestination | null>(null);
  const [destName, setDestName] = useState('');
  const [destSlug, setDestSlug] = useState('');
  const [destRegion, setDestRegion] = useState('');
  const [destCountry, setDestCountry] = useState('India');
  const [destContinent, setDestContinent] = useState('Asia');
  const [destSummary, setDestSummary] = useState('');
  const [destActivitiesLabel, setDestActivitiesLabel] = useState('');
  const [destHeroUrl, setDestHeroUrl] = useState('');
  const [destHeroMediaId, setDestHeroMediaId] = useState<string | null>(null);
  const [destIsFeatured, setDestIsFeatured] = useState(false);
  const [destIsVendorTerritory, setDestIsVendorTerritory] = useState(false);
  const [destIsActive, setDestIsActive] = useState(true);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<AdminTheme | null>(null);
  const [themeName, setThemeName] = useState('');
  const [themePhoto, setThemePhoto] = useState('');
  const [themePhotoMediaId, setThemePhotoMediaId] = useState<string | null>(null);
  const [themeLink, setThemeLink] = useState('');
  const [themeIsActive, setThemeIsActive] = useState(true);

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<AdminFaq | null>(null);
  const [faqScope, setFaqScope] = useState<FaqScope>('general');
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('general');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqIsActive, setFaqIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: 'Offer' | 'Video' | 'Destination' | 'Theme' | 'FAQ' | 'Coupon';
  } | null>(null);

  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: AdminCoupon) => {
    setEditingCoupon(c);
    setIsCouponModalOpen(true);
  };

  const handleOpenRedemptions = (c: AdminCoupon) => {
    setSelectedRedemptionCoupon(c);
    setIsRedemptionsOpen(true);
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    toast.success(`Copied "${code}" to clipboard`);
    setTimeout(() => {
      setCopiedCouponCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  const handleToggleCouponActive = (c: AdminCoupon) => {
    toggleCouponActiveMutation.mutate(
      { id: c.id, isActive: !c.isActive },
      {
        onSuccess: (updated) => {
          toast.success(`Coupon ${updated.code} is now ${updated.isActive ? 'active' : 'inactive'}`);
        },
        onError: () => toast.error('Failed to update coupon status'),
      },
    );
  };

  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferTitle('');
    setOfferBadgeLabel('');
    setOfferPhoto('');
    setOfferPhotoMediaId('');
    setOfferLink('');
    setOfferValidFrom('');
    setOfferValidUntil('');
    setOfferIsActive(true);
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: AdminOffer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title);
    setOfferBadgeLabel(offer.badgeLabel ?? '');
    setOfferPhoto(offer.photoUrl ?? '');
    setOfferPhotoMediaId(offer.photoMediaId);
    setOfferLink(offer.linkUrl);
    setOfferValidFrom(offer.validFrom ?? '');
    setOfferValidUntil(offer.validUntil ?? '');
    setOfferIsActive(offer.isActive);
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerLink.trim() || !offerPhotoMediaId) {
      toast.error('Please fill all required fields and upload a banner image');
      return;
    }

    const payload = {
      title: offerTitle.trim(),
      badgeLabel: offerBadgeLabel.trim() || null,
      photoMediaId: offerPhotoMediaId,
      linkUrl: offerLink.trim(),
      validFrom: offerValidFrom.trim() || null,
      validUntil: offerValidUntil.trim() || null,
      isActive: offerIsActive,
      displayOrder: editingOffer ? editingOffer.displayOrder : offers.length + 1,
    };

    if (editingOffer) {
      updateOfferMutation.mutate(
        { id: editingOffer.id, input: payload },
        {
          onSuccess: () => {
            toast.success('Offer banner updated successfully');
            setIsOfferModalOpen(false);
          },
          onError: () => toast.error('Failed to update offer banner'),
        },
      );
    } else {
      createOfferMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Offer banner created successfully');
          setIsOfferModalOpen(false);
        },
        onError: () => toast.error('Failed to create offer banner'),
      });
    }
  };

  const handleMoveOffer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= offers.length) return;
    const current = offers[index];
    const target = offers[targetIndex];
    if (!current || !target) return;

    reorderOffersMutation.mutate(
      [
        { id: current.id, displayOrder: target.displayOrder },
        { id: target.id, displayOrder: current.displayOrder },
      ],
      {
        onSuccess: () => toast.success('Offers reordered'),
        onError: () => toast.error('Failed to reorder offers'),
      },
    );
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoTitle('');
    setVideoDestinationId(destinations[0]?.id ?? '');
    setVideoUrl('');
    setVideoThumb('');
    setVideoThumbMediaId('');
    setVideoDuration('');
    setVideoViewsLabel('');
    setVideoIsActive(true);
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: AdminVideo) => {
    setEditingVideo(v);
    setVideoTitle(v.title);
    setVideoDestinationId(v.destinationId ?? '');
    setVideoUrl(v.videoUrl ?? '');
    setVideoThumb(v.thumbnailUrl ?? '');
    setVideoThumbMediaId(v.thumbnailMediaId ?? '');
    setVideoDuration(formatSecondsToDuration(v.durationSeconds));
    setVideoViewsLabel(v.viewsLabel ?? '');
    setVideoIsActive(v.isActive);
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      toast.error('Video title is required');
      return;
    }

    const payload = {
      title: videoTitle.trim(),
      destinationId: videoDestinationId.trim() || null,
      videoUrl: videoUrl.trim() || null,
      thumbnailMediaId: videoThumbMediaId.trim() || null,
      durationSeconds: parseDurationToSeconds(videoDuration),
      viewsLabel: videoViewsLabel.trim() || null,
      isActive: videoIsActive,
      displayOrder: editingVideo ? editingVideo.displayOrder : videos.length + 1,
    };

    if (editingVideo) {
      updateVideoMutation.mutate(
        { id: editingVideo.id, input: payload },
        {
          onSuccess: () => {
            toast.success('Video updated successfully');
            setIsVideoModalOpen(false);
          },
          onError: () => toast.error('Failed to update video'),
        },
      );
    } else {
      createVideoMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Video created successfully');
          setIsVideoModalOpen(false);
        },
        onError: () => toast.error('Failed to create video'),
      });
    }
  };

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    const current = videos[index];
    const target = videos[targetIndex];
    if (!current || !target) return;

    reorderVideosMutation.mutate(
      [
        { id: current.id, displayOrder: target.displayOrder },
        { id: target.id, displayOrder: current.displayOrder },
      ],
      {
        onSuccess: () => toast.success('Videos reordered'),
        onError: () => toast.error('Failed to reorder videos'),
      },
    );
  };

  const handleOpenAddDestination = () => {
    setEditingDestination(null);
    setDestName('');
    setDestSlug('');
    setDestRegion('');
    setDestCountry('India');
    setDestContinent('Asia');
    setDestSummary('');
    setDestActivitiesLabel('');
    setDestHeroUrl('');
    setDestHeroMediaId(null);
    setDestIsFeatured(false);
    setDestIsVendorTerritory(false);
    setDestIsActive(true);
    setIsDestinationModalOpen(true);
  };

  const handleOpenEditDestination = (dest: AdminDestination) => {
    setEditingDestination(dest);
    setDestName(dest.name);
    setDestSlug(dest.slug);
    setDestRegion(dest.region);
    setDestCountry(dest.country);
    setDestContinent(dest.continent);
    setDestSummary(dest.summary ?? '');
    setDestActivitiesLabel(dest.activitiesLabel ?? '');
    setDestHeroUrl(dest.heroImageUrl ?? '');
    setDestHeroMediaId(dest.heroMediaId);
    setDestIsFeatured(dest.isFeatured);
    setDestIsVendorTerritory(dest.isVendorTerritory);
    setDestIsActive(dest.isActive);
    setIsDestinationModalOpen(true);
  };

  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName.trim() || !destRegion.trim()) return;

    const payload = {
      name: destName.trim(),
      slug: destSlug.trim() || undefined,
      region: destRegion.trim(),
      country: destCountry.trim() || 'India',
      continent: destContinent.trim() || 'Asia',
      summary: destSummary.trim() || null,
      activitiesLabel: destActivitiesLabel.trim() || null,
      heroMediaId: destHeroMediaId,
      isFeatured: destIsFeatured,
      isVendorTerritory: destIsVendorTerritory,
      isActive: destIsActive,
      displayOrder: editingDestination ? editingDestination.displayOrder : destinations.length + 1,
    };

    if (editingDestination) {
      updateDestinationMutation.mutate(
        { id: editingDestination.id, input: payload },
        {
          onSuccess: () => {
            toast.success('Destination updated successfully');
            setIsDestinationModalOpen(false);
          },
          onError: () => toast.error('Failed to update destination'),
        },
      );
    } else {
      createDestinationMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Destination created successfully');
          setIsDestinationModalOpen(false);
        },
        onError: () => toast.error('Failed to create destination'),
      });
    }
  };

  const handleMoveDestination = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= destinations.length) return;
    const current = destinations[index];
    const target = destinations[targetIndex];
    if (!current || !target) return;

    reorderDestinationsMutation.mutate(
      [
        { id: current.id, displayOrder: target.displayOrder },
        { id: target.id, displayOrder: current.displayOrder },
      ],
      {
        onSuccess: () => toast.success('Destinations reordered'),
        onError: () => toast.error('Failed to reorder destinations'),
      },
    );
  };

  const handleOpenAddTheme = () => {
    setEditingTheme(null);
    setThemeName('');
    setThemePhoto('');
    setThemePhotoMediaId(null);
    setThemeLink('');
    setThemeIsActive(true);
    setIsThemeModalOpen(true);
  };

  const handleOpenEditTheme = (thm: AdminTheme) => {
    setEditingTheme(thm);
    setThemeName(thm.name);
    setThemePhoto(thm.photoUrl ?? '');
    setThemePhotoMediaId(thm.photoMediaId);
    setThemeLink(thm.linkUrl ?? '');
    setThemeIsActive(thm.isActive);
    setIsThemeModalOpen(true);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) return;

    const payload = {
      name: themeName.trim(),
      photoMediaId: themePhotoMediaId,
      linkUrl: themeLink.trim() || null,
      isActive: themeIsActive,
      displayOrder: editingTheme ? editingTheme.displayOrder : themes.length + 1,
    };

    if (editingTheme) {
      updateThemeMutation.mutate(
        { id: editingTheme.id, input: payload },
        {
          onSuccess: () => {
            toast.success('Travel theme updated successfully');
            setIsThemeModalOpen(false);
          },
          onError: () => toast.error('Failed to update theme'),
        },
      );
    } else {
      createThemeMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Travel theme created successfully');
          setIsThemeModalOpen(false);
        },
        onError: () => toast.error('Failed to create theme'),
      });
    }
  };

  const handleMoveTheme = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= themes.length) return;
    const current = themes[index];
    const target = themes[targetIndex];
    if (!current || !target) return;

    reorderThemesMutation.mutate(
      [
        { id: current.id, displayOrder: target.displayOrder },
        { id: target.id, displayOrder: current.displayOrder },
      ],
      {
        onSuccess: () => toast.success('Travel themes reordered'),
        onError: () => toast.error('Failed to reorder themes'),
      },
    );
  };

  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqScope('general');
    setFaqCategory('general');
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqIsActive(true);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: AdminFaq) => {
    setEditingFaq(faq);
    setFaqScope(faq.scope);
    setFaqCategory(faq.category);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqIsActive(faq.isActive);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    const payload = {
      scope: faqScope,
      category: faqCategory,
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      isActive: faqIsActive,
      displayOrder: editingFaq ? editingFaq.displayOrder : faqs.length + 1,
    };

    if (editingFaq) {
      updateFaqMutation.mutate(
        { id: editingFaq.id, input: payload },
        {
          onSuccess: () => {
            toast.success('FAQ updated successfully');
            setIsFaqModalOpen(false);
          },
          onError: () => toast.error('Failed to update FAQ'),
        },
      );
    } else {
      createFaqMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('FAQ created successfully');
          setIsFaqModalOpen(false);
        },
        onError: () => toast.error('Failed to create FAQ'),
      });
    }
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    const current = faqs[index];
    const target = faqs[targetIndex];
    if (!current || !target) return;

    reorderFaqsMutation.mutate(
      [
        { id: current.id, displayOrder: target.displayOrder },
        { id: target.id, displayOrder: current.displayOrder },
      ],
      {
        onSuccess: () => toast.success('FAQs reordered'),
        onError: () => toast.error('Failed to reorder FAQs'),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'Offer') {
      deleteOfferMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('Offer removed'),
        onError: () => toast.error('Failed to remove offer'),
      });
    } else if (deleteTarget.type === 'Video') {
      deleteVideoMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('Video removed from slider'),
        onError: () => toast.error('Failed to remove video'),
      });
    } else if (deleteTarget.type === 'Destination') {
      deleteDestinationMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('Destination deleted'),
        onError: () => toast.error('Failed to delete destination'),
      });
    } else if (deleteTarget.type === 'Theme') {
      deleteThemeMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('Travel theme deleted'),
        onError: () => toast.error('Failed to delete theme'),
      });
    } else if (deleteTarget.type === 'FAQ') {
      deleteFaqMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('FAQ deleted'),
        onError: () => toast.error('Failed to delete FAQ'),
      });
    } else if (deleteTarget.type === 'Coupon') {
      deleteCouponMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success('Coupon deleted'),
        onError: () => toast.error('Failed to delete coupon'),
      });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div
        className={`p-5 rounded-[4px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Home Page Website Management
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Manage FAQs, promotional discount banners, trending video slider, destinations, and travel themes shown directly on the KrikoTrip home page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'offers' && (
            <button
              onClick={handleOpenAddOffer}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Discount Offer</span>
            </button>
          )}
          {activeTab === 'videos' && (
            <button
              onClick={handleOpenAddVideo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trending Video</span>
            </button>
          )}
          {activeTab === 'destinations' && (
            <button
              onClick={handleOpenAddDestination}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination</span>
            </button>
          )}
          {activeTab === 'themes' && (
            <button
              onClick={handleOpenAddTheme}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Travel Theme</span>
            </button>
          )}
          {activeTab === 'faqs' && (
            <button
              onClick={handleOpenAddFaq}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Home FAQ</span>
            </button>
          )}
          {activeTab === 'coupons' && (
            <button
              onClick={handleOpenAddCoupon}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          )}
        </div>
      </div>

      <div
        className={`p-1.5 rounded-[4px] border flex flex-wrap items-center gap-2 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discount Offers &amp; Banners ({offers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Trending Video Slider ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'destinations'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Destinations ({destinations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'themes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palmtree className="w-4 h-4" />
          <span>Travel Themes ({themes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Home Page FAQs ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Discount Coupons ({couponsMeta?.total ?? coupons.length})</span>
        </button>
      </div>

      {activeTab === 'offers' && (
        <div className="space-y-4">
          {isOffersLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-[4px] border-slate-300 dark:border-slate-700">
              No promotional offers found. Click &quot;Add Discount Offer&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={`rounded-[4px] border overflow-hidden flex flex-col justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={offer.photoUrl || ''}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold tracking-wider uppercase shadow-xs ${
                          offer.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    {offer.badgeLabel && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          {offer.badgeLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold line-clamp-1 text-slate-900 dark:text-white">
                        {offer.title}
                      </h4>
                      <div className="p-2 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                        <span className="truncate pr-2">{offer.linkUrl}</span>
                        <a
                          href={offer.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 hover:text-blue-700 p-0.5"
                          title="Test destination link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offer.isActive}
                        onClick={() =>
                          toggleOfferActiveMutation.mutate(
                            { id: offer.id, isActive: !offer.isActive },
                            {
                              onSuccess: () =>
                                toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'}`),
                              onError: () => toast.error('Failed to toggle offer status'),
                            },
                          )
                        }
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            offer.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              offer.isActive ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {offer.isActive ? 'Active' : 'Off'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveOffer(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOffer(index, 'down')}
                          disabled={index === offers.length - 1}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditOffer(offer)}
                          className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit offer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: offer.id,
                              title: offer.title,
                              type: 'Offer',
                            })
                          }
                          className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete offer banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {isVideosLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-[4px] border-slate-300 dark:border-slate-700">
              No trending videos found. Click &quot;Add Trending Video&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`rounded-[4px] border overflow-hidden flex flex-col justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {video.videoUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewVideoUrl(video.videoUrl)}
                          className="w-10 h-10 rounded-full bg-white/90 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg"
                          title="Preview video"
                        >
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </button>
                      </div>
                    )}
                    {video.destinationName && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                          {video.destinationName}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] text-white bg-black/70 px-1.5 py-0.5 rounded-[3px] backdrop-blur-xs">
                      {video.durationSeconds && (
                        <>
                          <span>{formatSecondsToDuration(video.durationSeconds)}</span>
                          {video.viewsLabel && <span>•</span>}
                        </>
                      )}
                      {video.viewsLabel && <span>{video.viewsLabel}</span>}
                    </div>
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <h4 className="text-sm font-semibold line-clamp-1 text-slate-900 dark:text-white">
                      {video.title}
                    </h4>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={video.isActive}
                        onClick={() =>
                          toggleVideoActiveMutation.mutate(
                            { id: video.id, isActive: !video.isActive },
                            {
                              onSuccess: () =>
                                toast.success(`Video ${video.isActive ? 'deactivated' : 'activated'}`),
                              onError: () => toast.error('Failed to toggle video status'),
                            },
                          )
                        }
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            video.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              video.isActive ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {video.isActive ? 'Active' : 'Off'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveVideo(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveVideo(index, 'down')}
                          disabled={index === videos.length - 1}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(video)}
                          className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit video"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: video.id,
                              title: video.title,
                              type: 'Video',
                            })
                          }
                          className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="space-y-4">
          {isDestinationsLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading destinations...</div>
          ) : destinations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-[4px] border-slate-300 dark:border-slate-700">
              No destinations found. Click &quot;Add Destination&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {destinations.map((dest, index) => (
                <div
                  key={dest.id}
                  className={`rounded-[4px] border overflow-hidden flex flex-col justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={dest.heroImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                      <span className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                        {dest.name}
                      </span>
                      <span className="text-slate-200 text-xs drop-shadow-xs">
                        {dest.region}, {dest.country}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {dest.isFeatured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Featured
                          </span>
                        )}
                        {dest.isVendorTerritory && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Vendor Territory
                          </span>
                        )}
                        {dest.activitiesLabel && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {dest.activitiesLabel}
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                        <span className="truncate pr-2">
                          /tour-packages?destination={dest.slug}
                        </span>
                        <a
                          href={`/tour-packages?destination=${dest.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 hover:text-blue-700 p-0.5"
                          title="View destination tours"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={dest.isActive}
                        onClick={() =>
                          toggleDestinationActiveMutation.mutate(
                            { id: dest.id, isActive: !dest.isActive },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `Destination ${dest.isActive ? 'deactivated' : 'activated'}`,
                                ),
                              onError: () =>
                                toast.error('Failed to toggle status'),
                            },
                          )
                        }
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            dest.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              dest.isActive ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {dest.isActive ? 'Active' : 'Off'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveDestination(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDestination(index, 'down')}
                          disabled={index === destinations.length - 1}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditDestination(dest)}
                          className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit destination"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: dest.id,
                              title: dest.name,
                              type: 'Destination',
                            })
                          }
                          className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete destination"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'themes' && (
        <div className="space-y-4">
          {isThemesLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading travel themes...</div>
          ) : themes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-[4px] border-slate-300 dark:border-slate-700">
              No travel themes found. Click &quot;Add Travel Theme&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {themes.map((thm, index) => (
                <div
                  key={thm.id}
                  className={`rounded-[4px] border overflow-hidden flex flex-col justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={thm.photoUrl || 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80'}
                      alt={thm.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                        {thm.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="p-2 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                      <span className="truncate pr-2">
                        {thm.effectiveLinkUrl}
                      </span>
                      <a
                        href={thm.effectiveLinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 hover:text-blue-700 p-0.5"
                        title="Test link destination"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={thm.isActive}
                        onClick={() =>
                          toggleThemeActiveMutation.mutate(
                            { id: thm.id, isActive: !thm.isActive },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `Theme ${thm.isActive ? 'deactivated' : 'activated'}`,
                                ),
                              onError: () => toast.error('Failed to toggle status'),
                            },
                          )
                        }
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            thm.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              thm.isActive ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {thm.isActive ? 'Active' : 'Off'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveTheme(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTheme(index, 'down')}
                          disabled={index === themes.length - 1}
                          className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditTheme(thm)}
                          className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit photo, name & link"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: thm.id,
                              title: thm.name,
                              type: 'Theme',
                            })
                          }
                          className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete theme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'faqs' && (
        <div
          className={`rounded-[4px] border overflow-hidden shadow-xs ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs by question or answer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                {(['All', 'general', 'contact'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setFaqScopeFilter(sc)}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                      faqScopeFilter === sc
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sc === 'All' ? 'All Scopes' : sc === 'general' ? 'General' : 'Contact'}
                  </button>
                ))}
              </div>

              {['All', 'General', 'Booking & Payments', 'Cancellation & Refund', 'Permits & Travel Guidelines'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    faqCategoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isFaqsLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No FAQs match your search or filter criteria.
              </div>
            ) : (
              faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
                        {faq.scope === 'contact' ? 'Contact Us' : 'General Site'}
                      </span>
                      <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                        {formatFaqCategory(faq.category)}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          faq.isActive ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                      >
                        {faq.isActive ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={faq.isActive}
                      onClick={() =>
                        toggleFaqActiveMutation.mutate(
                          { id: faq.id, isActive: !faq.isActive },
                          {
                            onSuccess: () =>
                              toast.success(`FAQ ${faq.isActive ? 'hidden' : 'live'}`),
                            onError: () => toast.error('Failed to toggle FAQ status'),
                          },
                        )
                      }
                      className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-500"
                    >
                      <span
                        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          faq.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            faq.isActive ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>

                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                      <button
                        type="button"
                        onClick={() => handleMoveFaq(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveFaq(index, 'down')}
                        disabled={index === faqs.length - 1}
                        className="p-1 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditFaq(faq)}
                        className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit question & answer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: faq.id,
                            title: faq.question,
                            type: 'FAQ',
                          })
                        }
                        className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-[4px] border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={couponSearch}
                onChange={(e) => {
                  setCouponSearch(e.target.value);
                  setCouponPage(1);
                }}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={couponStatusFilter}
                onChange={(e) => {
                  setCouponStatusFilter(e.target.value as 'all' | 'true' | 'false');
                  setCouponPage(1);
                }}
                className={`p-2 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>

              {(couponSearch || couponStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setCouponSearch('');
                    setCouponStatusFilter('all');
                    setCouponPage(1);
                  }}
                  className="p-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div
            className={`rounded-[4px] border overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {isCouponsLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading discount coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No coupons found matching your criteria. Click &quot;Add Coupon&quot; above to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Validity</th>
                      <th className="p-3">Usage / Limits</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3">Visibility</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {coupons.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold tracking-wider text-xs">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCouponCode(c.code)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-[3px] cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedCouponCode === c.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {c.description && (
                            <span className="text-[11px] text-slate-500 block mt-1 line-clamp-1 max-w-xs">
                              {c.description}
                            </span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                            {c.discountType === 'percent'
                              ? `${c.discountValue}% OFF`
                              : `₹${Number(c.discountValue).toLocaleString('en-IN')} OFF`}
                          </span>
                          {c.discountType === 'percent' && c.maxDiscountPaise !== null && (
                            <span className="text-[10px] text-slate-500 block">
                              Max ₹{Math.round(c.maxDiscountPaise / 100).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {c.minOrderPaise !== null ? (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              ₹{Math.round(c.minOrderPaise / 100).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {c.validFrom || c.validUntil ? (
                            <div className="space-y-0.5 text-[11px]">
                              {c.validFrom && (
                                <div className="text-slate-500">
                                  From:{' '}
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                    {new Date(c.validFrom).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                              )}
                              {c.validUntil && (
                                <div className="text-slate-500">
                                  Until:{' '}
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                    {new Date(c.validUntil).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No expiration</span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold block">
                            {c.usedCount} / {c.usageLimit !== null ? c.usageLimit : '∞'} used
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {c.perUserLimit !== null ? `Max ${c.perUserLimit} / user` : 'No user limit'}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {c.appliesTo === 'all' ? (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              All Packages
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {c.packageIds.length} Packages
                            </span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {c.isPublic ? (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Public
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Hidden
                            </span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={c.isActive}
                            onClick={() => handleToggleCouponActive(c)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              c.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                c.isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="p-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRedemptions(c)}
                              className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Redemptions"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditCoupon(c)}
                              className="p-1.5 rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  id: c.id,
                                  title: c.code,
                                  type: 'Coupon',
                                })
                              }
                              className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {couponsMeta && couponsMeta.totalPages > 1 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page {couponsMeta.page} of {couponsMeta.totalPages} ({couponsMeta.total} coupons)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={couponsMeta.page <= 1}
                    onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={couponsMeta.page >= couponsMeta.totalPages}
                    onClick={() => setCouponPage((p) => Math.min(couponsMeta.totalPages, p + 1))}
                    className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingOffer ? 'Edit Promotional Banner' : 'Add New Promotional Banner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive Tour Package Offer"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Badge Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLAT 25% OFF, SAVE ₹3,500"
                  value={offerBadgeLabel}
                  onChange={(e) => setOfferBadgeLabel(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <ImageUploadField
                label="Offer Banner Graphic (16:9) *"
                value={offerPhoto}
                onChange={(url, mediaId) => {
                  setOfferPhoto(url);
                  if (mediaId) setOfferPhotoMediaId(mediaId);
                }}
                aspectRatio="16/9"
                placeholder="Choose Offer Photo or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Destination URL Link *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/tour-packages or https://..."
                  value={offerLink}
                  onChange={(e) => setOfferLink(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Valid From (Optional)
                  </label>
                  <input
                    type="date"
                    value={offerValidFrom}
                    onChange={(e) => setOfferValidFrom(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={offerValidUntil}
                    onChange={(e) => setOfferValidUntil(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingOffer ? 'Save Banner' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingVideo ? 'Edit Trending Video' : 'Add New Trending Video'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Video Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving with Turtles in Havelock Island"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Destination (Optional)
                </label>
                <select
                  value={videoDestinationId}
                  onChange={(e) => setVideoDestinationId(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">No specific destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Direct Video MP4 URL
                </label>
                <input
                  type="url"
                  placeholder="https://assets.mixkit.co/... or CDN MP4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <ImageUploadField
                label="Video Cover Thumbnail Photo"
                value={videoThumb}
                onChange={(url, mediaId) => {
                  setVideoThumb(url);
                  if (mediaId) setVideoThumbMediaId(mediaId);
                }}
                aspectRatio="16/9"
                placeholder="Choose Thumbnail Photo or Drag & Drop"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Duration (e.g. 0:45)
                  </label>
                  <input
                    type="text"
                    placeholder="0:45"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Views Count Label (e.g. 10K views)
                  </label>
                  <input
                    type="text"
                    placeholder="10K views"
                    value={videoViewsLabel}
                    onChange={(e) => setVideoViewsLabel(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingVideo ? 'Save Video' : 'Add to Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDestinationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDestinationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kashmir Valley"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={destSlug}
                    onChange={(e) => setDestSlug(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Region (State/UT) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jammu and Kashmir"
                    value={destRegion}
                    onChange={(e) => setDestRegion(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={destCountry}
                    onChange={(e) => setDestCountry(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Continent
                  </label>
                  <input
                    type="text"
                    value={destContinent}
                    onChange={(e) => setDestContinent(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <ImageUploadField
                label="Destination Hero Banner (4:3) *"
                value={destHeroUrl}
                onChange={(url, mediaId) => {
                  setDestHeroUrl(url);
                  if (mediaId) setDestHeroMediaId(mediaId);
                }}
                aspectRatio="4/3"
                placeholder="Choose Destination Photo or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Activities Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15+ Tours, Trekking & Shikara"
                  value={destActivitiesLabel}
                  onChange={(e) => setDestActivitiesLabel(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Destination Summary / Tagline
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief highlight of the destination..."
                  value={destSummary}
                  onChange={(e) => setDestSummary(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destIsFeatured}
                    onChange={(e) => setDestIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Featured Destination (Home Page Carousel)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destIsVendorTerritory}
                    onChange={(e) => setDestIsVendorTerritory(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Vendor Partner Territory
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDestinationModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDestinationMutation.isPending || updateDestinationMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingDestination ? 'Save Destination' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingTheme ? 'Edit Travel Theme' : 'Add New Travel Theme'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Theme Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honeymoon Special, Wildlife Safari"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <ImageUploadField
                label="Theme Cover Photo (4:3) *"
                value={themePhoto}
                onChange={(url, mediaId) => {
                  setThemePhoto(url);
                  if (mediaId) setThemePhotoMediaId(mediaId);
                }}
                aspectRatio="4/3"
                placeholder="Choose Theme Photo or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Custom Destination URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Default: /tour-packages?theme=<slug>"
                  value={themeLink}
                  onChange={(e) => setThemeLink(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsThemeModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createThemeMutation.isPending || updateThemeMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingTheme ? 'Save Theme' : 'Create Travel Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingFaq ? 'Edit Home Page FAQ' : 'Add New Home Page FAQ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    FAQ Scope *
                  </label>
                  <select
                    value={faqScope}
                    onChange={(e) => setFaqScope(e.target.value as FaqScope)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="general">General Site</option>
                    <option value="contact">Contact Us Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    FAQ Category *
                  </label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value as FaqCategory)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="general">General</option>
                    <option value="booking_payments">Booking &amp; Payments</option>
                    <option value="cancellation_refund">Cancellation &amp; Refund</option>
                    <option value="permits_guidelines">Permits &amp; Travel Guidelines</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does customized package booking work?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clear and detailed answer for travelers..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingFaq ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewVideoUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-black rounded-[4px] overflow-hidden relative shadow-2xl">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="w-full h-auto aspect-16/9 object-contain bg-black"
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          itemName={deleteTarget.title}
          itemType={deleteTarget.type}
          warningMessage="This content item will be permanently removed from the live KrikoTrip home page."
        />
      )}

      <CouponEditorModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupon={editingCoupon}
      />

      <CouponRedemptionsDrawer
        isOpen={isRedemptionsOpen}
        onClose={() => setIsRedemptionsOpen(false)}
        coupon={selectedRedemptionCoupon}
      />
    </div>
  );
};
