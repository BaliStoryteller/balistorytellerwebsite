import fs from 'node:fs';
import path from 'node:path';
import {
  SEED_AUDIT_LOGS,
  SEED_AVAILABILITY,
  SEED_BOOKINGS,
  SEED_DESTINATIONS,
  SEED_EXPERIENCES,
  SEED_GUIDES,
  SEED_NOTIFICATIONS,
  SEED_PAYOUTS,
  SEED_REVIEWS,
} from '@/lib/data/seed-data';
import type {
  AppRole,
  AuditLog,
  AvailabilityStatus,
  Booking,
  BookingStatus,
  BookingType,
  Destination,
  Experience,
  ExperienceStatus,
  Guide,
  GuideApprovalStatus,
  GuideAvailabilitySlot,
  NotificationItem,
  Payout,
  PayoutStatus,
  Review,
} from '@/types/marketplace';

interface MarketplaceState {
  seedVersion?: string;
  defaultCommissionRate: number;
  destinations: Destination[];
  guides: Guide[];
  experiences: Experience[];
  reviews: Review[];
  bookings: Booking[];
  availability: GuideAvailabilitySlot[];
  payouts: Payout[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  processedIdempotencyKeys: string[];
}

const SEED_VERSION = '2026-11-19-v3-avail';
const DATA_FILE = path.join('/tmp', 'bali-storyteller-sandbox-state.json');

function getInitialState(): MarketplaceState {
  return {
    seedVersion: SEED_VERSION,
    defaultCommissionRate: 0.18,
    destinations: structuredClone(SEED_DESTINATIONS),
    guides: structuredClone(SEED_GUIDES),
    experiences: structuredClone(SEED_EXPERIENCES),
    reviews: structuredClone(SEED_REVIEWS),
    bookings: structuredClone(SEED_BOOKINGS),
    availability: structuredClone(SEED_AVAILABILITY),
    payouts: structuredClone(SEED_PAYOUTS),
    auditLogs: structuredClone(SEED_AUDIT_LOGS),
    notifications: structuredClone(SEED_NOTIFICATIONS),
    processedIdempotencyKeys: [],
  };
}

// Keep in globalThis for hot-reload durability + write through to /tmp in Node
const globalForStore = globalThis as unknown as {
  __baliStorytellerState?: MarketplaceState;
};

export function readMarketplaceState(): MarketplaceState {
  if (
    globalForStore.__baliStorytellerState &&
    globalForStore.__baliStorytellerState.seedVersion === SEED_VERSION
  ) {
    return globalForStore.__baliStorytellerState;
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as MarketplaceState;
      if (parsed.seedVersion === SEED_VERSION) {
        globalForStore.__baliStorytellerState = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback to seed
  }
  const initial = getInitialState();
  globalForStore.__baliStorytellerState = initial;
  persistMarketplaceState(initial);
  return initial;
}

export function persistMarketplaceState(state: MarketplaceState): void {
  globalForStore.__baliStorytellerState = state;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // ignore read-only fs errors in serverless environments
  }
}

export function addAuditLog(
  state: MarketplaceState,
  entry: Omit<AuditLog, 'id' | 'createdAt'>
) {
  state.auditLogs.unshift({
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// PUBLIC QUERIES
// ---------------------------------------------------------------------------

export function getPublicGuides(filters?: {
  destination?: string;
  language?: string;
  specialty?: string;
  minRating?: number;
  maxPrice?: number;
  date?: string;
  query?: string;
}) {
  const state = readMarketplaceState();
  let list = state.guides.filter((g) => g.approvalStatus === 'approved');

  if (filters?.destination) {
    const d = filters.destination.toLowerCase();
    list = list.filter(
      (g) =>
        g.locationBase.toLowerCase().includes(d) ||
        g.destinationsCovered.some((dest) => dest.toLowerCase().includes(d))
    );
  }
  if (filters?.language) {
    const lang = filters.language.toLowerCase();
    list = list.filter((g) =>
      g.languages.some((l) => l.language.toLowerCase().includes(lang))
    );
  }
  if (filters?.specialty) {
    const sp = filters.specialty.toLowerCase();
    list = list.filter((g) =>
      g.specialties.some((s) => s.toLowerCase().includes(sp))
    );
  }
  if (filters?.minRating && filters.minRating > 0) {
    list = list.filter((g) => g.ratingAvg >= filters.minRating!);
  }
  if (filters?.maxPrice && filters.maxPrice > 0) {
    list = list.filter((g) => g.startingPriceUsd <= filters.maxPrice!);
  }
  if (filters?.date) {
    list = list.filter((g) => isGuideAvailableOnDate(g.id, filters.date!, state).available);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (g) =>
        g.displayName.toLowerCase().includes(q) ||
        g.headline.toLowerCase().includes(q) ||
        g.biography.toLowerCase().includes(q) ||
        g.locationBase.toLowerCase().includes(q) ||
        g.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }
  return list;
}

export function getGuideBySlug(slug: string, includeUnapproved = false): Guide | null {
  const state = readMarketplaceState();
  const guide = state.guides.find((g) => g.slug === slug);
  if (!guide) return null;
  if (!includeUnapproved && guide.approvalStatus !== 'approved') return null;
  return guide;
}

export function getPublicExperiences(filters?: {
  category?: string;
  destination?: string;
  guideId?: string;
  query?: string;
}) {
  const state = readMarketplaceState();
  const approvedGuideIds = new Set(
    state.guides.filter((g) => g.approvalStatus === 'approved').map((g) => g.id)
  );

  let list = state.experiences.filter(
    (e) =>
      e.status === 'published' &&
      e.guideIds.some((gid) => approvedGuideIds.has(gid))
  );

  if (filters?.category && filters.category !== 'All') {
    list = list.filter((e) => e.category === filters.category);
  }
  if (filters?.destination) {
    const d = filters.destination.toLowerCase();
    list = list.filter(
      (e) =>
        e.destinationSlug.toLowerCase().includes(d) ||
        e.locationName.toLowerCase().includes(d)
    );
  }
  if (filters?.guideId) {
    list = list.filter((e) => e.guideIds.includes(filters.guideId!));
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.shortSummary.toLowerCase().includes(q) ||
        e.locationName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }
  return list;
}

export function getExperienceBySlug(slug: string): Experience | null {
  const state = readMarketplaceState();
  const exp = state.experiences.find((e) => e.slug === slug && e.status === 'published');
  return exp ?? null;
}

// ---------------------------------------------------------------------------
// AVAILABILITY & BOOKING ENGINE (SERVER-SIDE VALIDATION + SNAPSHOTS)
// ---------------------------------------------------------------------------

export function isGuideAvailableOnDate(
  guideId: string,
  date: string,
  existingState?: MarketplaceState
): { available: boolean; reason?: string } {
  const state = existingState ?? readMarketplaceState();
  const guide = state.guides.find((g) => g.id === guideId);
  if (guide?.availableFrom && date < guide.availableFrom) {
    return {
      available: false,
      reason: `Guide is available starting ${guide.availableFrom}.`,
    };
  }
  if (guide?.availableUntil && date > guide.availableUntil) {
    return {
      available: false,
      reason: `Guide schedule is open until ${guide.availableUntil}.`,
    };
  }
  const slot = state.availability.find(
    (s) => s.guideId === guideId && s.date === date
  );
  if (slot && (slot.status === 'blocked' || slot.status === 'booked')) {
    return {
      available: false,
      reason:
        slot.status === 'blocked'
          ? slot.notes || 'Guide marked this date unavailable.'
          : 'Guide already has a confirmed booking on this date.',
    };
  }

  const confirmedConflict = state.bookings.find(
    (b) =>
      b.guideId === guideId &&
      b.bookingDate === date &&
      b.status === 'confirmed'
  );
  if (confirmedConflict) {
    return {
      available: false,
      reason: `Overlaps confirmed booking ${confirmedConflict.bookingReference}.`,
    };
  }

  return { available: true };
}

export interface CreateBookingInput {
  customerId?: string | null;
  guideId: string;
  experienceId?: string | null;
  bookingType: BookingType;
  bookingDate: string;
  startTime?: string;
  durationHours: number;
  preferredLanguage: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  customItineraryNotes?: string;
  idempotencyKey?: string;
  isDemo?: boolean;
}

export function createValidatedBooking(input: CreateBookingInput): {
  ok: true;
  booking: Booking;
} | {
  ok: false;
  error: string;
  statusCode: number;
} {
  const state = readMarketplaceState();

  if (input.idempotencyKey && state.processedIdempotencyKeys.includes(input.idempotencyKey)) {
    const existing = state.bookings[0];
    if (existing) return { ok: true, booking: existing };
  }

  const guide = state.guides.find((g) => g.id === input.guideId);
  if (!guide || guide.approvalStatus !== 'approved') {
    return { ok: false, error: 'Selected guide is not currently verified and active.', statusCode: 400 };
  }

  // Validate date is not in the past
  const today = new Date().toISOString().slice(0, 10);
  if (!input.bookingDate || input.bookingDate < today) {
    return { ok: false, error: 'Please choose a valid upcoming date.', statusCode: 400 };
  }

  // Server-side availability verification
  const avail = isGuideAvailableOnDate(guide.id, input.bookingDate, state);
  if (!avail.available) {
    return {
      ok: false,
      error: avail.reason || 'Guide is unavailable on the selected date.',
      statusCode: 409,
    };
  }

  // Calculate price from authoritative catalog rates (never trust client price)
  let unitPrice = guide.fullDayRateUsd;
  let subtotal = guide.fullDayRateUsd;

  if (input.bookingType === 'curated_experience' && input.experienceId) {
    const exp = state.experiences.find(
      (e) => e.id === input.experienceId && e.status === 'published'
    );
    if (!exp) {
      return { ok: false, error: 'Selected experience is not published.', statusCode: 404 };
    }
    if (input.guestCount > exp.maxGuests) {
      return {
        ok: false,
        error: `Maximum ${exp.maxGuests} guests allowed for this curated experience.`,
        statusCode: 400,
      };
    }
    unitPrice = exp.priceUsd;
    subtotal = Number((exp.priceUsd * input.guestCount).toFixed(2));
  } else if (input.bookingType === 'hourly') {
    const hrs = Math.max(2, Math.min(10, input.durationHours || 4));
    unitPrice = guide.hourlyRateUsd;
    subtotal = Number((guide.hourlyRateUsd * hrs).toFixed(2));
  } else {
    // full_day or custom_itinerary
    unitPrice = guide.fullDayRateUsd;
    subtotal = guide.fullDayRateUsd;
  }

  const commissionRate = guide.commissionRateOverride ?? state.defaultCommissionRate;
  const commissionAmount = Number((subtotal * commissionRate).toFixed(2));
  const guideEarnings = Number((subtotal - commissionAmount).toFixed(2));

  const now = new Date().toISOString();
  const ref = `BST-${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const booking: Booking = {
    id: `bk-${Date.now()}`,
    bookingReference: ref,
    customerId: input.customerId ?? null,
    guideId: guide.id,
    experienceId: input.experienceId ?? null,
    bookingType: input.bookingType,
    bookingDate: input.bookingDate,
    startTime: input.startTime || '08:30',
    durationHours: input.durationHours,
    preferredLanguage: input.preferredLanguage,
    guestCount: input.guestCount,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim(),
    customerPhone: input.customerPhone?.trim(),
    specialRequests: input.specialRequests?.trim(),
    customItineraryNotes: input.customItineraryNotes?.trim(),
    unitPriceSnapshot: unitPrice,
    subtotalSnapshot: subtotal,
    commissionRateSnapshot: commissionRate,
    commissionAmountSnapshot: commissionAmount,
    guideEarningsSnapshot: guideEarnings,
    currency: 'USD',
    status: 'pending', // Never blindly auto-confirmed until guide/platform rules check
    paymentStatus: 'paid', // Sandbox test payment authorized
    isDemo: input.isDemo ?? true,
    createdAt: now,
    updatedAt: now,
  };

  state.bookings.unshift(booking);
  if (input.idempotencyKey) {
    state.processedIdempotencyKeys.push(input.idempotencyKey);
  }

  // Notify guide
  state.notifications.unshift({
    id: `not-${Date.now()}`,
    userId: guide.userId,
    title: `New Booking Request ${booking.bookingReference}`,
    body: `${booking.customerName} (${booking.guestCount} guests) requested ${booking.bookingDate} in ${booking.preferredLanguage}.`,
    category: 'booking',
    linkUrl: '/guide?tab=requests',
    isRead: false,
    createdAt: now,
  });

  addAuditLog(state, {
    actorName: booking.customerName,
    actorRole: 'customer',
    action: 'CREATE_BOOKING_REQUEST',
    entityType: 'booking',
    entityId: booking.id,
    summary: `Created ${booking.bookingReference} ($${booking.subtotalSnapshot.toFixed(2)} USD, ${(commissionRate * 100).toFixed(0)}% commission snapshot).`,
  });

  persistMarketplaceState(state);
  return { ok: true, booking };
}

// ---------------------------------------------------------------------------
// ADMIN & GUIDE MUTATIONS
// ---------------------------------------------------------------------------

export function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  actorName: string,
  actorRole: AppRole,
  reason?: string
): { ok: true; booking: Booking } | { ok: false; error: string } {
  const state = readMarketplaceState();
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };

  if (newStatus === 'confirmed') {
    const conflict = state.bookings.find(
      (b) =>
        b.id !== booking.id &&
        b.guideId === booking.guideId &&
        b.bookingDate === booking.bookingDate &&
        b.status === 'confirmed'
    );
    if (conflict) {
      return {
        ok: false,
        error: `Cannot confirm: overlaps confirmed booking ${conflict.bookingReference} on ${booking.bookingDate}.`,
      };
    }

    // Reserve guide availability slot
    const existingSlot = state.availability.find(
      (a) => a.guideId === booking.guideId && a.date === booking.bookingDate
    );
    if (existingSlot) {
      existingSlot.status = 'booked';
      existingSlot.notes = `${booking.bookingReference} Confirmed`;
    } else {
      state.availability.push({
        id: `av-${Date.now()}`,
        guideId: booking.guideId,
        date: booking.bookingDate,
        status: 'booked',
        startTime: booking.startTime,
        endTime: '17:00',
        notes: `${booking.bookingReference} Confirmed`,
      });
    }
  }

  if (newStatus === 'refunded') {
    booking.paymentStatus = 'refunded';
  }

  const prev = booking.status;
  booking.status = newStatus;
  booking.updatedAt = new Date().toISOString();

  addAuditLog(state, {
    actorName,
    actorRole,
    action: `BOOKING_STATUS_${newStatus.toUpperCase()}`,
    entityType: 'booking',
    entityId: booking.id,
    summary: `Transitioned ${booking.bookingReference} from ${prev} to ${newStatus}.`,
    reason,
  });

  persistMarketplaceState(state);
  return { ok: true, booking };
}

export function setGuideAvailability(
  guideId: string,
  date: string,
  status: AvailabilityStatus,
  startTime = '08:00',
  endTime = '17:00',
  notes?: string
) {
  const state = readMarketplaceState();
  const confirmedBooking = state.bookings.find(
    (b) => b.guideId === guideId && b.bookingDate === date && b.status === 'confirmed'
  );
  if (confirmedBooking && status !== 'booked') {
    return {
      ok: false as const,
      error: `Cannot unblock/alter ${date}: confirmed booking ${confirmedBooking.bookingReference} is scheduled.`,
    };
  }

  const existing = state.availability.find(
    (a) => a.guideId === guideId && a.date === date
  );
  if (existing) {
    existing.status = status;
    existing.startTime = startTime;
    existing.endTime = endTime;
    existing.notes = notes;
  } else {
    state.availability.push({
      id: `av-${Date.now()}`,
      guideId,
      date,
      status,
      startTime,
      endTime,
      notes,
    });
  }

  persistMarketplaceState(state);
  return { ok: true as const };
}

export function updateGuideApproval(
  guideId: string,
  status: GuideApprovalStatus,
  actorName: string,
  reason?: string
) {
  const state = readMarketplaceState();
  const guide = state.guides.find((g) => g.id === guideId);
  if (!guide) return null;

  const prev = guide.approvalStatus;
  guide.approvalStatus = status;
  guide.isVerified = status === 'approved';
  if (status === 'approved' && guide.documents) {
    guide.documents = guide.documents.map((d) => ({
      ...d,
      verificationStatus: 'verified',
    }));
  }

  addAuditLog(state, {
    actorName,
    actorRole: 'admin',
    action: `GUIDE_${status.toUpperCase()}`,
    entityType: 'guide_profile',
    entityId: guide.id,
    summary: `Changed ${guide.displayName} approval status from ${prev} to ${status}.`,
    reason,
  });

  persistMarketplaceState(state);
  return guide;
}

export function updateExperienceStatus(
  experienceId: string,
  status: ExperienceStatus,
  actorName: string
) {
  const state = readMarketplaceState();
  const exp = state.experiences.find((e) => e.id === experienceId);
  if (!exp) return null;
  const prev = exp.status;
  exp.status = status;

  addAuditLog(state, {
    actorName,
    actorRole: 'admin',
    action: `EXPERIENCE_${status.toUpperCase()}`,
    entityType: 'experience',
    entityId: exp.id,
    summary: `Experience "${exp.title}" status updated from ${prev} to ${status}.`,
  });
  persistMarketplaceState(state);
  return exp;
}

export function updateCommissionRate(newRate: number, actorName: string, reason?: string) {
  const state = readMarketplaceState();
  const clamped = Math.max(0.05, Math.min(0.4, Number(newRate)));
  const prev = state.defaultCommissionRate;
  state.defaultCommissionRate = clamped;

  addAuditLog(state, {
    actorName,
    actorRole: 'admin',
    action: 'UPDATE_COMMISSION_RATE',
    entityType: 'platform_settings',
    entityId: 'default_commission_rate',
    summary: `Updated platform commission rate from ${(prev * 100).toFixed(1)}% to ${(clamped * 100).toFixed(1)}% (existing booking snapshots preserved).`,
    reason,
  });
  persistMarketplaceState(state);
  return clamped;
}

export function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  actorName: string,
  paymentReference?: string,
  notes?: string
) {
  const state = readMarketplaceState();
  const payout = state.payouts.find((p) => p.id === payoutId);
  if (!payout) return null;
  const prev = payout.status;
  payout.status = status;
  if (paymentReference) payout.paymentReference = paymentReference;
  if (notes) payout.notes = notes;
  if (status === 'completed') payout.completedAt = new Date().toISOString();

  addAuditLog(state, {
    actorName,
    actorRole: 'admin',
    action: `PAYOUT_${status.toUpperCase()}`,
    entityType: 'payout',
    entityId: payout.id,
    summary: `Payout $${payout.amountUsd.toFixed(2)} for ${payout.accountHolder} moved from ${prev} to ${status}${paymentReference ? ` (Ref: ${paymentReference})` : ''}.`,
  });
  persistMarketplaceState(state);
  return payout;
}
