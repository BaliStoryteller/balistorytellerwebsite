import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, MapPin, Languages, ArrowUpRight, Calendar } from 'lucide-react';
import { formatShortWindow } from '@/lib/date-utils';
import type { Guide } from '@/types/marketplace';

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <article className="group cirrel-card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1">
      {/* Compact Image-Led Header (Shorter on mobile for better viewport density) */}
      <Link
        href={`/guides/${guide.slug}`}
        className="relative block aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-black/20"
      >
        <img
          src={guide.profilePhotoUrl}
          alt={guide.displayName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        {/* Compact Top Floating Chips */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
          {guide.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-[#D8F36A] border border-white/15">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-white border border-white/15 tabular-nums ml-auto">
            <Star className="w-3 h-3 fill-[#D8F36A] text-[#D8F36A]" />
            {guide.ratingAvg.toFixed(2)}
          </span>
        </div>

        {/* Bottom Overlay Name & Base */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-[11px] text-[#D8F36A] font-semibold">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{guide.locationBase}</span>
            <span className="opacity-50">·</span>
            <span className="text-white/80 shrink-0">{guide.yearsExperience}y</span>
          </div>
          <h3 className="text-[17px] font-bold tracking-tight leading-tight truncate mt-0.5">
            {guide.displayName}
          </h3>
          <p className="text-[11.5px] text-white/75 line-clamp-1">{guide.headline}</p>
        </div>
      </Link>

      {/* Compact Cirrel Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ink-2)]">
            <Languages className="w-3.5 h-3.5 text-[var(--accent-ink)] shrink-0" />
            <span className="truncate">
              {guide.languages.map((l) => l.language).join(' · ')}
            </span>
          </div>

          <p className="text-[12.5px] text-[var(--muted)] leading-snug line-clamp-2">
            {guide.biography}
          </p>

          <div className="flex flex-wrap gap-1">
            {guide.specialties.slice(0, 2).map((sp) => (
              <span
                key={sp}
                className="rounded-full bg-[var(--card-2)] border border-[var(--line)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--ink-2)]"
              >
                {sp}
              </span>
            ))}
          </div>

          {/* Available From - Until Window Label */}
          <div className="flex items-center gap-1.5 rounded-[12px] bg-[var(--card-2)] border border-[var(--line)] px-2.5 py-1.5 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-ink)] shrink-0" />
            <span className="text-[var(--muted)] font-medium">Available:</span>
            <span className="font-semibold text-[var(--ink)] tabular-nums truncate">
              {formatShortWindow(guide.availableFrom, guide.availableUntil)}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[var(--line)] flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
              From
            </span>
            <span className="text-[15px] font-bold text-[var(--ink)] tabular-nums">
              ${guide.startingPriceUsd}
              <span className="text-[11px] font-medium text-[var(--muted)]"> / day</span>
            </span>
          </div>

          <Link
            href={`/guides/${guide.slug}`}
            className="inline-flex items-center gap-1 rounded-full btn-cirrel-green px-3 py-1.5 text-[12px] font-semibold"
          >
            <span>Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D8F36A]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
