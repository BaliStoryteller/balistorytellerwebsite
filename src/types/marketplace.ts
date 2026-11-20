export type AppRole = 'customer' | 'guide' | 'admin';

export type GuideApprovalStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended';

export type ExperienceStatus = 'draft' | 'pending_approval' | 'published' | 'unpublished' | 'archived';

export type BookingType = 'hourly' | 'full_day' | 'curated_experience' | 'custom_itinerary';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type PayoutStatus = 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';

export type AvailabilityStatus = 'available' | 'blocked' | 'booked';

export interface GuideLanguage {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational';
}

export interface GuideDocument {
  id: string;
  guideId: string;
  documentType: 'hpi_license' | 'national_id' | 'certification' | 'insurance';
  documentTitle: string;
  storagePath: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  reviewerNotes?: string;
  createdAt: string;
}

export interface GuideAvailabilitySlot {
  id: string;
  guideId: string;
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface Guide {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  headline: string;
  biography: string;
  personalStory: string;
  locationBase: string;
  yearsExperience: number;
  licenseNumber: string;
  qualifications: string[];
  destinationsCovered: string[];
  languages: GuideLanguage[];
  specialties: string[];
  hourlyRateUsd: number;
  fullDayRateUsd: number;
  startingPriceUsd: number;
  commissionRateOverride?: number | null;
  profilePhotoUrl: string;
  introVideoUrl?: string;
  availableFrom?: string; // YYYY-MM-DD
  availableUntil?: string; // YYYY-MM-DD
  galleryUrls: string[];
  approvalStatus: GuideApprovalStatus;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  reviewCount: number;
  completedToursCount: number;
  documents?: GuideDocument[];
  createdAt: string;
}

export interface ItineraryStop {
  id: string;
  stopOrder: number;
  timeLabel: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  category:
    | 'Cultural Heritage'
    | 'Temple Exploration'
    | 'Traditional Villages'
    | 'Rice Terraces'
    | 'Nature and Waterfalls'
    | 'Balinese Food and Traditions'
    | 'Spiritual and Cultural Experiences';
  destinationSlug: string;
  locationName: string;
  shortSummary: string;
  introduction: string;
  durationHours: number;
  durationLabel: string;
  priceUsd: number;
  maxGuests: number;
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  coverImageUrl: string;
  galleryUrls: string[];
  status: ExperienceStatus;
  proposedByGuideId?: string | null;
  guideIds: string[];
  primaryGuideId: string;
  itinerary: ItineraryStop[];
  ratingAvg: number;
  reviewCount: number;
  isFeatured: boolean;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  culturalNotes: string;
  coverImageUrl: string;
  bestTimeToVisit: string;
  highlights: string[];
  isFeatured: boolean;
}

export interface Review {
  id: string;
  bookingId?: string;
  guideId: string;
  experienceId?: string;
  authorName: string;
  authorOrigin: string;
  rating: number;
  comment: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerId?: string | null;
  guideId: string;
  experienceId?: string | null;
  bookingType: BookingType;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;
  durationHours: number;
  preferredLanguage: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  customItineraryNotes?: string;
  unitPriceSnapshot: number;
  subtotalSnapshot: number;
  commissionRateSnapshot: number;
  commissionAmountSnapshot: number;
  guideEarningsSnapshot: number;
  currency: 'USD';
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  guideId: string;
  amountUsd: number;
  currency: 'USD';
  status: PayoutStatus;
  bankName: string;
  accountHolder: string;
  accountLast4: string;
  paymentReference?: string;
  notes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: AppRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  reason?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'booking' | 'payout' | 'verification' | 'message' | 'system';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  guideId?: string;
  avatarUrl?: string;
  isDemoSession: boolean;
}
