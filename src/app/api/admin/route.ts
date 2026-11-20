import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import {
  readMarketplaceState,
  updateBookingStatus,
  updateCommissionRate,
  updateExperienceStatus,
  updateGuideApproval,
  updatePayoutStatus,
} from '@/lib/store/marketplace-store';
import type {
  BookingStatus,
  ExperienceStatus,
  GuideApprovalStatus,
  PayoutStatus,
} from '@/types/marketplace';

export async function GET() {
  const session = await requireRole(['admin']);
  if (!session) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  const state = readMarketplaceState();
  return NextResponse.json(state);
}

export async function PATCH(request: NextRequest) {
  const session = await requireRole(['admin']);
  if (!session) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = (await request.json()) as {
    action:
      | 'guide_approval'
      | 'experience_status'
      | 'booking_status'
      | 'commission_rate'
      | 'payout_status';
    id?: string;
    status?: string;
    rate?: number;
    paymentReference?: string;
    reason?: string;
  };

  if (body.action === 'guide_approval' && body.id && body.status) {
    const guide = updateGuideApproval(
      body.id,
      body.status as GuideApprovalStatus,
      session.fullName,
      body.reason
    );
    return NextResponse.json({ guide });
  }

  if (body.action === 'experience_status' && body.id && body.status) {
    const experience = updateExperienceStatus(
      body.id,
      body.status as ExperienceStatus,
      session.fullName
    );
    return NextResponse.json({ experience });
  }

  if (body.action === 'booking_status' && body.id && body.status) {
    const res = updateBookingStatus(
      body.id,
      body.status as BookingStatus,
      session.fullName,
      'admin',
      body.reason
    );
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
    return NextResponse.json({ booking: res.booking });
  }

  if (body.action === 'commission_rate' && typeof body.rate === 'number') {
    const rate = updateCommissionRate(body.rate, session.fullName, body.reason);
    return NextResponse.json({ defaultCommissionRate: rate });
  }

  if (body.action === 'payout_status' && body.id && body.status) {
    const payout = updatePayoutStatus(
      body.id,
      body.status as PayoutStatus,
      session.fullName,
      body.paymentReference,
      body.reason
    );
    return NextResponse.json({ payout });
  }

  return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
}
