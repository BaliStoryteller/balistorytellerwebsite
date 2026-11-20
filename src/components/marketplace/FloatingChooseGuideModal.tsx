'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Languages,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { formatShortWindow } from '@/lib/date-utils';
import type { Guide } from '@/types/marketplace';

interface FloatingChooseGuideModalProps {
  guides: Guide[];
  selectedGuideId?: string;
  onSelectGuide?: (guide: Guide, language: string) => void;
  buttonLabel?: string;
}

export function FloatingChooseGuideModal({
  guides,
  selectedGuideId,
  onSelectGuide,
  buttonLabel = 'Choose Your Guide',
}: FloatingChooseGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    for (const g of guides) {
      for (const l of g.languages) {
        set.add(l.language);
      }
    }
    return Array.from(set);
  }, [guides]);

  const matchingGuides = useMemo(() => {
    if (!selectedLanguage) return [];
    return guides.filter((g) =>
      g.languages.some((l) => l.language === selectedLanguage)
    );
  }, [guides, selectedLanguage]);

  const activeGuide = selectedGuideId
    ? guides.find((g) => g.id === selectedGuideId)
    : null;

  return (
    <>
      {/* Sleek Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full cirrel-glass px-4 py-2 text-[12px] sm:text-[12.5px] font-semibold text-[var(--ink)] hover:border-[#344B35] transition-all cursor-pointer"
      >
        <Users className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
        <span>
          {activeGuide ? `Guide: ${activeGuide.displayName}` : buttonLabel}
        </span>
      </button>

      {/* Floating Rounded Glass Card Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose your guide by language"
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xl cirrel-glass rounded-[28px] p-5 sm:p-7 space-y-5 max-h-[86vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--line)]">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
                  <Sparkles className="w-3.5 h-3.5" /> Curated Experiences
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                  Choose Your Guide
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Select your preferred language first to view licensed storytellers fluent in it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close choose guide card"
                className="flex h-9 w-9 items-center justify-center rounded-full cirrel-btn-ghost shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Select Language First */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                1. Choose Spoken Language
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableLanguages.map((lang) => {
                  const active = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(active ? '' : lang)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        active ? 'btn-cirrel-lime' : 'cirrel-btn-ghost'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Matching Guides List */}
            {!selectedLanguage ? (
              <div className="rounded-[18px] bg-[var(--card-2)] border border-[var(--line)] p-4 text-xs text-[var(--muted)] text-center">
                Tap a language above (e.g. <strong>English</strong>, <strong>French</strong>,{' '}
                <strong>Japanese</strong>) to see matching guides.
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-ink)]">
                  2. {matchingGuides.length}{' '}
                  {matchingGuides.length === 1 ? 'Guide' : 'Guides'} Speaking {selectedLanguage}
                </p>

                <div className="space-y-2.5">
                  {matchingGuides.map((g) => {
                    const langMeta = g.languages.find((l) => l.language === selectedLanguage);
                    const isSelected = selectedGuideId === g.id;
                    return (
                      <div
                        key={g.id}
                        className={`rounded-[20px] p-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'bg-[#344B35]/25 border-[#D8F36A]'
                            : 'bg-[var(--card-2)] border-[var(--line)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={g.profilePhotoUrl}
                            alt={g.displayName}
                            className="h-12 w-12 rounded-full object-cover border-2 border-[#B69A58]/50 shrink-0"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[var(--ink)] truncate">
                                {g.displayName}
                              </p>
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#B69A58] shrink-0">
                                <Star className="w-3 h-3 fill-current" /> {g.ratingAvg.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11.5px] font-semibold text-[var(--accent-ink)]">
                              {selectedLanguage} ({langMeta?.proficiency}) · {g.locationBase}
                            </p>
                            <p className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] tabular-nums">
                              <Calendar className="w-3 h-3 shrink-0" />
                              Available: {formatShortWindow(g.availableFrom, g.availableUntil)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/guides/${g.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="rounded-full cirrel-btn-ghost px-3 py-1.5 text-[11.5px] font-semibold inline-flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                          {onSelectGuide && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectGuide(g, selectedLanguage);
                                setIsOpen(false);
                              }}
                              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                                isSelected ? 'btn-cirrel-lime' : 'btn-cirrel-green'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                              <span>{isSelected ? 'Selected' : 'Choose Guide'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
