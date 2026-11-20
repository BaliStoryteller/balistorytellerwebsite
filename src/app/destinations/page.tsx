import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { readMarketplaceState } from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function DestinationsPage() {
  const session = await getServerSession();
  const state = readMarketplaceState();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-ink)]">
            Island Regions
          </span>
          <h1 className="font-serif-display text-4xl sm:text-6xl font-medium text-[var(--ink)]">
            Explore Bali by Destination
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
            Each region of Bali carries distinct dialects, temple customs, microclimates, and
            agrarian histories. Discover the guides rooted in each valley and coastline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group editorial-card overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--card-3)]">
                <img
                  src={dest.coverImageUrl}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191A18]/80 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#141914]">
                  {dest.region}
                </span>
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-[#F7F5EF]">
                  <div>
                    <h2 className="font-serif-display text-3xl font-semibold">{dest.name}</h2>
                    <p className="text-xs text-[#F7F5EF]/80 mt-0.5">{dest.tagline}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8F36A] text-[#141914]">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[var(--ink-2)] leading-relaxed">{dest.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {dest.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--card-2)] px-3 py-1 text-xs font-medium text-[var(--accent-ink)]"
                    >
                      <MapPin className="w-3 h-3" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
