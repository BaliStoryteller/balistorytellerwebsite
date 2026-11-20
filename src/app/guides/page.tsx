import React from 'react';
import { getServerSession } from '@/lib/auth/session';
import {
  getPublicGuides,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { GuidesDirectoryClient } from '@/components/marketplace/GuidesDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{
    destination?: string;
    language?: string;
    specialty?: string;
    date?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const state = readMarketplaceState();
  const guides = getPublicGuides();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />

      <main className="flex-1 pt-24 sm:pt-28 px-4 sm:px-7 max-w-[1340px] mx-auto w-full">
        <div className="max-w-2xl space-y-1.5 mb-5 sm:mb-7">
          <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-ink)]">
            Curated Directory
          </span>
          <h1 className="text-[28px] sm:text-5xl font-bold text-[var(--ink)] tracking-[-0.025em] leading-tight">
            Explore Local Storytellers
          </h1>
          <p className="text-[13px] sm:text-sm text-[var(--muted)] leading-relaxed">
            Every guide is personally verified, licensed under HPI regulations, and selected for
            depth of cultural storytelling.
          </p>
        </div>

        <GuidesDirectoryClient
          guides={guides}
          availability={state.availability}
          initialFilters={params}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
