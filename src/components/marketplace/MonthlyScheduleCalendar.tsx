'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { formatShortDate, formatShortWindow } from '@/lib/date-utils';
import type { GuideAvailabilitySlot } from '@/types/marketplace';

interface MonthlyScheduleCalendarProps {
  guideId: string;
  guideName?: string;
  availability: GuideAvailabilitySlot[];
  availableFrom?: string;
  availableUntil?: string;
  selectedDate?: string;
  onSelectDate?: (dateIso: string) => void;
  /** 'card' = standalone floating glass monthly calendar card; 'popover' = floating trigger + dropdown calendar */
  mode?: 'card' | 'popover';
  /** Allow guide owner in dashboard to click any non-booked date to toggle/edit it */
  allowBlockedSelection?: boolean;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyScheduleCalendar({
  guideId,
  guideName,
  availability,
  availableFrom,
  availableUntil,
  selectedDate,
  onSelectDate,
  mode = 'card',
  allowBlockedSelection = false,
}: MonthlyScheduleCalendarProps) {
  const initialDate = selectedDate || availableFrom || '2026-11-25';
  const [initYear, initMonth] = initialDate.split('-').map(Number);

  const [viewYear, setViewYear] = useState(initYear || 2026);
  const [viewMonth, setViewMonth] = useState((initMonth || 11) - 1); // 0-indexed
  const [open, setOpen] = useState(false);

  const slotMap = useMemo(() => {
    const map = new Map<string, GuideAvailabilitySlot>();
    for (const s of availability) {
      if (s.guideId === guideId) {
        map.set(s.date, s);
      }
    }
    return map;
  }, [availability, guideId]);

  const monthTitle = useMemo(() => {
    const dt = new Date(Date.UTC(viewYear, viewMonth, 1));
    return dt.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }, [viewYear, viewMonth]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1));
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
    const startOffset = (firstDay.getUTCDay() + 6) % 7;

    const cells: ({ iso: string; day: number } | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({ iso: `${viewYear}-${mm}-${dd}`, day: d });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayIso = '2026-11-19';

  const selectedSlot = selectedDate ? slotMap.get(selectedDate) : undefined;

  const calendarBody = (
    <div className="space-y-3.5">
      {/* Header: Availability Window + Month Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {guideName && (
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--accent-ink)]">
              {guideName}&apos;s Schedule
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#D8F36A] ring-2 ring-[#344B35]" />
            <span className="text-[11.5px] font-semibold text-[var(--muted)] tabular-nums">
              Available: {formatShortWindow(availableFrom, availableUntil)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-[var(--card-2)] border border-[var(--line)] p-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--card-3)] text-[var(--ink)] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-bold text-[var(--ink)] min-w-[106px] text-center">
            {monthTitle}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--card-3)] text-[var(--ink)] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] py-1"
          >
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const slot = slotMap.get(cell.iso);
          const isBooked = slot?.status === 'booked';
          const isBlocked = slot?.status === 'blocked';
          const isPast = cell.iso < todayIso;
          const outOfRange =
            (availableFrom && cell.iso < availableFrom) ||
            (availableUntil && cell.iso > availableUntil);

          const isDisabled = allowBlockedSelection
            ? isBooked || isPast
            : isBooked || isBlocked || isPast || Boolean(outOfRange);

          const isSelected = selectedDate === cell.iso;

          let cellStyle =
            'bg-[var(--card-2)] text-[var(--ink)] border-[var(--line)] hover:border-[#344B35] hover:bg-[#344B35]/20 cursor-pointer';
          if (isSelected) {
            cellStyle = 'btn-cirrel-lime font-bold ring-2 ring-[#344B35] border-transparent';
          } else if (isBooked) {
            cellStyle =
              'bg-black/45 text-white/45 border-white/10 line-through cursor-not-allowed';
          } else if (isBlocked) {
            cellStyle =
              'bg-red-500/12 text-red-400/75 border-red-500/20 line-through cursor-not-allowed';
          } else if (isPast || outOfRange) {
            cellStyle =
              'bg-transparent text-[var(--muted)]/40 border-transparent cursor-not-allowed';
          }

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled}
              title={
                isBooked
                  ? slot?.notes || 'Already booked'
                  : isBlocked
                  ? slot?.notes || 'Blocked by guide'
                  : outOfRange
                  ? 'Outside guide availability window'
                  : `Select ${cell.iso}`
              }
              onClick={() => {
                if (isDisabled) return;
                onSelectDate?.(cell.iso);
                if (mode === 'popover') setOpen(false);
              }}
              className={`relative aspect-square rounded-[12px] border text-[12px] font-semibold flex flex-col items-center justify-center transition-all tabular-nums ${cellStyle}`}
            >
              <span>{cell.day}</span>
              {(isBlocked || isBooked) && (
                <Lock className="w-2.5 h-2.5 opacity-60 mt-0.5" />
              )}
              {!isBlocked && !isBooked && !isPast && !outOfRange && !isSelected && (
                <span className="h-1 w-1 rounded-full bg-[#344B35] dark:bg-[#D8F36A] mt-0.5 opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend + Active Slot Note */}
      <div className="pt-2.5 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#D8F36A] ring-1 ring-[#344B35]" /> Available
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/70" /> Blocked (Disabled)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-white/40 border border-[var(--line)]" /> Booked
          </span>
        </div>
        {selectedSlot?.notes && (
          <span className="font-semibold text-[var(--accent-ink)]">
            {selectedSlot.notes}
          </span>
        )}
      </div>
    </div>
  );

  if (mode === 'popover') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 cirrel-input px-4 py-3 text-sm font-semibold text-left cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 min-w-0 truncate">
            <Calendar className="w-4 h-4 text-[var(--accent-ink)] shrink-0" />
            <span className="tabular-nums">
              {selectedDate ? formatShortDate(selectedDate) : 'Choose an available date'}
            </span>
          </span>
          <span className="text-[11px] font-semibold text-[var(--accent-ink)] shrink-0">
            {open ? 'Close' : 'Calendar'}
          </span>
        </button>

        {open && (
          <div className="mt-2 rounded-[24px] cirrel-glass p-4 sm:p-5 shadow-2xl z-40">
            {calendarBody}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cirrel-glass rounded-[24px] p-4 sm:p-5 shadow-[0_18px_46px_-18px_rgba(0,0,0,0.45)]">
      {calendarBody}
    </div>
  );
}
