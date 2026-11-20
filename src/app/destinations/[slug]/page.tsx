import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Info } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import {
  getPublicExperiences,
  getPublicGuides,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { GuideCard } from '@/components/marketplace/GuideCard';
import { ExperienceCard } from '@/components/marketplace/ExperienceCard';

export const dynamic = 'force-dynamic';

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession();
  const state = readMarketplaceState();
  const dest = state.destinations.find((d) => d.slug === slug);
  if (!dest) notFound();

  const guides = getPublicGuides({ destination: dest.name.split(' ')[0] });
  const experiences = getPublicExperiences({ destination: dest.slug });
  const guideMap = new Map(getPublicGuides().map((g) => [g.id, g]));

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-24 sm:pt-28 px-5 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-ink)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Destinations
        </Link>

        {/* Hero Banner */}
        <section className="relative rounded-[32px] overflow-hidden bg-[#191A18] min-h-[360px] flex items-end">
          <img
            src={dest.coverImageUrl}
            alt={dest.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191A18]/90 via-[#191A18]/35 to-transparent" />
          <div className="relative z-10 p-7 sm:p-12 max-w-3xl text-[#F7F5EF] space-y-3">
            <span className="rounded-full bg-[#D8F36A] text-[#141914] px-3.5 py-1 text-xs font-semibold">
              {dest.region}
            </span>
            <h1 className="font-serif-display text-4xl sm:text-6xl font-medium">
              {dest.name}
            </h1>
            <p className="text-sm sm:text-base text-[#F7F5EF]/85">{dest.description}</p>
          </div>
        </section>

        {/* Cultural Notes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="editorial-card p-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-ink)]">
              <Info className="w-4 h-4" /> Cultural Etiquette
            </span>
            <p className="text-sm text-[var(--ink-2)] leading-relaxed">{dest.culturalNotes}</p>
          </div>
          <div className="editorial-card p-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B69A58]">
              <Calendar className="w-4 h-4" /> Best Season to Visit
            </span>
            <p className="text-sm font-semibold text-[var(--ink)]">{dest.bestTimeToVisit}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dest.highlights.map((h) => (
                <span key={h} className="rounded-full bg-[var(--card-2)] px-3 py-1 text-xs">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Guides in Destination */}
        <section className="space-y-5">
          <h2 className="font-serif-display text-3xl font-medium text-[var(--ink)]">
            Storytellers Covering {dest.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((g) => (
              <GuideCard key={g.id} guide={g} />
            ))}
          </div>
        </section>

        {/* Experiences in Destination */}
        {experiences.length > 0 && (
          <section className="space-y-5">
            <h2 className="font-serif-display text-3xl font-medium text-[var(--ink)]">
              Curated Journeys Here
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  primaryGuide={guideMap.get(exp.primaryGuideId) ?? null}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
