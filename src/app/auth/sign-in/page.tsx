'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import type { AppRole } from '@/types/marketplace';

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const requiredRole = searchParams.get('required');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithRole = async (role: 'customer' | 'guide', customEmail?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'demo',
          role,
          email: customEmail,
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error || 'Authentication failed.');
        setLoading(false);
        return;
      }
      const target =
        nextPath && !nextPath.startsWith('/admin')
          ? nextPath
          : role === 'guide'
          ? '/guide'
          : '/my-bookings';
      router.push(target);
      router.refresh();
    } catch {
      setError('Could not establish session.');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'password',
          email,
          password,
          role: email.includes('made') || email.includes('guide') ? 'guide' : 'customer',
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        session?: { role: AppRole };
      };
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }
      const role = data.session?.role ?? 'customer';
      const target =
        nextPath && !nextPath.startsWith('/admin')
          ? nextPath
          : role === 'guide'
          ? '/guide'
          : '/my-bookings';
      router.push(target);
      router.refresh();
    } catch {
      setError('Sign-in error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-4xl mx-auto w-full space-y-6">
        {requiredRole === 'guide' && (
          <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-4 flex items-center gap-3 text-sm text-[var(--ink)]">
            <Lock className="w-5 h-5 shrink-0 text-amber-500" />
            <span>
              Please sign in with a verified <strong>Guide</strong> account to access{' '}
              <code>{nextPath}</code>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Standard Traveler & Guide Login Form */}
          <div className="md:col-span-6 cirrel-card p-6 sm:p-7 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent-ink)]">
                Traveler & Guide Access
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                Sign In to Bali Storyteller
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Manage your cultural bookings or access your licensed storyteller workspace.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full cirrel-input px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full cirrel-input px-4 py-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full btn-cirrel-green py-3 text-sm font-semibold cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-[var(--muted)] text-center">
              New traveler?{' '}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-[var(--accent-ink)] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Sandbox Role Switcher (Strictly Customer & Guide Only — Admin Hidden) */}
          <div className="md:col-span-6 cirrel-card p-6 sm:p-7 space-y-5">
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-[#344B35] px-3 py-0.5 text-[11px] font-semibold text-[#D8F36A]">
                Interactive Sandbox
              </span>
              <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                Quick Demo Access
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Explore the marketplace as a Traveler or manage requests and availability as a
                licensed Balinese Guide.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => loginWithRole('customer')}
                className="w-full flex items-center justify-between rounded-[18px] bg-[var(--card-2)] hover:bg-[var(--card-3)] border border-[var(--line)] p-4 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl btn-cirrel-lime">
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      Claire Bennett (Traveler)
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      View bookings & traveler account
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--accent-ink)]" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => loginWithRole('guide')}
                className="w-full flex items-center justify-between rounded-[18px] bg-[var(--card-2)] hover:bg-[var(--card-3)] border border-[var(--line)] p-4 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl btn-cirrel-green">
                    <Compass className="w-5 h-5 text-[#D8F36A]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      I Made Wijaya (Licensed Guide)
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Manage requests, availability & earnings
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--accent-ink)]" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignInInner />
    </Suspense>
  );
}
