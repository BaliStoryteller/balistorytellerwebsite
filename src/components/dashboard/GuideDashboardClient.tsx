'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Globe2,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  Star,
  User,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { BaliStorytellerLogo } from '@/components/brand/BaliStorytellerLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { GuideIntroVideoCard } from '@/components/marketplace/GuideIntroVideoCard';
import { MonthlyScheduleCalendar } from '@/components/marketplace/MonthlyScheduleCalendar';
import { extractYouTubeVideoId } from '@/lib/youtube';
import type {
  AvailabilityStatus,
  Booking,
  Experience,
  Guide,
  GuideAvailabilitySlot,
  NotificationItem,
  Payout,
  Review,
  SessionUser,
} from '@/types/marketplace';

export type GuideTab =
  | 'overview'
  | 'bookings'
  | 'requests'
  | 'experiences'
  | 'availability'
  | 'profile'
  | 'earnings'
  | 'payouts'
  | 'reviews'
  | 'notifications'
  | 'settings';

const GUIDE_NAV: { id: GuideTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'requests', label: 'Booking Requests', icon: Inbox },
  { id: 'experiences', label: 'My Experiences', icon: Award },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'payouts', label: 'Payout History', icon: Wallet },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface GuideDashboardClientProps {
  session: SessionUser;
  initialData: {
    guide: Guide;
    bookings: Booking[];
    experiences: Experience[];
    availability: GuideAvailabilitySlot[];
    payouts: Payout[];
    reviews: Review[];
    notifications: NotificationItem[];
  };
}

