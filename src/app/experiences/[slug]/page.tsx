import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Star,
  Users,
  X,
} from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import {
  getExperienceBySlug,
  getPublicGuides,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { ExperienceBookingFlow } from '@/components/marketplace/ExperienceBookingFlow';
import { formatShortWindow } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession();
  const experience = getExperienceBySlug(slug);
  if (!experience) notFound();

  const state = readMarketplaceState();
  const allGuides = getPublicGuides();
  const associatedGuides = allGuides.filter((g) =>
    experience.guideIds.includes(g.id)
  );
  const reviews = state.reviews.filter(
    (r) => r.experienceId === experience.id && r.isPublished
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />

      <main className="flex-1 pt-24 sm:pt-28 px-5 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-ink)] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Experiences
          </Link>
          <a
            href="#book-experience"
            className="lg:hidden rounded-full bg-[#191A18] text-[#D8F36A] px-4 py-2 text-xs font-semibold"
          >
            Reserve (${experience.priceUsd}/guest)
          </a>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 aspect-[16/10] overflow-hidden rounded-[28px] bg-[var(--card-3)]">
            <img
              src={experience.coverImageUrl}
              alt={experience.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {(experience.galleryUrls.slice(1, 3).length > 0
              ? experience.galleryUrls.slice(1, 3)
              : ['/images/hero-bali.jpg', '/images/dest-ubud.svg']
            ).map((url, idx) => (
              <div
                key={idx}
                className="aspect-[16/10] md:aspect-auto md:h-full overflow-hidden rounded-[24px] bg-[var(--card-3)]"
              >
                <img
                  src={url}
                  alt={`${experience.title} view ${idx + 2}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Overview & Approved Guides (Row 1 Left on Desktop, Top on Mobile) */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 min-w-0 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#344B35] text-[#D8F36A] px-3.5 py-1 text-xs font-semibold">
                  {experience.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full cirrel-card border border-[var(--line)] px-3 py-1 text-xs font-semibold tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#B69A58] text-[#B69A58]" />
                  {experience.ratingAvg > 0 ? experience.ratingAvg.toFixed(2) : '5.0'} (
                  {experience.reviewCount} reviews)
                </span>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-5xl font-medium text-[var(--ink)] leading-tight">
                {experience.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                  <MapPin className="w-4 h-4 text-[var(--accent-ink)]" /> {experience.locationName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                  <Clock className="w-4 h-4 text-[var(--accent-ink)]" /> {experience.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                  <Users className="w-4 h-4 text-[var(--accent-ink)]" /> Max {experience.maxGuests} guests
                </span>
              </div>

              <p className="text-base text-[var(--ink-2)] leading-relaxed pt-2">
                {experience.introduction}
              </p>
            </div>

            {/* Approved Guides Leading This Experience */}
            <section className="cirrel-card p-5 sm:p-6 space-y-3.5">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)]">
                Approved Storytellers Who Lead This Journey
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {associatedGuides.map((g) => (
                  <Link
                    key={g.id}
                    href={`/guides/${g.slug}`}
                    className="flex items-center gap-3 rounded-[16px] bg-[var(--card-2)] hover:bg-[var(--card-3)] border border-[var(--line)] p-3 transition-colors"
                  >
                    <img
                      src={g.profilePhotoUrl}
                      alt={g.displayName}
                      className="h-11 w-11 rounded-full object-cover border border-[#B69A58]/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--ink)] truncate">
                        {g.displayName}
                      </p>
                      <p className="text-[11px] text-[var(--accent-ink)] font-semibold truncate">
                        {g.languages.map((l) => l.language).join(' · ')}
                      </p>
                      <p className="text-[10.5px] text-[var(--muted)] tabular-nums">
                        Available: {formatShortWindow(g.availableFrom, g.availableUntil)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Dedicated Experience Booking Section (Separate Section on Mobile, Sticky Right Sidebar on Desktop) */}
          <section
            id="book-experience"
            aria-label="Experience Booking"
            className="scroll-mt-24 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 min-w-0 lg:sticky lg:top-24 rounded-[28px] bg-[var(--card-2)]/65 border border-[var(--line)] p-4 sm:p-6 lg:p-0 lg:bg-transparent lg:border-0 lg:rounded-none space-y-4 lg:space-y-0"
          >
            <div className="lg:hidden space-y-1 px-1">
              <span className="inline-block rounded-full bg-[#344B35] text-[#D8F36A] px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.16em]">
                Experience Booking
              </span>
              <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">
                Plan &amp; Reserve in 4 Steps
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pick your guide, choose an open date, enter your details, then review your
                Experience Summary before submitting.
              </p>
            </div>

            <ExperienceBookingFlow
              experience={experience}
              guides={associatedGuides.length > 0 ? associatedGuides : allGuides}
              availability={state.availability}
            />
          </section>

          {/* Itinerary, Inclusions & Reviews (Row 2 Left on Desktop, Below Booking Section on Mobile) */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 min-w-0 space-y-8">
            {/* Itinerary Stops */}
            <section className="editorial-card p-6 sm:p-8 space-y-5">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--ink)]">
                Step-by-Step Itinerary
              </h2>
              <div className="space-y-5 relative before:absolute before:left-[18px] before:top-3 before:bottom-3 before:w-[1.5px] before:bg-[#191A18]/12">
                {experience.itinerary.map((stop) => (
                  <div key={stop.id} className="relative pl-11">
                    <span className="absolute left-0 top-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#344B35] text-xs font-bold text-[#D8F36A] tabular-nums">
                      {stop.stopOrder}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#B69A58] tabular-nums">
                      <span>{stop.timeLabel}</span>
                      <span>•</span>
                      <span>{stop.durationMinutes} mins</span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--ink)] mt-0.5">
                      {stop.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-2)] mt-1 leading-relaxed">
                      {stop.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Inclusions, Exclusions & Meeting Point */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="editorial-card p-6 space-y-3">
                <h3 className="font-serif-display text-xl font-semibold text-[var(--ink)]">
                  What&apos;s Included
                </h3>
                <ul className="space-y-2 text-sm text-[var(--ink-2)]">
                  {experience.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[var(--accent-ink)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="editorial-card p-6 space-y-3">
                <h3 className="font-serif-display text-xl font-semibold text-[var(--ink)]">
                  Not Included &amp; Meeting
                </h3>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {experience.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[var(--line)]">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-ink)]">
                    Meeting Location
                  </span>
                  <p className="text-xs font-medium text-[var(--ink)] mt-1">
                    {experience.meetingPoint}
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">
                  Recent Guest Reviews
                </h2>
                {reviews.map((rev) => (
                  <div key={rev.id} className="editorial-card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {rev.authorName} ·{' '}
                        <span className="font-normal text-xs text-[var(--muted)]">
                          {rev.authorOrigin}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B69A58]">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}.0
                      </span>
                    </div>
                    <p className="text-sm text-[var(--ink-2)]">{rev.comment}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
