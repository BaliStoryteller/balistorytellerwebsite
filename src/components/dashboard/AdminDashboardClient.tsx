'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Compass,
  CreditCard,
  DollarSign,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BaliStorytellerLogo } from '@/components/brand/BaliStorytellerLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type {
  AuditLog,
  Booking,
  BookingStatus,
  Destination,
  Experience,
  ExperienceStatus,
  Guide,
  GuideApprovalStatus,
  NotificationItem,
  Payout,
  PayoutStatus,
  Review,
  SessionUser,
} from '@/types/marketplace';

export type AdminTab =
  | 'overview'
  | 'bookings'
  | 'guides'
  | 'verification'
  | 'experiences'
  | 'destinations'
  | 'customers'
  | 'reviews'
  | 'payments'
  | 'commissions'
  | 'payouts'
  | 'analytics'
  | 'messages'
  | 'settings';

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'guides', label: 'Guides', icon: Compass },
  { id: 'verification', label: 'Guide Verification', icon: ShieldCheck },
  { id: 'experiences', label: 'Experiences', icon: Award },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'payouts', label: 'Payouts', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings & Audit', icon: Settings },
];

interface AdminDashboardClientProps {
  session: SessionUser;
  initialState: {
    defaultCommissionRate: number;
    guides: Guide[];
    experiences: Experience[];
    destinations: Destination[];
    bookings: Booking[];
    payouts: Payout[];
    reviews: Review[];
    auditLogs: AuditLog[];
    notifications: NotificationItem[];
  };
}

