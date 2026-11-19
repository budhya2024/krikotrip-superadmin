import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Users,
  Star,
  Trash2,
  X,
  Compass,
  Filter,
  RotateCcw,
  Edit3,
  Calendar,
  LayoutGrid,
  List,
} from 'lucide-react';
import type { Tour } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS } from './VendorPortalView';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { TourPackageEditorModal } from './TourPackageEditorModal';

interface ManageTourViewProps {
  tours: Tour[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour?: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const ManageTourView: React.FC<ManageTourViewProps> = ({
  tours,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  onToggleStatus,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Tour Package Editor Modal State
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editorInitialTab, setEditorInitialTab] = useState<
    'basic' | 'about' | 'itinerary' | 'includes' | 'faqs'
  >('basic');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetTour, setDeleteTargetTour] = useState<Tour | null>(null);

  // Sync external header "Add Tour" button
  useEffect(() => {
    if (isAddModalOpen && !isEditorOpen) {
      setEditingTour(null);
      setEditorInitialTab('basic');
      setIsEditorOpen(true);
    }
  }, [isAddModalOpen, isEditorOpen]);

  const categories = ['All', 'Adventure', 'Luxury', 'Honeymoon', 'Cultural', 'Family'];

  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: tours.length,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: tours.filter((t) => t.destination === dest).length,
    })),
  ];

  const categoryOptions = [
    {
      value: 'All',
      label: 'All Categories',
      icon: <Filter className="w-4 h-4 text-slate-400" />,
      badge: tours.length,
    },
    ...categories.filter((c) => c !== 'All').map((cat) => ({
      value: cat,
      label: cat,
      icon: <Filter className="w-4 h-4 text-blue-500" />,
      badge: tours.filter((t) => t.category === cat).length,
    })),
  ];

  const publishedCount = tours.filter((t) => t.status === 'Published').length;
  const draftCount = tours.filter((t) => t.status === 'Draft').length;

  const filteredTours = tours.filter((tour) => {
    const matchesCategory =
      selectedCategory === 'All' || tour.category === selectedCategory;
    const matchesDest =
      destinationFilter === 'All' || tour.destination === destinationFilter;
    const matchesStatus =
      statusFilter === 'All' || tour.status === statusFilter;
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDest && matchesStatus && matchesSearch;
  });

  const handleOpenNewTour = () => {
    setEditingTour(null);
    setEditorInitialTab('basic');
    setIsEditorOpen(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditTour = (
    tour: Tour,
    tab: 'basic' | 'about' | 'itinerary' | 'includes' | 'faqs' = 'basic'
  ) => {
    setEditingTour(tour);
    setEditorInitialTab(tab);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setIsAddModalOpen(false);
    setEditingTour(null);
  };

  const handleSaveEditor = (savedTour: Tour) => {
    if (editingTour && onUpdateTour) {
      onUpdateTour(savedTour);
    } else {
      onAddTour(savedTour);
    }
    handleCloseEditor();
  };

  // If user clicked "Add Tour Package" or "Manage" on a tour, open the dedicated full page
  if (isEditorOpen) {
    return (
      <TourPackageEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        tour={editingTour}
        onSave={handleSaveEditor}
        initialTab={editorInitialTab}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Action Bar with Destination & Category Dropdown Filters with Icons */}
      <div
        className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tours, destinations, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                }`}
            />
          </div>

          {/* Dropdown Filters with Icons and Add Tour Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Toggle Bar */}
            <div
              className={`inline-flex p-1 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
            >
              {[
                { key: 'All', label: 'All', count: tours.length },
                { key: 'Published', label: 'Published', count: publishedCount },
                { key: 'Draft', label: 'Drafts', count: draftCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusFilter === tab.key
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${statusFilter === tab.key
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <DropdownFilter
              label="Destination"
              value={destinationFilter}
              onChange={setDestinationFilter}
              options={destinationOptions}
              icon={<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            <DropdownFilter
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              icon={<Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />

            {(destinationFilter !== 'All' || selectedCategory !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDestinationFilter('All');
                  setSelectedCategory('All');
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

            {/* View Mode Switcher: Grid vs List */}
            <div className="flex items-center p-1 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="Grid View (Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="List View (Table)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleOpenNewTour}
              className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer ml-auto sm:ml-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tour Package</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(destinationFilter !== 'All' || selectedCategory !== 'All') && (
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
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                  title="Clear category filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* View Mode Output: List View vs Grid View */}
      {viewMode === 'list' ? (
        <div
          className={`rounded-[4px] border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead
                className={`text-[11px] font-semibold uppercase tracking-wider border-b ${theme === 'dark'
                  ? 'bg-slate-800/80 text-slate-300 border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
              >
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">SL</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Package Info</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Destination</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Duration & Plan</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Seats</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Price / Guest</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">Rating</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredTours.map((tour, index) => {
                  const reviewCount = tour.reviews?.length || tour.reviewsCount || 0;
                  const itineraryDaysCount = tour.itinerary?.length || 0;

                  return (
                    <tr
                      key={tour.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* SL */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center text-xs font-semibold text-slate-400">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>

                      {/* Package Info (Thumbnail, Title & ID) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={tour.featuredImage}
                            alt={tour.title}
                            className="w-12 h-12 rounded-[4px] object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div
                              onClick={() => handleOpenEditTour(tour, 'basic')}
                              className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 truncate max-w-[220px]"
                              title={tour.title}
                            >
                              {tour.title}
                            </div>
                            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              {tour.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination (Clean, no bg color) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {tour.destination}
                        </span>
                      </td>

                      {/* Category (Clean, no bg color) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {tour.category}
                        </span>
                      </td>

                      {/* Duration & Plan */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {itineraryDaysCount > 0 ? `${itineraryDaysCount} Days Plan` : tour.duration}
                        </div>
                        <span className="text-[11px] text-slate-400">{tour.duration}</span>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{tour.seatsAvailable} left</span>
                        </span>
                      </td>

                      {/* Starting Price */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          ₹{tour.price.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">per guest</span>
                      </td>

                      {/* Rating (Clean, no bg color) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{tour.rating}</span>
                          <span className="text-slate-400 text-[11px]">({reviewCount})</span>
                        </div>
                      </td>

                      {/* Status Toggle Bar */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(tour.id)}
                          className="inline-flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer hover:opacity-80 py-1"
                          title={`Click to switch between Published and Draft (Currently: ${tour.status})`}
                        >
                          <span
                            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${tour.status === 'Published'
                              ? 'bg-emerald-600 justify-end'
                              : 'bg-slate-300 dark:bg-slate-700 justify-start'
                              }`}
                          >
                            <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                          </span>
                          <span
                            className={
                              tour.status === 'Published'
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-amber-600 dark:text-amber-400 font-medium'
                            }
                          >
                            {tour.status}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTour(tour, 'basic')}
                            className="p-1.5 rounded-[4px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                            title="Manage Tour Package"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetTour(tour)}
                            className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Tour Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Counter Bar */}
          <div
            className={`px-4 py-3 border-t flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
          >
            <div className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredTours.length}</span> of{' '}<span className="font-semibold text-slate-800 dark:text-slate-200">{tours.length}</span> tour packages
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-5">
          {filteredTours.map((tour) => {
            const reviewCount = tour.reviews?.length || tour.reviewsCount || 0;
            const itineraryDaysCount = tour.itinerary?.length || 0;

            return (
              <div
                key={tour.id}
                className={`rounded-[4px] border overflow-hidden transition-all flex flex-col justify-between ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
                  }`}
              >
                <div>
                  {/* Image - Clean Without Badges */}
                  <div className="relative h-48 overflow-hidden group">
                    <img
                      src={tour.featuredImage}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 truncate font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{tour.destination}, {tour.country}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{tour.category}</span>
                      </span>

                      {/* Rating (Clean, no bg box) */}
                      <div
                        className="flex items-center gap-1 text-xs font-semibold shrink-0"
                        title={`${tour.rating} rating (${reviewCount} reviews)`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{tour.rating}</span>
                        <span className="text-slate-400 text-[11px]">({reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {tour.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {itineraryDaysCount > 0 ? `${itineraryDaysCount} Days Plan` : tour.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {tour.seatsAvailable} seats left
                      </span>
                    </div>

                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="pt-1 text-[11px] text-slate-500 space-y-1 line-clamp-2">
                        {tour.highlights.slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer with Price, Status Toggle Bar and Actions */}
                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting Price</span>
                    <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{tour.price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> / guest</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(tour.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer hover:opacity-80 py-1"
                      title={`Click to switch between Published and Draft (Currently: ${tour.status})`}
                    >
                      <span
                        className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${tour.status === 'Published'
                          ? 'bg-emerald-600 justify-end'
                          : 'bg-slate-300 dark:bg-slate-700 justify-start'
                          }`}
                      >
                        <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                      </span>
                      <span
                        className={
                          tour.status === 'Published'
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-amber-600 dark:text-amber-400 font-medium'
                        }
                      >
                        {tour.status}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTour(tour, 'basic')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Edit Itinerary, Inclusions, FAQs, Description & Reviews"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>

                      <button
                        onClick={() => setDeleteTargetTour(tour)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px] cursor-pointer transition-colors"
                        title="Delete Tour Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetTour}
        onClose={() => setDeleteTargetTour(null)}
        onConfirm={() => {
          if (deleteTargetTour) {
            onDeleteTour(deleteTargetTour.id);
            setDeleteTargetTour(null);
          }
        }}
        itemType="Tour Package"
        itemName={deleteTargetTour?.title}
        warningMessage="This package, its day-by-day itinerary, photo gallery, inclusions, FAQs, and price settings will be permanently removed."
      />
    </div>
  );
};
