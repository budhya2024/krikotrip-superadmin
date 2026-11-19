import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  CheckCheck,
  Calendar,
  Star,
  Users,
  MessageSquare,
} from 'lucide-react';
import type { NavigationKey } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentTab: NavigationKey;
  onSelectTab: (tab: NavigationKey) => void;
  onOpenMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'booking' | 'review' | 'vendor' | 'contact';
  read: boolean;
  tab: NavigationKey;
}

const tabTitles: Record<NavigationKey, string> = {
  dashboard: 'Dashboard Overview',
  'home-page': 'Home Page Management',
  'manage-tours': 'Manage Tours & Packages',
  'booking-enquiries': 'Booking Enquiries',
  vendors: 'Vendor Portal & Access',
  reviews: 'Customer Review Management',
  blog: 'Blog & Articles',
  gallery: 'Photo & Media Gallery',
  contact: 'Contact & Messages',
  chatbot: 'AI Travel Chatbot Management',
  settings: 'Settings & Admin Profile',
};

const mobileTabTitles: Record<NavigationKey, string> = {
  dashboard: 'Dashboard',
  'home-page': 'Home Page',
  'manage-tours': 'Manage Tours',
  'booking-enquiries': 'Enquiries',
  vendors: 'Vendor Portal',
  reviews: 'Review Management',
  blog: 'Blog',
  gallery: 'Gallery',
  contact: 'Messages',
  chatbot: 'Chatbot',
  settings: 'Settings',
};

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Booking Enquiry',
    description: 'Kritika Agarwal submitted enquiry for Tiger Trail package',
    time: '5m ago',
    type: 'booking',
    read: false,
    tab: 'booking-enquiries',
  },
  {
    id: '2',
    title: 'New Customer Review',
    description: 'Aarav Sharma rated 5 stars for Kerala Houseboat Tour',
    time: '25m ago',
    type: 'review',
    read: false,
    tab: 'reviews',
  },
  {
    id: '3',
    title: 'Vendor Partner Update',
    description: 'Kashmir Alpine & Shikara updated portal details',
    time: '2h ago',
    type: 'vendor',
    read: false,
    tab: 'vendors',
  },
  {
    id: '4',
    title: 'New Contact Message',
    description: 'Vikram Singh sent enquiry regarding group custom tour',
    time: '1d ago',
    type: 'contact',
    read: true,
    tab: 'contact',
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentTitle = tabTitles[currentTab] || 'Admin';

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setShowNotifications(false);
    onSelectTab(item.tab);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'vendor':
        return <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'contact':
        return <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-200 border-b ${theme === 'dark'
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-slate-800'
        }`}
    >
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-[4px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="lg:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0">
              <img src="/favicon.ico" alt="KrikoTrip" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
            </div>
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate overflow-hidden">
              <span className="md:hidden block truncate">{mobileTabTitles[currentTab] || currentTitle}</span>
              <span className="hidden md:inline truncate">{currentTitle}</span>
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notification Button & Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-[4px] transition-colors cursor-pointer ${theme === 'dark'
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-[4px] border z-50 shadow-lg ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${!item.read
                          ? theme === 'dark'
                            ? 'bg-slate-800/40 hover:bg-slate-800/70'
                            : 'bg-blue-50/40 hover:bg-blue-50/70'
                          : theme === 'dark'
                            ? 'hover:bg-slate-800/50'
                            : 'hover:bg-slate-50'
                          }`}
                      >
                        <div className="mt-0.5 p-1.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getNotificationIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        {!item.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher Button - No border */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-[4px] transition-colors cursor-pointer ${theme === 'dark'
              ? 'text-amber-400 hover:bg-slate-800'
              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
              }`}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* User Profile - Only icon and name, no dropdown menu */}
          <div
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-2 p-1 sm:p-1.5 rounded-[4px] transition-colors cursor-pointer ${theme === 'dark'
              ? 'hover:bg-slate-800 text-slate-100'
              : 'hover:bg-slate-100 text-slate-800'
              }`}
            title="Settings & Admin Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="KrikoTrip Super Admin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
            />
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
              KrikoTrip Admin Panel
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
