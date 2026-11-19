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
} from 'lucide-react';
import type { DiscountOffer, TrendingVideo, TravelTheme, HomePageFaq } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { ImageUploadField } from '../common/ImageUploadField';

interface HomePageViewProps {
  discountOffers: DiscountOffer[];
  onAddOffer: (offer: DiscountOffer) => void;
  onUpdateOffer: (offer: DiscountOffer) => void;
  onDeleteOffer: (id: string) => void;
  onToggleOfferStatus: (id: string) => void;

  trendingVideos: TrendingVideo[];
  onAddVideo: (video: TrendingVideo) => void;
  onUpdateVideo: (video: TrendingVideo) => void;
  onDeleteVideo: (id: string) => void;
  onToggleVideoStatus: (id: string) => void;

  travelThemes: TravelTheme[];
  onAddTheme: (theme: TravelTheme) => void;
  onUpdateTheme: (theme: TravelTheme) => void;
  onDeleteTheme: (id: string) => void;
  onToggleThemeStatus: (id: string) => void;

  homePageFaqs: HomePageFaq[];
  onAddFaq: (faq: HomePageFaq) => void;
  onUpdateFaq: (faq: HomePageFaq) => void;
  onDeleteFaq: (id: string) => void;
  onToggleFaqStatus: (id: string) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  discountOffers,
  onAddOffer,
  onUpdateOffer,
  onDeleteOffer,
  onToggleOfferStatus,

  trendingVideos,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onToggleVideoStatus,

  travelThemes,
  onAddTheme,
  onUpdateTheme,
  onDeleteTheme,
  onToggleThemeStatus,

  homePageFaqs,
  onAddFaq,
  onUpdateFaq,
  onDeleteFaq,
  onToggleFaqStatus,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'offers' | 'videos' | 'themes' | 'faqs'>('offers');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DiscountOffer | null>(null);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrendingVideo | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<TravelTheme | null>(null);

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<HomePageFaq | null>(null);