export function AdminDashboardClient({
  session,
  initialState,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Stateful data synced with /api/admin
  const [guides, setGuides] = useState(initialState.guides);
  const [experiences, setExperiences] = useState(initialState.experiences);
  const [bookings, setBookings] = useState(initialState.bookings);
  const [payouts, setPayouts] = useState(initialState.payouts);
  const [auditLogs, setAuditLogs] = useState(initialState.auditLogs);
  const [commissionRate, setCommissionRate] = useState(initialState.defaultCommissionRate);
  const [rateDraft, setRateDraft] = useState(String(Math.round(initialState.defaultCommissionRate * 100)));

  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [payoutRefInput, setPayoutRefInput] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const guideMap = useMemo(() => new Map(guides.map((g) => [g.id, g])), [guides]);
  const expMap = useMemo(() => new Map(experiences.map((e) => [e.id, e])), [experiences]);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshAdminData = async () => {
    const res = await fetch('/api/admin');
    if (!res.ok) return;
    const data = await res.json();
    setGuides(data.guides);
    setExperiences(data.experiences);
    setBookings(data.bookings);
    setPayouts(data.payouts);
    setAuditLogs(data.auditLogs);
    setCommissionRate(data.defaultCommissionRate);
  };

  const runAdminMutation = async (payload: Record<string, unknown>, successText: string) => {
    const res = await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      notify(data.error || 'Action could not be completed.');
      return;
    }
    await refreshAdminData();
    notify(successText);
  };

  // Financial & Booking KPIs
  const metrics = useMemo(() => {
    const totalBookings = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled' || b.status === 'refunded').length;

    const activeRevenueBookings = bookings.filter(
      (b) => b.status !== 'cancelled' && b.status !== 'refunded'
    );
    const grossRevenue = activeRevenueBookings.reduce((s, b) => s + b.subtotalSnapshot, 0);
    const platformCommission = activeRevenueBookings.reduce(
      (s, b) => s + b.commissionAmountSnapshot,
      0
    );
    const guideEarnings = activeRevenueBookings.reduce(
      (s, b) => s + b.guideEarningsSnapshot,
      0
    );
    const pendingPayoutsTotal = payouts
      .filter((p) => p.status === 'requested' || p.status === 'approved')
      .reduce((s, p) => s + p.amountUsd, 0);

    return {
      totalBookings,
      pending,
      confirmed,
      completed,
      cancelled,
      grossRevenue,
      platformCommission,
      guideEarnings,
      pendingPayoutsTotal,
    };
  }, [bookings, payouts]);

  const chartMonthlyRevenue = useMemo(
    () => [
      { month: 'Jul', gross: 1420, commission: 255, bookings: 7 },
      { month: 'Aug', gross: 1890, commission: 340, bookings: 9 },
      { month: 'Sep', gross: 2150, commission: 387, bookings: 11 },
      { month: 'Oct', gross: 2680, commission: 482, bookings: 14 },
      {
        month: 'Nov',
        gross: Math.round(metrics.grossRevenue),
        commission: Math.round(metrics.platformCommission),
        bookings: metrics.totalBookings,
      },
    ],
    [metrics]
  );

  const chartTopGuides = useMemo(() => {
    return guides
      .filter((g) => g.approvalStatus === 'approved')
      .map((g) => {
        const guideBookings = bookings.filter(
          (b) => b.guideId === g.id && b.status !== 'cancelled'
        );
        return {
          name: g.displayName.split(' ').slice(-1)[0],
          revenue: Math.round(guideBookings.reduce((s, b) => s + b.subtotalSnapshot, 0)),
          tours: guideBookings.length,
        };
      });
  }, [guides, bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const g = guideMap.get(b.guideId);
        const match =
          b.bookingReference.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          (g?.displayName.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [bookings, bookingStatusFilter, globalSearch, guideMap]);

  const pendingGuidesCount = guides.filter((g) => g.approvalStatus === 'pending_review').length;
  const pendingExpCount = experiences.filter((e) => e.status === 'pending_approval').length;

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/auth/sign-in';
  };

  return (
    <div className="min-h-screen text-[var(--ink)] flex">
      {/* Desktop Floating Glass Sidebar (Cirrel-inspired Liquid Glass Rail, Green Active Pill) */}
      <aside
        className={`hidden lg:flex flex-col justify-between glass-surface rounded-[26px] m-4 mr-0 transition-all duration-300 sticky top-4 h-[calc(100vh-32px)] shrink-0 ${
          sidebarCollapsed ? 'w-[82px]' : 'w-[258px]'
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
              aria-label="Toggle sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/60 text-[var(--ink)] cursor-pointer ml-auto"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              const badge =
                item.id === 'verification' && pendingGuidesCount > 0
                  ? pendingGuidesCount
                  : item.id === 'experiences' && pendingExpCount > 0
                  ? pendingExpCount
                  : null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'btn-cirrel-green text-[#F7F5EF]'
                      : 'text-[var(--ink-2)] hover:bg-white/60 hover:text-[var(--ink)]'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D8F36A]' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {badge && (
                        <span className="rounded-full bg-[#B69A58] text-white px-2 py-0.5 text-[10px] font-bold">
                          {badge}
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
              href="/"
              className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] py-2 text-xs font-semibold hover:bg-[var(--card-3)]"
            >
              <Globe2 className="w-3.5 h-3.5" /> Public Marketplace
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--card-3)] hover:bg-[#191A18] hover:text-[#F7F5EF] py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Floating Glass Top Header ONLY (No bottom nav!) */}
        <header className="sticky top-4 z-30 mx-4 sm:mx-7 mt-4 rounded-[22px] glass-surface px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open admin navigation"
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[#191A18] text-[#F7F5EF]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
                Admin Curator Console
              </p>
              <h1 className="font-serif-display text-xl sm:text-2xl font-semibold text-[var(--ink)]">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full cirrel-input px-3.5 py-2 w-60">
              <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search booking, guide, guest..."
                className="w-full bg-transparent text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              />
            </div>

            <ThemeToggle compact />

            {session.isDemoSession && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-[#344B35] px-3 py-1 text-[11px] font-semibold text-[#D8F36A]">
                Sandbox
              </span>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className="flex h-9 w-9 items-center justify-center rounded-[12px] cirrel-btn-ghost cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#D8F36A]" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-[20px] cirrel-glass p-4 space-y-2.5 z-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-ink)]">
                    Platform Notifications
                  </p>
                  {initialState.notifications.map((n) => (
                    <div key={n.id} className="rounded-xl bg-[var(--card-2)] p-2.5 text-xs">
                      <p className="font-semibold text-[var(--ink)]">{n.title}</p>
                      <p className="text-[var(--muted)] mt-0.5">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full cirrel-btn-ghost pl-1.5 pr-3 py-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full btn-cirrel-green text-xs font-bold text-[#D8F36A]">
                SD
              </span>
              <span className="text-xs font-semibold">{session.fullName.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {toastMsg && (
          <div className="mx-4 sm:mx-7 mt-4 rounded-2xl bg-[#191A18] text-[#D8F36A] px-4 py-3 text-xs font-semibold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button type="button" onClick={() => setToastMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Workspace */}
        <main className="p-4 sm:p-7 space-y-6 max-w-[1440px] w-full mx-auto">
          {/* 1. OVERVIEW & 12. ANALYTICS */}
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {[
                  { label: 'Gross Revenue', value: `$${metrics.grossRevenue.toFixed(0)}`, sub: 'Active bookings', icon: DollarSign, highlight: true },
                  { label: 'Platform Commission', value: `$${metrics.platformCommission.toFixed(0)}`, sub: `${Math.round(commissionRate * 100)}% dynamic rate`, icon: Percent },
                  { label: 'Guide Net Earnings', value: `$${metrics.guideEarnings.toFixed(0)}`, sub: 'Allocated to guides', icon: Award },
                  { label: 'Pending Payouts', value: `$${metrics.pendingPayoutsTotal.toFixed(0)}`, sub: `${payouts.filter((p) => p.status !== 'completed').length} requests`, icon: Wallet },
                  { label: 'Total Bookings', value: String(metrics.totalBookings), sub: `${metrics.pending} pending · ${metrics.confirmed} confirmed`, icon: Activity },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`rounded-[22px] p-4 transition-all ${
                      kpi.highlight
                        ? 'btn-cirrel-green text-[#F7F5EF]'
                        : 'cirrel-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          kpi.highlight ? 'text-[#D8F36A]' : 'text-[var(--muted)]'
                        }`}
                      >
                        {kpi.label}
                      </span>
                      <kpi.icon
                        className={`w-4 h-4 ${
                          kpi.highlight ? 'text-[#D8F36A]' : 'text-[var(--accent-ink)]'
                        }`}
                      />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 tabular-nums">{kpi.value}</p>
                    <p
                      className={`text-xs mt-1 ${
                        kpi.highlight ? 'text-white/75' : 'text-[var(--muted)]'
                      }`}
                    >
                      {kpi.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status Breakdown Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Pending Confirmation', metrics.pending, 'bg-amber-500/15 text-amber-500 border-amber-500/25'],
                  ['Confirmed Journeys', metrics.confirmed, 'bg-[#344B35] text-[#D8F36A] border-[#344B35]'],
                  ['Completed Tours', metrics.completed, 'cirrel-card text-[var(--accent-ink)] border-[var(--line)]'],
                  ['Cancelled / Refunded', metrics.cancelled, 'bg-red-500/15 text-red-500 border-red-500/25'],
                ].map(([label, val, cls]) => (
                  <div key={String(label)} className={`rounded-2xl border p-4 ${cls}`}>
                    <span className="text-xs font-medium">{label}</span>
                    <p className="text-xl font-bold tabular-nums mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Recharts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 editorial-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif-display text-2xl font-medium">
                        Revenue & Commission Trend
                      </h2>
                      <p className="text-xs text-[var(--muted)]">
                        Monthly gross marketplace volume vs platform commission (USD)
                      </p>
                    </div>
                  </div>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartMonthlyRevenue}>
                        <defs>
                          <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#344B35" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#344B35" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#191A1812" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="gross"
                          name="Gross Revenue ($)"
                          stroke="#344B35"
                          strokeWidth={2.5}
                          fill="url(#grossFill)"
                        />
                        <Area
                          type="monotone"
                          dataKey="commission"
                          name="Commission ($)"
                          stroke="#B69A58"
                          strokeWidth={2}
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 editorial-card p-6 space-y-4">
                  <div>
                    <h2 className="font-serif-display text-2xl font-medium">
                      Top-Performing Guides
                    </h2>
                    <p className="text-xs text-[var(--muted)]">
                      Active gross booking revenue by verified storyteller
                    </p>
                  </div>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartTopGuides}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#191A1812" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar
                          dataKey="revenue"
                          name="Revenue ($)"
                          fill="#344B35"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="editorial-card p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif-display text-2xl font-medium">
                  Marketplace Bookings ({filteredBookings.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'refunded'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setBookingStatusFilter(st)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                          bookingStatusFilter === st
                            ? 'bg-[#191A18] text-[#D8F36A]'
                            : 'bg-[var(--card-2)] text-[var(--ink-2)]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Mobile Stacked Cards (No horizontal swipe) */}
              <div className="space-y-3 md:hidden">
                {filteredBookings.map((bk) => {
                  const g = guideMap.get(bk.guideId);
                  const exp = bk.experienceId ? expMap.get(bk.experienceId) : null;
                  return (
                    <div key={bk.id} className="rounded-2xl bg-[var(--card-2)] border border-[var(--line)] p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold tabular-nums text-[var(--accent-ink)]">
                          {bk.bookingReference}
                        </span>
                        <span className="rounded-full bg-[var(--card-3)] px-2.5 py-0.5 text-[10px] font-semibold uppercase">
                          {bk.status}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-[var(--ink)]">
                        {exp ? exp.title : bk.bookingType.replace('_', ' ')}
                      </p>
                      <p className="text-[var(--muted)]">
                        {bk.customerName} ({bk.guestCount} guests) · {g?.displayName} · {bk.bookingDate}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                        <span className="font-bold tabular-nums">
                          ${bk.subtotalSnapshot.toFixed(2)}{' '}
                          <span className="font-normal text-[var(--muted)]">
                            (Net ${bk.guideEarningsSnapshot.toFixed(2)})
                          </span>
                        </span>
                        <select
                          value={bk.status}
                          onChange={(e) =>
                            runAdminMutation(
                              {
                                action: 'booking_status',
                                id: bk.id,
                                status: e.target.value as BookingStatus,
                                reason: 'Admin manual status update',
                              },
                              `Booking ${bk.bookingReference} updated to ${e.target.value}`
                            )
                          }
                          className="cirrel-input px-2.5 py-1 text-xs font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase tracking-wider">
                      <th className="py-3 pr-4">Ref</th>
                      <th className="py-3 pr-4">Customer</th>
                      <th className="py-3 pr-4">Guide</th>
                      <th className="py-3 pr-4">Experience / Type</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Total</th>
                      <th className="py-3 pr-4">Comm.</th>
                      <th className="py-3 pr-4">Guide Net</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Manual Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {filteredBookings.map((bk) => {
                      const g = guideMap.get(bk.guideId);
                      const exp = bk.experienceId ? expMap.get(bk.experienceId) : null;
                      return (
                        <tr key={bk.id} className="hover:bg-[var(--card-2)]/60">
                          <td className="py-3.5 pr-4 font-semibold tabular-nums">
                            {bk.bookingReference}
                          </td>
                          <td className="py-3.5 pr-4">
                            <p className="font-medium text-[var(--ink)]">{bk.customerName}</p>
                            <p className="text-[11px] text-[var(--muted)]">{bk.guestCount} guests</p>
                          </td>
                          <td className="py-3.5 pr-4 font-medium">{g?.displayName}</td>
                          <td className="py-3.5 pr-4 max-w-[180px] truncate">
                            {exp ? exp.title : bk.bookingType.replace('_', ' ')}
                          </td>
                          <td className="py-3.5 pr-4 tabular-nums">{bk.bookingDate}</td>
                          <td className="py-3.5 pr-4 font-semibold tabular-nums">
                            ${bk.subtotalSnapshot.toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-4 tabular-nums text-[#B69A58] font-medium">
                            ${bk.commissionAmountSnapshot.toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-4 tabular-nums text-[var(--accent-ink)] font-semibold">
                            ${bk.guideEarningsSnapshot.toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="rounded-full bg-[var(--card-3)] px-2.5 py-1 text-[11px] font-semibold uppercase">
                              {bk.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <select
                              value={bk.status}
                              onChange={(e) =>
                                runAdminMutation(
                                  {
                                    action: 'booking_status',
                                    id: bk.id,
                                    status: e.target.value as BookingStatus,
                                    reason: 'Admin manual status update',
                                  },
                                  `Booking ${bk.bookingReference} updated to ${e.target.value}`
                                )
                              }
                              className="cirrel-input px-2.5 py-1.5 text-xs font-medium"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. GUIDES & 4. GUIDE VERIFICATION */}
          {(activeTab === 'guides' || activeTab === 'verification') && (
            <div className="space-y-4">
              {guides
                .filter((g) =>
                  activeTab === 'verification'
                    ? g.approvalStatus === 'pending_review' || g.approvalStatus === 'rejected'
                    : true
                )
                .map((g) => (
                  <div
                    key={g.id}
                    className="editorial-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={g.profilePhotoUrl}
                        alt={g.displayName}
                        className="h-16 w-16 rounded-2xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif-display text-2xl font-semibold">
                            {g.displayName}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase ${
                              g.approvalStatus === 'approved'
                                ? 'bg-[#D8F36A] text-[#141914]'
                                : g.approvalStatus === 'pending_review'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {g.approvalStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--accent-ink)] font-medium">
                          {g.headline} · {g.locationBase} · License: {g.licenseNumber}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          Languages: {g.languages.map((l) => l.language).join(', ')} · Specialties:{' '}
                          {g.specialties.join(', ')}
                        </p>
                        {g.documents && g.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {g.documents.map((doc) => (
                              <span
                                key={doc.id}
                                className="inline-flex items-center gap-1 rounded-xl bg-[var(--card-2)] border border-[var(--line)] px-2.5 py-1 text-[11px]"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
                                {doc.documentTitle} ({doc.verificationStatus})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {g.approvalStatus !== 'approved' && (
                        <button
                          type="button"
                          onClick={() =>
                            runAdminMutation(
                              {
                                action: 'guide_approval',
                                id: g.id,
                                status: 'approved' as GuideApprovalStatus,
                                reason: 'Verified HPI credentials and documentation',
                              },
                              `${g.displayName} approved and published to marketplace.`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] text-[#D8F36A] px-4 py-2 text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                      )}
                      {g.approvalStatus !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() =>
                            runAdminMutation(
                              {
                                action: 'guide_approval',
                                id: g.id,
                                status: 'suspended' as GuideApprovalStatus,
                                reason: 'Admin review suspension',
                              },
                              `${g.displayName} suspended from public visibility.`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 text-red-800 px-4 py-2 text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 5. EXPERIENCES MANAGEMENT */}
          {activeTab === 'experiences' && (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="editorial-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={exp.coverImageUrl}
                      alt={exp.title}
                      className="h-16 w-20 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif-display text-xl font-semibold">
                          {exp.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            exp.status === 'published'
                              ? 'bg-[#D8F36A] text-[#141914]'
                              : exp.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {exp.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {exp.category} · {exp.locationName} · {exp.durationLabel} · $
                        {exp.priceUsd}/guest
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exp.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() =>
                          runAdminMutation(
                            {
                              action: 'experience_status',
                              id: exp.id,
                              status: 'published' as ExperienceStatus,
                            },
                            `"${exp.title}" is now published publicly.`
                          )
                        }
                        className="rounded-full bg-[#344B35] text-[#D8F36A] px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Approve & Publish
                      </button>
                    )}
                    {exp.status === 'published' && (
                      <button
                        type="button"
                        onClick={() =>
                          runAdminMutation(
                            {
                              action: 'experience_status',
                              id: exp.id,
                              status: 'unpublished' as ExperienceStatus,
                            },
                            `"${exp.title}" unpublished.`
                          )
                        }
                        className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        runAdminMutation(
                          {
                            action: 'experience_status',
                            id: exp.id,
                            status: 'archived' as ExperienceStatus,
                          },
                          `"${exp.title}" archived.`
                        )
                      }
                      className="rounded-full border border-red-200 text-red-700 px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 10. COMMISSIONS MANAGEMENT */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              <div className="editorial-card p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
                    Dynamic Platform Fee Config
                  </span>
                  <h2 className="font-serif-display text-3xl font-medium">
                    Current Marketplace Commission: {(commissionRate * 100).toFixed(1)}%
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Applies to all new bookings. Historical bookings preserve their immutable
                    purchase-time commission snapshot.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={40}
                    value={rateDraft}
                    onChange={(e) => setRateDraft(e.target.value)}
                    className="w-24 rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-3 py-2.5 text-sm font-bold tabular-nums"
                  />
                  <span className="text-sm font-semibold">%</span>
                  <button
                    type="button"
                    onClick={() =>
                      runAdminMutation(
                        {
                          action: 'commission_rate',
                          rate: Number(rateDraft) / 100,
                          reason: 'Admin updated marketplace commission rate',
                        },
                        `Commission rate updated to ${rateDraft}%.`
                      )
                    }
                    className="rounded-full bg-[#191A18] text-[#D8F36A] px-5 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Save Rate
                  </button>
                </div>
              </div>

              <div className="editorial-card p-5 sm:p-6">
                <h3 className="font-serif-display text-2xl font-medium mb-4">
                  Commission Ledger by Booking
                </h3>
                <div className="space-y-2.5 md:hidden">
                  {bookings.map((bk) => (
                    <div key={bk.id} className="rounded-2xl bg-[var(--card-2)] border border-[var(--line)] p-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{bk.bookingReference}</span>
                        <span className="uppercase text-[10px] font-semibold">{bk.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-[var(--muted)]">
                        <span>Gross ${bk.subtotalSnapshot.toFixed(2)} ({(bk.commissionRateSnapshot * 100).toFixed(1)}%)</span>
                        <span className="font-semibold text-[var(--accent-ink)]">Net ${bk.guideEarningsSnapshot.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                      <th className="py-2.5 pr-4">Booking Ref</th>
                      <th className="py-2.5 pr-4">Gross</th>
                      <th className="py-2.5 pr-4">Snapshot Rate</th>
                      <th className="py-2.5 pr-4">Platform Comm.</th>
                      <th className="py-2.5 pr-4">Guide Net</th>
                      <th className="py-2.5">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {bookings.map((bk) => (
                      <tr key={bk.id}>
                        <td className="py-3 pr-4 font-semibold">{bk.bookingReference}</td>
                        <td className="py-3 pr-4 tabular-nums">${bk.subtotalSnapshot.toFixed(2)}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {(bk.commissionRateSnapshot * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 pr-4 tabular-nums font-semibold text-[#B69A58]">
                          ${bk.commissionAmountSnapshot.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 tabular-nums font-semibold text-[var(--accent-ink)]">
                          ${bk.guideEarningsSnapshot.toFixed(2)}
                        </td>
                        <td className="py-3 uppercase">{bk.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* 11. PAYOUTS MANAGEMENT */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payouts.map((p) => {
                const g = guideMap.get(p.guideId);
                return (
                  <div
                    key={p.id}
                    className="editorial-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tabular-nums">
                          ${p.amountUsd.toFixed(2)} USD
                        </span>
                        <span className="rounded-full bg-[var(--card-3)] px-3 py-0.5 text-[11px] font-bold uppercase">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {g?.displayName || p.accountHolder} · {p.bankName} (••••{p.accountLast4})
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {p.notes} {p.paymentReference ? `· Ref: ${p.paymentReference}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {p.status !== 'completed' && (
                        <>
                          <input
                            type="text"
                            placeholder="Bank Transfer Ref"
                            value={payoutRefInput[p.id] ?? p.paymentReference ?? ''}
                            onChange={(e) =>
                              setPayoutRefInput((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))
                            }
                            className="rounded-full border border-[var(--line)] bg-[var(--card-2)] px-3.5 py-2 text-xs"
                          />
                          {p.status === 'requested' && (
                            <button
                              type="button"
                              onClick={() =>
                                runAdminMutation(
                                  {
                                    action: 'payout_status',
                                    id: p.id,
                                    status: 'approved' as PayoutStatus,
                                  },
                                  'Payout request approved.'
                                )
                              }
                              className="rounded-full bg-[#344B35] text-[#F7F5EF] px-4 py-2 text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              runAdminMutation(
                                {
                                  action: 'payout_status',
                                  id: p.id,
                                  status: 'completed' as PayoutStatus,
                                  paymentReference:
                                    payoutRefInput[p.id] || `MANUAL-${Date.now().toString().slice(-6)}`,
                                },
                                'Payout marked completed with reference.'
                              )
                            }
                            className="rounded-full bg-[#191A18] text-[#D8F36A] px-4 py-2 text-xs font-semibold cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* REMAINING CLEAN TABS: DESTINATIONS, CUSTOMERS, REVIEWS, PAYMENTS, MESSAGES, SETTINGS/AUDIT */}
          {activeTab === 'destinations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {initialState.destinations.map((d) => (
                <div key={d.id} className="editorial-card p-5 flex gap-4">
                  <img
                    src={d.coverImageUrl}
                    alt={d.name}
                    className="h-24 w-28 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--accent-ink)]">{d.region}</span>
                    <h3 className="font-serif-display text-2xl font-semibold">{d.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">{d.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="editorial-card p-6 space-y-4">
              <h2 className="font-serif-display text-2xl font-medium">Registered Travelers</h2>
              <div className="divide-y divide-[var(--line)] text-sm">
                {Array.from(
                  new Map(bookings.map((b) => [b.customerEmail, b])).values()
                ).map((c) => (
                  <div key={c.customerEmail} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.customerName}</p>
                      <p className="text-xs text-[var(--muted)]">{c.customerEmail}</p>
                    </div>
                    <span className="rounded-full bg-[var(--card-2)] px-3 py-1 text-xs font-semibold">
                      {bookings.filter((x) => x.customerEmail === c.customerEmail).length} bookings
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {initialState.reviews.map((r) => (
                <div key={r.id} className="editorial-card p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {r.authorName} · <span className="text-xs text-[var(--muted)]">{r.authorOrigin}</span>
                    </p>
                    <p className="text-sm text-[var(--ink-2)] mt-1">{r.comment}</p>
                  </div>
                  <span className="rounded-full bg-[#D8F36A]/40 px-3 py-1 text-xs font-bold shrink-0">
                    {r.rating}.0 ★
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="editorial-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-2xl font-medium">
                  Payment Transactions & Webhook Security
                </h2>
                <span className="rounded-full bg-[#D8F36A]/40 px-3 py-1 text-xs font-semibold">
                  Sandbox Test Environment
                </span>
              </div>
              <div className="divide-y divide-[var(--line)] text-xs">
                {bookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{b.bookingReference}</p>
                      <p className="text-[var(--muted)]">{b.customerName} · {b.bookingDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm tabular-nums">${b.subtotalSnapshot.toFixed(2)} USD</p>
                      <p className="uppercase text-[var(--accent-ink)] font-semibold">{b.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="editorial-card p-6 space-y-4">
              <h2 className="font-serif-display text-2xl font-medium">
                Curator Communication Hub
              </h2>
              {initialState.notifications.map((n) => (
                <div key={n.id} className="rounded-2xl bg-[var(--card-2)] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <span className="text-[11px] uppercase text-[var(--accent-ink)] font-semibold">{n.category}</span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)]">{n.body}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="editorial-card p-6 space-y-4">
              <h2 className="font-serif-display text-2xl font-medium">
                Immutable Financial & Operational Audit Trail
              </h2>
              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl bg-[var(--card-2)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="rounded-full bg-[#191A18] text-[#D8F36A] px-2.5 py-0.5 text-[10px] font-bold">
                        {log.action}
                      </span>
                      <p className="font-medium text-[var(--ink)] mt-1.5">{log.summary}</p>
                      <p className="text-[var(--muted)] mt-0.5">
                        Actor: {log.actorName} ({log.actorRole})
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] tabular-nums shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Admin Slide-In Drawer (No bottom navigation!) */}
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
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium ${
                      activeTab === item.id
                        ? 'bg-[#191A18] text-[#D8F36A]'
                        : 'text-[var(--ink)] hover:bg-[var(--card-3)]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="pt-4 border-t border-[var(--line)] space-y-2">
              <Link
                href="/"
                className="block text-center rounded-full border border-[var(--line)] py-2.5 text-xs font-semibold"
              >
                Public Site
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-full bg-[#191A18] text-[#F7F5EF] py-2.5 text-xs font-semibold"
              >
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
