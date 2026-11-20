'use client';

import React, { useState } from 'react';
import { MonthlyScheduleCalendar } from '@/components/marketplace/MonthlyScheduleCalendar';
import type { GuideAvailabilitySlot } from '@/types/marketplace';

interface GuideProfileMonthlyScheduleProps {
  guideId: string;
  guideName: string;
  availability: GuideAvailabilitySlot[];
  availableFrom?: string;
  availableUntil?: string;
}

export function GuideProfileMonthlySchedule({
  guideId,
  guideName,
  availability,
  availableFrom,
  availableUntil,
}: GuideProfileMonthlyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-25');

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    window.dispatchEvent(
      new CustomEvent('bs:select-guide-date', { detail: { date: iso, guideId } })
    );
  };

  return (
    <MonthlyScheduleCalendar
      mode="card"
      guideId={guideId}
      guideName={guideName}
      availability={availability}
      availableFrom={availableFrom}
      availableUntil={availableUntil}
      selectedDate={selectedDate}
      onSelectDate={handleSelectDate}
    />
  );
}
