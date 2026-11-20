import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { readMarketplaceState } from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();
  const state = readMarketplaceState();
  const booking = state.bookings.find(
    (b) => b.id === id || b.bookingReference === id
  );
  if (!booking) notFound();

  const guide = state.guides.find((g) => g.id === booking.guideId);
  const experience = booking.experienceId
    ? state.experiences.find((e) => e.id === booking.experienceId)
    : null;

  const badgeStyle =
    booking.status === 'confirmed'
      ? 'bg-[#D8F36A] text-[#141914]'
      : booking.status === 'completed'
      ? 'bg-[#344B35] text-[#F7F5EF]'
      : booking.status === 'cancelled' || booking.status === 'refunded'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-900';

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-3xl mx-auto w-full space-y-6">
        <div className="editorial-card p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[var(--line)]">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
                Booking Reference
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[var(--ink)] tabular-nums">
                {booking.bookingReference}
              </h1>
              {booking.isDemo && (
                <span className="inline-block rounded-full bg-[#191A18]/8 px-3 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                  Sandbox / Test Mode Transaction
                </span>
              )}
            </div>
            <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${badgeStyle}`}>
              {booking.status}
            </span>
          </div>

          <div className="rounded-2xl bg-[#344B35]/8 border border-[#344B35]/20 p-4 flex items-start gap-3 text-sm text-[var(--accent-ink)]">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {booking.status === 'pending'
                  ? 'Request Submitted — Awaiting Guide Confirmation'
                  : `Booking Status: ${booking.status.toUpperCase()}`}
              </p>
              <p className="text-xs text-[var(--ink-2)] mt-0.5">
                Guide availability was verified at submission and your price snapshot is locked.
              </p>
            </div>
          </div>

          {/* Guide & Experience Summary */}
          {guide && (
            <div className="flex items-center gap-4 rounded-2xl bg-[var(--card-2)] p-4">
              <img
                src={guide.profilePhotoUrl}
                alt={guide.displayName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Your Storyteller
                </p>
                <p className="font-serif-display text-2xl font-semibold text-[var(--ink)]">
                  {guide.displayName}
                </p>
                <p className="text-xs text-[var(--accent-ink)] font-medium">
                  {experience ? experience.title : `${booking.bookingType.replace('_', ' ')}`}
                </p>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl bg-[var(--card-2)] p-3.5">
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <p className="font-semibold text-[var(--ink)] mt-1 tabular-nums">
                {booking.bookingDate}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--card-2)] p-3.5">
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Clock className="w-3.5 h-3.5" /> Duration
              </span>
              <p className="font-semibold text-[var(--ink)] mt-1 tabular-nums">
                {booking.durationHours} hrs
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--card-2)] p-3.5">
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Languages className="w-3.5 h-3.5" /> Language
              </span>
              <p className="font-semibold text-[var(--ink)] mt-1">
                {booking.preferredLanguage}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--card-2)] p-3.5">
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Users className="w-3.5 h-3.5" /> Guests
              </span>
              <p className="font-semibold text-[var(--ink)] mt-1 tabular-nums">
                {booking.guestCount}
              </p>
            </div>
          </div>

          {/* Immutable Price Snapshot */}
          <div className="rounded-2xl bg-[#191A18] text-[#F7F5EF] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Unit Rate Snapshot</span>
              <span className="tabular-nums">${booking.unitPriceSnapshot.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Payment Status</span>
              <span className="uppercase text-[#D8F36A] font-semibold">
                {booking.paymentStatus}
              </span>
            </div>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <span className="text-sm font-medium">Total Locked Amount</span>
              <span className="text-2xl font-bold text-[#D8F36A] tabular-nums">
                ${booking.subtotalSnapshot.toFixed(2)} USD
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-ink)]" /> Traveler: {booking.customerName} (
              {booking.customerEmail})
            </span>
            <div className="flex gap-2">
              <Link
                href="/my-bookings"
                className="rounded-full bg-[#344B35] text-[#F7F5EF] px-5 py-2.5 text-xs font-semibold"
              >
                View My Bookings
              </Link>
              <Link
                href="/guides"
                className="rounded-full border border-[var(--line)] px-5 py-2.5 text-xs font-semibold"
              >
                Explore More Guides
              </Link>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
