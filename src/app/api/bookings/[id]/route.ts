import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import {
  readMarketplaceState,
  updateBookingStatus,
} from '@/lib/store/marketplace-store';
import type { BookingStatus } from '@/types/marketplace';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = readMarketplaceState();
  const booking = state.bookings.find(
    (b) => b.id === id || b.bookingReference === id
  );
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  const guide = state.guides.find((g) => g.id === booking.guideId) ?? null;
  const experience = booking.experienceId
    ? state.experiences.find((e) => e.id === booking.experienceId) ?? null
    : null;

  return NextResponse.json({ booking, guide, experience });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    status: BookingStatus;
    reason?: string;
  };

  const state = readMarketplaceState();
  const booking = state.bookings.find((b) => b.id === id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Server-side RBAC check
  if (session.role === 'customer') {
    const owns = booking.customerId === session.id || booking.customerEmail === session.email;
    if (!owns || body.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Customers can only cancel their own pending bookings.' },
        { status: 403 }
      );
    }
  } else if (session.role === 'guide') {
    if (booking.guideId !== session.guideId) {
      return NextResponse.json(
        { error: 'Guides cannot modify bookings assigned to another guide.' },
        { status: 403 }
      );
    }
    if (!['confirmed', 'cancelled', 'completed'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Guides cannot set refunds or override financial states.' },
        { status: 403 }
      );
    }
  }

  const result = updateBookingStatus(
    id,
    body.status,
    session.fullName,
    session.role,
    body.reason
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ booking: result.booking });
}
