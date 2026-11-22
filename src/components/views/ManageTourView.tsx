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
  Copy,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tour } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { TourPackageEditorModal } from './TourPackageEditorModal';
import { useDestinationsQuery } from '../../api/destinations';
import {
  useAdminPackagesQuery,
  usePatchPackageStatusMutation,
  useDeletePackageMutation,
  useDuplicatePackageMutation,
  type AdminPackageItem,
  type PackageCategory,
  type PackageStatus,
} from '../../api/packages';

interface ManageTourViewProps {
  tours?: Tour[];
  onAddTour?: (tour: Tour) => void;
  onUpdateTour?: (tour: Tour) => void;
  onDeleteTour?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

const toPackageCategory = (val: string): PackageCategory | undefined => {
  const normalized = val.toLowerCase();
  if (normalized === 'adventure' || normalized === 'luxury' || normalized === 'honeymoon' || normalized === 'family' || normalized === 'cultural') {
    return normalized;
  }
  return undefined;
};

const toPackageStatus = (val: string): PackageStatus | undefined => {
  const normalized = val.toLowerCase();
  if (normalized === 'published' || normalized === 'draft' || normalized === 'archived') {
    return normalized;
  }
  return undefined;
};

export const ManageTourView: React.FC<ManageTourViewProps> = ({
  tours: _legacyTours,
  onAddTour: _legacyAdd,
  onUpdateTour: _legacyUpdate,
  onDeleteTour: _legacyDelete,
  onToggleStatus: _legacyToggle,
  isAddModalOpen = false,
  setIsAddModalOpen,
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editorInitialTab, setEditorInitialTab] = useState<
    'basic' | 'about' | 'itinerary' | 'includes' | 'faqs'
  >('basic');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetPackage, setDeleteTargetPackage] = useState<AdminPackageItem | null>(null);

  const { data: destinationsData } = useDestinationsQuery();

  const selectedDestinationId = destinationFilter === 'All'
    ? undefined
    : destinationsData?.find((d) => d.name === destinationFilter || d.id === destinationFilter)?.id;

  const { data: packagesResponse, isLoading } = useAdminPackagesQuery({
    q: searchQuery.trim() || undefined,
    destinationId: selectedDestinationId,
    category: toPackageCategory(selectedCategory),
    status: toPackageStatus(statusFilter),
    limit: 100,
  });

  const patchStatusMutation = usePatchPackageStatusMutation();
  const deleteMutation = useDeletePackageMutation();
  const duplicateMutation = useDuplicatePackageMutation();

  const packages: AdminPackageItem[] = packagesResponse?.data || [];