export function GuideDashboardClient({
  session,
  initialData,
}: GuideDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [guide, setGuide] = useState(initialData.guide);
  const [bookings, setBookings] = useState(initialData.bookings);
  const [experiences, setExperiences] = useState(initialData.experiences);
  const [availability, setAvailability] = useState(initialData.availability);

  // Availability quick form
  const [selectedDate, setSelectedDate] = useState('2026-11-29');
  const [slotStatus, setSlotStatus] = useState<AvailabilityStatus>('blocked');
  const [slotNotes, setSlotNotes] = useState('Personal / Village Ceremony');

  // Proposal form
  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState<Experience['category']>('Cultural Heritage');
  const [propDuration, setPropDuration] = useState('4');
  const [propPrice, setPropPrice] = useState('115');
  const [propSummary, setPropSummary] = useState('');

  // Editable permitted profile fields
  const [headline, setHeadline] = useState(guide.headline);
  const [biography, setBiography] = useState(guide.biography);
  const [personalStory, setPersonalStory] = useState(guide.personalStory);
  const [locationBase, setLocationBase] = useState(guide.locationBase);
  const [introVideoUrl, setIntroVideoUrl] = useState(guide.introVideoUrl ?? '');
  const [availableFrom, setAvailableFrom] = useState(guide.availableFrom ?? '2026-11-20');
  const [availableUntil, setAvailableUntil] = useState(guide.availableUntil ?? '2027-02-28');

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshGuideData = async () => {
    const res = await fetch('/api/guide');
    if (!res.ok) return;
    const data = await res.json();
    if (data.guide) setGuide(data.guide);
    setBookings(data.bookings);
    setExperiences(data.experiences);
    setAvailability(data.availability);
  };

  const pendingRequests = useMemo(
    () => bookings.filter((b) => b.status === 'pending'),
    [bookings]
  );
  const upcomingConfirmed = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed'),
    [bookings]
  );
  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed'),
    [bookings]
  );
  const expMap = useMemo(
    () => new Map(experiences.map((e) => [e.id, e])),
    [experiences]
  );

  const financialSummary = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'refunded');
    const gross = active.reduce((s, b) => s + b.subtotalSnapshot, 0);
    const commission = active.reduce((s, b) => s + b.commissionAmountSnapshot, 0);
    const net = active.reduce((s, b) => s + b.guideEarningsSnapshot, 0);
    const paid = initialData.payouts
      .filter((p) => p.status === 'completed')
      .reduce((s, p) => s + p.amountUsd, 0);
    const pendingPayout = Math.max(0, net - paid);
    return { gross, commission, net, paid, pendingPayout };
  }, [bookings, initialData.payouts]);

  const handleBookingDecision = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        reason: status === 'confirmed' ? 'Accepted by Guide' : 'Declined by Guide',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notify(data.error || 'Could not update booking.');
      return;
    }
    await refreshGuideData();
    notify(status === 'confirmed' ? 'Booking confirmed!' : 'Booking request declined.');
  };

  const handleSetAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/guide', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_availability',
        payload: { date: selectedDate, status: slotStatus, notes: slotNotes },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notify(data.error || 'Cannot update date.');
      return;
    }
    await refreshGuideData();
    notify(`Updated ${selectedDate} as ${slotStatus}.`);
  };

  const handleProposeExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/guide', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'propose_experience',
        payload: {
          title: propTitle,
          category: propCategory,
          durationHours: Number(propDuration),
          priceUsd: Number(propPrice),
          shortSummary: propSummary,
        },
      }),
    });
    if (!res.ok) {
      notify('Could not submit proposal.');
      return;
    }
    setPropTitle('');
    setPropSummary('');
    await refreshGuideData();
    notify('Experience submitted! It stays unpublished until Admin approval.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (introVideoUrl.trim() && !extractYouTubeVideoId(introVideoUrl)) {
      notify('Please enter a valid YouTube video URL (youtube.com/watch?v= or youtu.be/).');
      return;
    }
    const res = await fetch('/api/guide', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_profile',
        payload: {
          headline,
          biography,
          personalStory,
          locationBase,
          introVideoUrl,
          availableFrom,
          availableUntil,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notify(data.error || 'Could not save profile details.');
      return;
    }
    await refreshGuideData();
    notify('Guide profile & introduction video saved.');
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/auth/sign-in';
  };

  return (
    <div className="min-h-screen text-[var(--ink)] flex">
      {/* Desktop Floating Glass Sidebar (Cirrel-inspired, Green Active Pill) */}
      <aside
        className={`hidden lg:flex flex-col justify-between glass-surface rounded-[26px] m-4 mr-0 sticky top-4 h-[calc(100vh-32px)] shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[80px]' : 'w-[250px]'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between px-1">
            {!sidebarCollapsed && (
              <Link href="/">
                <BaliStorytellerLogo variant="auto" compact />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/60 ml-auto cursor-pointer"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          <nav className="space-y-1">
            {GUIDE_NAV.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'btn-cirrel-green text-[#F7F5EF]'
                      : 'text-[var(--ink-2)] hover:bg-white/60'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D8F36A]' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === 'requests' && pendingRequests.length > 0 && (
                        <span className="rounded-full bg-[#D8F36A] text-[#141914] px-2 py-0.5 text-[10px] font-bold">
                          {pendingRequests.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[var(--line)] space-y-2">
          {!sidebarCollapsed && (
            <Link
              href={`/guides/${guide.slug}`}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] py-2 text-xs font-semibold hover:bg-[var(--card-3)]"
            >
              <Globe2 className="w-3.5 h-3.5" /> Public Profile
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--card-3)] hover:bg-[#191A18] hover:text-[#F7F5EF] py-2 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Floating Glass Mobile-First Top Header ONLY (No bottom nav!) */}
        <header className="sticky top-4 z-30 mx-4 sm:mx-6 mt-4 rounded-[22px] glass-surface px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open guide menu"
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[#191A18] text-[#F7F5EF]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
                Guide Workspace
              </p>
              <h1 className="font-serif-display text-xl sm:text-2xl font-semibold text-[var(--ink)]">
                {GUIDE_NAV.find((n) => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className="rounded-full btn-cirrel-lime px-3.5 py-2 text-xs font-bold cursor-pointer"
            >
              {pendingRequests.length} Requests
            </button>
            <img
              src={guide.profilePhotoUrl}
              alt={guide.displayName}
              className="h-9 w-9 rounded-full object-cover border border-white/20"
            />
          </div>
        </header>

        {toastMsg && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-2xl bg-[#191A18] text-[#D8F36A] px-4 py-3 text-xs font-semibold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button type="button" onClick={() => setToastMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="p-4 sm:p-6 space-y-6 max-w-5xl w-full mx-auto">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {[
                  { label: 'Upcoming Tours', value: String(upcomingConfirmed.length), accent: true },
                  { label: 'Pending Requests', value: String(pendingRequests.length) },
                  { label: 'Completed Tours', value: String(guide.completedToursCount + completedBookings.length) },
                  { label: 'Net Earnings', value: `$${financialSummary.net.toFixed(0)}` },
                  { label: 'Average Rating', value: `${guide.ratingAvg.toFixed(2)} ★` },
                  { label: 'Total Reviews', value: String(guide.reviewCount) },
                ].map((k) => (
                  <div
                    key={k.label}
                    className={`rounded-[20px] p-4 transition-all ${
                      k.accent
                        ? 'btn-cirrel-green text-[#F7F5EF]'
                        : 'cirrel-card'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${k.accent ? 'text-[#D8F36A]' : 'text-[var(--muted)]'}`}>
                      {k.label}
                    </span>
                    <p className="text-2xl sm:text-3xl font-bold mt-1.5 tabular-nums">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Next Scheduled Experience */}
              {upcomingConfirmed[0] && (
                <div className="rounded-[24px] bg-[#191A18] text-[#F7F5EF] p-6 space-y-3">
                  <span className="inline-block rounded-full bg-[#D8F36A] text-[#141914] px-3 py-1 text-[11px] font-bold uppercase">
                    Next Scheduled Experience
                  </span>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-medium">
                    {upcomingConfirmed[0].experienceId
                      ? expMap.get(upcomingConfirmed[0].experienceId)?.title
                      : 'Private Cultural Guiding'}
                  </h2>
                  <p className="text-xs text-white/75">
                    {upcomingConfirmed[0].bookingDate} at {upcomingConfirmed[0].startTime} ·{' '}
                    {upcomingConfirmed[0].customerName} ({upcomingConfirmed[0].guestCount} guests ·{' '}
                    {upcomingConfirmed[0].preferredLanguage})
                  </p>
                </div>
              )}

              {/* Quick Intro Video Status Card */}
              <div className="cirrel-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-ink)]">
                    Introduction Video
                  </p>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {guide.introVideoUrl
                      ? 'Your YouTube introduction video is live on your public profile.'
                      : 'Add a YouTube introduction video so travelers can meet you first.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="rounded-full btn-cirrel-green px-4 py-2 text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  {guide.introVideoUrl ? 'Update YouTube Link' : 'Add YouTube Video'}
                </button>
              </div>
            </div>
          )}

          {/* 2. MY BOOKINGS & 3. BOOKING REQUESTS */}
          {(activeTab === 'bookings' || activeTab === 'requests') && (
            <div className="space-y-4">
              {(activeTab === 'requests' ? pendingRequests : bookings).map((bk) => (
                <div key={bk.id} className="editorial-card p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--accent-ink)] tabular-nums">
                      {bk.bookingReference}
                    </span>
                    <span className="rounded-full bg-[var(--card-3)] px-3 py-1 text-[11px] font-bold uppercase">
                      {bk.status}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-2xl font-semibold">
                    {bk.experienceId
                      ? expMap.get(bk.experienceId)?.title
                      : `${bk.bookingType.replace('_', ' ')} Request`}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[var(--muted)]">
                    <span>Date: <strong className="text-[var(--ink)]">{bk.bookingDate}</strong></span>
                    <span>Guests: <strong className="text-[var(--ink)]">{bk.guestCount}</strong></span>
                    <span>Language: <strong className="text-[var(--ink)]">{bk.preferredLanguage}</strong></span>
                    <span>Your Net: <strong className="text-[var(--accent-ink)]">${bk.guideEarningsSnapshot.toFixed(2)}</strong></span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)]">
                    Guest: <strong>{bk.customerName}</strong> {bk.specialRequests ? `· Note: ${bk.specialRequests}` : ''}
                  </p>

                  {bk.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleBookingDecision(bk.id, 'confirmed')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] text-[#D8F36A] px-5 py-2.5 text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Booking
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingDecision(bk.id, 'cancelled')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 text-red-800 px-5 py-2.5 text-xs font-semibold cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {activeTab === 'requests' && pendingRequests.length === 0 && (
                <div className="editorial-card p-8 text-center text-sm text-[var(--muted)]">
                  All booking requests have been reviewed.
                </div>
              )}
            </div>
          )}

          {/* 4. MY EXPERIENCES & PROPOSALS */}
          {activeTab === 'experiences' && (
            <div className="space-y-6">
              <form onSubmit={handleProposeExperience} className="editorial-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--accent-ink)]" />
                  <h2 className="font-serif-display text-2xl font-medium">
                    Propose a New Cultural Experience
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Proposals remain unpublished until reviewed and approved by Platform Admins.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder="Experience Title"
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  />
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value as Experience['category'])}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  >
                    <option>Cultural Heritage</option>
                    <option>Temple Exploration</option>
                    <option>Traditional Villages</option>
                    <option>Rice Terraces</option>
                    <option>Nature and Waterfalls</option>
                    <option>Balinese Food and Traditions</option>
                    <option>Spiritual and Cultural Experiences</option>
                  </select>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={propDuration}
                    onChange={(e) => setPropDuration(e.target.value)}
                    placeholder="Duration (hours)"
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  />
                  <input
                    type="number"
                    min={45}
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    placeholder="Price per guest (USD)"
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={propSummary}
                  onChange={(e) => setPropSummary(e.target.value)}
                  placeholder="Describe the cultural story, route, and village partners..."
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#344B35] text-[#F7F5EF] px-6 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Submit Proposal for Admin Approval
                </button>
              </form>

              <div className="space-y-3">
                {experiences.map((e) => (
                  <div key={e.id} className="editorial-card p-5 flex items-center justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-[var(--card-3)] px-2.5 py-0.5 text-[10px] font-bold uppercase">
                        {e.status.replace('_', ' ')}
                      </span>
                      <h3 className="font-serif-display text-xl font-semibold mt-1">{e.title}</h3>
                      <p className="text-xs text-[var(--muted)]">
                        {e.category} · {e.durationLabel} · ${e.priceUsd}/guest
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE FLOATING MONTHLY AVAILABILITY CALENDAR */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <MonthlyScheduleCalendar
                mode="card"
                guideId={guide.id}
                guideName={guide.displayName}
                availability={availability}
                availableFrom={availableFrom}
                availableUntil={availableUntil}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                allowBlockedSelection
              />

              <form onSubmit={handleSetAvailability} className="editorial-card p-6 space-y-4">
                <h3 className="font-serif-display text-xl font-medium">
                  Update Availability for {selectedDate}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                  />
                  <select
                    value={slotStatus}
                    onChange={(e) => setSlotStatus(e.target.value as AvailabilityStatus)}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="blocked">Block Date</option>
                  </select>
                  <input
                    type="text"
                    value={slotNotes}
                    onChange={(e) => setSlotNotes(e.target.value)}
                    placeholder="Note (e.g. Temple Ceremony)"
                    className="rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[#191A18] text-[#D8F36A] px-6 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Save Schedule Slot
                </button>
              </form>
            </div>
          )}

          {/* 6. MY PROFILE (Verification remains Admin-Controlled) */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="editorial-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div>
                  <h2 className="font-serif-display text-2xl font-medium">{guide.displayName}</h2>
                  <p className="text-xs text-[var(--muted)]">License: {guide.licenseNumber}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#344B35] text-[#D8F36A] px-3 py-1 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verification Admin-Controlled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Base Region
                  </label>
                  <input
                    type="text"
                    value={locationBase}
                    onChange={(e) => setLocationBase(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full cirrel-input px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Available Until
                  </label>
                  <input
                    type="date"
                    value={availableUntil}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                    className="w-full cirrel-input px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Introduction Video (YouTube Link)
                  </label>
                  {introVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setIntroVideoUrl('')}
                      className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      Clear link
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full cirrel-input px-4 py-2.5 text-sm"
                />
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Displayed first as a landscape video card on your public profile so travelers can
                  meet you before booking.
                </p>
                {introVideoUrl.trim() && !extractYouTubeVideoId(introVideoUrl) && (
                  <p className="text-[11px] text-red-400 mt-1">
                    Enter a valid YouTube link (e.g. youtube.com/watch?v=..., youtu.be/..., or
                    youtube.com/shorts/...).
                  </p>
                )}
              </div>

              {extractYouTubeVideoId(introVideoUrl) && (
                <div className="pt-1">
                  <GuideIntroVideoCard
                    guideName={guide.displayName}
                    introVideoUrl={introVideoUrl}
                    compact
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Personal Story Quote
                </label>
                <textarea
                  rows={2}
                  value={personalStory}
                  onChange={(e) => setPersonalStory(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Biography
                </label>
                <textarea
                  rows={4}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded-full btn-cirrel-green px-6 py-3 text-xs font-semibold cursor-pointer"
              >
                Save Permitted Profile Details
              </button>
            </form>
          )}

          {/* 7. EARNINGS (READ-ONLY) */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#191A18] text-[#F7F5EF] p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs text-[#D8F36A] font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Read-Only Financial Ledger
                  </span>
                  <p className="text-xs text-white/75 mt-1">
                    All figures reflect immutable purchase-time snapshots. Only Platform Admins
                    can adjust commissions or settle payouts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  ['Gross Earnings', `$${financialSummary.gross.toFixed(2)}`],
                  ['Platform Fee', `$${financialSummary.commission.toFixed(2)}`],
                  ['Net Guide Earnings', `$${financialSummary.net.toFixed(2)}`],
                  ['Paid Out', `$${financialSummary.paid.toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label} className="editorial-card p-4">
                    <span className="text-[11px] text-[var(--muted)] uppercase font-semibold">{label}</span>
                    <p className="text-xl font-bold tabular-nums mt-1">{val}</p>
                  </div>
                ))}
              </div>

              <div className="editorial-card p-5 space-y-3">
                <h3 className="font-serif-display text-2xl font-medium">
                  Per-Booking Calculation Breakdown
                </h3>
                <div className="divide-y divide-[var(--line)] text-xs">
                  {bookings.map((b) => (
                    <div key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{b.bookingReference} · {b.bookingDate}</p>
                        <p className="text-[var(--muted)]">
                          Gross ${b.subtotalSnapshot.toFixed(2)} − {(b.commissionRateSnapshot * 100).toFixed(0)}% platform fee (${b.commissionAmountSnapshot.toFixed(2)})
                        </p>
                      </div>
                      <span className="text-base font-bold text-[var(--accent-ink)] tabular-nums">
                        +${b.guideEarningsSnapshot.toFixed(2)} net
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. PAYOUT HISTORY */}
          {activeTab === 'payouts' && (
            <div className="space-y-3">
              {initialData.payouts.map((p) => (
                <div key={p.id} className="editorial-card p-5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg tabular-nums">${p.amountUsd.toFixed(2)} USD</p>
                    <p className="text-xs text-[var(--muted)]">
                      {p.bankName} (••••{p.accountLast4}) · Ref: {p.paymentReference || 'Pending'}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#D8F36A]/45 px-3 py-1 text-xs font-bold uppercase">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 9. REVIEWS, 10. NOTIFICATIONS, 11. SETTINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {initialData.reviews.map((r) => (
                <div key={r.id} className="editorial-card p-5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{r.authorName} · {r.authorOrigin}</span>
                    <span className="text-[#B69A58]">{r.rating}.0 ★</span>
                  </div>
                  <p className="text-sm text-[var(--ink-2)] mt-2">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              {initialData.notifications.map((n) => (
                <div key={n.id} className="editorial-card p-5">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="editorial-card p-6 space-y-3 text-sm">
              <h2 className="font-serif-display text-2xl font-medium">Guide Workspace Settings</h2>
              <p className="text-xs text-[var(--muted)]">
                Signed in as {session.fullName} ({session.email}). Payout bank preferences and
                verification documents are managed alongside Platform Curators.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Guide Slide-In Drawer (No bottom navigation!) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#191A18]/50 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="absolute left-2.5 top-2.5 bottom-2.5 w-[82%] max-w-xs rounded-[26px] cirrel-glass text-[var(--ink)] p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                <BaliStorytellerLogo variant="auto" compact />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#191A18] text-[#F7F5EF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {GUIDE_NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium ${
                      activeTab === item.id
                        ? 'bg-[#344B35] text-[#D8F36A]'
                        : 'text-[var(--ink)] hover:bg-[var(--card-3)]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-full bg-[#191A18] text-[#F7F5EF] py-2.5 text-xs font-semibold"
            >
              Sign Out
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
