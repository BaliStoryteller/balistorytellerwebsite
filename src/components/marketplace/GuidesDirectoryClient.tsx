'use client';

import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { GuideCard } from '@/components/marketplace/GuideCard';
import type { Guide, GuideAvailabilitySlot } from '@/types/marketplace';

interface GuidesDirectoryClientProps {
  guides: Guide[];
  availability: GuideAvailabilitySlot[];
  initialFilters: {
    destination?: string;
    language?: string;
    specialty?: string;
    date?: string;
    q?: string;
  };
}

const SPECIALTIES = [
  'All Specialties',
  'Cultural Heritage',
  'Temple Exploration',
  'Traditional Villages',
  'Rice Terraces',
  'Nature and Waterfalls',
  'Balinese Food and Traditions',
  'Spiritual and Cultural Experiences',
];

export function GuidesDirectoryClient({
  guides,
  availability,
  initialFilters,
}: GuidesDirectoryClientProps) {
  const [query, setQuery] = useState(initialFilters.q ?? '');
  const [destination, setDestination] = useState(initialFilters.destination ?? '');
  const [language, setLanguage] = useState(initialFilters.language ?? '');
  const [specialty, setSpecialty] = useState(initialFilters.specialty ?? '');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [date, setDate] = useState(initialFilters.date ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return guides.filter((g) => {
      if (query) {
        const q = query.toLowerCase();
        const match =
          g.displayName.toLowerCase().includes(q) ||
          g.headline.toLowerCase().includes(q) ||
          g.biography.toLowerCase().includes(q) ||
          g.locationBase.toLowerCase().includes(q) ||
          g.specialties.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (destination) {
        const d = destination.toLowerCase();
        if (
          !g.locationBase.toLowerCase().includes(d) &&
          !g.destinationsCovered.some((x) => x.toLowerCase().includes(d))
        ) {
          return false;
        }
      }
      if (language) {
        if (!g.languages.some((l) => l.language.toLowerCase().includes(language.toLowerCase()))) {
          return false;
        }
      }
      if (specialty && specialty !== 'All Specialties') {
        if (!g.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase()))) {
          return false;
        }
      }
      if (minRating > 0 && g.ratingAvg < minRating) return false;
      if (g.startingPriceUsd > maxPrice) return false;
      if (date) {
        const slot = availability.find((a) => a.guideId === g.id && a.date === date);
        if (slot && (slot.status === 'blocked' || slot.status === 'booked')) {
          return false;
        }
      }
      return true;
    });
  }, [guides, availability, query, destination, language, specialty, minRating, maxPrice, date]);

  const clearAll = () => {
    setQuery('');
    setDestination('');
    setLanguage('');
    setSpecialty('');
    setMinRating(0);
    setMaxPrice(250);
    setDate('');
  };

  return (
    <div className="space-y-8">
      {/* Compact Filter Bar (Screenshot-inspired Dark Charcoal + Soft Lime active chips) */}
      <div className="cirrel-card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="flex-1 flex items-center gap-2 rounded-full cirrel-input px-4 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guide name, temple lore, culinary, French..."
              className="w-full bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full sm:w-auto rounded-full cirrel-input px-3.5 py-2 text-xs font-semibold text-[var(--ink)]"
            >
              <option value="" className="text-[#191A18]">All Regions</option>
              <option value="Ubud" className="text-[#191A18]">Ubud & Keliki</option>
              <option value="Sidemen" className="text-[#191A18]">Sidemen Valley</option>
              <option value="Uluwatu" className="text-[#191A18]">Uluwatu & Bukit</option>
              <option value="Munduk" className="text-[#191A18]">Munduk & North Bali</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-auto rounded-full cirrel-input px-3.5 py-2 text-xs font-semibold text-[var(--ink)]"
            >
              <option value="" className="text-[#191A18]">All Languages</option>
              <option value="English" className="text-[#191A18]">English</option>
              <option value="French" className="text-[#191A18]">French</option>
              <option value="Japanese" className="text-[#191A18]">Japanese</option>
              <option value="German" className="text-[#191A18]">German</option>
              <option value="Dutch" className="text-[#191A18]">Dutch</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="col-span-2 sm:col-span-1 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full btn-cirrel-green px-4 py-2 text-xs font-semibold cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8F36A]" />
              <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
            </button>
          </div>
        </div>

        {/* Specialty Quick Pills — Wraps cleanly with zero horizontal swipe */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SPECIALTIES.map((sp) => {
            const active = (sp === 'All Specialties' && !specialty) || specialty === sp;
            return (
              <button
                key={sp}
                type="button"
                onClick={() => setSpecialty(sp === 'All Specialties' ? '' : sp)}
                className={`rounded-full px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'btn-cirrel-lime'
                    : 'cirrel-btn-ghost'
                }`}
              >
                {sp}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="pt-3 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                Available on Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full cirrel-input px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full cirrel-input px-3 py-2 text-xs font-semibold"
              >
                <option value={0} className="text-[#191A18]">Any Rating</option>
                <option value={4.9} className="text-[#191A18]">4.9+ Stars</option>
                <option value={4.95} className="text-[#191A18]">4.95+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                Max Starting Price: ${maxPrice}
              </label>
              <input
                type="range"
                min={80}
                max={250}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#D8F36A]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>
          Showing <strong className="text-[var(--ink)]">{filtered.length}</strong> verified
          Balinese storytellers
        </span>
        {(query || destination || language || specialty || minRating > 0 || date) && (
          <button
            type="button"
            onClick={clearAll}
            className="font-semibold text-[var(--accent-ink)] hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Compact Responsive Guides Grid */}
      {filtered.length === 0 ? (
        <div className="cirrel-card p-10 text-center space-y-3">
          <p className="text-xl font-bold text-[var(--ink)]">
            No guides match these exact filters
          </p>
          <p className="text-sm text-[var(--muted)]">
            Try clearing your date or language constraint to explore all approved local guides.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full btn-cirrel-green px-5 py-2 text-xs font-semibold cursor-pointer"
          >
            Show All Guides
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {filtered.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
