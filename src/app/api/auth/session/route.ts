import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_USERS, getServerSession } from '@/lib/auth/session';
import { DEMO_SESSION_COOKIE } from '@/lib/supabase/middleware';
import {
  createSupabaseServerClient,
  isSupabaseServerConfigured,
} from '@/lib/supabase/server';
import type { AppRole } from '@/types/marketplace';

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json({
    session,
    supabaseConfigured: isSupabaseServerConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    mode?: 'demo' | 'password' | 'signup';
    role?: AppRole;
    email?: string;
    password?: string;
    fullName?: string;
  };

  if (isSupabaseServerConfigured() && body.mode !== 'demo') {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
    }

    if (body.mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: body.email ?? '',
        password: body.password ?? '',
        options: {
          data: { full_name: body.fullName ?? 'Traveler' },
        },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ user: data.user, requiresConfirmation: !data.session });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email ?? '',
      password: body.password ?? '',
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ user: data.user });
  }

  // Sandbox / Demo Role Authentication
  const role: AppRole =
    body.role === 'admin' || body.role === 'guide' || body.role === 'customer'
      ? body.role
      : 'customer';

  const demoUser = {
    ...DEMO_USERS[role],
    email: body.email?.trim() || DEMO_USERS[role].email,
    fullName: body.fullName?.trim() || DEMO_USERS[role].fullName,
  };

  const response = NextResponse.json({ session: demoUser, mode: 'sandbox' });
  response.cookies.set(DEMO_SESSION_COOKIE, JSON.stringify(demoUser), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  if (isSupabaseServerConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) await supabase.auth.signOut();
  }
  const response = NextResponse.json({ signedOut: true });
  response.cookies.delete(DEMO_SESSION_COOKIE);
  return response;
}
