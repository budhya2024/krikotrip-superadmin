import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type {
  NavigationKey,
  Tour,
  BookingEnquiry,
  Vendor,
  TourReview,
} from '../../types';
import {
  mockTours,
  mockEnquiries,
  mockVendors,
  mockReviews,
} from '../../data/mockData';
import { DashboardView } from '../views/DashboardView';
import { HomePageView } from '../views/HomePageView';
import { ManageTourView } from '../views/ManageTourView';
import { BookingEnquiryView } from '../views/BookingEnquiryView';
import { VendorPortalView } from '../views/VendorPortalView';
import { ReviewsManagementView } from '../views/ReviewsManagementView';
import { BlogView } from '../views/BlogView';
import { GalleryView } from '../views/GalleryView';
import { ContactView } from '../views/ContactView';
import { ChatbotView } from '../views/ChatbotView';
import { SettingsView } from '../views/SettingsView';
import { useTheme } from '../../context/ThemeContext';

const validNavigationKeys: readonly NavigationKey[] = [
  'dashboard',
  'home-page',
  'manage-tours',
  'booking-enquiries',
  'vendors',
  'reviews',
  'blog',
  'gallery',
  'contact',
  'chatbot',
  'settings',
];

const isValidNavigationKey = (key: unknown): key is NavigationKey => {
  return typeof key === 'string' && (validNavigationKeys as readonly string[]).includes(key);
};

