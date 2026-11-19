import React, { useState } from 'react';
import {
  Save,
  CheckCircle,
  Building,
  Sun,
  Moon,
  Globe,
  ImageIcon,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import type { AgencySettings } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import brandLogo from '../../assets/images/brand-logo.png';

interface SettingsViewProps {
  settings: AgencySettings;
  onSaveSettings: (settings: AgencySettings) => void;
}

type SettingsTab = 'profile-security' | 'appearance' | 'agency';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile-security');
  const [formData, setFormData] = useState<AgencySettings>(initialSettings);
  const [agencySavedSuccess, setAgencySavedSuccess] = useState(false);

  // Admin Profile State
  const [adminName, setAdminName] = useState('Elena Rostova');
  const [adminEmail, setAdminEmail] = useState('superadmin@krikotrip.com');
  const [adminPhone, setAdminPhone] = useState('+91 98300 12345');
  const [adminAvatar, setAdminAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  );
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedSuccess(true);
    setTimeout(() => setProfileSavedSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current admin password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    // Success simulation
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleAgencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setAgencySavedSuccess(true);
    setTimeout(() => setAgencySavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Page Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings & Admin Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your Super Admin credentials, password security, interface theme, and travel agency configurations.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div
          className={`flex items-center gap-1 p-1 rounded-[4px] border shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile-security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${activeTab === 'profile-security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${activeTab === 'appearance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme & Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${activeTab === 'agency'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Agency & Currency</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ADMIN PROFILE & PASSWORD CHANGE                   */}
      {/* ========================================================= */}
      {activeTab === 'profile-security' && (
        <div className="space-y-6">
          {/* Card 1: Admin Profile Details */}
          <div
            className={`p-5 rounded-[4px] border space-y-5 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-base">Super Administrator Profile</h3>
                  <p className="text-xs text-slate-500">Master account credentials for KrikoTrip management</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Super Administrator
              </span>
            </div>

            {profileSavedSuccess && (
              <div className="p-3 rounded-[4px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Admin profile changes saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Profile Avatar Row */}
              <div className="flex items-center gap-4 p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <img
                  src={adminAvatar}
                  alt={adminName}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/20 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Profile Avatar Photo
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Displayed in the top navigation bar and admin session audit logs.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setAdminAvatar(
                          adminAvatar.includes('1534528741775')
                            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                        )
                      }
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Toggle Avatar Style
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Primary Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Security Access Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Super Administrator (Full Root Access)"
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none opacity-70 cursor-not-allowed ${theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Password Change Features */}
          <div
            className={`p-5 rounded-[4px] border space-y-5 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-base">Change Admin Password</h3>
                  <p className="text-xs text-slate-500">
                    Ensure your account is using a long, random password to stay secure
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Encrypted SHA-256</span>
              </div>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Admin password updated successfully! Future logins will require your new password.</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Current Password *
                </label>
                <div className="relative max-w-md">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showCurrentPass ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Guide */}
              <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Password Security Guidelines:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                  <span className={newPassword.length >= 8 ? 'text-emerald-600 font-semibold' : ''}>
                    • Minimum 8 characters long {newPassword.length >= 8 ? '✓' : ''}
                  </span>
                  <span className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600 font-semibold' : ''}>
                    • Passwords match {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : ''}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: APPEARANCE & DARK/LIGHT MODE                      */}
      {/* ========================================================= */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Card: Dark / Light Mode Option */}
          <div
            className={`p-5 rounded-[4px] border space-y-5 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-base">Appearance & Interface Theme</h3>
                  <p className="text-xs text-slate-500">
                    Switch between Light and Dark interface colors across the entire super admin portal
                  </p>
                </div>
              </div>

              {/* Master Sliding Toggle Bar */}
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={toggleTheme}
                className="flex items-center gap-2.5 p-1.5 px-3  dark:border-slate-700 cursor-pointer  transition-colors"
                title="Toggle Dark / Light Theme"
              >
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-blue-600' : 'bg-amber-400'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  />
                </span>
                <span className="text-xs font-semibold">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
            </div>

            {/* Visual Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-[4px] border-2 cursor-pointer transition-all ${theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-sm">Light Theme</span>
                  </div>
                  {theme === 'light' ? (
                    <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded-[4px] bg-blue-100">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Click to Select</span>
                  )}
                </div>

                <div className="p-3 rounded-[4px] bg-white border border-slate-200 space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="w-16 h-2.5 rounded-full bg-slate-200 block" />
                    <span className="w-6 h-2.5 rounded-full bg-blue-600 block" />
                  </div>
                  <div className="w-full h-8 rounded-[4px] bg-slate-50 border border-slate-100 flex items-center px-2">
                    <span className="w-20 h-2 bg-slate-300 rounded-full" />
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Clean crisp white and royal blue palette, ideal for daylight hours.
                </p>
              </div>

              {/* Dark Theme Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-[4px] border-2 cursor-pointer transition-all ${theme === 'dark'
                  ? 'border-blue-500 bg-slate-800/80 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-sm">Dark Theme</span>
                  </div>
                  {theme === 'dark' ? (
                    <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded-[4px] bg-blue-950 border border-blue-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Click to Select</span>
                  )}
                </div>

                <div className="p-3 rounded-[4px] bg-slate-900 border border-slate-700 space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="w-16 h-2.5 rounded-full bg-slate-700 block" />
                    <span className="w-6 h-2.5 rounded-full bg-blue-500 block" />
                  </div>
                  <div className="w-full h-8 rounded-[4px] bg-slate-800 border border-slate-700 flex items-center px-2">
                    <span className="w-20 h-2 bg-slate-600 rounded-full" />
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Deep midnight slate and glowing blue accents, easy on the eyes in low light.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Brand Assets & Favicon */}
          <div
            className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-base">Brand Graphics & Assets</h3>
                <p className="text-xs text-slate-500">Official logo and browser tab favicon active across the portal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Logo Card */}
              <div
                className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Main Agency Logo</span>
                  <span className="text-xs px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
                    1777 × 524 PNG
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[4px] p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[90px]">
                  <img src={brandLogo} alt="KrikoTrip Official Logo" className="max-h-12 w-auto object-contain" />
                </div>
                <p className="text-xs text-slate-500 mt-2.5">
                  Applied in Super Admin navigation sidebar header and public views.
                </p>
              </div>

              {/* Favicon Card */}
              <div
                className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Browser Favicon</span>
                  <span className="text-xs px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
                    48 × 48 ICO
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[4px] p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[90px]">
                  <div className="w-12 h-12 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                    <img src="/favicon.ico" alt="KrikoTrip Favicon" className="w-8 h-8 object-contain" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2.5">
                  Applied in browser tab, bookmarks, mobile header, and collapsed sidebar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AGENCY PROFILE & REGIONAL SETTINGS                */}
      {/* ========================================================= */}
      {activeTab === 'agency' && (
        <form onSubmit={handleAgencySubmit} className="space-y-6">
          {agencySavedSuccess && (
            <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agency profile and currency settings updated successfully!</span>
            </div>
          )}

          {/* Agency Information Card */}
          <div
            className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-base">Travel Agency Profile</h3>
                <p className="text-xs text-slate-500">Company information for vouchers, invoices, and guest communications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Agency Brand Name
                </label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Official Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-xs text-slate-700 dark:text-slate-300">
                Headquarters Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
              />
            </div>
          </div>

          {/* Currency & Regional */}
          <div
            className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-base">Currency & Timezone</h3>
                <p className="text-xs text-slate-500">Default financial currency and agency operating hours</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Primary Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="AED (د.إ)">AED (د.إ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="UTC+5:30 (India Standard)">UTC+5:30 (India Standard)</option>
                  <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                  <option value="UTC+0 (London, GMT)">UTC+0 (London, GMT)</option>
                  <option value="UTC+1 (Central European)">UTC+1 (Central European)</option>
                  <option value="UTC+4 (Dubai)">UTC+4 (Dubai)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Agency Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
