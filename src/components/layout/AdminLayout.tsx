import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type {
  NavigationKey,
  Tour,
  BookingEnquiry,
} from '../../types';
import {
  mockTours,
  mockEnquiries,
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
  const [enquiries] = useState<BookingEnquiry[]>(mockEnquiries);

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
        return <BookingEnquiryView />;
      case 'vendors':
        return <VendorPortalView />;
      case 'reviews':
        return <ReviewsManagementView />;
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
