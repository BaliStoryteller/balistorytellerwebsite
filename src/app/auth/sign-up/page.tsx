'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'signup',
        role: 'customer',
        fullName,
        email,
        password,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || 'Could not register account.');
      setLoading(false);
      return;
    }
    router.push('/my-bookings');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-md mx-auto w-full">
        <div className="editorial-card p-6 sm:p-8 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
              Traveler Account
            </span>
            <h1 className="font-serif-display text-3xl font-semibold text-[var(--ink)] mt-1">
              Create Your Account
            </h1>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#344B35] hover:bg-[#191A18] text-[#F7F5EF] py-3.5 text-sm font-semibold cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Traveler Account'}
            </button>
          </form>

          <p className="text-xs text-center text-[var(--muted)]">
            Already registered?{' '}
            <Link href="/auth/sign-in" className="font-semibold text-[var(--accent-ink)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
