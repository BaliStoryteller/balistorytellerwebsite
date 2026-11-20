import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import {
  createValidatedBooking,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import type { BookingType } from '@/types/marketplace';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const state = readMarketplaceState();

  if (session.role === 'admin') {
    return NextResponse.json({ bookings: state.bookings });
  }
  if (session.role === 'guide' && session.guideId) {
    return NextResponse.json({
      bookings: state.bookings.filter((b) => b.guideId === session.guideId),
    });
  }
  return NextResponse.json({
    bookings: state.bookings.filter(
      (b) => b.customerId === session.id || b.customerEmail === session.email
    ),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const body = (await request.json()) as {
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
  };

  if (!body.guideId || !body.bookingDate || !body.customerName || !body.customerEmail) {
    return NextResponse.json(
      { error: 'Guide, date, customer name, and email are required.' },
      { status: 400 }
    );
  }

  const result = createValidatedBooking({
    customerId: session?.id ?? null,
    guideId: body.guideId,
    experienceId: body.experienceId ?? null,
    bookingType: body.bookingType ?? 'curated_experience',
    bookingDate: body.bookingDate,
    startTime: body.startTime,
    durationHours: Number(body.durationHours) || 5,
    preferredLanguage: body.preferredLanguage || 'English',
    guestCount: Math.max(1, Number(body.guestCount) || 2),
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    specialRequests: body.specialRequests,
    customItineraryNotes: body.customItineraryNotes,
    idempotencyKey: body.idempotencyKey,
    isDemo: session ? session.isDemoSession : true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json({ booking: result.booking }, { status: 201 });
}
