import React, { useState } from 'react';
import {
  Search,
  Plus,
  KeyRound,
  Trash2,
  X,
  Building,
  Eye,
  CheckCircle2,
  MapPin,
  Check,
  Filter,
  RotateCcw,
  Compass,
  Copy,
  Star,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { VendorDetailsModal } from './VendorDetailsModal';
import {
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useUpdateVendorPortalAccessMutation,
  useUpdateVendorStatusMutation,
  useUpdateVendorTerritoriesMutation,
  useVendorsQuery,
  type AdminVendorItem,
  type VendorCategory,
  type VendorPortalRole,
  type VendorStatus,
} from '../../api/vendors';
import { useDestinationsQuery } from '../../api/destinations';

export const SUPPORTED_DESTINATIONS = [
  'Kashmir',
  'Andaman',
  'Kerala',
  'Sundarban',
  'Gangtok',
] as const;

export type SupportedDestination = (typeof SUPPORTED_DESTINATIONS)[number];

export const getDestinationBadgeStyle = (destination: string) => {
  switch (destination.toLowerCase()) {
    case 'kashmir':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800';
    case 'andaman':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
    case 'kerala':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    case 'sundarban':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    case 'gangtok':
    case 'sikkim':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300 dark:border-violet-800';
    case 'goa':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800';
    case 'rajasthan':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  }
};

const mapCategoryToApi = (cat: string): VendorCategory | undefined => {
  switch (cat) {
    case 'Tour Operator':
      return 'tour_operator';
    case 'Resort & Hotel':
      return 'resort_hotel';
    case 'Transport & Fleet':
      return 'transport_fleet';
    case 'Adventure Guide':
      return 'adventure_guide';
    default:
      return undefined;
  }
};

const mapStatusToApi = (status: string): VendorStatus | undefined => {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Pending Approval':
      return 'pending_approval';
    case 'Suspended':
      return 'suspended';
    default:
      return undefined;
  }
};