export const AdminLayout: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const currentTab: NavigationKey = isValidNavigationKey(tabParam) ? tabParam : 'dashboard';

  const handleSelectTab = (tab: NavigationKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'dashboard') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);

  const [tours, setTours] = useState<Tour[]>(mockTours);
  const [enquiries, setEnquiries] = useState<BookingEnquiry[]>(mockEnquiries);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [reviews, setReviews] = useState<TourReview[]>(mockReviews);

  const handleAddTour = (newTour: Tour) => {
    setTours([newTour, ...tours]);
  };

  const handleUpdateTour = (updatedTour: Tour) => {
    setTours(tours.map((t) => (t.id === updatedTour.id ? updatedTour : t)));
  };

  const handleDeleteTour = (id: string) => {
    setTours(tours.filter((t) => t.id !== id));
  };

  const handleToggleTourStatus = (id: string) => {
    setTours(
      tours.map((t) => (t.id === id ? { ...t, status: t.status === 'Published' ? 'Draft' : 'Published' } : t))
    );
  };

  const handleUpdateEnquiryStatus = (id: string, status: BookingEnquiry['status']) => {
    setEnquiries(
      enquiries.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const handleDeleteEnquiry = (id: string) => {
    setEnquiries(enquiries.filter((e) => e.id !== id));
  };

  const handleAssignVendor = (enquiryId: string, vendorId: string, vendorName: string) => {
    setEnquiries(
      enquiries.map((e) =>
        e.id === enquiryId
          ? {
            ...e,
            assignedVendorId: vendorId,
            assignedVendorName: vendorName,
            vendorLeadStatus: 'Sent to Vendor',
          }
          : e
      )
    );
  };

  const handleUpdatePricing = (
    enquiryId: string,
    pricing: {
      baseCost: number;
      markupPercent: number;
      taxPercent: number;
      discountAmount: number;
      finalQuotedPrice: number;
      vendorPayout: number;
      agencyMargin: number;
    }
  ) => {
    setEnquiries(
      enquiries.map((e) =>
        e.id === enquiryId
          ? {
            ...e,
            ...pricing,
            budget: `₹${pricing.finalQuotedPrice.toLocaleString('en-IN')}`,
          }
          : e
      )
    );
  };

  const handleVendorLeadResponse = (enquiryId: string, response: 'Accepted' | 'Declined') => {
    setEnquiries(
      enquiries.map((e) =>
        e.id === enquiryId
          ? {
            ...e,
            vendorLeadStatus: response,
            status: response === 'Accepted' ? 'In Progress' : e.status,
          }
          : e
      )
    );
  };

  const handleTogglePortalAccess = (id: string) => {
    setVendors(
      vendors.map((v) => (v.id === id ? { ...v, portalAccess: !v.portalAccess } : v))
    );
  };

  const handleUpdateVendorStatus = (id: string, status: Vendor['status']) => {
    setVendors(
      vendors.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const handleUpdateVendorDestinations = (vendorId: string, destinations: string[]) => {
    setVendors(
      vendors.map((v) =>
        v.id === vendorId ? { ...v, assignedDestinations: destinations } : v
      )
    );
  };

  const handleAddVendor = (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'toursListed'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: vendorData.registrationId || `VND-${300 + vendors.length + 1}`,
      createdAt: 'Just now',
      toursListed: 0,
    };
    setVendors([newVendor, ...vendors]);
  };

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
  };

  const handleAddReview = (newReview: TourReview) => {
    setReviews([newReview, ...reviews]);
  };

  const handleUpdateReview = (updatedReview: TourReview) => {
    setReviews(reviews.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleToggleShowOnPackage = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, showOnPackage: !r.showOnPackage } : r))
    );
  };

  const handleToggleShowOnHome = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, showOnHome: !r.showOnHome } : r))
    );
  };

  const handleUpdateReviewStatus = (id: string, status: TourReview['status']) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleReplyToReview = (id: string, reply: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, adminReply: reply } : r))
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            tours={tours}
            enquiries={enquiries}
            onNavigate={(tab) => handleSelectTab(tab)}
          />
        );
      case 'home-page':
        return <HomePageView />;
      case 'manage-tours':
        return (
          <ManageTourView
            tours={tours}
            onAddTour={handleAddTour}
            onUpdateTour={handleUpdateTour}
            onDeleteTour={handleDeleteTour}
            onToggleStatus={handleToggleTourStatus}
            isAddModalOpen={isAddTourModalOpen}
            setIsAddModalOpen={setIsAddTourModalOpen}
          />
        );
      case 'booking-enquiries':
        return (
          <BookingEnquiryView
            enquiries={enquiries}
            vendors={vendors}
            onUpdateStatus={handleUpdateEnquiryStatus}
            onDeleteEnquiry={handleDeleteEnquiry}
            onAssignVendor={handleAssignVendor}
            onUpdatePricing={handleUpdatePricing}
          />
        );
      case 'vendors':
        return (
          <VendorPortalView
            vendors={vendors}
            enquiries={enquiries}
            onTogglePortalAccess={handleTogglePortalAccess}
            onUpdateVendorStatus={handleUpdateVendorStatus}
            onUpdateVendorDestinations={handleUpdateVendorDestinations}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
            onVendorLeadResponse={handleVendorLeadResponse}
          />
        );
      case 'reviews':
        return (
          <ReviewsManagementView
            reviews={reviews}
            tours={tours}
            onAddReview={handleAddReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
            onToggleShowOnPackage={handleToggleShowOnPackage}
            onToggleShowOnHome={handleToggleShowOnHome}
            onUpdateReviewStatus={handleUpdateReviewStatus}
            onReplyToReview={handleReplyToReview}
          />
        );
      case 'blog':
        return <BlogView />;
      case 'gallery':
        return <GalleryView />;
      case 'contact':
        return <ContactView />;
      case 'chatbot':
        return <ChatbotView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
        }`}
    >
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`transition-all duration-200 min-h-screen flex flex-col min-w-0 ${isSidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
          }`}
      >
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full min-w-0 max-w-[1720px] mx-auto">
          {renderContent()}
        </main>

        <footer
          className={`py-3 px-5 border-t text-xs text-center ${theme === 'dark'
            ? 'border-slate-800 text-slate-500 bg-slate-900'
            : 'border-slate-200 text-slate-400 bg-white'
            }`}
        >
          <div className="flex items-center justify-between max-w-[1720px] mx-auto">
            <span>&copy; 2026 KrikoTrip Admin</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
