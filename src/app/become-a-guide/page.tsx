'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export default function BecomeAGuidePage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('Ubud & Gianyar');
  const [license, setLicense] = useState('');
  const [languages, setLanguages] = useState('English, Indonesian, Balinese');
  const [story, setStory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-28 sm:pt-32 px-5 sm:px-8 max-w-5xl mx-auto w-full space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#344B35] text-[#D8F36A] px-3.5 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> For Balinese Professionals
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-medium text-[var(--ink)] leading-tight">
              Become a Bali Storyteller Guide
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
              We partner with licensed Balinese guides who value depth over speed. Set your
              rates, manage your calendar on mobile, and build lasting relationships with
              international guests.
            </p>
            <div className="editorial-card p-5 space-y-3 text-xs text-[var(--ink-2)]">
              <p className="font-semibold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-ink)]" /> Verification Requirements
              </p>
              <p>• Active HPI Bali Guide License or certified specialist credential</p>
              <p>• Fluent guiding proficiency in English or additional international languages</p>
              <p>• Commitment to respectful village & temple protocols</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {submitted ? (
              <div className="editorial-card p-8 sm:p-10 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D8F36A] text-[#141914]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="font-serif-display text-3xl font-medium">
                  Application Received for Curator Review
                </h2>
                <p className="text-sm text-[var(--ink-2)] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Your credentials ({license || 'HPI Pending'})
                  have been queued for our Admin Verification team. You will remain hidden
                  from public discovery until approved.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/auth/sign-in"
                    className="rounded-full bg-[#191A18] text-[#F7F5EF] px-5 py-2.5 text-xs font-semibold"
                  >
                    Preview Guide Portal
                  </Link>
                  <Link
                    href="/"
                    className="rounded-full border border-[var(--line)] px-5 py-2.5 text-xs font-semibold"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="editorial-card p-6 sm:p-8 space-y-4">
                <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">
                  Guide Application Form
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="I Ketut Dharma"
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ketut@example.com"
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                      Home Region *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                    >
                      <option>Ubud & Gianyar</option>
                      <option>Sidemen Valley</option>
                      <option>Uluwatu & Bukit</option>
                      <option>Munduk & North Bali</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                      HPI License Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      placeholder="HPI-BALI-XXXX"
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Languages & Proficiency *
                  </label>
                  <input
                    type="text"
                    required
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Your Storytelling Specialty & Background *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Share the temples, villages, food traditions, or ecological stories you bring to life..."
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#344B35] hover:bg-[#191A18] text-[#F7F5EF] py-3.5 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Submit Application for Verification
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
