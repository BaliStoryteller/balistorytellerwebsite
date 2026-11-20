import React from 'react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { readMarketplaceState } from '@/lib/store/marketplace-store';
import { AdminDashboardClient } from '@/components/dashboard/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await requireRole(['admin']);
  if (!session) {
    redirect('/admin/login');
  }

  const state = readMarketplaceState();

  return (
    <AdminDashboardClient
      session={session}
      initialState={{
        defaultCommissionRate: state.defaultCommissionRate,
        guides: state.guides,
        experiences: state.experiences,
        destinations: state.destinations,
        bookings: state.bookings,
        payouts: state.payouts,
        reviews: state.reviews,
        auditLogs: state.auditLogs,
        notifications: state.notifications,
      }}
    />
  );
}
