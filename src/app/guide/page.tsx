import React from 'react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { readMarketplaceState } from '@/lib/store/marketplace-store';
import { GuideDashboardClient } from '@/components/dashboard/GuideDashboardClient';

export const dynamic = 'force-dynamic';

export default async function GuidePage() {
  const session = await requireRole(['guide', 'admin']);
  if (!session) {
    redirect('/auth/sign-in?next=/guide&required=guide');
  }

  const state = readMarketplaceState();
  const guideId = session.guideId ?? 'g-made-wijaya';
  const guide = state.guides.find((g) => g.id === guideId) ?? state.guides[0];

  return (
    <GuideDashboardClient
      session={session}
      initialData={{
        guide,
        bookings: state.bookings.filter((b) => b.guideId === guide.id),
        experiences: state.experiences.filter(
          (e) => e.guideIds.includes(guide.id) || e.proposedByGuideId === guide.id
        ),
        availability: state.availability.filter((a) => a.guideId === guide.id),
        payouts: state.payouts.filter((p) => p.guideId === guide.id),
        reviews: state.reviews.filter((r) => r.guideId === guide.id),
        notifications: state.notifications.filter((n) => n.userId === guide.userId),
      }}
    />
  );
}
