import { cookies } from 'next/headers';
import {
  createSupabaseServerClient,
  isSupabaseServerConfigured,
} from '@/lib/supabase/server';
import { DEMO_SESSION_COOKIE } from '@/lib/supabase/middleware';
import type { AppRole, SessionUser } from '@/types/marketplace';

export const DEMO_USERS: Record<AppRole, SessionUser> = {
  customer: {
    id: '00000000-0000-4000-8000-000000000101',
    email: 'claire.bennett@example.com',
    fullName: 'Claire Bennett',
    role: 'customer',
    avatarUrl: '/images/guide-kadek.jpg',
    isDemoSession: true,
  },
  guide: {
    id: '00000000-0000-4000-8000-000000000201',
    email: 'made.wijaya@balistoryteller.com',
    fullName: 'I Made Wijaya',
    role: 'guide',
    guideId: 'g-made-wijaya',
    avatarUrl: '/images/guide-made.svg',
    isDemoSession: true,
  },
  admin: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'curator@balistoryteller.com',
    fullName: 'Sari Dewi (Platform Curator)',
    role: 'admin',
    avatarUrl: '/images/guide-ayu.svg',
    isDemoSession: true,
  },
};

export async function getServerSession(): Promise<SessionUser | null> {
  if (isSupabaseServerConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: profile }, { data: roles }, { data: guideProfile }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', user.id),
        supabase
          .from('guide_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

    const roleList = (roles ?? []).map((r) => r.role as AppRole);
    const resolvedRole: AppRole = roleList.includes('admin')
      ? 'admin'
      : roleList.includes('guide')
      ? 'guide'
      : 'customer';

    return {
      id: user.id,
      email: user.email ?? '',
      fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'Traveler',
      role: resolvedRole,
      guideId: guideProfile?.id,
      avatarUrl: profile?.avatar_url ?? undefined,
      isDemoSession: false,
    };
  }

  // Sandbox / Demo mode cookie session
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (
      parsed.role === 'customer' ||
      parsed.role === 'guide' ||
      parsed.role === 'admin'
    ) {
      const base = DEMO_USERS[parsed.role];
      return {
        ...base,
        email: parsed.email || base.email,
        fullName: parsed.fullName || base.fullName,
        guideId: parsed.guideId || base.guideId,
        isDemoSession: true,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function requireRole(allowed: AppRole[]): Promise<SessionUser | null> {
  const session = await getServerSession();
  if (!session) return null;
  if (!allowed.includes(session.role)) return null;
  return session;
}
