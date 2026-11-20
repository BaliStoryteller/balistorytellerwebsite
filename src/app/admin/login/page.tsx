'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { BaliStorytellerLogo } from '@/components/brand/BaliStorytellerLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function AdminPrivateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('curator@balistoryteller.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'password',
          role: 'admin',
          email,
          password,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Invalid curator credentials.');
        setLoading(false);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Authentication failed.');
      setLoading(false);
    }
  };

  const handleSandboxAdmin = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'demo', role: 'admin' }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Could not open curator sandbox.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md cirrel-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <BaliStorytellerLogo variant="auto" compact />
          <ThemeToggle compact />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] px-3 py-0.5 text-[11px] font-semibold text-[#D8F36A]">
            <Lock className="w-3 h-3" /> Restricted Curator Console
          </span>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight pt-1">
            Platform Administration
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Direct internal access only. Not linked from public pages.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
              Curator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full cirrel-input px-4 py-2.5 text-sm"
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
              className="w-full cirrel-input px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full btn-cirrel-green py-3 text-sm font-semibold cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Sign In to Console'}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--line)]">
          <button
            type="button"
            disabled={loading}
            onClick={handleSandboxAdmin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full cirrel-btn-ghost py-2.5 text-xs font-semibold cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--accent-ink)]" />
            Continue in Sandbox Curator Mode
          </button>
        </div>
      </div>
    </div>
  );
}
