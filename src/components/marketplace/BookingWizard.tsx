'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  ShieldCheck,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { MonthlyScheduleCalendar } from '@/components/marketplace/MonthlyScheduleCalendar';
import type {
  BookingType,
  Experience,
  Guide,
  GuideAvailabilitySlot,
} from '@/types/marketplace';

interface BookingWizardProps {
  guides: Guide[];
  experiences: Experience[];
  availability: GuideAvailabilitySlot[];
  preselectedGuideId?: string;
  preselectedExperienceId?: string;
}

export function BookingWizard({
  guides,
  experiences,
  availability,
  preselectedGuideId,
  preselectedExperienceId,
}: BookingWizardProps) {
  const router = useRouter();
  const initialExp = preselectedExperienceId
    ? experiences.find((e) => e.id === preselectedExperienceId)
    : undefined;
  const initialGuide =
    guides.find((g) => g.id === (preselectedGuideId || initialExp?.primaryGuideId)) ||
    guides[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guideId, setGuideId] = useState(initialGuide?.id ?? '');
  const [bookingType, setBookingType] = useState<BookingType>(
    initialExp ? 'curated_experience' : 'curated_experience'
  );
  const [experienceId, setExperienceId] = useState(initialExp?.id ?? '');
  const [bookingDate, setBookingDate] = useState('2026-11-25');
  const [durationHours, setDurationHours] = useState(
    initialExp?.durationHours ?? 5
  );
  const [language, setLanguage] = useState(
    initialGuide?.languages[0]?.language ?? 'English'
  );

  // Sync when user selects a date from Guide Profile floating monthly calendar or chooses a guide by language
  useEffect(() => {
    const onDateSync = (ev: Event) => {
      const custom = ev as CustomEvent<{ date?: string; guideId?: string }>;
      if (custom.detail?.guideId && custom.detail.guideId !== guideId) return;
      if (custom.detail?.date) {
        setBookingDate(custom.detail.date);
        setStep(2);
      }
    };
    const onGuideLangSync = (ev: Event) => {
      const custom = ev as CustomEvent<{ guideId?: string; language?: string }>;
      if (custom.detail?.guideId) setGuideId(custom.detail.guideId);
      if (custom.detail?.language) setLanguage(custom.detail.language);
    };
    window.addEventListener('bs:select-guide-date', onDateSync);
    window.addEventListener('bs:select-guide-language', onGuideLangSync);
    return () => {
      window.removeEventListener('bs:select-guide-date', onDateSync);
      window.removeEventListener('bs:select-guide-language', onGuideLangSync);
    };
  }, [guideId]);
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedGuide = useMemo(
    () => guides.find((g) => g.id === guideId) ?? guides[0],
    [guides, guideId]
  );

  const guideExperiences = useMemo(
    () => experiences.filter((e) => e.guideIds.includes(guideId)),
    [experiences, guideId]
  );

  const selectedExp = useMemo(
    () => guideExperiences.find((e) => e.id === experienceId) ?? guideExperiences[0],
    [guideExperiences, experienceId]
  );

  const dateSlot = useMemo(
    () =>
      availability.find(
        (a) => a.guideId === guideId && a.date === bookingDate
      ),
    [availability, guideId, bookingDate]
  );

  const isOutOfRange = Boolean(
    (selectedGuide?.availableFrom && bookingDate < selectedGuide.availableFrom) ||
      (selectedGuide?.availableUntil && bookingDate > selectedGuide.availableUntil)
  );

  const isDateBlocked =
    dateSlot?.status === 'blocked' || dateSlot?.status === 'booked' || isOutOfRange;

  const priceSummary = useMemo(() => {
    if (!selectedGuide) return { unit: 0, total: 0, label: '' };
    if (bookingType === 'curated_experience' && selectedExp) {
      return {
        unit: selectedExp.priceUsd,
        total: selectedExp.priceUsd * guestCount,
        label: `${guestCount} × $${selectedExp.priceUsd} (${selectedExp.title})`,
      };
    }
    if (bookingType === 'hourly') {
      const hrs = Math.max(2, durationHours);
      return {
        unit: selectedGuide.hourlyRateUsd,
        total: selectedGuide.hourlyRateUsd * hrs,
        label: `${hrs} hrs × $${selectedGuide.hourlyRateUsd}/hr`,
      };
    }
    return {
      unit: selectedGuide.fullDayRateUsd,
      total: selectedGuide.fullDayRateUsd,
      label:
        bookingType === 'custom_itinerary'
          ? 'Custom Full-Day Itinerary Request'
          : 'Full-Day Private Guide Hire (8 hrs)',
    };
  }, [selectedGuide, bookingType, selectedExp, guestCount, durationHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (isDateBlocked) {
      setErrorMsg('This guide is unavailable on the selected date. Please pick another date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId,
          experienceId:
            bookingType === 'curated_experience' ? selectedExp?.id ?? null : null,
          bookingType,
          bookingDate,
          durationHours,
          preferredLanguage: language,
          guestCount,
          customerName,
          customerEmail,
          customerPhone,
          specialRequests,
          customItineraryNotes: customNotes,
          idempotencyKey: `web-${guideId}-${bookingDate}-${Date.now()}`,
        }),
      });
      const data = (await res.json()) as {
        booking?: { id: string };
        error?: string;
      };
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
    <div className="editorial-card p-5 sm:p-7 space-y-6">
      {/* Stepper Indicator */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-ink)]">
            Guide-First Request
          </span>
          <h3 className="font-serif-display text-2xl font-semibold text-[var(--ink)]">
            Reserve Your Storyteller
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-2 rounded-full transition-all ${
                step === n
                  ? 'w-7 bg-[#344B35]'
                  : step > n
                  ? 'w-3 bg-[#D8F36A]'
                  : 'w-2 bg-[#191A18]/15'
              }`}
            />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            {/* Step 1: Guide & Service Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                1. Selected Local Guide
              </label>
              <select
                value={guideId}
                onChange={(e) => {
                  const next = guides.find((g) => g.id === e.target.value);
                  setGuideId(e.target.value);
                  if (next?.languages[0]) setLanguage(next.languages[0].language);
                }}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm font-medium text-[var(--ink)] focus:outline-none focus:border-[#344B35]"
              >
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.displayName} — {g.locationBase} (${g.startingPriceUsd}+)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                2. Booking Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['curated_experience', 'Curated Experience'],
                    ['full_day', 'Full-Day Hire'],
                    ['hourly', 'Hourly Hire'],
                    ['custom_itinerary', 'Custom Itinerary'],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBookingType(type)}
                    className={`rounded-2xl px-3 py-2.5 text-xs font-semibold border text-left transition-all cursor-pointer ${
                      bookingType === type
                        ? 'bg-[#191A18] text-[#D8F36A] border-[#191A18]'
                        : 'bg-[var(--card-2)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--card-3)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {bookingType === 'curated_experience' && guideExperiences.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  3. Choose Experience
                </label>
                <select
                  value={selectedExp?.id ?? ''}
                  onChange={(e) => {
                    const exp = guideExperiences.find((x) => x.id === e.target.value);
                    setExperienceId(e.target.value);
                    if (exp) setDurationHours(exp.durationHours);
                  }}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm font-medium text-[var(--ink)]"
                >
                  {guideExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} (${exp.priceUsd}/guest · {exp.durationLabel})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bookingType === 'hourly' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm font-medium"
                />
              </div>
            )}

            {bookingType === 'custom_itinerary' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Describe Your Interests & Pace
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="E.g., quiet village temples, architecture sketching, traditional lunch..."
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-full btn-cirrel-green py-3.5 text-sm font-semibold cursor-pointer"
            >
              Continue to Date & Preferences
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Select Available Date (Blocked Dates Disabled)
                </label>
                <MonthlyScheduleCalendar
                  mode="popover"
                  guideId={guideId}
                  guideName={selectedGuide?.displayName}
                  availability={availability}
                  availableFrom={selectedGuide?.availableFrom}
                  availableUntil={selectedGuide?.availableUntil}
                  selectedDate={bookingDate}
                  onSelectDate={setBookingDate}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  <Users className="w-3.5 h-3.5" /> Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full cirrel-input px-4 py-3 text-sm font-medium"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="text-[#141914]">
                      {n} {n === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Availability Feedback */}
            <div
              className={`rounded-2xl px-4 py-3 text-xs flex items-center gap-2 border ${
                isDateBlocked
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#344B35]/8 border-[#344B35]/20 text-[var(--accent-ink)]'
              }`}
            >
              {isDateBlocked ? (
                <>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {dateSlot?.notes || 'Guide is unavailable on this date.'} Please select
                    another date.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {selectedGuide?.displayName} has open availability on {bookingDate}.
                  </span>
                </>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                <Languages className="w-3.5 h-3.5" /> Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm font-medium"
              >
                {(selectedGuide?.languages ?? [{ language: 'English', proficiency: 'Fluent' }]).map(
                  (l) => (
                    <option key={l.language} value={l.language}>
                      {l.language} ({l.proficiency})
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-full border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--card-3)] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isDateBlocked}
                onClick={() => setStep(3)}
                className="w-2/3 rounded-full bg-[#344B35] hover:bg-[#191A18] disabled:opacity-40 text-[#F7F5EF] py-3 text-sm font-semibold transition-colors cursor-pointer"
              >
                Continue to Traveler Details
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name *"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email Address *"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="WhatsApp / Phone (optional)"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Dietary notes, pickup hotel, mobility preferences..."
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
            </div>

            {/* Summary Snapshot Box */}
            <div className="rounded-2xl bg-[#191A18] text-[#F7F5EF] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#D8F36A] font-medium">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Booking Summary
                </span>
                <span>Pending Guide Confirmation</span>
              </div>
              <p className="text-xs text-white/75">{priceSummary.label}</p>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {bookingDate} · {language}
                </span>
                <span>{guestCount} guests</span>
              </div>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-white/75">Total Protected Rate</span>
                <span className="text-xl font-bold text-[#D8F36A] tabular-nums">
                  ${priceSummary.total.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-ink)] shrink-0" />
              <span>
                Sandbox test checkout enabled. Guide availability is checked server-side and
                price snapshots are locked upon request.
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-full border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--card-3)] cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 rounded-full btn-cirrel-green py-3.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Verifying Availability...' : 'Submit Booking Request'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