  useEffect(() => {
    if (isAddModalOpen && !isEditorOpen) {
      setEditingPackageId(null);
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
      badge: packages.length,
    },
    ...(destinationsData || []).map((dest) => ({
      value: dest.name,
      label: dest.name,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: packages.filter((p) => p.destinationId === dest.id || p.destinationName === dest.name).length,
    })),
  ];

  const categoryOptions = [
    {
      value: 'All',
      label: 'All Categories',
      icon: <Filter className="w-4 h-4 text-slate-400" />,
      badge: packages.length,
    },
    ...categories.filter((c) => c !== 'All').map((cat) => ({
      value: cat,
      label: cat,
      icon: <Filter className="w-4 h-4 text-blue-500" />,
      badge: packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length,
    })),
  ];

  const publishedCount = packages.filter((p) => p.status === 'published').length;
  const draftCount = packages.filter((p) => p.status === 'draft').length;
  const archivedCount = packages.filter((p) => p.status === 'archived').length;

  const handleOpenNewTour = () => {
    setEditingPackageId(null);
    setEditorInitialTab('basic');
    setIsEditorOpen(true);
    if (setIsAddModalOpen) setIsAddModalOpen(true);
  };

  const handleOpenEditTour = (
    pkg: AdminPackageItem,
    tab: 'basic' | 'about' | 'itinerary' | 'includes' | 'faqs' = 'basic'
  ) => {
    setEditingPackageId(pkg.id);
    setEditorInitialTab(tab);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    if (setIsAddModalOpen) setIsAddModalOpen(false);
    setEditingPackageId(null);
  };

  const handleToggleStatus = async (pkg: AdminPackageItem) => {
    const nextStatus: PackageStatus = pkg.status === 'published' ? 'draft' : 'published';
    try {
      await patchStatusMutation.mutateAsync({ id: pkg.id, status: nextStatus });
      toast.success(`Package status updated to ${nextStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
    }
  };

  const handleDuplicate = async (pkg: AdminPackageItem) => {
    try {
      await duplicateMutation.mutateAsync(pkg.id);
      toast.success(`Duplicated "${pkg.title}" as draft`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate package';
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetPackage) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetPackage.id);
      toast.success('Tour package deleted successfully');
      setDeleteTargetPackage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete package';
      toast.error(msg);
    }
  };

  if (isEditorOpen) {
    return (
      <TourPackageEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        tour={null}
        packageId={editingPackageId}
        initialTab={editorInitialTab}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div
        className={`p-4 rounded-[4px] border space-y-3 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tours, destinations, countries..."
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
            <div
              className={`inline-flex p-1 rounded-[4px] border ${
                theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {[
                { key: 'All', label: 'All', count: packages.length },
                { key: 'Published', label: 'Published', count: publishedCount },
                { key: 'Draft', label: 'Drafts', count: draftCount },
                { key: 'Archived', label: 'Archived', count: archivedCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.key
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      statusFilter === tab.key
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

            <div className="flex items-center p-1 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'grid'
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
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'list'
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

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading tour packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div
          className={`p-12 rounded-[4px] border text-center ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            No tour packages found
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Try adjusting your search query, clearing your filters, or creating a new package.
          </p>
          <button
            type="button"
            onClick={handleOpenNewTour}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Package</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div
          className={`rounded-[4px] border overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead
                className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
                  theme === 'dark'
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
                {packages.map((pkg, index) => {
                  const fallbackImage =
                    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80';
                  const displayImage = pkg.coverImageUrl || fallbackImage;
                  const priceInr = Math.round(pkg.pricePaise / 100);

                  return (
                    <tr
                      key={pkg.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap text-center text-xs font-semibold text-slate-400">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImage}
                            alt={pkg.title}
                            className="w-12 h-12 rounded-[4px] object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div
                              onClick={() => handleOpenEditTour(pkg, 'basic')}
                              className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 truncate max-w-[220px]"
                              title={pkg.title}
                            >
                              {pkg.title}
                            </div>
                            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              {pkg.slug || pkg.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {pkg.destinationName}
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
                          {pkg.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {pkg.days} Days / {pkg.nights} Nights
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {pkg.itineraryDaysCount > 0 ? `${pkg.itineraryDaysCount} Days Plan` : `${pkg.days}D / ${pkg.nights}N`}
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{pkg.seatsAvailable ?? 10} left</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          ₹{priceInr.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">per guest</span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {pkg.ratingAvg.toFixed(1)}
                          </span>
                          <span className="text-slate-400 text-[11px]">({pkg.reviewsCount})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pkg)}
                          className="inline-flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer hover:opacity-80 py-1"
                          title={`Click to switch between Published and Draft (Currently: ${pkg.status})`}
                        >
                          <span
                            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                              pkg.status === 'published'
                                ? 'bg-emerald-600 justify-end'
                                : 'bg-slate-300 dark:bg-slate-700 justify-start'
                            }`}
                          >
                            <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                          </span>
                          <span
                            className={
                              pkg.status === 'published'
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold capitalize'
                                : 'text-amber-600 dark:text-amber-400 font-medium capitalize'
                            }
                          >
                            {pkg.status}
                          </span>
                        </button>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTour(pkg, 'basic')}
                            className="p-1.5 rounded-[4px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                            title="Manage Tour Package"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(pkg)}
                            className="p-1.5 rounded-[4px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Duplicate Tour Package"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetPackage(pkg)}
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

          <div
            className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{packages.length}</span> tour packages
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {packages.map((pkg) => {
            const fallbackImage =
              'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80';
            const displayImage = pkg.coverImageUrl || fallbackImage;
            const priceInr = Math.round(pkg.pricePaise / 100);

            return (
              <div
                key={pkg.id}
                className={`rounded-[4px] border overflow-hidden transition-all flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="relative h-48 overflow-hidden group">
                    <img
                      src={displayImage}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {pkg.badgeLabel && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow-xs">
                        {pkg.badgeLabel}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 truncate font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{pkg.destinationName}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold capitalize">{pkg.category}</span>
                      </span>

                      <div
                        className="flex items-center gap-1 text-xs font-semibold shrink-0"
                        title={`${pkg.ratingAvg.toFixed(1)} rating (${pkg.reviewsCount} reviews)`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {pkg.ratingAvg.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-[11px]">({pkg.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {pkg.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {pkg.days} Days / {pkg.nights} Nights
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {pkg.seatsAvailable ?? 10} seats left
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting Price</span>
                    <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{priceInr.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> / guest</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pkg)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer hover:opacity-80 py-1"
                      title={`Click to switch between Published and Draft (Currently: ${pkg.status})`}
                    >
                      <span
                        className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                          pkg.status === 'published'
                            ? 'bg-emerald-600 justify-end'
                            : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                      </span>
                      <span
                        className={
                          pkg.status === 'published'
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold capitalize'
                            : 'text-amber-600 dark:text-amber-400 font-medium capitalize'
                        }
                      >
                        {pkg.status}
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTour(pkg, 'basic')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Edit Itinerary, Inclusions, FAQs, Description"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(pkg)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px] cursor-pointer transition-colors"
                        title="Duplicate Tour Package"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetPackage(pkg)}
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

      <DeleteConfirmModal
        isOpen={!!deleteTargetPackage}
        onClose={() => setDeleteTargetPackage(null)}
        onConfirm={handleDeleteConfirm}
        itemType="Tour Package"
        itemName={deleteTargetPackage?.title}
        warningMessage="This package, its day-by-day itinerary, photo gallery, inclusions, FAQs, and price settings will be permanently removed."
      />
    </div>
  );
};
