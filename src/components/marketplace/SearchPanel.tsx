'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Languages, Compass, Calendar, Users, Search } from 'lucide-react';

interface SearchPanelProps {
  variant?: 'hero' | 'compact';
  initialValues?: {
    destination?: string;
    language?: string;
    specialty?: string;
    date?: string;
    guests?: string;
  };
}

export function SearchPanel({ variant = 'hero', initialValues }: SearchPanelProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(initialValues?.destination ?? '');
  const [language, setLanguage] = useState(initialValues?.language ?? '');
  const [specialty, setSpecialty] = useState(initialValues?.specialty ?? '');
  const [date, setDate] = useState(initialValues?.date ?? '');
  const [guests, setGuests] = useState(initialValues?.guests ?? '2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (language) params.set('language', language);
    if (specialty) params.set('specialty', specialty);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    router.push(`/guides${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const isHero = variant === 'hero';
  const iconColor = isHero ? 'text-[#D8F36A]' : 'text-[var(--accent-ink)]';
  const borderLine = isHero ? 'border-white/12' : 'border-[var(--line)]';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full overflow-hidden transition-all ${
        isHero
          ? 'rounded-[22px] lg:rounded-full bg-[#131914]/78 backdrop-blur-[34px] saturate-[180%] text-[#f2f5f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.14),0_26px_64px_-16px_rgba(0,0,0,0.65)]'
          : 'rounded-[22px] lg:rounded-full cirrel-glass text-[var(--ink)]'
      }`}
    >
      {/* Single-Layer Responsive Bar: Clean 2-col mobile -> 3-col tablet -> single-row flex pill desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:items-center min-w-0">
        {/* Destination */}
        <label
          className={`col-span-1 min-w-0 lg:flex-[1.2] lg:min-w-0 flex items-center gap-2 px-3 sm:px-4 lg:pl-5 lg:pr-3 py-2.5 sm:py-3 cursor-pointer border-b border-r ${borderLine} lg:border-b-0`}
        >
          <MapPin className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="min-w-0 flex-1">
            <span className="block text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-65">
              Destination
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full max-w-full bg-transparent text-[12.5px] sm:text-[13px] font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="text-[#141914]">All of Bali</option>
              <option value="Ubud" className="text-[#141914]">Ubud & Keliki</option>
              <option value="Sidemen" className="text-[#141914]">Sidemen Valley</option>
              <option value="Uluwatu" className="text-[#141914]">Uluwatu & Bukit</option>
              <option value="Munduk" className="text-[#141914]">Munduk & North Bali</option>
            </select>
          </div>
        </label>

        {/* Language */}
        <label
          className={`col-span-1 min-w-0 lg:flex-[1] lg:min-w-0 flex items-center gap-2 px-3 sm:px-4 lg:px-3.5 py-2.5 sm:py-3 cursor-pointer border-b sm:border-r lg:border-b-0 ${borderLine}`}
        >
          <Languages className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="min-w-0 flex-1">
            <span className="block text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-65">
              Language
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-full bg-transparent text-[12.5px] sm:text-[13px] font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="text-[#141914]">Any Language</option>
              <option value="English" className="text-[#141914]">English</option>
              <option value="French" className="text-[#141914]">French</option>
              <option value="Japanese" className="text-[#141914]">Japanese</option>
              <option value="German" className="text-[#141914]">German</option>
              <option value="Dutch" className="text-[#141914]">Dutch</option>
            </select>
          </div>
        </label>

        {/* Specialty */}
        <label
          className={`col-span-1 min-w-0 lg:flex-[1.3] lg:min-w-0 flex items-center gap-2 px-3 sm:px-4 lg:px-3.5 py-2.5 sm:py-3 cursor-pointer border-b border-r sm:border-r-0 lg:border-b-0 lg:border-r ${borderLine}`}
        >
          <Compass className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="min-w-0 flex-1">
            <span className="block text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-65">
              Specialty
            </span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full max-w-full bg-transparent text-[12.5px] sm:text-[13px] font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="text-[#141914]">All Specialties</option>
              <option value="Cultural Heritage" className="text-[#141914]">Cultural Heritage</option>
              <option value="Temple Exploration" className="text-[#141914]">Temple Exploration</option>
              <option value="Traditional Villages" className="text-[#141914]">Traditional Villages</option>
              <option value="Rice Terraces" className="text-[#141914]">Rice Terraces</option>
              <option value="Nature and Waterfalls" className="text-[#141914]">Nature & Waterfalls</option>
              <option value="Balinese Food" className="text-[#141914]">Food & Traditions</option>
              <option value="Spiritual" className="text-[#141914]">Spiritual Rituals</option>
            </select>
          </div>
        </label>

        {/* Date (Clear Fallback Label for iOS Safari when empty) */}
        <label
          className={`col-span-1 min-w-0 lg:flex-[1] lg:min-w-0 flex items-center gap-2 px-3 sm:px-4 lg:px-3.5 py-2.5 sm:py-3 cursor-pointer border-b sm:border-b-0 sm:border-r ${borderLine}`}
        >
          <Calendar className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="min-w-0 flex-1 relative">
            <span className="block text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-65">
              Date
            </span>
            <div className="relative flex items-center">
              {!date && (
                <span className="pointer-events-none text-[12.5px] sm:text-[13px] font-semibold opacity-80">
                  Flexible
                </span>
              )}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Preferred date"
                className={`bg-transparent text-[12px] sm:text-[12.5px] font-semibold focus:outline-none max-w-full ${
                  !date ? 'opacity-0 absolute inset-0 w-full cursor-pointer' : 'w-full'
                }`}
              />
            </div>
          </div>
        </label>

        {/* Guests */}
        <label
          className={`col-span-1 min-w-0 lg:w-[104px] lg:shrink-0 flex items-center gap-2 px-3 sm:px-4 lg:px-3.5 py-2.5 sm:py-3 cursor-pointer border-r ${borderLine}`}
        >
          <Users className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="min-w-0 flex-1">
            <span className="block text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-65">
              Guests
            </span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent text-[12.5px] sm:text-[13px] font-semibold focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={String(n)} className="text-[#141914]">
                  {n}
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Single Green CTA */}
        <div className="col-span-1 lg:shrink-0 flex items-center justify-center lg:justify-end px-2.5 py-2 lg:px-2.5">
          <button
            type="submit"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 rounded-full btn-cirrel-green px-4 sm:px-5 py-2.5 text-[12.5px] sm:text-[13px] font-semibold cursor-pointer whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[#D8F36A] shrink-0" />
            <span>Find Guide</span>
          </button>
        </div>
      </div>
    </form>
  );
}
