import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  addAuditLog,
  persistMarketplaceState,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') ?? '';
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_test_bali_storyteller';

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const isValid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    idempotencyKey: string;
    bookingId: string;
    event: 'payment.succeeded' | 'payment.refunded';
  };

  const state = readMarketplaceState();
  if (state.processedIdempotencyKeys.includes(payload.idempotencyKey)) {
    return NextResponse.json({ status: 'already_processed' });
  }

  const booking = state.bookings.find((b) => b.id === payload.bookingId);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (payload.event === 'payment.succeeded') {
    booking.paymentStatus = 'paid';
  } else if (payload.event === 'payment.refunded') {
    booking.paymentStatus = 'refunded';
    booking.status = 'refunded';
  }

  state.processedIdempotencyKeys.push(payload.idempotencyKey);
  addAuditLog(state, {
    actorName: 'Verified Payment Webhook',
    actorRole: 'admin',
    action: `WEBHOOK_${payload.event.toUpperCase()}`,
    entityType: 'booking',
    entityId: booking.id,
    summary: `Processed verified webhook ${payload.event} (key: ${payload.idempotencyKey}).`,
  });
  persistMarketplaceState(state);

  return NextResponse.json({ received: true, bookingId: booking.id });
}
