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
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { NavigationKey } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/use-auth';
import {
  useAdminNotificationsQuery,
  useAdminNotificationUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type AdminNotificationItem,
} from '../../api/notifications';

interface HeaderProps {
  currentTab: NavigationKey;
  onSelectTab: (tab: NavigationKey) => void;
  onOpenMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
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

const formatTimeAgo = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { adminUser, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: unreadCountData } = useAdminNotificationUnreadCountQuery();
  const { data: notificationsData } = useAdminNotificationsQuery({ limit: 20 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadCountData ?? 0;
  const notifications = notificationsData?.data ?? [];
  const currentTitle = tabTitles[currentTab] || 'Admin';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  const handleMarkAllAsRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  const handleNotificationClick = async (item: AdminNotificationItem) => {
    if (!item.readAt) {
      await markReadMutation.mutateAsync(item.id);
    }
    setShowNotifications(false);
    if (item.targetTab) {
      onSelectTab(item.targetTab as NavigationKey);
    }
  };

  const getNotificationIcon = (type: AdminNotificationItem['type']) => {
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

  const adminDisplayName = adminUser?.name || 'Super Admin';
  const initialLetter = adminDisplayName.charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-200 border-b ${theme === 'dark'
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-slate-800'
        }`}
    >
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-[4px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight hidden sm:block">
              {currentTitle}
            </h1>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight sm:hidden">
              {mobileTabTitles[currentTab] || currentTitle}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
              KrikoTrip Central Travel Management Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-[4px] relative transition-colors cursor-pointer ${showNotifications
                ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
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
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${!item.readAt
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
                            <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {item.body}
                          </p>
                        </div>
                        {!item.readAt && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2 p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-100'
                : 'hover:bg-slate-100 text-slate-800'
                }`}
              title="Admin Profile Menu"
            >
              {adminUser?.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminDisplayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-blue-500/20 shrink-0">
                  {initialLetter}
                </div>
              )}
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[130px] truncate">
                {adminDisplayName}
              </span>
            </button>

            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
                  }`}
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {adminDisplayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {adminUser?.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    Super Admin
                  </span>
                </div>

                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Settings & Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      void signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
