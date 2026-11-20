import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { extractYouTubeVideoId } from '@/lib/youtube';
import {
  addAuditLog,
  persistMarketplaceState,
  readMarketplaceState,
  setGuideAvailability,
} from '@/lib/store/marketplace-store';
import type { AvailabilityStatus, Experience } from '@/types/marketplace';

export async function GET() {
  const session = await requireRole(['guide', 'admin']);
  if (!session) {
    return NextResponse.json({ error: 'Guide authentication required' }, { status: 403 });
  }

  const state = readMarketplaceState();
  const guideId = session.guideId ?? 'g-made-wijaya';
  const guide = state.guides.find((g) => g.id === guideId) ?? null;

  return NextResponse.json({
    guide,
    bookings: state.bookings.filter((b) => b.guideId === guideId),
    experiences: state.experiences.filter(
      (e) => e.guideIds.includes(guideId) || e.proposedByGuideId === guideId
    ),
    availability: state.availability.filter((a) => a.guideId === guideId),
    payouts: state.payouts.filter((p) => p.guideId === guideId),
    reviews: state.reviews.filter((r) => r.guideId === guideId),
    notifications: state.notifications.filter((n) => n.userId === session.id),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await requireRole(['guide', 'admin']);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const guideId = session.guideId ?? 'g-made-wijaya';
  const body = (await request.json()) as {
    action: 'update_profile' | 'set_availability' | 'propose_experience' | 'request_payout';
    payload: Record<string, unknown>;
  };

  const state = readMarketplaceState();
  const guide = state.guides.find((g) => g.id === guideId);
  if (!guide) {
    return NextResponse.json({ error: 'Guide profile not found' }, { status: 404 });
  }

  if (body.action === 'update_profile') {
    const p = body.payload;
    if (typeof p.headline === 'string') guide.headline = p.headline;
    if (typeof p.biography === 'string') guide.biography = p.biography;
    if (typeof p.personalStory === 'string') guide.personalStory = p.personalStory;
    if (typeof p.locationBase === 'string') guide.locationBase = p.locationBase;
    if (typeof p.availableFrom === 'string') guide.availableFrom = p.availableFrom;
    if (typeof p.availableUntil === 'string') guide.availableUntil = p.availableUntil;
    if (typeof p.introVideoUrl === 'string') {
      const trimmed = p.introVideoUrl.trim();
      if (!trimmed) {
        guide.introVideoUrl = '';
      } else {
        const videoId = extractYouTubeVideoId(trimmed);
        if (!videoId) {
          return NextResponse.json(
            {
              error:
                'Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).',
            },
            { status: 400 }
          );
        }
        guide.introVideoUrl = trimmed;
      }
    }
    if (Array.isArray(p.specialties)) guide.specialties = p.specialties as string[];
    if (Array.isArray(p.destinationsCovered)) {
      guide.destinationsCovered = p.destinationsCovered as string[];
    }
    // Verification status & credentials remain strictly admin-controlled
    persistMarketplaceState(state);
    return NextResponse.json({ guide });
  }

  if (body.action === 'set_availability') {
    const date = String(body.payload.date || '');
    const status = String(body.payload.status || 'available') as AvailabilityStatus;
    const notes = typeof body.payload.notes === 'string' ? body.payload.notes : undefined;
    const res = setGuideAvailability(guideId, date, status, '08:00', '17:00', notes);
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'propose_experience') {
    const p = body.payload;
    const title = String(p.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Experience title is required' }, { status: 400 });
    }
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      slug,
      title,
      category: (p.category as Experience['category']) || 'Cultural Heritage',
      destinationSlug: String(p.destinationSlug || 'ubud'),
      locationName: String(p.locationName || guide.locationBase),
      shortSummary: String(p.shortSummary || 'Curated local cultural journey.'),
      introduction: String(p.introduction || p.shortSummary || ''),
      durationHours: Number(p.durationHours) || 4,
      durationLabel: `${Number(p.durationHours) || 4} hours`,
      priceUsd: Math.max(45, Number(p.priceUsd) || 110),
      maxGuests: Math.max(1, Number(p.maxGuests) || 4),
      inclusions: ['Private licensed guide', 'Cultural entrance support'],
      exclusions: ['Personal expenses'],
      meetingPoint: String(p.meetingPoint || `${guide.locationBase} Central Meeting Point`),
      coverImageUrl: '/images/exp-temple.jpg',
      galleryUrls: ['/images/exp-temple.jpg'],
      status: 'pending_approval', // Must stay unpublished until admin approval
      proposedByGuideId: guideId,
      guideIds: [guideId],
      primaryGuideId: guideId,
      itinerary: [
        {
          id: `stop-${Date.now()}`,
          stopOrder: 1,
          timeLabel: '08:30',
          title: 'Welcome & Cultural Briefing',
          description: String(p.shortSummary || 'Opening walk and local introduction.'),
          durationMinutes: 90,
        },
      ],
      ratingAvg: 0,
      reviewCount: 0,
      isFeatured: false,
    };

    state.experiences.unshift(newExp);
    addAuditLog(state, {
      actorName: guide.displayName,
      actorRole: 'guide',
      action: 'SUBMIT_EXPERIENCE_PROPOSAL',
      entityType: 'experience',
      entityId: newExp.id,
      summary: `Submitted "${newExp.title}" for admin approval.`,
    });
    persistMarketplaceState(state);
    return NextResponse.json({ experience: newExp }, { status: 201 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
