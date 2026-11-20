import React from 'react';
import Link from 'next/link';
import { CalendarCheck, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function HowItWorksPage() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-ink)]">
            Marketplace Mechanics
          </span>
          <h1 className="font-serif-display text-4xl sm:text-6xl font-medium text-[var(--ink)]">
            How Bali Storyteller Works
          </h1>
          <p className="text-base text-[var(--ink-2)]">
            From guide-first discovery to verified availability, locked price snapshots, and
            curatorial approval.
          </p>
        </div>

        <div className="space-y-5">
          {[
            {
              icon: ShieldCheck,
              num: '01',
              title: 'Curated, Licensed Guides Only',
              desc: 'Only guides whose HPI credentials and qualifications have been verified and approved by our Admin Curators appear publicly.',
            },
            {
              icon: CalendarCheck,
              num: '02',
              title: 'Real-Time Availability & Booking Requests',
              desc: 'Whether hiring a guide hourly, for a full day, or for a curated cultural experience, our booking engine validates availability dates server-side and prevents double-bookings.',
            },
            {
              icon: FileCheck2,
              num: '03',
              title: 'Locked Price & Commission Snapshots',
              desc: 'At booking creation, the exact unit price, total, commission percentage, and guide net earnings are snapshotted immutably for financial clarity.',
            },
            {
              icon: CheckCircle2,
              num: '04',
              title: 'Guide Confirmation & Cultural Preparation',
              desc: 'Bookings enter Pending status until your chosen guide confirms exact timing and shares temple dress or meeting guidance.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="editorial-card p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#344B35] text-[#D8F36A]">
                <step.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold tracking-widest text-[#B69A58]">
                  STEP {step.num}
                </span>
                <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">
                  {step.title}
                </h2>
                <p className="text-sm text-[var(--ink-2)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-full bg-[#191A18] text-[#F7F5EF] px-6 py-3 text-sm font-semibold"
          >
            Discover Guides
          </Link>
          <Link
            href="/become-a-guide"
            className="rounded-full border border-[var(--line)] bg-white text-[var(--ink)] px-6 py-3 text-sm font-semibold"
          >
            Apply as a Guide
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
