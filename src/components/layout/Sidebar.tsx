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
} from 'lucide-react';
import type { NavigationKey, NavItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
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

  const sidebarContent = (
    <div
      className={`h-full flex flex-col justify-between select-none transition-colors duration-200 ${theme === 'dark'
        ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
        : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
    >
      {/* Top Header / Branding */}
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
                <div className="">
                  <img
                    src={brandLogo}
                    alt="KrikoTrip"
                    className="w-auto max-w-[140px] object-contain"
                  />
                </div>

              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-[4px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
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

        {/* Navigation List - Enhanced Font Size & Spacing (Direct 1-Click Navigation, No Dropdown Boxes) */}
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

                {/* Tooltip when collapsed */}
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

      {/* Bottom Footer Section: Profile & Branding */}
      <div
        className={`p-3 border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
      >
        {!isCollapsed ? (
          /* Expanded: Show Profile Icon and Name - No border */
          <div
            onClick={() => onSelectTab('settings')}
            className={`p-2.5 rounded-[4px] flex items-center justify-between cursor-pointer transition-colors ${theme === 'dark'
              ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-100'
              : 'bg-white shadow-xs hover:bg-blue-50/60 text-slate-800'
              }`}
            title="Open Admin Profile & Settings"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="KrikoTrip Super Admin"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate">
                  KrikoTrip Super Admin
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate">
                  Super Admin Panel
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab('settings');
              }}
              className="p-1.5 rounded-[4px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed: Only show the Logo */
          <div className="flex flex-col items-center gap-2 py-0.5">
            <button
              onClick={onToggleCollapse}
              title="KrikoTrip Super Admin (Click to expand)"
              className="w-10 h-10 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <img
                src="/favicon.ico"
                alt="KrikoTrip Logo"
                className="w-7 h-7 object-contain"
              />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${isCollapsed ? 'w-18' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
