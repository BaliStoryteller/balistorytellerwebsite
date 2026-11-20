'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Compass,
  Menu,
  Search,
  User,
  X,
  ArrowUpRight,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { BaliStorytellerLogo } from '@/components/brand/BaliStorytellerLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { SessionUser } from '@/types/marketplace';

gsap.registerPlugin(ScrollTrigger);

interface PublicNavbarProps {
  session?: SessionUser | null;
}

const CENTER_LINKS = [
  { href: '/guides', label: 'Explore Guides' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/about', label: 'About' },
];

export function PublicNavbar({ session }: PublicNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomepage = pathname === '/';

  const [isScrolled, setIsScrolled] = useState(!isHomepage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkTheme(document.documentElement.dataset.theme !== 'light');
    };
    syncTheme();
    const obs = new MutationObserver(syncTheme);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isHomepage) {
      setIsScrolled(true);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleScrollState = (scrolled: boolean) => {
      setIsScrolled(scrolled);
      const el = shellRef.current;
      if (!el || prefersReduced) return;

      if (scrolled) {
        gsap.to(el, {
          maxWidth: '1120px',
          marginTop: 12,
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 9999,
          duration: 0.38,
          ease: 'power3.out',
        });
      } else {
        gsap.to(el, {
          maxWidth: '1340px',
          marginTop: 0,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
          paddingBottom: 16,
          borderRadius: 0,
          duration: 0.32,
          ease: 'power2.out',
        });
      }
    };

    const initialScrolled = window.scrollY > 36;
    handleScrollState(initialScrolled);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 36,
        end: 999999,
        onEnter: () => handleScrollState(true),
        onLeaveBack: () => handleScrollState(false),
      });
    });

    return () => ctx.revert();
  }, [isHomepage]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSearchOpen(false);
    router.push(
      `/guides${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''}`
    );
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setMobileMenuOpen(false);
    router.refresh();
  };

  const transparentHeroMode = isHomepage && !isScrolled;
  const useLightInk = transparentHeroMode || isDarkTheme;

  const dashboardHref =
    session?.role === 'admin'
      ? '/admin'
      : session?.role === 'guide'
      ? '/guide'
      : '/my-bookings';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6 pointer-events-none">
        <div
          ref={shellRef}
          className={`pointer-events-auto mx-auto flex items-center justify-between transition-all duration-300 ${
            transparentHeroMode
              ? 'max-w-[1340px] py-4 px-2 sm:px-6 bg-transparent border border-transparent'
              : 'mt-3 max-w-[1120px] rounded-full cirrel-glass px-4 py-2'
          }`}
        >
          {/* Left: Logo */}
          <Link href="/" className="shrink-0 flex items-center pl-1 focus:outline-none">
            <BaliStorytellerLogo
              variant={useLightInk ? 'light' : 'dark'}
              compact={isScrolled}
            />
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6"
          >
            {CENTER_LINKS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[13px] font-semibold tracking-wide transition-colors ${
                    transparentHeroMode
                      ? 'text-[#f2f5f2]/90 hover:text-white'
                      : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#D8F36A]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle compact onHero={transparentHeroMode} />

            <Link
              href="/become-a-guide"
              className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                transparentHeroMode
                  ? 'text-[#f2f5f2] hover:bg-white/12'
                  : 'text-[var(--ink-2)] hover:bg-[var(--card-2)]'
              }`}
            >
              Become a Guide
            </Link>

            {session ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={dashboardHref}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    transparentHeroMode
                      ? 'bg-white/12 text-white border border-white/20 hover:bg-white/20'
                      : 'cirrel-btn-ghost text-[var(--ink)]'
                  }`}
                >
                  <LayoutDashboard className={`w-3.5 h-3.5 ${transparentHeroMode ? 'text-[#D8F36A]' : 'text-[var(--accent-ink)]'}`} />
                  <span>
                    {session.role === 'admin'
                      ? 'Console'
                      : session.role === 'guide'
                      ? 'Guide Hub'
                      : 'Bookings'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className={`p-2 rounded-full cursor-pointer ${
                    transparentHeroMode
                      ? 'bg-white/12 text-white hover:bg-white/20'
                      : 'cirrel-btn-ghost text-[var(--ink)]'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  transparentHeroMode
                    ? 'border border-white/25 text-white hover:bg-white/15'
                    : 'cirrel-btn-ghost text-[var(--ink)]'
                }`}
              >
                Sign In
              </Link>
            )}

            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 rounded-full btn-cirrel-green px-4 py-2 text-[12.5px] font-semibold"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D8F36A]" />
            </Link>
          </div>

          {/* Mobile Compact Top Actions (TOP NAV ONLY) */}
          <div className="flex lg:hidden items-center gap-1.5">
            <ThemeToggle compact onHero={transparentHeroMode} />
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Search guides and experiences"
              className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${
                transparentHeroMode
                  ? 'bg-white/14 text-white backdrop-blur-md'
                  : 'cirrel-btn-ghost'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-[12px] btn-cirrel-green"
            >
              <Menu className="w-4 h-4 text-[#D8F36A]" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Search Bar Popdown */}
        {mobileSearchOpen && (
          <div className="pointer-events-auto lg:hidden mt-2 mx-auto max-w-md rounded-[20px] cirrel-glass p-2.5">
            <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--accent-ink)] ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guide, Ubud, French, temple..."
                className="w-full bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none py-1.5"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-full btn-cirrel-green px-4 py-1.5 text-xs font-semibold shrink-0"
              >
                Find
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Slide-In Navigation Drawer (No Bottom Bar!) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            aria-label="Mobile Navigation Drawer"
            className="absolute right-2.5 top-2.5 bottom-2.5 w-[84%] max-w-xs rounded-[26px] cirrel-glass text-[var(--ink)] flex flex-col justify-between p-5 overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                <BaliStorytellerLogo variant={isDarkTheme ? 'light' : 'dark'} compact />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] cirrel-btn-ghost"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-4 flex flex-col gap-1">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/guides', label: 'Explore Guides' },
                  { href: '/experiences', label: 'Experiences' },
                  { href: '/destinations', label: 'Destinations' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/about', label: 'About Bali Storyteller' },
                  { href: '/become-a-guide', label: 'Become a Guide' },
                  { href: '/my-bookings', label: 'My Account & Bookings' },
                ].map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-[14px] px-3.5 py-2.5 text-[14px] font-semibold transition-colors ${
                        active
                          ? 'btn-cirrel-green text-[#F7F5EF]'
                          : 'hover:bg-[var(--card-2)] text-[var(--ink)]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-60" />
                    </Link>
                  );
                })}
              </nav>

              {session && (
                <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--muted)] px-1">
                    {session.fullName} ({session.role})
                  </p>
                  {session.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-[14px] btn-cirrel-green px-3.5 py-2.5 text-xs font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#D8F36A]" />
                      Open Admin Dashboard
                    </Link>
                  )}
                  {(session.role === 'guide' || session.role === 'admin') && (
                    <Link
                      href="/guide"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-[14px] btn-cirrel-green px-3.5 py-2.5 text-xs font-semibold"
                    >
                      <Compass className="w-4 h-4 text-[#D8F36A]" />
                      Open Guide Workspace
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--line)] flex flex-col gap-2">
              {session ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-[14px] cirrel-btn-ghost py-2.5 text-xs font-semibold"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-[14px] btn-cirrel-green py-3 text-xs font-semibold"
                >
                  <User className="w-4 h-4 text-[#D8F36A]" />
                  Sign In / Switch Role
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
