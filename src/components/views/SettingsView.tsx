import React, { useState, useRef } from 'react';
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
  Upload,
  Loader2,
  Trash2,
  Bell,
  Share2,
  BarChart3,
  Award,
  Mail,
} from 'lucide-react';
import type { AgencySettings } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/use-auth';
import { authClient } from '../../lib/auth-client';
import { updateAdminProfile } from '../../api/admin';
import { uploadAdminImage } from '../../api/media';
import {
  useAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  type LoyaltyConfig,
  type LoyaltyTierConfig,
} from '../../api/settings';
import brandLogo from '../../assets/images/brand-logo.png';

interface SettingsViewProps {
  settings?: AgencySettings;
  onSaveSettings?: (settings: AgencySettings) => void;
}

type SettingsTab = 'profile-security' | 'appearance' | 'agency' | 'loyalty';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
}) => {
  const { theme, setTheme } = useTheme();
  const { adminUser, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile-security');

  const { data: serverSettings, isLoading: isSettingsLoading } = useAdminSettingsQuery();
  const updateSettingsMutation = useUpdateAdminSettingsMutation();

  const [formData, setFormData] = useState<AgencySettings>(() => ({
    agencyName: initialSettings?.agencyName || 'KrikoTrip Holidays & Luxury Travels',
    tagline: initialSettings?.tagline || 'Your Gateway to Extraordinary Journeys',
    contactEmail: initialSettings?.contactEmail || 'info@krikotrips.com',
    phone: initialSettings?.phone || '+91 8250338715',
    whatsappNumber: initialSettings?.whatsappNumber || '+91 8250338715',
    address: initialSettings?.address || 'BL-A Shop-GLP/5 676 Green Land Park, Sonarpur, Kolkata - 700103',
    mapEmbedUrl:
      initialSettings?.mapEmbedUrl ||
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14748.241355447664!2d88.4239!3d22.4419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02720d440939fb%3A0xb35a396e6255776a!2sSonarpur%2C%20Kolkata%2C%20West%20Bengal%20700103!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    currency: initialSettings?.currency || 'INR',
    timezone: initialSettings?.timezone || 'Asia/Kolkata',
    bookingAutoConfirm: initialSettings?.bookingAutoConfirm ?? false,
    emailNotifications: initialSettings?.emailNotifications ?? true,
    smsAlerts: initialSettings?.smsAlerts ?? false,
    socialLinks: initialSettings?.socialLinks || {
      facebook: 'https://facebook.com/krikotrip',
      instagram: 'https://instagram.com/krikotrip',
      youtube: 'https://youtube.com/@krikotrip',
      pinterest: 'https://pinterest.com/krikotrip',
    },
    homeStats: initialSettings?.homeStats || [
      { id: 'tours', label: 'Tour Completed', value: '1000+', number: '1000+' },
      { id: 'experience', label: 'Travel Experience', value: '10+', number: '10+' },
      { id: 'travelers', label: 'Happy Traveler', value: '1+', number: '1+' },
      { id: 'retention', label: 'Retention Rate', value: '98%', number: '98%' },
    ],
  }));

  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>({
    pointValuePaise: 100,
    earnPercent: 1,
    redeemMaxPercentOfOrder: 100,
    tiers: [
      { tier: 'silver_explorer', minLifetimePoints: 0 },
      { tier: 'gold_explorer', minLifetimePoints: 1000 },
      { tier: 'platinum_elite', minLifetimePoints: 5000 },
    ],
    signupBonusPoints: 0,
  });
  const [loyaltySavedSuccess, setLoyaltySavedSuccess] = useState(false);
  const [loyaltyError, setLoyaltyError] = useState('');

  const [prevServerSettings, setPrevServerSettings] = useState(serverSettings);
  if (serverSettings !== prevServerSettings) {
    setPrevServerSettings(serverSettings);
    if (serverSettings) {
      setFormData({
        agencyName: serverSettings.agencyName,
        tagline: serverSettings.tagline || '',
        contactEmail: serverSettings.contactEmail,
        phone: serverSettings.supportPhone,
        whatsappNumber: serverSettings.whatsappNumber || '',
        address: serverSettings.address || '',
        mapEmbedUrl: serverSettings.mapEmbedUrl || '',
        currency: serverSettings.currency,
        timezone: serverSettings.timezone,
        bookingAutoConfirm: serverSettings.bookingAutoConfirm,
        emailNotifications: serverSettings.emailNotifications,
        smsAlerts: serverSettings.smsAlerts,
        socialLinks: serverSettings.socialLinks || {},
        homeStats: serverSettings.homeStats || [],
      });
      if (serverSettings.loyaltyConfig) {
        const raw = serverSettings.loyaltyConfig as unknown as Partial<LoyaltyConfig>;
        setLoyaltyConfig({
          pointValuePaise: typeof raw.pointValuePaise === 'number' ? raw.pointValuePaise : 100,
          earnPercent: typeof raw.earnPercent === 'number' ? raw.earnPercent : 1,
          redeemMaxPercentOfOrder:
            typeof raw.redeemMaxPercentOfOrder === 'number' ? raw.redeemMaxPercentOfOrder : 100,
          tiers:
            Array.isArray(raw.tiers) && raw.tiers.length > 0
              ? (raw.tiers as LoyaltyTierConfig[])
              : [
                  { tier: 'silver_explorer', minLifetimePoints: 0 },
                  { tier: 'gold_explorer', minLifetimePoints: 1000 },
                  { tier: 'platinum_elite', minLifetimePoints: 5000 },
                ],
          signupBonusPoints:
            typeof raw.signupBonusPoints === 'number' ? raw.signupBonusPoints : 0,
        });
      }
    }
  }

  const [agencySavedSuccess, setAgencySavedSuccess] = useState(false);
  const [agencyError, setAgencyError] = useState('');

  const [adminName, setAdminName] = useState(adminUser?.name || '');
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || '');
  const [adminPhone, setAdminPhone] = useState(adminUser?.phone || '');
  const [adminAvatar, setAdminAvatar] = useState(adminUser?.avatarUrl || '');
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileError('Avatar photo exceeds 10MB limit.');
      return;
    }

    setIsUploadingAvatar(true);
    setProfileError('');

    try {
      const uploadRes = await uploadAdminImage(file, 'avatar');
      await updateAdminProfile({ phone: adminPhone || null, avatarMediaId: uploadRes.id });
      await refreshSession();
      setAdminAvatar(uploadRes.url);
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch {
      setProfileError('Failed to upload avatar image. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setProfileError('');
    try {
      await updateAdminProfile({ phone: adminPhone || null, avatarMediaId: null });
      await refreshSession();
      setAdminAvatar('');
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch {
      setProfileError('Failed to remove avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [prevUser, setPrevUser] = useState(adminUser);
  if (adminUser !== prevUser) {
    setPrevUser(adminUser);
    if (adminUser) {
      setAdminName(adminUser.name);
      setAdminEmail(adminUser.email);
      setAdminPhone(adminUser.phone || '');
      setAdminAvatar(adminUser.avatarUrl || '');
    }
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    try {
      if (adminName && adminName !== adminUser?.name) {
        await authClient.updateUser({ name: adminName });
      }
      await updateAdminProfile({ phone: adminPhone || null });
      await refreshSession();
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch {
      setProfileError('Failed to save profile changes. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current admin password.');
      return;
    }

    if (newPassword.length < 14) {
      setPasswordError('New password must be at least 14 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res?.error) {
        setPasswordError(res.error.message || 'Failed to update password.');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError('Unable to update password. Please check your credentials.');
    }
  };

  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeError('');
    setEmailChangeSuccess('');

    const targetEmail = newAdminEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setEmailChangeError('Please enter a valid email address.');
      return;
    }

    if (targetEmail === adminEmail.toLowerCase()) {
      setEmailChangeError('New email cannot be the same as your current email.');
      return;
    }

    setIsChangingEmail(true);
    try {
      const res = await authClient.changeEmail({
        newEmail: targetEmail,
        callbackURL: window.location.origin + '/admin',
      });

      if (res?.error) {
        setEmailChangeError(res.error.message || 'Failed to request email change.');
        return;
      }

      setEmailChangeSuccess(
        `Verification email sent to ${targetEmail}. Please check your inbox to confirm the change.`,
      );
      setNewAdminEmail('');
    } catch {
      setEmailChangeError('Unable to send email change verification. Please try again.');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoyaltyError('');
    setLoyaltySavedSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync({
        loyaltyConfig,
      });
      setLoyaltySavedSuccess(true);
      setTimeout(() => setLoyaltySavedSuccess(false), 3000);
    } catch {
      setLoyaltyError('Failed to save loyalty settings. Please try again.');
    }
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgencyError('');
    try {
      await updateSettingsMutation.mutateAsync({
        agencyName: formData.agencyName,
        tagline: formData.tagline || null,
        contactEmail: formData.contactEmail,
        supportPhone: formData.phone,
        whatsappNumber: formData.whatsappNumber || null,
        address: formData.address || null,
        mapEmbedUrl: formData.mapEmbedUrl || null,
        currency: formData.currency,
        timezone: formData.timezone,
        bookingAutoConfirm: formData.bookingAutoConfirm,
        emailNotifications: formData.emailNotifications,
        smsAlerts: formData.smsAlerts,
        socialLinks: formData.socialLinks || {},
        homeStats: formData.homeStats || [],
      });
      if (onSaveSettings) {
        onSaveSettings(formData);
      }
      setAgencySavedSuccess(true);
      setTimeout(() => setAgencySavedSuccess(false), 3000);
    } catch {
      setAgencyError('Failed to save agency settings. Please check your connection and try again.');
    }
  };

  const updateStatItem = (index: number, field: 'label' | 'value', val: string) => {
    const list = [...(formData.homeStats || [])];
    if (list[index]) {
      list[index] = {
        ...list[index],
        [field]: val,
        ...(field === 'value' ? { number: val } : {}),
      };
      setFormData({ ...formData, homeStats: list });
    }
  };

  const updateSocialLink = (platform: string, val: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...(formData.socialLinks || {}),
        [platform]: val,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings & Admin Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your Super Admin credentials, password security, interface theme, and travel agency configurations.
          </p>
        </div>

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
            <Shield className="w-3.5 h-3.5" />
            <span>Profile & Security</span>
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

          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${activeTab === 'loyalty'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Loyalty & Tiers</span>
          </button>
        </div>
      </div>

      {activeTab === 'profile-security' && (
        <div className="space-y-6">
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
                  <h3 className="font-semibold text-base">Super Admin Profile</h3>
                  <p className="text-xs text-slate-500">
                    Your personal information and identity across the administration panel
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-2xs font-bold uppercase rounded-[4px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Super Admin
              </span>
            </div>

            {profileError && (
              <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSavedSuccess && (
              <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile details saved successfully!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative group shrink-0">
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt={adminName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center border-2 border-blue-400 shadow-xs">
                    {(adminName || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Admin Avatar Photo</h4>
                <p className="text-xs text-slate-500">
                  Recommended size: 256x256 px. Supports JPG, PNG, and WebP up to 10MB.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                  {adminAvatar && (
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={adminEmail}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-3xs text-slate-400 mt-1">Super admin email is locked to primary auth credentials</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
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
                <span>Encrypted Security</span>
              </div>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Admin password updated successfully! Future logins will require your new password.</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="At least 14 characters"
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
                      placeholder="Re-type new password"
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

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          <div
            className={`p-5 rounded-[4px] border space-y-5 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-base">Change Admin Email</h3>
                  <p className="text-xs text-slate-500">
                    Update your primary super admin login address via email verification
                  </p>
                </div>
              </div>
            </div>

            {emailChangeError && (
              <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailChangeError}</span>
              </div>
            )}

            {emailChangeSuccess && (
              <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  New Admin Email Address *
                </label>
                <div className="max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="new-admin@krikotrips.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                  <p className="text-3xs text-slate-400 mt-1">
                    A confirmation link will be delivered to the new email address before the update takes effect.
                  </p>
                </div>
              </div>

              <div className="flex justify-start pt-1">
                <button
                  type="submit"
                  disabled={isChangingEmail || !newAdminEmail}
                  className="flex items-center gap-2 px-5 py-2 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isChangingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  <span>{isChangingEmail ? 'Sending Link...' : 'Send Verification Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div
            className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <Sun className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-base">Dashboard Interface Theme</h3>
                <p className="text-xs text-slate-500">
                  Select your preferred color mode for daily operational use
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-[4px] border text-left flex items-start gap-3.5 transition-all cursor-pointer ${theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className="p-2.5 rounded-[4px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Light Mode</span>
                    {theme === 'light' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Clean, high-contrast crisp theme designed for daylight viewing and office hours.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-[4px] border text-left flex items-start gap-3.5 transition-all cursor-pointer ${theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className="p-2.5 rounded-[4px] bg-slate-800 text-slate-200 dark:bg-slate-700 shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Dark Mode</span>
                    {theme === 'dark' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Deep slate low-glare theme designed to reduce eye strain in low-light environments.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div
            className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-base">Agency Brand Assets</h3>
                <p className="text-xs text-slate-500">Official brand mark rendered across portal headers and client invoices</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                <img src={brandLogo} alt="KrikoTrip Brand Logo" className="h-10 w-auto object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Active Brand Logo</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-definition transparent vector PNG used as the primary emblem for KrikoTrip.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agency' && (
        <form onSubmit={handleAgencySubmit} className="space-y-6">
          {agencyError && (
            <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{agencyError}</span>
            </div>
          )}

          {agencySavedSuccess && (
            <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agency profile, regional settings, and home statistics updated successfully!</span>
            </div>
          )}

          {isSettingsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
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
                      Agency Brand Name *
                    </label>
                    <input
                      type="text"
                      required
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
                      Support Email *
                    </label>
                    <input
                      type="email"
                      required
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
                      Official Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 8250338715"
                      value={formData.whatsappNumber || ''}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Google Maps Embed URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      value={formData.mapEmbedUrl || ''}
                      onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
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
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Timezone (IANA)
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+05:30)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST, UTC+04:00)</option>
                      <option value="Asia/Bangkok">Asia/Bangkok (ICT, UTC+07:00)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+08:00)</option>
                      <option value="Europe/London">Europe/London (GMT/BST, UTC+00:00)</option>
                      <option value="Europe/Paris">Europe/Paris (CET/CEST, UTC+01:00)</option>
                      <option value="America/New_York">America/New_York (EST/EDT, UTC-05:00)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-base">Automation & Notification Preferences</h3>
                    <p className="text-xs text-slate-500">Control automated booking confirmations and alert channels</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-[4px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bookingAutoConfirm}
                      onChange={(e) => setFormData({ ...formData, bookingAutoConfirm: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                        Automatic Booking Confirmation
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Automatically confirm guest booking enquiries when packages carry fixed pricing and immediate availability.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-[4px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                        Admin Email Notifications
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Enqueue automated email alerts to the support email address whenever a new guest enquiry or message arrives.
                      </span>
                    </div>
                  </label>

                  <div className="flex items-start justify-between gap-3 p-3 rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 opacity-70">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled
                        checked={false}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-400 cursor-not-allowed"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                          SMS Instant Alerts
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Send mobile SMS alerts via transactional gateway for critical booking actions.
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-3xs font-bold uppercase rounded-[4px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-base">Social Media Profiles</h3>
                    <p className="text-xs text-slate-500">Public social account URLs linked across the site footer and customer touchpoints</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/krikotrip"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => updateSocialLink('facebook', e.target.value)}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/krikotrip"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => updateSocialLink('instagram', e.target.value)}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@krikotrip"
                      value={formData.socialLinks?.youtube || ''}
                      onChange={(e) => updateSocialLink('youtube', e.target.value)}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Pinterest URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://pinterest.com/krikotrip"
                      value={formData.socialLinks?.pinterest || ''}
                      onChange={(e) => updateSocialLink('pinterest', e.target.value)}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-base">Homepage Statistics Bar</h3>
                    <p className="text-xs text-slate-500">4 trust metrics displayed prominently below the homepage search banner</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.homeStats || []).map((stat, idx) => (
                    <div
                      key={stat.id || idx}
                      className="p-3.5 rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase">
                          Metric #{idx + 1} ({stat.id || 'stat'})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Display Value
                          </label>
                          <input
                            type="text"
                            value={stat.value || stat.number || ''}
                            onChange={(e) => updateStatItem(idx, 'value', e.target.value)}
                            placeholder="e.g. 1000+"
                            className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                              }`}
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Label Title
                          </label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStatItem(idx, 'label', e.target.value)}
                            placeholder="e.g. Tour Completed"
                            className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Agency Settings'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {activeTab === 'loyalty' && (
        <form onSubmit={handleLoyaltySubmit} className="space-y-6">
          {loyaltyError && (
            <div className="p-3.5 rounded-[4px] bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loyaltyError}</span>
            </div>
          )}

          {loyaltySavedSuccess && (
            <div className="p-3.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Loyalty program rules, earn rates, and membership tiers updated successfully!</span>
            </div>
          )}

          {isSettingsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              <div
                className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <Award className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-base">Point Valuation & Earning Rules</h3>
                    <p className="text-xs text-slate-500">
                      Configure point redemption monetary value and automated earnings for completed trips
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      1 Point Value (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={loyaltyConfig.pointValuePaise / 100}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLoyaltyConfig({
                          ...loyaltyConfig,
                          pointValuePaise: Math.max(1, Math.round(val * 100)),
                        });
                      }}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                    <p className="text-3xs text-slate-400 mt-1">
                      Monetary value in rupees per loyalty point ({loyaltyConfig.pointValuePaise} paise).
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Earn Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={loyaltyConfig.earnPercent}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLoyaltyConfig({
                          ...loyaltyConfig,
                          earnPercent: val,
                        });
                      }}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                    <p className="text-3xs text-slate-400 mt-1">
                      Percentage of completed booking final price credited as points.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                      Max Order Redemption (%) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      required
                      value={loyaltyConfig.redeemMaxPercentOfOrder}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 100;
                        setLoyaltyConfig({
                          ...loyaltyConfig,
                          redeemMaxPercentOfOrder: Math.min(100, Math.max(1, val)),
                        });
                      }}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                    />
                    <p className="text-3xs text-slate-400 mt-1">
                      Maximum percentage of an order price that can be paid via points.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    Sign-up Bonus Points
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={loyaltyConfig.signupBonusPoints}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setLoyaltyConfig({
                        ...loyaltyConfig,
                        signupBonusPoints: Math.max(0, val),
                      });
                    }}
                    className={`w-full max-w-xs p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                  <p className="text-3xs text-slate-400 mt-1">
                    Bonus points credited automatically when a new customer verifies their account.
                  </p>
                </div>
              </div>

              <div
                className={`p-5 rounded-[4px] border space-y-4 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-base">Membership Tier Thresholds</h3>
                    <p className="text-xs text-slate-500">
                      Minimum lifetime points required to attain Silver, Gold, and Platinum status
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                        Silver Explorer
                      </span>
                      <span className="px-2 py-0.5 text-3xs font-bold uppercase rounded-[4px] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Default
                      </span>
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold mb-1 text-slate-500">
                        Minimum Lifetime Points
                      </label>
                      <input
                        type="number"
                        disabled
                        value={
                          loyaltyConfig.tiers.find((t) => t.tier === 'silver_explorer')?.minLifetimePoints ?? 0
                        }
                        className="w-full p-2 text-xs rounded-[4px] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-3xs text-slate-400">Entry-level tier assigned upon customer account creation.</p>
                  </div>

                  <div className="p-4 rounded-[4px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                        Gold Explorer
                      </span>
                      <span className="px-2 py-0.5 text-3xs font-bold uppercase rounded-[4px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        Tier 2
                      </span>
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Minimum Lifetime Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={
                          loyaltyConfig.tiers.find((t) => t.tier === 'gold_explorer')?.minLifetimePoints ?? 1000
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setLoyaltyConfig({
                            ...loyaltyConfig,
                            tiers: loyaltyConfig.tiers.map((t) =>
                              t.tier === 'gold_explorer' ? { ...t, minLifetimePoints: val } : t,
                            ),
                          });
                        }}
                        className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                          : 'bg-white border-amber-200 text-slate-900 focus:border-amber-600'
                          }`}
                      />
                    </div>
                    <p className="text-3xs text-slate-400">Unlocked after accumulating threshold lifetime points.</p>
                  </div>

                  <div className="p-4 rounded-[4px] border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                        Platinum Elite
                      </span>
                      <span className="px-2 py-0.5 text-3xs font-bold uppercase rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        Top Tier
                      </span>
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Minimum Lifetime Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={
                          loyaltyConfig.tiers.find((t) => t.tier === 'platinum_elite')?.minLifetimePoints ?? 5000
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setLoyaltyConfig({
                            ...loyaltyConfig,
                            tiers: loyaltyConfig.tiers.map((t) =>
                              t.tier === 'platinum_elite' ? { ...t, minLifetimePoints: val } : t,
                            ),
                          });
                        }}
                        className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                          : 'bg-white border-blue-200 text-slate-900 focus:border-blue-600'
                          }`}
                      />
                    </div>
                    <p className="text-3xs text-slate-400">Premium recognition for top-spending frequent travelers.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Loyalty Settings'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};
