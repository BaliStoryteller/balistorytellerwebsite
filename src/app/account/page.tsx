import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, User, Compass, LayoutDashboard } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/sign-in?next=/account');

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="editorial-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#344B35] text-[#D8F36A]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#D8F36A]/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[#141914]">
                <ShieldCheck className="w-3 h-3" /> Role: {session.role}
              </span>
              <h1 className="font-serif-display text-3xl font-semibold text-[var(--ink)] mt-1">
                {session.fullName}
              </h1>
              <p className="text-xs text-[var(--muted)]">{session.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/my-bookings"
              className="rounded-full bg-[#191A18] text-[#F7F5EF] px-5 py-2.5 text-xs font-semibold"
            >
              My Bookings
            </Link>
            {session.role === 'guide' && (
              <Link
                href="/guide"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] text-[#D8F36A] px-5 py-2.5 text-xs font-semibold"
              >
                <Compass className="w-3.5 h-3.5" /> Guide Dashboard
              </Link>
            )}
            {session.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#B69A58] text-[#141914] px-5 py-2.5 text-xs font-semibold"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
