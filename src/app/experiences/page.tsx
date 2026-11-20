import React from 'react';
import { getServerSession } from '@/lib/auth/session';
import { getPublicExperiences, getPublicGuides } from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { ExperiencesDirectoryClient } from '@/components/marketplace/ExperiencesDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const experiences = getPublicExperiences();
  const guides = getPublicGuides();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-24 sm:pt-28 px-4 sm:px-7 max-w-[1340px] mx-auto w-full">
        <div className="max-w-2xl space-y-1.5 mb-5 sm:mb-7">
          <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-ink)]">
            Guide-Authored Journeys
          </span>
          <h1 className="text-[28px] sm:text-5xl font-bold text-[var(--ink)] tracking-[-0.025em] leading-tight">
            Curated Experiences Across Bali
          </h1>
          <p className="text-[13px] sm:text-sm text-[var(--muted)] leading-relaxed">
            Every experience is co-created with an approved local guide and reviewed by our
            curatorial team before publication.
          </p>
        </div>

        <ExperiencesDirectoryClient
          experiences={experiences}
          guides={guides}
          initialCategory={params.category}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
