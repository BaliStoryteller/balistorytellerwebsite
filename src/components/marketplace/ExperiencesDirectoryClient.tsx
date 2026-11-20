'use client';

import React, { useMemo, useState } from 'react';
import { ExperienceCard } from '@/components/marketplace/ExperienceCard';
import { FloatingChooseGuideModal } from '@/components/marketplace/FloatingChooseGuideModal';
import type { Experience, Guide } from '@/types/marketplace';

const CATEGORIES = [
  'All',
  'Cultural Heritage',
  'Temple Exploration',
  'Traditional Villages',
  'Rice Terraces',
  'Nature and Waterfalls',
  'Balinese Food and Traditions',
  'Spiritual and Cultural Experiences',
] as const;

export function ExperiencesDirectoryClient({
  experiences,
  guides,
  initialCategory,
}: {
  experiences: Experience[];
  guides: Guide[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory || 'All');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');
  const guideMap = useMemo(() => new Map(guides.map((g) => [g.id, g])), [guides]);

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (category !== 'All' && e.category !== category) return false;
      if (selectedGuideId && !e.guideIds.includes(selectedGuideId)) return false;
      return true;
    });
  }, [experiences, category, selectedGuideId]);

  const activeGuide = selectedGuideId ? guideMap.get(selectedGuideId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active ? 'btn-cirrel-lime' : 'cirrel-btn-ghost'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <FloatingChooseGuideModal
            guides={guides}
            selectedGuideId={selectedGuideId}
            onSelectGuide={(g) =>
              setSelectedGuideId((prev) => (prev === g.id ? '' : g.id))
            }
            buttonLabel="Choose Your Guide"
          />
          {activeGuide && (
            <button
              type="button"
              onClick={() => setSelectedGuideId('')}
              className="rounded-full bg-[#344B35] text-[#D8F36A] px-3 py-2 text-xs font-semibold cursor-pointer"
            >
              Reset ×
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cirrel-card p-10 text-center space-y-2">
          <p className="text-xl font-bold text-[var(--ink)]">
            No published experiences match your selection
          </p>
          <p className="text-sm text-[var(--muted)]">
            Reset your guide or category filter to explore all curated experiences.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setSelectedGuideId('');
            }}
            className="mt-2 rounded-full btn-cirrel-green px-5 py-2 text-xs font-semibold cursor-pointer"
          >
            View All Experiences
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {filtered.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              primaryGuide={guideMap.get(exp.primaryGuideId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
