import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShieldAlert,
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
} from 'lucide-react';
import type { Vendor, BookingEnquiry } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DropdownFilter } from '../common/DropdownFilter';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { VendorDetailsModal } from './VendorDetailsModal';

export const SUPPORTED_DESTINATIONS = [
  'Kashmir',
  'Andaman',
  'Kerala',
  'Sundarban',
  'Gangtok',
] as const;

export type SupportedDestination = (typeof SUPPORTED_DESTINATIONS)[number];

interface VendorPortalViewProps {
  vendors: Vendor[];
  enquiries?: BookingEnquiry[];
  onTogglePortalAccess: (id: string) => void;
  onUpdateVendorStatus: (id: string, status: Vendor['status']) => void;
  onUpdateVendorDestinations: (vendorId: string, destinations: string[]) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'toursListed'>) => void;
  onDeleteVendor: (id: string) => void;
  onVendorLeadResponse?: (enquiryId: string, response: 'Accepted' | 'Declined') => void;
}

export const getDestinationBadgeStyle = (destination: string) => {
  switch (destination) {
    case 'Kashmir':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800';
    case 'Andaman':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
    case 'Kerala':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    case 'Sundarban':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    case 'Gangtok':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300 dark:border-violet-800';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  }
};

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  vendors,
  onTogglePortalAccess,
  onUpdateVendorStatus,
  onUpdateVendorDestinations,
  onAddVendor,
  onDeleteVendor,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Vendor Details Drawer State
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<Vendor | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [deleteTargetVendor, setDeleteTargetVendor] = useState<Vendor | null>(null);

  // Destination Management Modal State
  const [editingVendorForDest, setEditingVendorForDest] = useState<Vendor | null>(null);
  const [selectedDestList, setSelectedDestList] = useState<string[]>([]);

  // Add Vendor Form
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Vendor['category']>('Tour Operator');
  const [commissionRate, setCommissionRate] = useState(12);
  const [portalRole, setPortalRole] = useState<Vendor['portalRole']>('Vendor Admin');
  const portalAccess = true;
  const [assignedDestinations, setAssignedDestinations] = useState<string[]>(['Kashmir']);

  // Generator functions for Vendor Registration ID and Password
  const generateRegistrationId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `VR-2026-${randomNum}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Kriko@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const [registrationId, setRegistrationId] = useState(generateRegistrationId());
  const [portalPassword, setPortalPassword] = useState(generatePassword());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [registeredSuccessVendor, setRegisteredSuccessVendor] = useState<{
    name: string;
    regId: string;
    email: string;
    password: string;
    dest: string;
  } | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenRegisterModal = () => {
    setRegistrationId(generateRegistrationId());
    setPortalPassword(generatePassword());
    setIsAddModalOpen(true);
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
      badge: vendors.length,
    },
    ...SUPPORTED_DESTINATIONS.map((dest) => ({
      value: dest,
      label: dest,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      badge: vendors.filter((v) => v.assignedDestinations?.includes(dest)).length,
    })),
  ];

  const categoryOptions = [
    {
      value: 'All',
      label: 'All Categories',
      icon: <Filter className="w-4 h-4 text-slate-400" />,
      badge: vendors.length,
    },
    ...categories.filter((c) => c !== 'All').map((cat) => ({
      value: cat,
      label: cat,
      icon: <Building className="w-4 h-4 text-blue-500" />,
      badge: vendors.filter((v) => v.category === cat).length,
    })),
  ];

  // Filtering for Directory
  const filteredVendors = vendors.filter((v) => {
    const matchCat = categoryFilter === 'All' || v.category === categoryFilter;
    const matchDest =
      destinationFilter === 'All' ||
      (v.assignedDestinations && v.assignedDestinations.includes(destinationFilter));
    const matchSearch =
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDestinations &&
        v.assignedDestinations.some((d) =>
          d.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    return matchCat && matchDest && matchSearch;
  });

  const totalVendors = vendors.length;
  const activeAccessCount = vendors.filter((v) => v.portalAccess).length;
  const pendingApprovalsCount = vendors.filter((v) => v.status === 'Pending Approval').length;

  // Modal: Open Destination Assignment
  const handleOpenDestModal = (vendor: Vendor) => {
    setEditingVendorForDest(vendor);
    setSelectedDestList([...(vendor.assignedDestinations || [])]);
  };

  const handleToggleDestCheckbox = (dest: string) => {
    if (selectedDestList.includes(dest)) {
      if (selectedDestList.length > 1) {
        setSelectedDestList(selectedDestList.filter((d) => d !== dest));
      }
    } else {
      setSelectedDestList([...selectedDestList, dest]);
    }
  };

  const handleSaveDestinations = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendorForDest) return;

    onUpdateVendorDestinations(editingVendorForDest.id, selectedDestList);
    setEditingVendorForDest(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson || !email) return;

    onAddVendor({
      businessName: contactPerson,
      contactPerson,
      email,
      phone,
      location: location || `${assignedDestinations[0] || 'Local'} Territory`,
      category,
      commissionRate: Number(commissionRate),
      portalRole,
      portalAccess,
      assignedDestinations: assignedDestinations.length > 0 ? assignedDestinations : ['Kashmir'],
      status: 'Active',
      registrationId,
      portalPassword,
    });

    setRegisteredSuccessVendor({
      name: contactPerson,
      regId: registrationId,
      email,
      password: portalPassword,
      dest: assignedDestinations.join(', '),
    });

    setContactPerson('');
    setEmail('');
    setPhone('');
    setLocation('');
    setAssignedDestinations(['Kashmir']);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Destination Partners</span>
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalVendors}
          </div>
          <span className="text-xs text-slate-500 font-medium">Across 5 Primary Hubs</span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Portal Login Enabled</span>
            <KeyRound className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeAccessCount}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Authorized portal users
          </span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Destinations Covered</span>
            <MapPin className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            5 Regions
          </div>
          <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
            Kashmir, Andaman, Kerala, Sundarban, Gangtok
          </span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingApprovalsCount}
          </div>
          <span className="text-xs text-amber-600 font-semibold">New applications</span>
        </div>
      </div>

      {/* Top Header Bar with Register Action */}
      <div
        className={`p-3.5 sm:p-4 rounded-[4px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[4px] bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Vendor Directory & Destination Control</span>

            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage authorized local operators, assigned territories, commission rates, and portal credentials.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenRegisterModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      {/* VENDOR DIRECTORY & DESTINATION ACCESS CONTROL */}
      <div className="space-y-4">
        {/* Destination & Category Filter Bar with Dropdowns and Icons */}
        <div
          className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor name, email, location, territory..."
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
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryOptions}
                icon={<Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              />

              {(destinationFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationFilter('All');
                    setCategoryFilter('All');
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
          {(destinationFilter !== 'All' || categoryFilter !== 'All') && (
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
              {categoryFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold text-xs">
                  <Building className="w-3.5 h-3.5 text-sky-500" />
                  <span>Category: {categoryFilter}</span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('All')}
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

        {/* Vendors Table */}
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
                Registered Vendor Partners Log
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {filteredVendors.length} Records
              </span>
            </div>


          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead
                className={`text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark'
                  ? 'bg-slate-800/80 text-slate-300 border-slate-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <tr>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Vendor Partner</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Destination Territory Access</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Tours Completed</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Category & City</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Commission</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Portal Login</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div
                        onClick={() => {
                          setSelectedVendorForDetails(vendor);
                          setIsDetailsModalOpen(true);
                        }}
                        className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate max-w-[160px]"
                      >
                        {vendor.businessName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {vendor.registrationId && (
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold mr-1">
                            {vendor.registrationId} •
                          </span>
                        )}
                        {vendor.contactPerson} • {vendor.email}
                      </div>
                    </td>

                    {/* Destination Access Badges (Clean text, no bg) */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vendor.assignedDestinations && vendor.assignedDestinations.length > 0 ? (
                          vendor.assignedDestinations.slice(0, 3).map((dest, i) => (
                            <span key={dest} className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {dest}{i < Math.min(vendor.assignedDestinations.length, 3) - 1 ? ',' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No territory</span>
                        )}
                        {vendor.assignedDestinations && vendor.assignedDestinations.length > 3 && (
                          <span className="text-[11px] font-medium text-slate-500">
                            +{vendor.assignedDestinations.length - 3}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDestModal(vendor)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                          title="Configure Destination Access"
                        >
                          Edit
                        </button>
                      </div>
                    </td>

                    {/* Tours Completed (Clean text, no bg box) */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVendorForDetails(vendor);
                          setIsDetailsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        title="Click to view all completed tours for this vendor"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{vendor.toursCompleted ?? vendor.completedToursList?.length ?? 0} Completed</span>
                      </button>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="text-slate-900 dark:text-white font-medium text-xs">
                        {vendor.category}
                      </div>
                      <div className="text-[11px] text-slate-500">{vendor.location}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-center font-semibold text-slate-900 dark:text-white text-xs">
                      {vendor.commissionRate}%
                    </td>

                    {/* Portal Access (Clean text, no bg box) */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => onTogglePortalAccess(vendor.id)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer hover:underline ${vendor.portalAccess
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                          }`}
                        title="Toggle Portal Login Access"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{vendor.portalAccess ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Status (Clean text, no dropdown box) */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateVendorStatus(
                            vendor.id,
                            vendor.status === 'Active' ? 'Pending Approval' : 'Active'
                          )
                        }
                        className={`text-xs font-semibold cursor-pointer hover:underline ${vendor.status === 'Active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : vendor.status === 'Pending Approval'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          }`}
                        title="Click to toggle status"
                      >
                        {vendor.status === 'Pending Approval' ? 'Pending' : vendor.status}
                      </button>
                    </td>

                    {/* Actions: View Details + Delete (Clean icons, no bg box) */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVendorForDetails(vendor);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-[4px] text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Vendor Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetVendor(vendor)}
                          className="p-1.5 rounded-[4px] text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Remove vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Industrial Pagination / Counter Bar */}
          <div
            className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
          >
            <div className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredVendors.length > 0 ? 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredVendors.length}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{vendors.length}</span> vendor partners
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
      </div>



      {/* MODAL 1: EDIT DESTINATION TERRITORY ACCESS */}
      {editingVendorForDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-md rounded-[4px] border p-6 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-base">Configure Destination Access</h3>
                <p className="text-xs text-slate-500">{editingVendorForDest.businessName}</p>
              </div>
              <button
                onClick={() => setEditingVendorForDest(null)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestinations} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select which destination territories this vendor is permitted to view and accept leads for. Leads outside these regions will be strictly hidden:
              </p>

              <div className="space-y-2">
                {SUPPORTED_DESTINATIONS.map((dest) => {
                  const isChecked = selectedDestList.includes(dest);
                  return (
                    <div
                      key={dest}
                      onClick={() => handleToggleDestCheckbox(dest)}
                      className={`p-3 rounded-[4px] border cursor-pointer flex items-center justify-between transition-colors ${isChecked
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-[2px] border flex items-center justify-center ${isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-400'
                            }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-sm">{dest}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-[4px] border font-semibold ${getDestinationBadgeStyle(
                          dest
                        )}`}
                      >
                        Territory
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVendorForDest(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px]"
                >
                  Save Territories
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER VENDOR PARTNER WITH DESTINATION SELECTION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-lg rounded-[4px] border p-6 max-h-[90vh] overflow-y-auto ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-base">Register Vendor Partner</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              {/* Destination Territories Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Assigned Destination Territories (Access Control)
                </label>
                <select
                  value={assignedDestinations[0] || 'Kashmir'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'All') {
                      setAssignedDestinations([...SUPPORTED_DESTINATIONS]);
                    } else {
                      setAssignedDestinations([val]);
                    }
                  }}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none cursor-pointer ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  {SUPPORTED_DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest} Territory Access
                    </option>
                  ))}
                  <option value="All">All Territories (All 5 Destinations)</option>
                </select>
              </div>



              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="Tour Operator">Tour Operator</option>
                    <option value="Resort & Hotel">Resort & Hotel</option>
                    <option value="Transport & Fleet">Transport & Fleet</option>
                    <option value="Adventure Guide">Adventure Guide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="vendor@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Portal Role</label>
                  <select
                    value={portalRole}
                    onChange={(e) => setPortalRole(e.target.value as any)}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="Vendor Admin">Vendor Admin</option>
                    <option value="Vendor Manager">Vendor Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  type="text"
                  placeholder="City, State / Region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>


              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px]"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Success Confirmation Pop Up */}
      {registeredSuccessVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-md rounded-[4px] border p-5 sm:p-6 shadow-xl ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-base">Vendor Registered Successfully</h3>
              </div>
              <button
                onClick={() => setRegisteredSuccessVendor(null)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-500">
                Vendor partner credentials generated for portal access. Share these details with the vendor:
              </p>

              <div
                className={`p-3.5 rounded-[4px] border space-y-2.5 ${theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Vendor Partner
                  </span>
                  <p className="text-sm font-semibold">{registeredSuccessVendor.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Registration ID
                    </span>
                    <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {registeredSuccessVendor.regId}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Territory Access
                    </span>
                    <p className="text-xs font-semibold">{registeredSuccessVendor.dest}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Portal Login Email
                  </span>
                  <p className="text-xs font-mono font-semibold">{registeredSuccessVendor.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Portal Password
                  </span>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {registeredSuccessVendor.password}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `KrikoTrip Vendor Partner Credentials\nVendor: ${registeredSuccessVendor.name}\nRegistration ID: ${registeredSuccessVendor.regId}\nLogin Email: ${registeredSuccessVendor.email}\nPassword: ${registeredSuccessVendor.password}\nTerritory Access: ${registeredSuccessVendor.dest}`;
                    copyToClipboard(text, 'all');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                >
                  {copiedField === 'all' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'all' ? 'Copied All!' : 'Copy Credentials'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegisteredSuccessVendor(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details & Completed Tours Modal */}
      <VendorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedVendorForDetails(null);
        }}
        vendor={selectedVendorForDetails}
        onTogglePortalAccess={onTogglePortalAccess}
        onOpenDestModal={handleOpenDestModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetVendor}
        onClose={() => setDeleteTargetVendor(null)}
        onConfirm={() => {
          if (deleteTargetVendor) {
            onDeleteVendor(deleteTargetVendor.id);
            setDeleteTargetVendor(null);
          }
        }}
        itemType="Vendor Account"
        itemName={deleteTargetVendor?.businessName}
        warningMessage="This vendor account, authorized destination access, assigned lead pipelines, and portal credentials will be permanently deleted."
      />
    </div>
  );
};