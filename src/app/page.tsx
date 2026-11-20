import React from 'react';
import { getServerSession } from '@/lib/auth/session';
import {
  getPublicExperiences,
  getPublicGuides,
  readMarketplaceState,
} from '@/lib/store/marketplace-store';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { HomepageClient } from '@/components/home/HomepageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession();
  const state = readMarketplaceState();
  const guides = getPublicGuides();
  const experiences = getPublicExperiences();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar session={session} />
      <main className="flex-1">
        <HomepageClient
          guides={guides}
          experiences={experiences}
          destinations={state.destinations}
          reviews={state.reviews.filter((r) => r.isPublished)}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
