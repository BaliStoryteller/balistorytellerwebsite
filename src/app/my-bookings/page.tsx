import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { readMarketplaceState } from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function MyBookingsPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/sign-in?next=/my-bookings');

  const state = readMarketplaceState();
  const guideMap = new Map(state.guides.map((g) => [g.id, g]));
  const expMap = new Map(state.experiences.map((e) => [e.id, e]));

  const myBookings =
    session.role === 'admin'
      ? state.bookings
      : state.bookings.filter(
          (b) => b.customerId === session.id || b.customerEmail === session.email
        );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
              Traveler Journeys
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-medium text-[var(--ink)]">
              My Bookings
            </h1>
          </div>
          <Link
            href="/guides"
            className="rounded-full bg-[#344B35] text-[#F7F5EF] px-5 py-2.5 text-xs font-semibold self-start"
          >
            Book Another Guide
          </Link>
        </div>

        {myBookings.length === 0 ? (
          <div className="editorial-card p-10 text-center space-y-3">
            <p className="font-serif-display text-2xl text-[var(--ink)]">No bookings yet</p>
            <p className="text-sm text-[var(--muted)]">
              Discover a verified local guide in Ubud, Sidemen, Uluwatu, or North Bali.
            </p>
            <Link
              href="/guides"
              className="inline-block rounded-full bg-[#191A18] text-[#D8F36A] px-5 py-2.5 text-xs font-semibold"
            >
              Explore Storytellers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((bk) => {
              const g = guideMap.get(bk.guideId);
              const exp = bk.experienceId ? expMap.get(bk.experienceId) : null;
              return (
                <Link
                  key={bk.id}
                  href={`/booking/${bk.id}`}
                  className="editorial-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {g && (
                      <img
                        src={g.profilePhotoUrl}
                        alt={g.displayName}
                        className="h-14 w-14 rounded-2xl object-cover shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[var(--accent-ink)] tabular-nums">
                          {bk.bookingReference}
                        </span>
                        <span className="rounded-full bg-[var(--card-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[var(--ink)]">
                          {bk.status}
                        </span>
                        {bk.isDemo && (
                          <span className="text-[10px] text-[var(--muted)]">(Sandbox)</span>
                        )}
                      </div>
                      <h2 className="font-serif-display text-xl font-semibold text-[var(--ink)]">
                        {exp ? exp.title : `Private ${bk.bookingType.replace('_', ' ')} with ${g?.displayName}`}
                      </h2>
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {bk.bookingDate}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {bk.durationHours} hrs · {bk.preferredLanguage}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] uppercase text-[var(--muted)]">
                        Protected Rate
                      </span>
                      <span className="text-lg font-bold tabular-nums">
                        ${bk.subtotalSnapshot.toFixed(2)}
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#191A18] text-[#D8F36A]">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