export const VendorPortalView: React.FC = () => {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'All' | 'Active' | 'Pending Approval' | 'Suspended'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendorForDetailsId, setSelectedVendorForDetailsId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [deleteTargetVendor, setDeleteTargetVendor] = useState<AdminVendorItem | null>(null);

  const [editingVendorForDest, setEditingVendorForDest] = useState<{ id: string; name: string; destinationIds: string[] } | null>(null);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<VendorCategory>('tour_operator');
  const [commissionPercent, setCommissionPercent] = useState<number>(12);
  const [portalRole, setPortalRole] = useState<VendorPortalRole>('vendor_admin');
  const [portalAccess, setPortalAccess] = useState(false);
  const [regDestinationIds, setRegDestinationIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [registeredSuccessVendor, setRegisteredSuccessVendor] = useState<{
    businessName: string;
    code: string;
    registrationId: string;
    email: string;
    destinations: string[];
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const destinationsQuery = useDestinationsQuery();
  const destinationsList = destinationsQuery.data || [];

  const vendorsQuery = useVendorsQuery({
    search: searchQuery.trim() || undefined,
    status: mapStatusToApi(statusTab),
    category: mapCategoryToApi(categoryFilter),
    destinationId: destinationFilter === 'All' ? undefined : destinationFilter,
    page,
    limit: 10,
  });

  const createVendorMutation = useCreateVendorMutation();
  const updateStatusMutation = useUpdateVendorStatusMutation();
  const updatePortalAccessMutation = useUpdateVendorPortalAccessMutation();
  const updateTerritoriesMutation = useUpdateVendorTerritoriesMutation();
  const deleteVendorMutation = useDeleteVendorMutation();

  const vendorsData = vendorsQuery.data;
  const vendorsList = vendorsData?.items || [];
  const facets = vendorsData?.facets;
  const stats = vendorsData?.stats || {
    totalVendors: 0,
    activeCount: 0,
    pendingApprovalsCount: 0,
    portalAccessCount: 0,
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenRegisterModal = () => {
    setBusinessName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setLocation('');
    setCategory('tour_operator');
    setCommissionPercent(12);
    setPortalRole('vendor_admin');
    setPortalAccess(false);
    setRegDestinationIds([]);
    setNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      setFormError('Please fill out all required fields');
      return;
    }
    setFormError(null);

    try {
      const created = await createVendorMutation.mutateAsync({
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        category,
        location: location.trim(),
        commissionPercent,
        status: 'pending_approval',
        portalAccess,
        portalRole,
        destinationIds: regDestinationIds,
        notes: notes.trim() || null,
      });

      setIsAddModalOpen(false);
      setRegisteredSuccessVendor({
        businessName: created.businessName,
        code: created.code,
        registrationId: created.registrationId,
        email: created.email,
        destinations: created.assignedDestinations,
      });
    } catch {
      setFormError('Failed to register vendor. Check if email or code is already in use.');
    }
  };

  const handleOpenDestModal = (vendor: { id: string; businessName: string; territories?: Array<{ id: string }> }) => {
    setEditingVendorForDest({
      id: vendor.id,
      name: vendor.businessName,
      destinationIds: vendor.territories ? vendor.territories.map((t) => t.id) : [],
    });
    setSelectedDestIds(vendor.territories ? vendor.territories.map((t) => t.id) : []);
  };

  const handleSaveDestinations = async () => {
    if (!editingVendorForDest) return;
    await updateTerritoriesMutation.mutateAsync({
      id: editingVendorForDest.id,
      destinationIds: selectedDestIds,
    });
    setEditingVendorForDest(null);
  };

  const handleOpenDetails = (id: string) => {
    setSelectedVendorForDetailsId(id);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetVendor) return;
    await deleteVendorMutation.mutateAsync(deleteTargetVendor.id);
    setDeleteTargetVendor(null);
  };

  const categories = [
    'All',
    'Tour Operator',
    'Resort & Hotel',
    'Transport & Fleet',
    'Adventure Guide',
  ];

  const destinationOptions = [
    {
      value: 'All',
      label: 'All Destinations',
      icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: stats.totalVendors,
    },
    ...destinationsList.map((dest) => ({
      value: dest.id,
      label: dest.name,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
    })),
  ];

  const categoryOptions = [
    {
      value: 'All',
      label: 'All Categories',
      icon: <Filter className="w-4 h-4 text-slate-400" />,
      badge: stats.totalVendors,
    },
    ...categories.filter((c) => c !== 'All').map((cat) => {
      const apiCat = mapCategoryToApi(cat);
      const count = (apiCat && facets?.byCategory?.[apiCat]) || 0;
      return {
        value: cat,
        label: cat,
        icon: <Building className="w-4 h-4 text-blue-500" />,
        badge: count,
      };
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vendor Directory & Partner Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize local operators, manage destination territories, track completed bookings, and disburse payouts
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenRegisterModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-[4px] border transition-all ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-xs'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Partners</span>
            <div className="p-2 rounded-[4px] bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalVendors}
            </span>
            <span className="text-xs text-slate-500">Registered</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-[4px] border transition-all ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-xs'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Partners</span>
            <div className="p-2 rounded-[4px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.activeCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Ready for tours</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-[4px] border transition-all ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-xs'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Approval</span>
            <div className="p-2 rounded-[4px] bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.pendingApprovalsCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">Needs review</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-[4px] border transition-all ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200 shadow-xs'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Portal Enabled</span>
            <div className="p-2 rounded-[4px] bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.portalAccessCount}
            </span>
            <span className="text-xs text-purple-600 font-medium">Portal access</span>
          </div>
        </div>
      </div>

      <div
        className={`p-4 rounded-[4px] border space-y-4 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
          }`}
      >
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
          {(['All', 'Active', 'Pending Approval', 'Suspended'] as const).map((tab) => {
            const count =
              tab === 'All'
                ? stats.totalVendors
                : tab === 'Active'
                  ? facets?.byStatus?.active ?? 0
                  : tab === 'Pending Approval'
                    ? facets?.byStatus?.pending_approval ?? 0
                    : facets?.byStatus?.suspended ?? 0;

            const isActive = statusTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusTab(tab);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by business name, code, contact person, email, or city..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DropdownFilter
              label="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
            />

            <DropdownFilter
              label="Territory"
              options={destinationOptions}
              value={destinationFilter}
              onChange={(val) => {
                setDestinationFilter(val);
                setPage(1);
              }}
            />

            {(searchQuery || categoryFilter !== 'All' || destinationFilter !== 'All' || statusTab !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setDestinationFilter('All');
                  setStatusTab('All');
                  setPage(1);
                }}
                className="p-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-[4px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[4px] border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-500'
                  }`}
              >
                <th className="py-3 px-4 font-semibold">Partner & Code</th>
                <th className="py-3 px-4 font-semibold">Contact & Location</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Assigned Territories</th>
                <th className="py-3 px-4 font-semibold text-center">Tours & Rating</th>
                <th className="py-3 px-4 font-semibold text-center">Commission</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Portal Access</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vendorsList.length > 0 ? (
                vendorsList.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {vendor.businessName}
                        </div>
                        <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                          {vendor.code} • {vendor.registrationId}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {vendor.contactPerson}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{vendor.location}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {vendor.phone}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {vendor.category.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs items-center">
                        {vendor.assignedDestinations?.length ? (
                          vendor.assignedDestinations.map((dest) => (
                            <span
                              key={dest}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${getDestinationBadgeStyle(
                                dest
                              )}`}
                            >
                              {dest}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDestModal(vendor)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1 font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {vendor.toursCompleted} Tours
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-amber-500 font-semibold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{vendor.ratingAvg > 0 ? vendor.ratingAvg.toFixed(1) : 'New'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {vendor.commissionPercent}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={vendor.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: vendor.id,
                            status: e.target.value as VendorStatus,
                          })
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-[4px] border cursor-pointer outline-hidden ${vendor.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : vendor.status === 'pending_approval'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                      >
                        <option value="pending_approval">Pending Approval</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          updatePortalAccessMutation.mutate({
                            id: vendor.id,
                            portalAccess: !vendor.portalAccess,
                          })
                        }
                        className={`px-2 py-1 text-[11px] font-semibold rounded-[4px] border inline-flex items-center gap-1 transition-colors cursor-pointer ${vendor.portalAccess
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{vendor.portalAccess ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(vendor.id)}
                          className="p-1.5 rounded-[4px] text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Completed Tours, Payouts & Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTargetVendor(vendor)}
                          className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Building className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm">No partner vendors found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing filters or click "Register Vendor" to add a new partner.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {vendorsData && vendorsData.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div>
              Showing Page {vendorsData.page} of {vendorsData.totalPages} ({vendorsData.total} partners)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= vendorsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-xl rounded-[4px] border shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Register Vendor Partner</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates an authorized agency partner and sends an onboarding invitation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-2.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Business / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Himalayan Trailblazers Pvt Ltd"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Official Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@agency.com"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Official Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Base City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Srinagar, Kashmir"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Partner Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="tour_operator">Tour Operator</option>
                    <option value="resort_hotel">Resort & Hotel</option>
                    <option value="transport_fleet">Transport & Fleet</option>
                    <option value="adventure_guide">Adventure Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Default Commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Primary Member Role
                  </label>
                  <select
                    value={portalRole}
                    onChange={(e) => setPortalRole(e.target.value as VendorPortalRole)}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="vendor_admin">Vendor Admin</option>
                    <option value="vendor_manager">Vendor Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="portalAccessToggle"
                    checked={portalAccess}
                    onChange={(e) => setPortalAccess(e.target.checked)}
                    className="rounded-[4px] text-blue-600 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="portalAccessToggle" className="text-xs font-semibold cursor-pointer">
                    Enable Portal Access immediately
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Authorized Destination Territories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 max-h-40 overflow-y-auto">
                  {destinationsList.map((dest) => {
                    const checked = regDestinationIds.includes(dest.id);
                    return (
                      <label
                        key={dest.id}
                        className="flex items-center gap-2 text-xs cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRegDestinationIds([...regDestinationIds, dest.id]);
                            } else {
                              setRegDestinationIds(regDestinationIds.filter((id) => id !== dest.id));
                            }
                          }}
                          className="rounded-[4px] text-blue-600 w-3.5 h-3.5"
                        />
                        <span className="truncate">{dest.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specialization, contact notes, vehicle fleet info, etc."
                  className="w-full px-3 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVendorMutation.isPending}
                  className="px-5 py-2 rounded-[4px] bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {createVendorMutation.isPending ? 'Registering...' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {registeredSuccessVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center">Vendor Partner Registered</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Partner record created for <strong className="text-slate-800 dark:text-slate-200">{registeredSuccessVendor.businessName}</strong>.
            </p>

            <div className="mt-4 p-4 rounded-[4px] border space-y-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Partner Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {registeredSuccessVendor.code}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {registeredSuccessVendor.registrationId}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(registeredSuccessVendor.registrationId, 'regId')}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {copiedField === 'regId' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Login Email:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {registeredSuccessVendor.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(registeredSuccessVendor.email, 'email')}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {registeredSuccessVendor.destinations.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">Territories:</span>
                  <div className="flex flex-wrap gap-1">
                    {registeredSuccessVendor.destinations.map((d) => (
                      <span
                        key={d}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${getDestinationBadgeStyle(
                          d
                        )}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-[4px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
              Portal invitation will be sent when the vendor portal launches.
            </div>

            <button
              type="button"
              onClick={() => setRegisteredSuccessVendor(null)}
              className="w-full mt-5 py-2 rounded-[4px] bg-slate-900 text-white dark:bg-slate-700 dark:text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {editingVendorForDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-[4px] border shadow-2xl p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold">Edit Destination Territories</h3>
              <button
                type="button"
                onClick={() => setEditingVendorForDest(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Select all destination territories serviced by <strong>{editingVendorForDest.name}</strong>:
            </p>

            <div className="space-y-2.5 mt-4 max-h-60 overflow-y-auto p-1">
              {destinationsList.map((dest) => {
                const checked = selectedDestIds.includes(dest.id);
                return (
                  <label
                    key={dest.id}
                    className={`flex items-center justify-between p-2.5 rounded-[4px] border text-xs cursor-pointer transition-colors ${checked
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-800'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDestIds([...selectedDestIds, dest.id]);
                          } else {
                            setSelectedDestIds(selectedDestIds.filter((id) => id !== dest.id));
                          }
                        }}
                        className="rounded-[4px] text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold">{dest.name}</span>
                    </div>
                    {dest.region && (
                      <span className="text-[11px] text-slate-400">{dest.region}</span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditingVendorForDest(null)}
                className="px-4 py-2 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateTerritoriesMutation.isPending}
                onClick={handleSaveDestinations}
                className="px-5 py-2 rounded-[4px] bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                {updateTerritoriesMutation.isPending ? 'Saving...' : 'Save Territories'}
              </button>
            </div>
          </div>
        </div>
      )}

      <VendorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedVendorForDetailsId(null);
        }}
        vendorId={selectedVendorForDetailsId}
        onOpenDestModal={(v) => handleOpenDestModal(v)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetVendor)}
        title="Delete Vendor Partner"
        itemName={deleteTargetVendor?.businessName}
        itemType="Vendor Partner"
        warningMessage="This partner will no longer be assigned to new tour bookings."
        onClose={() => setDeleteTargetVendor(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
