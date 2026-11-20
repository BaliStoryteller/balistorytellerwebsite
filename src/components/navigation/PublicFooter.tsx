import React from 'react';
import Link from 'next/link';
import { BaliStorytellerLogo } from '@/components/brand/BaliStorytellerLogo';
import { ShieldCheck, Globe2, Award } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#0c110d] text-[#f2f5f2] pt-14 pb-10 px-5 sm:px-8 mt-16 border-t border-white/10">
      <div className="max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <BaliStorytellerLogo variant="light" />
            <p className="text-[13.5px] leading-relaxed text-white/75 max-w-md">
              A curated, guide-first travel marketplace connecting discerning international
              travelers with licensed, vetted Balinese storytellers, cultural historians,
              and highland guardians.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-xs text-[#D8F36A]">
                <ShieldCheck className="w-3.5 h-3.5" /> HPI Licensed Guides
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-xs text-white/85">
                <Award className="w-3.5 h-3.5 text-[#B69A58]" /> Fair Local Compensation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-xs text-white/85">
                <Globe2 className="w-3.5 h-3.5 text-[#B69A58]" /> 8+ Languages
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B69A58]">
              Marketplace
            </h3>
            <ul className="space-y-2 text-[13.5px] text-white/75">
              <li><Link href="/guides" className="hover:text-[#D8F36A] transition-colors">Explore Guides</Link></li>
              <li><Link href="/experiences" className="hover:text-[#D8F36A] transition-colors">Curated Experiences</Link></li>
              <li><Link href="/destinations" className="hover:text-[#D8F36A] transition-colors">Bali Destinations</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#D8F36A] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B69A58]">
              Community
            </h3>
            <ul className="space-y-2 text-[13.5px] text-white/75">
              <li><Link href="/about" className="hover:text-[#D8F36A] transition-colors">Our Philosophy</Link></li>
              <li><Link href="/become-a-guide" className="hover:text-[#D8F36A] transition-colors">Become a Guide</Link></li>
              <li><Link href="/my-bookings" className="hover:text-[#D8F36A] transition-colors">My Bookings</Link></li>
              <li><Link href="/account" className="hover:text-[#D8F36A] transition-colors">Traveler Account</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B69A58]">
              Travelers & Guides
            </h3>
            <p className="text-xs text-white/65 leading-relaxed">
              Manage your upcoming Bali journeys or access your verified storyteller workspace.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/auth/sign-in"
                className="rounded-full btn-cirrel-green px-4 py-2 text-xs font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/guide"
                className="rounded-full border border-white/20 hover:border-[#D8F36A] text-white px-4 py-2 text-xs font-semibold transition-colors"
              >
                Guide Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/55">
          <p>© {new Date().getFullYear()} Bali Storyteller. Crafted in Ubud, Bali. All rights reserved.</p>
          <p>Licensed cultural guiding across Bali</p>
        </div>
      </div>
    </footer>
  );
}
