import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Award,
  Calendar,
  CheckCircle2,
  Languages,
  MapPin,
  ShieldCheck,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import {
  getGuideBySlug,
  getPublicExperiences,
  getPublicGuides,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { ExperienceCard } from '@/components/marketplace/ExperienceCard';
import { BookingWizard } from '@/components/marketplace/BookingWizard';
import { GuideProfileMonthlySchedule } from '@/components/marketplace/GuideProfileMonthlySchedule';
import { formatShortWindow } from '@/lib/date-utils';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export default async function GuideProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession();
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const state = readMarketplaceState();
  const allGuides = getPublicGuides();
  const experiences = getPublicExperiences({ guideId: guide.id });
  const reviews = state.reviews.filter(
    (r) => r.guideId === guide.id && r.isPublished
  );
  const guideSlots = state.availability.filter((a) => a.guideId === guide.id);
  const introEmbedUrl = getYouTubeEmbedUrl(guide.introVideoUrl);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />

      <main className="flex-1 pt-24 sm:pt-28 px-5 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Back Breadcrumb + Mobile Top-Inline Book CTA (No Bottom Bar!) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-ink)] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Guides
          </Link>
          <a
            href="#book-guide"
            className="lg:hidden rounded-full bg-[#191A18] text-[#D8F36A] px-4 py-2 text-xs font-semibold"
          >
            Request Booking (${guide.startingPriceUsd}+)
          </a>
        </div>

        {/* Hero Profile Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Unified Video-First Profile Card -> Story -> Credentials -> Experiences -> Gallery -> Reviews */}
          <div className="lg:col-span-7 min-w-0 space-y-8 sm:space-y-10">
            <div className="editorial-card overflow-hidden">
              {/* Top Media: Landscape 16:9 YouTube Introduction Video (or photo fallback) */}
              <div className="relative w-full aspect-video bg-black">
                {introEmbedUrl ? (
                  <iframe
                    src={introEmbedUrl}
                    title={`${guide.displayName} — Introduction Video`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={guide.profilePhotoUrl}
                    alt={guide.displayName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Card Body with Circular Avatar Before Name */}
              <div className="p-5 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {guide.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#344B35] text-[#D8F36A] px-3 py-1 text-[11px] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Storyteller
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--card-2)] px-3 py-1 text-xs font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#B69A58] text-[#B69A58]" />
                    {guide.ratingAvg.toFixed(2)} ({guide.reviewCount} reviews)
                  </span>
                </div>

                {/* Small Circle Avatar + Smaller Readable Guide Name */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={guide.profilePhotoUrl}
                    alt={guide.displayName}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-[#B69A58]/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-[20px] sm:text-[24px] font-bold text-[var(--ink)] leading-snug tracking-[-0.02em]">
                      {guide.displayName}
                    </h1>
                    <p className="text-[12.5px] sm:text-[13.5px] font-medium text-[var(--accent-ink)] leading-snug mt-0.5">
                      {guide.headline}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-ink)]" /> {guide.locationBase}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#B69A58]" /> {guide.yearsExperience} years guiding
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-ink)]" /> Available:{' '}
                    <strong className="text-[var(--ink)] tabular-nums">
                      {formatShortWindow(guide.availableFrom, guide.availableUntil)}
                    </strong>
                  </span>
                  <span>License: {guide.licenseNumber}</span>
                </div>

                {/* Quick Pricing Tiers */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--line)]">
                  <div className="rounded-2xl bg-[var(--card-2)] p-2.5 sm:p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      Hourly
                    </span>
                    <span className="text-sm font-bold tabular-nums">${guide.hourlyRateUsd}/hr</span>
                  </div>
                  <div className="rounded-2xl bg-[var(--card-2)] p-2.5 sm:p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      Full Day
                    </span>
                    <span className="text-sm font-bold tabular-nums">${guide.fullDayRateUsd}</span>
                  </div>
                  <div className="rounded-2xl bg-[#D8F36A]/35 p-2.5 sm:p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--accent-ink)]">
                      Tours Led
                    </span>
                    <span className="text-sm font-bold tabular-nums">{guide.completedToursCount}+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Story & Biography */}
            <section className="editorial-card p-6 sm:p-8 space-y-5">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--ink)]">
                Personal Story & Background
              </h2>
              <blockquote className="rounded-2xl bg-[#344B35] text-[#F7F5EF] p-5 font-serif-display text-xl italic leading-relaxed">
                {guide.personalStory}
              </blockquote>
              <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
                {guide.biography}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[var(--line)]">
                <div className="space-y-2.5">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    <Languages className="w-3.5 h-3.5 text-[var(--accent-ink)]" /> Languages Spoken
                  </h3>
                  <ul className="space-y-1.5 text-sm">
                    {guide.languages.map((l) => (
                      <li key={l.language} className="flex items-center justify-between">
                        <span className="font-medium text-[var(--ink)]">{l.language}</span>
                        <span className="rounded-full bg-[var(--card-2)] px-2.5 py-0.5 text-xs text-[var(--accent-ink)]">
                          {l.proficiency}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-ink)]" /> Verified Qualifications
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[var(--ink-2)]">
                    {guide.qualifications.map((q) => (
                      <li key={q} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#B69A58] shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex flex-wrap gap-2">
                {guide.destinationsCovered.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-[var(--card-2)] border border-[var(--line)] px-3 py-1 text-xs font-medium"
                  >
                    Covers: {d}
                  </span>
                ))}
              </div>
            </section>

            {/* Floating Monthly Availability Calendar (Blocked dates disabled) */}
            <GuideProfileMonthlySchedule
              guideId={guide.id}
              guideName={guide.displayName}
              availability={guideSlots}
              availableFrom={guide.availableFrom}
              availableUntil={guide.availableUntil}
            />

            {/* Photo Gallery */}
            <section className="space-y-4">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--ink)]">
                Field Photography Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {guide.galleryUrls.map((url, idx) => (
                  <div key={idx} className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--card-3)]">
                    <img
                      src={url}
                      alt={`${guide.displayName} gallery ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Approved Experiences Led by This Guide */}
            <section className="space-y-5">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--ink)]">
                Experiences Led by {guide.displayName.split(' ')[0]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} primaryGuide={guide} />
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-4">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--ink)]">
                Guest Reviews ({reviews.length})
              </h2>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="editorial-card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--ink)]">
                        {rev.authorName}{' '}
                        <span className="font-normal text-xs text-[var(--muted)]">
                          · {rev.authorOrigin}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B69A58]">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}.0
                      </span>
                    </div>
                    <p className="text-sm text-[var(--ink-2)] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Wizard */}
          <div id="book-guide" className="lg:col-span-5 min-w-0 lg:sticky lg:top-24">
            <BookingWizard
              guides={allGuides}
              experiences={getPublicExperiences()}
              availability={state.availability}
              preselectedGuideId={guide.id}
            />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
