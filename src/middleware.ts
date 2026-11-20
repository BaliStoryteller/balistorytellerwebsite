import { type NextRequest } from 'next/server';
import { updateSessionAndGuard } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSessionAndGuard(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guide/:path*',
    '/account/:path*',
    '/my-bookings/:path*',
  ],
};
