export type ThemeMode = 'light' | 'dark';

export type NavigationKey =
  | 'dashboard'
  | 'home-page'
  | 'manage-tours'
  | 'booking-enquiries'
  | 'vendors'
  | 'reviews'
  | 'blog'
  | 'gallery'
  | 'contact'
  | 'chatbot'
  | 'settings';

export interface NavSubItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface NavItem {
  id: NavigationKey;
  label: string;
  iconName: string;
  badge?: number;
  badgeVariant?: 'primary' | 'warning' | 'success';
  subItems?: NavSubItem[];
}

export interface VendorCompletedTour {
  id: string;
  tourTitle: string;
  customerName: string;
  destination: string;
  completedDate: string;
  passengers: number;
  payoutAmount: number;
  rating?: number;
  feedback?: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: 'Tour Operator' | 'Resort & Hotel' | 'Transport & Fleet' | 'Adventure Guide';
  location: string;
  assignedDestinations: string[]; // Destination territories e.g. ['Kashmir'], ['Andaman'], ['Kerala'], ['Sundarban'], ['Gangtok']
  toursListed: number;
  toursCompleted?: number; // total completed tours counter
  completedToursList?: VendorCompletedTour[]; // detailed list of completed tours
  totalPayoutDisbursed?: number;
  rating?: number;
  commissionRate: number; // in percentage e.g. 10
  portalAccess: boolean; // whether vendor can log in to vendor portal
  portalRole: 'Vendor Admin' | 'Vendor Manager' | 'Staff';
  status: 'Active' | 'Pending Approval' | 'Suspended';
  createdAt: string;
  registrationId?: string;
  portalPassword?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  transport?: string;
  activities?: string;
  meals?: string;
  accommodation?: string;
  highlightPhotos?: string[];
}

export interface TourFaq {
  id: string;
  question: string;
  answer: string;
}

export interface TourReview {
  id: string;
  tourId: string;
  tourTitle?: string;
  destination?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAvatar?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  verifiedBooking: boolean;
  status: 'Approved' | 'Pending' | 'Hidden';
  showOnPackage?: boolean; // active to show on the tour package page
  showOnHome?: boolean;    // show on home page badge / featured
  adminReply?: string;
  photos?: string[];
}

export interface Tour {
  id: string;
  title: string;
  destination: string;
  country: string;
  duration: string;
  price: number;
  rating: number;
  reviewsCount: number;
  featuredImage: string;
  category: 'Adventure' | 'Luxury' | 'Honeymoon' | 'Family' | 'Cultural';
  status: 'Published' | 'Draft' | 'Archived';
  seatsAvailable: number;
  description?: string;
  highlights?: string[];
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  faqs?: TourFaq[];
  reviews?: TourReview[];
}

export interface BookingEnquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourName: string;
  destination: string;      // e.g. 'Kashmir', 'Andaman', 'Kerala', 'Sundarban', 'Gangtok'
  travelDate: string;
  passengers: number;
  budget: string;
  status: 'Pending' | 'New' | 'In Progress' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  notes?: string;

  // Lead Assignment & Vendor Portal
  assignedVendorId?: string;
  assignedVendorName?: string;
  vendorLeadStatus: 'Unassigned' | 'Sent to Vendor' | 'Accepted' | 'Declined';

  // Booking Price Management
  baseCost: number;         // Net vendor cost
  markupPercent: number;    // Agency markup % e.g. 15%
  taxPercent: number;       // Taxes e.g. 5%
  discountAmount: number;   // Discount in ₹
  finalQuotedPrice: number; // Final selling price to guest
  vendorPayout: number;     // Calculated payout to vendor
  agencyMargin: number;     // Agency profit
}

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  author: string;
  authorAvatar?: string;
  category: string;
  destination?: string;
  publishedDate: string;
  views: number;
  readTime?: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  coverImage: string;
  coverImageAlt?: string;
  excerpt: string;
  content?: string;
  tags?: string[];

  // SEO Management Features
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeywords?: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Destinations' | 'Hotels' | 'Activities' | 'Cruises';
  imageUrl: string;
  location: string;
  uploadDate: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Replied' | 'Archived';
  receivedAt: string;
}

export interface AgencySettings {
  agencyName: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  whatsappNumber?: string;
  address: string;
  mapEmbedUrl?: string;
  currency: string;
  timezone: string;
  bookingAutoConfirm: boolean;
  emailNotifications: boolean;
  smsAlerts: boolean;
  autoApproveVerified?: boolean;
  reviewConfig?: {
    autoApproveVerified: boolean;
  };
  socialLinks?: Record<string, string>;
  homeStats?: Array<{
    id?: string;
    label: string;
    value: string;
    number?: string;
    icon?: string;
  }>;
}

export interface DiscountOffer {
  id: string;
  title: string;
  photoUrl: string;
  linkUrl: string;
  discountBadge?: string;
  validTill?: string;
  isActive: boolean;
}

export interface TrendingVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  destination: string;
  duration?: string;
  viewsCount?: string;
  isActive: boolean;
  order: number;
}

export interface TravelTheme {
  id: string;
  name: string;
  photoUrl: string;
  linkUrl?: string;
  tourCount?: number;
  isActive: boolean;
}

export interface HomePageFaq {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Booking & Payments' | 'Cancellation & Refund' | 'Permits & Travel Guidelines';
  displayOrder: number;
  isActive: boolean;
}
