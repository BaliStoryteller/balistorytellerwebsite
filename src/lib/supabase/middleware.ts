import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { AppRole } from '@/types/marketplace';

export const DEMO_SESSION_COOKIE = 'bs_demo_session';

function parseDemoRole(raw?: string): AppRole | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: AppRole };
    if (parsed.role === 'customer' || parsed.role === 'guide' || parsed.role === 'admin') {
      return parsed.role;
    }
  } catch {
    return null;
  }
  return null;
}

export async function updateSessionAndGuard(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === '/admin/login';
  const isProtectedAdmin = pathname.startsWith('/admin') && !isAdminLogin;
  const isProtectedGuide = pathname.startsWith('/guide');
  const isProtectedAccount =
    pathname.startsWith('/account') || pathname.startsWith('/my-bookings');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseReady = Boolean(
    url &&
      key &&
      !url.includes('your-project-id') &&
      !key.includes('your-supabase-anon-key')
  );

  let activeRole: AppRole | null = null;
  let isAuthenticated = false;

  if (supabaseReady) {
    const supabase = createServerClient(url!, key!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data: roleRows } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = (roleRows ?? []).map((r) => r.role as AppRole);
      if (roles.includes('admin')) activeRole = 'admin';
      else if (roles.includes('guide')) activeRole = 'guide';
      else activeRole = 'customer';
    }
  } else {
    // Sandbox / Demo authentication cookie fallback
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    const demoRole = parseDemoRole(demoCookie);
    if (demoRole) {
      isAuthenticated = true;
      activeRole = demoRole;
    }
  }

  // Server-side Route Protection (never rely solely on hiding nav links)
  if (isProtectedAdmin) {
    if (!isAuthenticated || activeRole !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isProtectedGuide) {
    if (!isAuthenticated || (activeRole !== 'guide' && activeRole !== 'admin')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/sign-in';
      redirectUrl.searchParams.set('next', pathname);
      redirectUrl.searchParams.set('required', 'guide');
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isProtectedAccount && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/sign-in';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
