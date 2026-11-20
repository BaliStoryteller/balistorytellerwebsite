import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Star } from 'lucide-react';
import type { Experience, Guide } from '@/types/marketplace';

interface ExperienceCardProps {
  experience: Experience;
  primaryGuide?: Guide | null;
}

export function ExperienceCard({ experience, primaryGuide }: ExperienceCardProps) {
  return (
    <article className="group cirrel-card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1">
      <Link
        href={`/experiences/${experience.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-black/20"
      >
        <img
          src={experience.coverImageUrl}
          alt={experience.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
          <span className="rounded-full bg-black/55 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-semibold text-white border border-white/15 truncate">
            {experience.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-white border border-white/15 tabular-nums shrink-0">
            <Star className="w-3 h-3 fill-[#D8F36A] text-[#D8F36A]" />
            {experience.ratingAvg > 0 ? experience.ratingAvg.toFixed(2) : 'New'}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
          <span className="inline-flex items-center gap-1 font-semibold truncate">
            <MapPin className="w-3 h-3 text-[#D8F36A] shrink-0" />
            {experience.locationName}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold shrink-0">
            <Clock className="w-3 h-3 text-[#D8F36A]" />
            {experience.durationHours}h
          </span>
        </div>
      </Link>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-[16px] font-bold text-[var(--ink)] leading-snug line-clamp-2 group-hover:text-[var(--accent-ink)] transition-colors">
            <Link href={`/experiences/${experience.slug}`}>{experience.title}</Link>
          </h3>
          <p className="text-[12.5px] text-[var(--muted)] line-clamp-2 leading-snug">
            {experience.shortSummary}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {primaryGuide && (
            <Link
              href={`/guides/${primaryGuide.slug}`}
              className="flex items-center gap-2 rounded-[12px] bg-[var(--card-2)] border border-[var(--line)] px-2.5 py-1.5 hover:bg-[var(--card-3)] transition-colors"
            >
              <img
                src={primaryGuide.profilePhotoUrl}
                alt={primaryGuide.displayName}
                className="w-7 h-7 rounded-full object-cover border border-[#B69A58]/40 shrink-0"
              />
              <span className="text-[12px] font-semibold text-[var(--ink)] truncate flex-1">
                {primaryGuide.displayName}
              </span>
              <span className="text-[10px] font-semibold text-[var(--accent-ink)] uppercase">Guide</span>
            </Link>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                From
              </span>
              <span className="text-[15px] font-bold text-[var(--ink)] tabular-nums">
                ${experience.priceUsd}
                <span className="text-[11px] font-medium text-[var(--muted)]"> / guest</span>
              </span>
            </div>
            <Link
              href={`/experiences/${experience.slug}`}
              className="rounded-full btn-cirrel-green px-3.5 py-1.5 text-[12px] font-semibold"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
