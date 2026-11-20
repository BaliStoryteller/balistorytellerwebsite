import React from 'react';
import Link from 'next/link';
import { Award, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { getServerSession } from '@/lib/auth/session';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-5xl mx-auto w-full space-y-14">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35]/10 px-3.5 py-1 text-xs font-semibold text-[var(--accent-ink)]">
            <Sparkles className="w-3.5 h-3.5" /> Our Cultural Philosophy
          </span>
          <h1 className="font-serif-display text-4xl sm:text-6xl font-medium text-[var(--ink)] leading-tight">
            Travel should deepen respect for the places we enter.
          </h1>
          <p className="text-base sm:text-lg text-[var(--ink-2)] leading-relaxed">
            Bali Storyteller was founded in Ubud to replace anonymous, rushed island
            excursions with genuine human connection. By putting licensed Balinese guides at
            the center of discovery, travelers meet the historians, temple keepers, weavers,
            and cooks who safeguard Bali&apos;s living culture.
          </p>
        </div>

        <div className="rounded-[28px] overflow-hidden aspect-[16/8] bg-[#191A18]">
          <img
            src="/images/hero-bali.jpg"
            alt="Bali highlands morning light"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified Credentials',
              body: 'Every guide holds an active HPI Bali Tourism License, identity verification, and cultural specialty assessment reviewed by our curators.',
            },
            {
              icon: HeartHandshake,
              title: 'Community Equity',
              body: 'Transparent commissions ensure local storytellers retain the overwhelming majority of every booking with auditable payouts.',
            },
            {
              icon: Award,
              title: 'Small-Group Depth',
              body: 'Journeys stay intimate—often 1 to 6 guests—so village conversations, temple etiquette, and mountain walks remain unhurried.',
            },
          ].map((card) => (
            <div key={card.title} className="editorial-card p-6 space-y-3">
              <card.icon className="w-6 h-6 text-[var(--accent-ink)]" />
              <h2 className="font-serif-display text-2xl font-medium">{card.title}</h2>
              <p className="text-sm text-[var(--ink-2)] leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-[#344B35] text-[#F7F5EF] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif-display text-3xl font-medium">
              Ready to meet your guide?
            </h2>
            <p className="text-sm text-[#F7F5EF]/80 mt-1">
              Browse verified profiles by language, destination, and cultural discipline.
            </p>
          </div>
          <Link
            href="/guides"
            className="rounded-full bg-[#D8F36A] text-[#141914] px-6 py-3 text-sm font-semibold shrink-0"
          >
            Explore Storytellers
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