  // Generic delete modal target
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: 'Offer' | 'Video' | 'Theme' | 'FAQ';
  } | null>(null);

  // Form States - Offer (Photo and Link)
  const [offerPhoto, setOfferPhoto] = useState('');
  const [offerLink, setOfferLink] = useState('');

  // Form States - Video Slider
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumb, setVideoThumb] = useState('');
  const [videoDestination, setVideoDestination] = useState('Kashmir');

  // Form States - Theme (Image, Name, and URL Link)
  const [themeName, setThemeName] = useState('');
  const [themePhoto, setThemePhoto] = useState('');
  const [themeLink, setThemeLink] = useState('');

  // Form States - FAQ
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState<HomePageFaq['category']>('General');

  // Open Handlers
  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferPhoto('');
    setOfferLink('');
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: DiscountOffer) => {
    setEditingOffer(offer);
    setOfferPhoto(offer.photoUrl);
    setOfferLink(offer.linkUrl);
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPhoto.trim() || !offerLink.trim()) return;

    if (editingOffer) {
      onUpdateOffer({
        ...editingOffer,
        title: 'Home Banner',
        photoUrl: offerPhoto.trim(),
        linkUrl: offerLink.trim(),
        discountBadge: undefined,
      });
    } else {
      const newOffer: DiscountOffer = {
        id: `off-${Date.now()}`,
        title: 'Home Banner',
        photoUrl: offerPhoto.trim(),
        linkUrl: offerLink.trim(),
        discountBadge: undefined,
        isActive: true,
      };
      onAddOffer(newOffer);
    }
    setIsOfferModalOpen(false);
  };

  // Video Handlers
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoTitle('');
    setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-a-boat-on-a-river-42777-large.mp4');
    setVideoThumb('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80');
    setVideoDestination('Kashmir');
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: TrendingVideo) => {
    setEditingVideo(v);
    setVideoTitle(v.title);
    setVideoUrl(v.videoUrl);
    setVideoThumb(v.thumbnailUrl);
    setVideoDestination(v.destination);
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    if (editingVideo) {
      onUpdateVideo({
        ...editingVideo,
        title: videoTitle.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: videoThumb.trim() || 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
        destination: videoDestination,
      });
    } else {
      const newVid: TrendingVideo = {
        id: `vid-${Date.now()}`,
        title: videoTitle.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: videoThumb.trim() || 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
        destination: videoDestination,
        duration: '0:45',
        viewsCount: '10K views',
        isActive: true,
        order: trendingVideos.length + 1,
      };
      onAddVideo(newVid);
    }
    setIsVideoModalOpen(false);
  };

  // Theme Handlers
  const handleOpenAddTheme = () => {
    setEditingTheme(null);
    setThemeName('');
    setThemePhoto('');
    setThemeLink('');
    setIsThemeModalOpen(true);
  };

  const handleOpenEditTheme = (thm: TravelTheme) => {
    setEditingTheme(thm);
    setThemeName(thm.name);
    setThemePhoto(thm.photoUrl);
    setThemeLink(thm.linkUrl || '');
    setIsThemeModalOpen(true);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim() || !themePhoto.trim()) return;

    if (editingTheme) {
      onUpdateTheme({
        ...editingTheme,
        name: themeName.trim(),
        photoUrl: themePhoto.trim(),
        linkUrl: themeLink.trim() || `/packages?theme=${encodeURIComponent(themeName.toLowerCase())}`,
      });
    } else {
      const newTheme: TravelTheme = {
        id: `thm-${Date.now()}`,
        name: themeName.trim(),
        photoUrl: themePhoto.trim(),
        linkUrl: themeLink.trim() || `/packages?theme=${encodeURIComponent(themeName.toLowerCase())}`,
        isActive: true,
      };
      onAddTheme(newTheme);
    }
    setIsThemeModalOpen(false);
  };

  // FAQ Handlers
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('General');
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: HomePageFaq) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    if (editingFaq) {
      onUpdateFaq({
        ...editingFaq,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory,
      });
    } else {
      const newFaq: HomePageFaq = {
        id: `hfaq-${Date.now()}`,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory,
        displayOrder: homePageFaqs.length + 1,
        isActive: true,
      };
      onAddFaq(newFaq);
    }
    setIsFaqModalOpen(false);
  };

  // Generic Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'Offer') onDeleteOffer(deleteTarget.id);
    if (deleteTarget.type === 'Video') onDeleteVideo(deleteTarget.id);
    if (deleteTarget.type === 'Theme') onDeleteTheme(deleteTarget.id);
    if (deleteTarget.type === 'FAQ') onDeleteFaq(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div
        className={`p-5 rounded-[4px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Home Page Website Management
            </h2>

          </div>
          <p className="text-xs text-slate-500">
            Manage FAQs, promotional discount banners (photo & link), trending video slider, and travel themes shown directly on the KrikoTrip home page.
          </p>
        </div>

        {/* Action Button based on active tab */}
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
        </div>
      </div>

      {/* 4 Main Tabs Bar */}
      <div
        className={`p-1.5 rounded-[4px] border flex flex-wrap items-center gap-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'offers'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discount Offers & Banners ({discountOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'videos'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Film className="w-4 h-4" />
          <span>Trending Video Slider ({trendingVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'themes'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Palmtree className="w-4 h-4" />
          <span>Travel Themes ({travelThemes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'faqs'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Home Page FAQs ({homePageFaqs.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: DISCOUNT OFFERS (PHOTO AND LINK)               */}
      {/* ======================================================== */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {discountOffers.map((offer) => (
              <div
                key={offer.id}
                className={`rounded-[4px] border overflow-hidden flex flex-col justify-between transition-all group ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                {/* Banner Photo Preview - ONLY Photo */}
                <div className="relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={offer.photoUrl}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Offer Link - ONLY Link */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Target Click Link */}
                    <div className="p-2 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                      <span className="truncate pr-2">{offer.linkUrl}</span>
                      <a
                        href={offer.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 hover:text-blue-700 p-1"
                        title="Test link destination"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Actions & Active Toggle */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={offer.isActive}
                      onClick={() => onToggleOfferStatus(offer.id)}
                      className="inline-flex items-center gap-2 cursor-pointer"
                      title="Toggle visible placement on Home page"
                    >
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${offer.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${offer.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {offer.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditOffer(offer)}
                        className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit photo or link"
                      >
                        <Edit3 className="w-4 h-4" />
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
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: TOP TRENDING VIDEO SLIDER                      */}
      {/* ======================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendingVideos.map((vid) => (
              <div
                key={vid.id}
                className={`rounded-[4px] border overflow-hidden flex flex-col justify-between transition-all group ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                {/* Video Card with Play Overlay */}
                <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  {/* Destination Tag */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[4px] bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/20">
                    {vid.destination}
                  </span>

                  {/* Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setPreviewVideoUrl(vid.videoUrl)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer"
                    title="Watch video preview"
                  >
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </button>

                  {/* Video Duration / Views */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-[4px] bg-black/75 text-white text-[10px] font-mono">
                    {vid.duration || '0:45'}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {vid.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {vid.videoUrl}
                    </p>
                  </div>

                  {/* Actions & Status */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={vid.isActive}
                      onClick={() => onToggleVideoStatus(vid.id)}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${vid.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${vid.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {vid.isActive ? 'In Slider' : 'Hidden'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVideo(vid)}
                        className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit video slider details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: vid.id,
                            title: vid.title,
                            type: 'Video',
                          })
                        }
                        className="p-1.5 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove video from slider"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: TRAVEL THEMES (PHOTO AND NAME)                 */}
      {/* ======================================================== */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {travelThemes.map((thm) => (
              <div
                key={thm.id}
                className={`rounded-[4px] border overflow-hidden flex flex-col justify-between group transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
              >
                {/* Theme Photo & Name */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={thm.photoUrl}
                    alt={thm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <span className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                      {thm.name}
                    </span>
                  </div>
                </div>

                {/* Theme Body: URL Link */}
                <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="p-2 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                    <span className="truncate pr-2">
                      {thm.linkUrl || `/packages?theme=${encodeURIComponent(thm.name.toLowerCase())}`}
                    </span>
                    <a
                      href={thm.linkUrl || `/packages?theme=${encodeURIComponent(thm.name.toLowerCase())}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 hover:text-blue-700 p-0.5"
                      title="Test link destination"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Theme Footer: Active Toggle & Edit */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={thm.isActive}
                      onClick={() => onToggleThemeStatus(thm.id)}
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
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: HOME PAGE FAQS (FAQ MANAGE)                    */}
      {/* ======================================================== */}
      {activeTab === 'faqs' && (
        <div
          className={`rounded-[4px] border overflow-hidden shadow-xs ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Table Top Header Bar with Search & Category Filter */}
          <div
            className={`p-3.5 sm:p-4 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions or answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-[4px] text-xs sm:text-sm border outline-none font-medium ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Category Dropdown Filter */}
              <select
                value={faqCategoryFilter}
                onChange={(e) => setFaqCategoryFilter(e.target.value)}
                className={`py-2 px-3 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold cursor-pointer shrink-0 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="All">All Categories ({homePageFaqs.length})</option>
                <option value="General">General</option>
                <option value="Booking & Payments">Booking & Payments</option>
                <option value="Cancellation & Refund">Cancellation & Refund</option>
                <option value="Permits & Travel Guidelines">Permits & Guidelines</option>
              </select>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2 text-xs text-slate-500 font-medium">
              <span>
                • {
                  homePageFaqs.filter((f) => {
                    const matchesSearch =
                      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory =
                      faqCategoryFilter === 'All' || f.category === faqCategoryFilter;
                    return matchesSearch && matchesCategory;
                  }).length
                } FAQs
              </span>
            </div>
          </div>

          {/* Structured Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead
                className={`text-xs font-semibold uppercase tracking-wider border-b ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 text-slate-300 border-slate-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap w-12 text-center">SL.</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap w-44">Category</th>
                  <th className="py-3 px-3.5 font-semibold">Question & Detailed Answer</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center w-28">Status</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  const filteredFaqs = homePageFaqs.filter((f) => {
                    const matchesSearch =
                      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory =
                      faqCategoryFilter === 'All' || f.category === faqCategoryFilter;
                    return matchesSearch && matchesCategory;
                  });

                  if (filteredFaqs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                          No frequently asked questions found matching your criteria.
                        </td>
                      </tr>
                    );
                  }

                  return filteredFaqs.map((faq, index) => (
                    <tr
                      key={faq.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* SL. */}
                      <td className="py-3.5 px-3.5 text-xs text-slate-400 font-semibold text-center align-top whitespace-nowrap">
                        #{index + 1}
                      </td>

                      {/* Category - Clean text, no bulky background */}
                      <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {faq.category}
                        </span>
                      </td>

                      {/* Question & Answer */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="space-y-1.5 max-w-2xl">
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {faq.question}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-3.5 align-top text-center whitespace-nowrap">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={faq.isActive}
                          onClick={() => onToggleFaqStatus(faq.id)}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title="Toggle published visibility on Home page"
                        >
                          <span
                            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              faq.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                faq.isActive ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              faq.isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {faq.isActive ? 'Published' : 'Hidden'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFaq(faq)}
                            className="p-1.5 rounded-[4px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit3 className="w-4 h-4" />
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
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT DISCOUNT OFFER (PHOTO AND LINK)       */}
      {/* ======================================================== */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingOffer ? 'Edit Discount Offer Banner' : 'Add New Discount Offer Banner'}
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
              <ImageUploadField
                label="Banner Image *"
                value={offerPhoto}
                onChange={setOfferPhoto}
                aspectRatio="16/9"
                placeholder="Choose Banner Image or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Destination Link (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/packages?destination=Kashmir or https://..."
                  value={offerLink}
                  onChange={(e) => setOfferLink(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-50 border-slate-200'
                    }`}
                />
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer"
                >
                  {editingOffer ? 'Save Changes' : 'Publish Offer Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT TRENDING VIDEO SLIDER                 */}
      {/* ======================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold">
                  {editingVideo ? 'Edit Trending Video' : 'Add Video to Slider'}
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
                  Video Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Shikara Ride on Dal Lake"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Destination Territory
                </label>
                <select
                  value={videoDestination}
                  onChange={(e) => setVideoDestination(e.target.value)}
                  className={`w-full p-2 text-xs sm:text-sm rounded-[4px] border outline-none font-medium ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="Kashmir">Kashmir</option>
                  <option value="Andaman">Andaman</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Sundarban">Sundarban</option>
                  <option value="Gangtok">Gangtok & Sikkim</option>
                </select>
              </div>

              <ImageUploadField
                label="Video Thumbnail Photo *"
                value={videoThumb}
                onChange={setVideoThumb}
                aspectRatio="16/9"
                placeholder="Choose Video Thumbnail or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Video File URL (MP4 / Web Video Stream) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://...video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-50 border-slate-200'
                    }`}
                />
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer"
                >
                  {editingVideo ? 'Save Video' : 'Add to Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT TRAVEL THEME (PHOTO AND NAME)         */}
      {/* ======================================================== */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
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
                  placeholder="e.g. Honeymoon & Romantic Getaways"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <ImageUploadField
                label="Theme Photo *"
                value={themePhoto}
                onChange={setThemePhoto}
                aspectRatio="16/9"
                placeholder="Choose Theme Photo or Drag & Drop"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Destination URL Link *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/packages?theme=honeymoon or https://..."
                  value={themeLink}
                  onChange={(e) => setThemeLink(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-mono text-blue-600 dark:text-blue-400 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer"
                >
                  {editingTheme ? 'Save Theme' : 'Create Travel Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD / EDIT HOME PAGE FAQ                         */}
      {/* ======================================================== */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  FAQ Category
                </label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value as any)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="General">General</option>
                  <option value="Booking & Payments">Booking & Payments</option>
                  <option value="Cancellation & Refund">Cancellation & Refund</option>
                  <option value="Permits & Travel Guidelines">Permits & Travel Guidelines</option>
                </select>
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
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark'
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
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer"
                >
                  {editingFaq ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIDEO PREVIEW MODAL                                       */}
      {/* ======================================================== */}
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

      {/* Delete Confirmation Modal */}
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
    </div>
  );
};
