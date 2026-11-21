import React from 'react';
import {
  Compass,
  MapPin,
  CalendarCheck2,
  BookOpen,
  Image as GalleryIcon,
  Mail,
  Settings as SettingsIcon,
  LayoutDashboard,
  Home,
  ChevronRight,
  ChevronLeft,
  X,
  Building2,
  Star,
  Bot,
  LogOut,
} from 'lucide-react';
import type { NavigationKey, NavItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/use-auth';
import brandLogo from '../../assets/images/brand-logo.png';

interface SidebarProps {
  currentTab: NavigationKey;
  onSelectTab: (tab: NavigationKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { theme } = useTheme();
  const { adminUser, signOut } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconName: 'LayoutDashboard',
    },
    {
      id: 'home-page',
      label: 'Home Page',
      iconName: 'Home',
    },
    {
      id: 'manage-tours',
      label: 'Manage Tour',
      iconName: 'MapPin',
    },
    {
      id: 'booking-enquiries',
      label: 'Booking Enquiry',
      iconName: 'CalendarCheck2',
    },
    {
      id: 'vendors',
      label: 'Vendor Portal',
      iconName: 'Building2',
    },
    {
      id: 'reviews',
      label: 'Review Management',
      iconName: 'Star',
    },
    {
      id: 'blog',
      label: 'Manage Blog',
      iconName: 'BookOpen',
    },
    {
      id: 'gallery',
      label: 'Gallery Images',
      iconName: 'GalleryIcon',
    },
    {
      id: 'contact',
      label: 'Contact us',
      iconName: 'Mail',
    },
    {
      id: 'chatbot',
      label: 'Chatbot',
      iconName: 'Bot',
    },
    {
      id: 'settings',
      label: 'Setting',
      iconName: 'SettingsIcon',
    },
  ];

  const renderIcon = (name: string, active: boolean) => {
    const iconClass = `w-5 h-5 transition-colors shrink-0 ${active ? 'text-white' : ''
      }`;

    switch (name) {
      case 'LayoutDashboard':
        return <LayoutDashboard className={iconClass} />;
      case 'Home':
        return <Home className={iconClass} />;
      case 'MapPin':
        return <MapPin className={iconClass} />;
      case 'CalendarCheck2':
        return <CalendarCheck2 className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Star':
        return <Star className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'GalleryIcon':
        return <GalleryIcon className={iconClass} />;
      case 'Mail':
        return <Mail className={iconClass} />;
      case 'Bot':
        return <Bot className={iconClass} />;
      case 'SettingsIcon':
        return <SettingsIcon className={iconClass} />;
      default:
        return <Compass className={iconClass} />;
    }
  };

  const adminDisplayName = adminUser?.name || 'Super Admin';
  const initialLetter = adminDisplayName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div
      className={`h-full flex flex-col justify-between select-none transition-colors duration-200 ${theme === 'dark'
        ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
        : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
    >
      <div>
        <div
          className={`h-16 px-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}
        >
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            {isCollapsed ? (
              <div
                title="KrikoTrip Super Admin"
                className="w-10 h-10 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0"
              >
                <img
                  src="/favicon.ico"
                  alt="KrikoTrip"
                  className="w-7 h-7 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src={brandLogo}
                  alt="KrikoTrip"
                  className="w-auto max-w-[140px] object-contain"
                />
              </div>
            )}
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-[4px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-sm font-semibold cursor-pointer transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/80'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}>
                      {renderIcon(item.iconName, isActive)}
                    </span>
                    {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
                  </div>
                </button>

                {isCollapsed && (
                  <div className="hidden group-hover:flex absolute left-full ml-2 px-2.5 py-1.5 rounded-[4px] bg-slate-900 text-white text-xs font-semibold whitespace-nowrap z-50 items-center gap-1.5 border border-slate-700 shadow-sm pointer-events-none">
                    <span>{item.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div
        className={`p-3 border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
      >
        {!isCollapsed ? (
          <div
            className={`p-2.5 rounded-lg flex items-center justify-between transition-colors ${theme === 'dark'
              ? 'bg-slate-800/80 text-slate-100'
              : 'bg-white shadow-xs text-slate-800'
              }`}
          >
            <div
              onClick={() => onSelectTab('settings')}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer min-w-0"
              title="Open Admin Profile & Settings"
            >
              {adminUser?.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminDisplayName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-blue-500/20 shrink-0">
                  {initialLetter}
                </div>
              )}
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-semibold truncate">
                  {adminDisplayName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {adminUser?.email || 'Super Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => onSelectTab('settings')}
                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-0.5">
            <button
              onClick={() => onSelectTab('settings')}
              title={`Settings (${adminDisplayName})`}
              className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {adminUser?.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminDisplayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {initialLetter}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full flex items-center justify-center p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${isCollapsed ? 'w-18' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
