'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { MonthlyScheduleCalendar } from '@/components/marketplace/MonthlyScheduleCalendar';
import { formatShortWindow } from '@/lib/date-utils';
import type {
  Experience,
  Guide,
  GuideAvailabilitySlot,
} from '@/types/marketplace';

interface ExperienceBookingFlowProps {
  experience: Experience;
  guides: Guide[];
  availability: GuideAvailabilitySlot[];
}

export function ExperienceBookingFlow({
  experience,
  guides,
  availability,
}: ExperienceBookingFlowProps) {
  const router = useRouter();

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    for (const g of guides) {
      for (const l of g.languages) set.add(l.language);
    }
    return Array.from(set);
  }, [guides]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [guideId, setGuideId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('2026-11-25');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const matchingGuides = useMemo(() => {
    if (!selectedLanguage) return [];
    return guides.filter((g) =>
      g.languages.some((l) => l.language === selectedLanguage)
    );
  }, [guides, selectedLanguage]);

  const selectedGuide = useMemo(
    () => guides.find((g) => g.id === guideId) ?? null,
    [guides, guideId]
  );

  const dateSlot = useMemo(
    () =>
      guideId
        ? availability.find((a) => a.guideId === guideId && a.date === bookingDate)
        : undefined,
    [availability, guideId, bookingDate]
  );

  const isOutOfRange = Boolean(
    (selectedGuide?.availableFrom && bookingDate < selectedGuide.availableFrom) ||
      (selectedGuide?.availableUntil && bookingDate > selectedGuide.availableUntil)
  );

  const isDateBlocked =
    dateSlot?.status === 'blocked' || dateSlot?.status === 'booked' || isOutOfRange;

  const totalAmount = Number((experience.priceUsd * guestCount).toFixed(2));

  const handleLanguagePick = (lang: string) => {
    setSelectedLanguage(lang);
    const firstMatch = guides.find((g) =>
      g.languages.some((l) => l.language === lang)
    );
    if (firstMatch) {
      setGuideId(firstMatch.id);
    } else {
      setGuideId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedGuide || !selectedLanguage) {
      setErrorMsg('Please select a language and guide first.');
      setStep(1);
      return;
    }
    if (isDateBlocked) {
      setErrorMsg('That date is unavailable for this guide. Please choose another date.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: selectedGuide.id,
          experienceId: experience.id,
          bookingType: 'curated_experience',
          bookingDate,
          durationHours: experience.durationHours,
          preferredLanguage: selectedLanguage,
          guestCount,
          customerName,
          customerEmail,
          customerPhone,
          specialRequests,
          idempotencyKey: `exp-${experience.id}-${selectedGuide.id}-${bookingDate}-${Date.now()}`,
        }),
      });
      const data = (await res.json()) as { booking?: { id: string }; error?: string };
      if (!res.ok || !data.booking) {
        setErrorMsg(data.error || 'Could not submit booking request.');
        setSubmitting(false);
        return;
      }
      router.push(`/booking/${data.booking.id}`);
    } catch {
      setErrorMsg('Network error submitting booking request.');
      setSubmitting(false);
    }
  };

  return (
    <div className="cirrel-card p-5 sm:p-6 space-y-5">
      {/* Header + Price */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div className="min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
            Experience Booking
          </span>
          <h3 className="text-xl font-bold text-[var(--ink)] tracking-tight mt-0.5">
            Book This Experience
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {experience.durationLabel} · Max {experience.maxGuests} guests
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xl font-bold text-[var(--ink)] tabular-nums">
            ${experience.priceUsd}
          </span>
          <span className="block text-[10.5px] text-[var(--muted)]">per guest</span>
        </div>
      </div>

      {/* Clear 3-Step Visual Breadcrumb */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          [1, '1. Guide'],
          [2, '2. Date'],
          [3, '3. Details'],
        ].map(([num, label]) => {
          const n = num as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                if (n === 1 || (n === 2 && guideId) || (n === 3 && guideId && !isDateBlocked)) {
                  setStep(n);
                }
              }}
              className={`rounded-full py-1.5 px-2 text-[11.5px] font-semibold text-center transition-all cursor-pointer ${
                active
                  ? 'btn-cirrel-green'
                  : done
                  ? 'bg-[#D8F36A]/35 text-[var(--accent-ink)]'
                  : 'bg-[var(--card-2)] text-[var(--muted)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: SELECT LANGUAGE FIRST -> THEN CHOOSE GUIDE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <Languages className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
                Step 1 · Select Your Language First
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableLanguages.map((lang) => {
                  const active = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguagePick(lang)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        active ? 'btn-cirrel-lime' : 'cirrel-btn-ghost'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {!selectedLanguage ? (
              <div className="rounded-[18px] bg-[var(--card-2)] border border-[var(--line)] p-4 text-xs text-[var(--muted)]">
                Choose a language above to see verified storytellers who lead this journey in
                your language.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--accent-ink)]">
                  Step 2 · Choose Your {selectedLanguage}-Speaking Guide
                </label>
                <div className="space-y-2">
                  {matchingGuides.map((g) => {
                    const active = guideId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGuideId(g.id)}
                        className={`w-full rounded-[18px] p-3 border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          active
                            ? 'bg-[#344B35]/30 border-[#D8F36A]'
                            : 'bg-[var(--card-2)] border-[var(--line)] hover:bg-[var(--card-3)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={g.profilePhotoUrl}
                            alt={g.displayName}
                            className="h-10 w-10 rounded-full object-cover border border-[#B69A58]/50 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[var(--ink)] truncate">
                              {g.displayName}
                            </p>
                            <p className="text-[11px] text-[var(--muted)] flex items-center gap-2">
                              <span className="inline-flex items-center gap-0.5 text-[#B69A58] font-semibold">
                                <Star className="w-3 h-3 fill-current" /> {g.ratingAvg.toFixed(2)}
                              </span>
                              <span>·</span>
                              <span className="truncate">
                                {formatShortWindow(g.availableFrom, g.availableUntil)}
                              </span>
                            </p>
                          </div>
                        </div>
                        {active && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--accent-ink)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!guideId}
              onClick={() => setStep(2)}
              className="w-full rounded-full btn-cirrel-green py-3 text-sm font-semibold cursor-pointer disabled:opacity-45"
            >
              Next: Pick Date & Guests
            </button>
          </div>
        )}

        {/* STEP 2: FLOATING MONTHLY CALENDAR + GUEST STEPPER */}
        {step === 2 && selectedGuide && (
          <div className="space-y-4">
            <div className="rounded-[16px] bg-[var(--card-2)] border border-[var(--line)] px-3.5 py-2.5 flex items-center gap-2.5">
              <img
                src={selectedGuide.profilePhotoUrl}
                alt={selectedGuide.displayName}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--ink)] truncate">
                  {selectedGuide.displayName}
                </p>
                <p className="text-[11px] text-[var(--accent-ink)] font-semibold">
                  Language: {selectedLanguage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                Change
              </button>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
                Pick an Available Date
              </label>
              <MonthlyScheduleCalendar
                mode="popover"
                guideId={selectedGuide.id}
                guideName={selectedGuide.displayName}
                availability={availability}
                availableFrom={selectedGuide.availableFrom}
                availableUntil={selectedGuide.availableUntil}
                selectedDate={bookingDate}
                onSelectDate={setBookingDate}
              />
            </div>

            <div className="flex items-center justify-between rounded-[16px] bg-[var(--card-2)] border border-[var(--line)] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent-ink)]" />
                <div>
                  <span className="block text-xs font-bold text-[var(--ink)]">Travelers</span>
                  <span className="block text-[10.5px] text-[var(--muted)]">
                    Max {experience.maxGuests} guests
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full cirrel-btn-ghost cursor-pointer"
                  aria-label="Decrease guests"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((c) => Math.min(experience.maxGuests, c + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full btn-cirrel-green cursor-pointer"
                  aria-label="Increase guests"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Price Preview */}
            <div className="rounded-[16px] bg-[var(--card-2)] border border-[var(--line)] px-4 py-3 flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">
                {guestCount} × ${experience.priceUsd}
              </span>
              <span className="text-base font-bold text-[var(--ink)] tabular-nums">
                ${totalAmount.toFixed(2)} USD
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-full cirrel-btn-ghost py-2.5 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isDateBlocked}
                onClick={() => setStep(3)}
                className="w-2/3 rounded-full btn-cirrel-green py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-45"
              >
                Next: Traveler Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVELER DETAILS & SUMMARY */}
        {step === 3 && selectedGuide && (
          <div className="space-y-3.5">
            <div className="space-y-2.5">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your Full Name *"
                className="w-full cirrel-input px-4 py-2.5 text-sm"
              />
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email Address *"
                className="w-full cirrel-input px-4 py-2.5 text-sm"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="WhatsApp / Phone (optional)"
                className="w-full cirrel-input px-4 py-2.5 text-sm"
              />
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Dietary preferences, hotel pickup note..."
                className="w-full cirrel-input px-4 py-2.5 text-sm"
              />
            </div>

            <div className="rounded-[18px] bg-[#141914] text-[#f2f5f2] p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#D8F36A] font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Experience Summary
                </span>
                <span>{selectedGuide.displayName}</span>
              </div>
              <p className="text-white/80 font-medium">{experience.title}</p>
              <p className="text-white/65 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {bookingDate} · {selectedLanguage} ·{' '}
                {guestCount} guests
              </p>
              <div className="pt-2 mt-1 border-t border-white/15 flex items-center justify-between">
                <span className="text-white/75">Total Rate</span>
                <span className="text-lg font-bold text-[#D8F36A] tabular-nums">
                  ${totalAmount.toFixed(2)} USD
                </span>
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-ink)] shrink-0" />
              Availability is verified server-side and rates are locked on request.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-full cirrel-btn-ghost py-3 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 rounded-full btn-cirrel-green py-3 text-sm font-semibold cursor-pointer disabled:opacity-55"
              >
                {submitting ? 'Confirming...' : 'Submit Booking Request'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
