'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { SearchPanel } from '@/components/marketplace/SearchPanel';
import { GuideCard } from '@/components/marketplace/GuideCard';
import { ExperienceCard } from '@/components/marketplace/ExperienceCard';
import { FloatingChooseGuideModal } from '@/components/marketplace/FloatingChooseGuideModal';
import type { Destination, Experience, Guide, Review } from '@/types/marketplace';

gsap.registerPlugin(ScrollTrigger);

interface HomepageClientProps {
  guides: Guide[];
  experiences: Experience[];
  destinations: Destination[];
  reviews: Review[];
}

export function HomepageClient({
  guides,
  experiences,
  destinations,
  reviews,
}: HomepageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedExpGuideId, setSelectedExpGuideId] = useState<string>('');

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 24,
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.from(section, {
          y: 22,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
            once: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const guideMap = new Map(guides.map((g) => [g.id, g]));

  const curatedExperiences = useMemo(() => {
    if (!selectedExpGuideId) return experiences.slice(0, 3);
    return experiences.filter((e) => e.guideIds.includes(selectedExpGuideId));
  }, [experiences, selectedExpGuideId]);

  return (
    <div ref={containerRef}>
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[78vh] sm:min-h-[84vh] flex flex-col justify-end overflow-hidden bg-[#0a0f0b]">
        <img
          src="/images/hero-bali.jpg"
          alt="Morning mist over Ubud rice terraces and mossy Balinese temple gate"
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-[#070a08]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1340px] mx-auto w-full px-4 sm:px-7 pt-24 sm:pt-28 pb-7 sm:pb-12 space-y-5 sm:space-y-6">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <div className="hero-stagger inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/18 px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold text-[#D8F36A] tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Discover Bali Through Local Eyes</span>
            </div>

            <h1 className="hero-stagger text-[32px] sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.07] sm:leading-[1.04] tracking-[-0.03em]">
              Discover More with Bali&apos;s{' '}
              <br className="hidden sm:inline" />
              <span className="text-[#D8F36A]">Licensed Tour Guides</span>.
            </h1>

            <p className="hero-stagger text-[13.5px] sm:text-base text-white/85 max-w-lg leading-relaxed font-medium">
              Meet the local guides who bring Bali&apos;s culture, traditions and hidden
              places to life.
            </p>

            <div className="hero-stagger flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
              <Link
                href="/guides"
                className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-lime px-4 sm:px-5 py-2.5 text-[12.5px] sm:text-[13px] font-bold"
              >
                <span>Explore Local Guides</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-green px-4 sm:px-5 py-2.5 text-[12.5px] sm:text-[13px] font-semibold"
              >
                <span>Discover Experiences</span>
              </Link>
            </div>
          </div>

          {/* 2. SLICK SINGLE-LAYER SEARCH BAR */}
          <div className="hero-stagger pt-1 sm:pt-2">
            <SearchPanel variant="hero" />
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROFESSIONAL GUIDES (Compact 4-column Cirrel cards) */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6">
          <div className="space-y-1 max-w-xl">
            <span className="inline-block text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#D8F36A] bg-[#344B35] px-2.5 py-0.5 rounded-full">
              Guide-First Discovery
            </span>
            <h2 className="text-[22px] sm:text-[32px] font-bold text-[var(--ink)] tracking-[-0.02em] leading-tight">
              Meet Our Verified Storytellers
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)]">
              Choose your companion first—HPI-licensed, personally vetted, and rooted in their local banjar.
            </p>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full cirrel-btn-ghost px-4 py-2 text-[12px] sm:text-[12.5px] font-semibold"
          >
            <span>All Guides</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {guides.slice(0, 4).map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      {/* 4. EXPLORE BALI BY DESTINATION (Compact 4-Tile Bento Grid) */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16">
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
          <div className="space-y-1">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#B69A58]">
              Regions of Depth
            </span>
            <h2 className="text-[22px] sm:text-[32px] font-bold text-[var(--ink)] tracking-[-0.02em]">
              Explore Bali by Destination
            </h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-semibold text-[var(--ink)] hover:text-[var(--accent-ink)] shrink-0"
          >
            All Regions <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group relative overflow-hidden rounded-[18px] sm:rounded-[22px] cirrel-card aspect-[4/3.4] sm:aspect-[4/3.2]"
            >
              <img
                src={dest.coverImageUrl}
                alt={dest.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                <span className="rounded-full bg-black/55 backdrop-blur-md px-2 py-0.5 text-[9.5px] sm:text-[10px] font-semibold text-white border border-white/15">
                  {dest.region}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-end justify-between gap-1.5 text-white">
                <div className="min-w-0">
                  <h3 className="text-[14px] sm:text-[18px] font-bold tracking-tight truncate">
                    {dest.name}
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-white/75 line-clamp-1">
                    {dest.tagline}
                  </p>
                </div>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full btn-cirrel-lime">
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CURATED CULTURAL EXPERIENCES (Compact Cards) */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#B69A58]">
              Guide-Led Journeys
            </span>
            <h2 className="text-[22px] sm:text-[32px] font-bold text-[var(--ink)] tracking-[-0.02em]">
              Curated Cultural Experiences
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <FloatingChooseGuideModal
              guides={guides}
              selectedGuideId={selectedExpGuideId}
              onSelectGuide={(g) =>
                setSelectedExpGuideId((prev) => (prev === g.id ? '' : g.id))
              }
              buttonLabel="Choose Your Guide"
            />
            {selectedExpGuideId && (
              <button
                type="button"
                onClick={() => setSelectedExpGuideId('')}
                className="rounded-full cirrel-btn-ghost px-3 py-2 text-[11.5px] font-semibold cursor-pointer"
              >
                Clear ×
              </button>
            )}
            <Link
              href="/experiences"
              className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-green px-4 py-2 text-[12px] sm:text-[12.5px] font-semibold"
            >
              <span>All Experiences</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D8F36A]" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {curatedExperiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              primaryGuide={guideMap.get(exp.primaryGuideId) ?? null}
            />
          ))}
        </div>
      </section>

      {/* 6. WHY EXPLORE WITH A LOCAL GUIDE? (Cirrel Glass Split) */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16">
        <div className="cirrel-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-5 sm:p-9 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold text-[#D8F36A]">
                <HeartHandshake className="w-3.5 h-3.5" /> Why Guide-First Travel
              </span>
              <h2 className="text-[22px] sm:text-[32px] font-bold text-[var(--ink)] tracking-[-0.02em] leading-tight">
                Context turns a photograph into a lifelong memory.
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] leading-relaxed max-w-xl">
                Bali Storyteller connects you with the guardian, historian, or artisan first—not
                generic bus itineraries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Verified HPI Credentials',
                  desc: 'Official Indonesian tourism licenses & curator verification.',
                },
                {
                  icon: Compass,
                  title: 'Unhurried Sacred Access',
                  desc: 'Dawn timing & respectful village introductions.',
                },
                {
                  icon: Award,
                  title: 'Fair Local Compensation',
                  desc: 'Storytellers earn 82% directly with auditable payouts.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Tailored to Your Pace',
                  desc: 'Adapt language, stops, and depth to your curiosity.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] bg-[var(--card-2)] border border-[var(--line)] p-3.5 space-y-1"
                >
                  <item.icon className="w-4 h-4 text-[var(--accent-ink)]" />
                  <h3 className="text-[13.5px] font-bold text-[var(--ink)]">{item.title}</h3>
                  <p className="text-[12px] text-[var(--muted)] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px]">
            <img
              src="/images/exp-temple.jpg"
              alt="Balinese water temple morning light"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 glass-dark rounded-[18px] p-4">
              <p className="text-[13px] font-medium italic text-white leading-snug">
                “Tri Hita Karana teaches harmony between people, nature, and spirit. That is what
                we share with every guest.”
              </p>
              <p className="text-[11px] text-[#D8F36A] mt-1.5 font-semibold">
                — I Made Wijaya, Ubud Senior Storyteller
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS + 8. GUEST REVIEWS (Compact Cirrel Grid) */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16 space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[
            {
              step: '01',
              title: 'Discover Your Storyteller',
              desc: 'Filter verified Balinese guides by language, region, specialty, and personal background.',
            },
            {
              step: '02',
              title: 'Choose Format & Check Dates',
              desc: 'Reserve a curated experience, full-day hire, hourly walk, or custom route with live availability.',
            },
            {
              step: '03',
              title: 'Confirm & Meet Locally',
              desc: 'Your guide confirms timing, sharing exact meeting etiquette and locked pricing.',
            },
          ].map((item) => (
            <div key={item.step} className="cirrel-card p-5 space-y-2">
              <span className="inline-block rounded-full bg-[#344B35] text-[#D8F36A] px-2.5 py-0.5 text-[11px] font-bold">
                STEP {item.step}
              </span>
              <h3 className="text-[17px] font-bold text-[var(--ink)]">{item.title}</h3>
              <p className="text-[12.5px] text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl sm:text-[28px] font-bold text-[var(--ink)] tracking-[-0.02em]">
              Traveler Reflections
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full cirrel-glass px-3 py-1 text-[12px] font-semibold text-[var(--ink)]">
              <Star className="w-3.5 h-3.5 fill-[var(--accent-ink)] text-[var(--accent-ink)]" /> 4.96 avg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {reviews.map((rev) => {
              const g = guideMap.get(rev.guideId);
              return (
                <div key={rev.id} className="cirrel-card p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-0.5 text-[var(--accent-ink)]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-[12.5px] text-[var(--ink-2)] leading-snug">
                      “{rev.comment}”
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--ink)]">{rev.authorName}</span>
                    {g && (
                      <Link
                        href={`/guides/${g.slug}`}
                        className="font-semibold text-[var(--accent-ink)] hover:underline"
                      >
                        {g.displayName.split(' ').slice(-1)[0]}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BECOME A GUIDE + 10. CULTURAL FIELD NOTES */}
      <section className="reveal-section max-w-[1340px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16 space-y-10 sm:space-y-12">
        <div className="cirrel-card p-5 sm:p-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 bg-gradient-to-r from-[#344B35]/20 to-transparent">
          <div className="max-w-xl space-y-2">
            <span className="inline-block rounded-full bg-[#344B35] px-3 py-0.5 text-[10.5px] sm:text-[11px] font-semibold text-[#D8F36A]">
              For Licensed Balinese Storytellers
            </span>
            <h2 className="text-[22px] sm:text-[32px] font-bold text-[var(--ink)] tracking-[-0.02em]">
              Share Your Island’s Living Heritage
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)]">
              Set your own calendar, propose bespoke itineraries, and receive fair, auditable payouts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/become-a-guide"
              className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-lime px-5 py-2.5 text-[13px] font-bold"
            >
              <span>Apply as a Guide</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-green px-5 py-2.5 text-[13px] font-semibold"
            >
              <span>Verification Standards</span>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl sm:text-[28px] font-bold text-[var(--ink)] tracking-[-0.02em]">
              Cultural Field Notes
            </h2>
            <Link
              href="/about"
              className="text-[12px] font-semibold text-[var(--ink-2)] hover:text-[var(--accent-ink)]"
            >
              Manifesto →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tag: 'Cosmology',
                title: 'Tri Hita Karana Before Entering a Village Temple',
                image: '/images/dest-ubud.svg',
                href: '/experiences/dawn-melukat-and-hidden-water-temples',
              },
              {
                tag: 'Living Heritage',
                title: 'Inside the Subak: Bali’s Thousand-Year Cooperative',
                image: '/images/dest-sidemen.svg',
                href: '/experiences/sidemen-subak-terraces-and-songket-looms',
              },
              {
                tag: 'Gastronomy',
                title: 'Bumbu Genep: Sacred Geometry of Balinese Spices',
                image: '/images/exp-culinary.svg',
                href: '/experiences/gianyar-dawn-market-and-bumbu-genep-kitchen',
              },
            ].map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="group cirrel-card overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black/20">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-[var(--accent-ink)]">
                    {article.tag}
                  </span>
                  <h3 className="text-[15.5px] font-bold text-[var(--ink)] group-hover:text-[var(--accent-ink)] transition-colors leading-snug">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
