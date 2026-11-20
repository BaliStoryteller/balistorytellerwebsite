'use client';

import React from 'react';
import { PlayCircle, ShieldCheck } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface GuideIntroVideoCardProps {
  guideName: string;
  introVideoUrl?: string | null;
  compact?: boolean;
}

export function GuideIntroVideoCard({
  guideName,
  introVideoUrl,
  compact = false,
}: GuideIntroVideoCardProps) {
  const embedUrl = getYouTubeEmbedUrl(introVideoUrl);
  if (!embedUrl) return null;

  return (
    <section
      aria-label={`${guideName} introduction video`}
      className="cirrel-card overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full btn-cirrel-green shrink-0">
            <PlayCircle className="w-3.5 h-3.5 text-[#D8F36A]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
              Personal Introduction
            </p>
            <h2 className="text-[13.5px] sm:text-sm font-bold text-[var(--ink)] truncate">
              Meet {guideName}
            </h2>
          </div>
        </div>
        {!compact && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--card-2)] border border-[var(--line)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--muted)] shrink-0">
            <ShieldCheck className="w-3 h-3 text-[var(--accent-ink)]" />
            Storyteller Video
          </span>
        )}
      </div>

      {/* Landscape 16:9 Responsive YouTube Embed */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={`${guideName} — Bali Storyteller Introduction Video`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}
