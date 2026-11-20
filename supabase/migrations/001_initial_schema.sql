
-- ============================================================================
-- BALI STORYTELLER — NORMALIZED POSTGRESQL / SUPABASE SCHEMA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('customer', 'guide', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE guide_approval_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE experience_status AS ENUM ('draft', 'pending_approval', 'published', 'unpublished', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('hourly', 'full_day', 'curated_experience', 'custom_itinerary');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('requested', 'approved', 'processing', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'blocked', 'booked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. PROFILES & USER ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  country TEXT,
  preferred_language TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ----------------------------------------------------------------------------
-- 3. PLATFORM SETTINGS (DYNAMIC COMMISSION CONFIG, ETC.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.platform_settings (key, value, description)
VALUES
  ('default_commission_rate', '{"rate": 0.18}'::jsonb, 'Default marketplace commission percentage (0.18 = 18%)'),
  ('currency', '{"code": "USD", "symbol": "$"}'::jsonb, 'Primary display and settlement currency'),
  ('booking_policy', '{"auto_confirm": false, "cancellation_window_hours": 48}'::jsonb, 'Platform booking and cancellation rules')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. DESTINATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  cultural_notes TEXT,
  cover_image_url TEXT NOT NULL,
  best_time_to_visit TEXT,
  highlights TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. GUIDE PROFILES, DOCUMENTS, LANGUAGES, SPECIALTIES & AVAILABILITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guide_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  biography TEXT NOT NULL,
  personal_story TEXT,
  location_base TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 1,
  license_number TEXT,
  qualifications TEXT[] DEFAULT '{}',
  destinations_covered TEXT[] DEFAULT '{}',
  hourly_rate_usd NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  full_day_rate_usd NUMERIC(10,2) NOT NULL DEFAULT 145.00,
  starting_price_usd NUMERIC(10,2) NOT NULL DEFAULT 110.00,
  commission_rate_override NUMERIC(5,4), -- Optional per-guide commission override
  profile_photo_url TEXT NOT NULL,
  intro_video_url TEXT,
  available_from DATE,
  available_until DATE,
  gallery_urls TEXT[] DEFAULT '{}',
  approval_status guide_approval_status NOT NULL DEFAULT 'pending_review',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  completed_tours_count INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guide_profiles_approval ON public.guide_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_guide_profiles_slug ON public.guide_profiles(slug);

CREATE TABLE IF NOT EXISTS public.guide_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'hpi_license', 'national_id', 'certification', 'insurance'
  document_title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guide_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL DEFAULT 'Fluent', -- 'Native', 'Fluent', 'Conversational'
  UNIQUE(guide_id, language)
);

CREATE TABLE IF NOT EXISTS public.guide_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  UNIQUE(guide_id, specialty)
);

CREATE TABLE IF NOT EXISTS public.guide_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status NOT NULL DEFAULT 'available',
  start_time TIME NOT NULL DEFAULT '08:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guide_id, date)
);

CREATE INDEX IF NOT EXISTS idx_guide_availability_lookup ON public.guide_availability(guide_id, date, status);

-- ----------------------------------------------------------------------------
-- 6. EXPERIENCES, ITINERARIES, STOPS & GUIDE ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  location_name TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  introduction TEXT NOT NULL,
  duration_hours NUMERIC(4,1) NOT NULL DEFAULT 6.0,
  duration_label TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 6,
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  meeting_point TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}',
  status experience_status NOT NULL DEFAULT 'pending_approval',
  proposed_by_guide_id UUID REFERENCES public.guide_profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_status ON public.experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);

CREATE TABLE IF NOT EXISTS public.experience_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  overview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.itinerary_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.experience_itineraries(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  time_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS public.experience_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  custom_price_usd NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(experience_id, guide_id)
);

-- ----------------------------------------------------------------------------
-- 7. BOOKINGS, GUESTS, PAYMENTS, COMMISSIONS, EARNINGS & PAYOUTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE RESTRICT,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  booking_type booking_type NOT NULL DEFAULT 'curated_experience',
  booking_date DATE NOT NULL,
  start_time TIME DEFAULT '08:30:00',
  duration_hours NUMERIC(4,1) NOT NULL DEFAULT 6.0,
  preferred_language TEXT NOT NULL DEFAULT 'English',
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  special_requests TEXT,
  custom_itinerary_notes TEXT,
  -- Immutable Price & Commission Snapshots at Purchase Time
  unit_price_snapshot NUMERIC(10,2) NOT NULL,
  subtotal_snapshot NUMERIC(10,2) NOT NULL,
  commission_rate_snapshot NUMERIC(5,4) NOT NULL,
  commission_amount_snapshot NUMERIC(10,2) NOT NULL,
  guide_earnings_snapshot NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide_date ON public.bookings(guide_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE TABLE IF NOT EXISTS public.booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  dietary_notes TEXT,
  age_group TEXT DEFAULT 'Adult'
);

CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'sandbox_checkout',
  provider_payment_id TEXT,
  amount_usd NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  webhook_verified BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  gross_amount_usd NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL,
  commission_amount_usd NUMERIC(10,2) NOT NULL,
  adjustment_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  refunded_amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'settled', 'refunded'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE RESTRICT,
  amount_usd NUMERIC(10,2) NOT NULL CHECK (amount_usd > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status payout_status NOT NULL DEFAULT 'requested',
  bank_name TEXT,
  account_holder TEXT,
  account_last4 TEXT,
  payment_reference TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guide_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  gross_amount_usd NUMERIC(10,2) NOT NULL,
  commission_amount_usd NUMERIC(10,2) NOT NULL,
  net_amount_usd NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'available', 'paid', 'reversed'
  payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. REVIEWS, NOTIFICATIONS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_origin TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'system', -- 'booking', 'payout', 'verification', 'message'
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role app_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 9. SECURITY HELPERS & ROW-LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(target_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = target_role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_guide_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.guide_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Approved guides, published experiences, destinations, reviews)
CREATE POLICY "Public destinations read" ON public.destinations FOR SELECT USING (TRUE);
CREATE POLICY "Public approved guides read" ON public.guide_profiles FOR SELECT
  USING (approval_status = 'approved' OR user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Public guide languages read" ON public.guide_languages FOR SELECT USING (TRUE);
CREATE POLICY "Public guide specialties read" ON public.guide_specialties FOR SELECT USING (TRUE);
CREATE POLICY "Public guide availability read" ON public.guide_availability FOR SELECT USING (TRUE);
CREATE POLICY "Public published experiences read" ON public.experiences FOR SELECT
  USING (status = 'published' OR proposed_by_guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Public itineraries read" ON public.experience_itineraries FOR SELECT USING (TRUE);
CREATE POLICY "Public stops read" ON public.itinerary_stops FOR SELECT USING (TRUE);
CREATE POLICY "Public experience_guides read" ON public.experience_guides FOR SELECT USING (TRUE);
CREATE POLICY "Public published reviews read" ON public.reviews FOR SELECT USING (is_published = TRUE OR public.has_role('admin'));

-- Profiles & Roles
CREATE POLICY "Own profile read or admin" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Own roles read or admin" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL
  USING (public.has_role('admin'));

-- Guide Documents (Private to owning guide & admins)
CREATE POLICY "Guide own docs or admin" ON public.guide_documents FOR SELECT
  USING (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Guide insert own docs" ON public.guide_documents FOR INSERT
  WITH CHECK (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Admin review docs" ON public.guide_documents FOR UPDATE
  USING (public.has_role('admin'));

-- Guide Profile Updates (Guides cannot change approval_status or is_verified via client; enforced by trigger or API)
CREATE POLICY "Guide update own profile" ON public.guide_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Guide manage own availability" ON public.guide_availability FOR ALL
  USING (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Guide propose experience" ON public.experiences FOR INSERT
  WITH CHECK (proposed_by_guide_id = public.current_guide_id() OR public.has_role('admin'));

-- Bookings & Guests
CREATE POLICY "Bookings scoped read" ON public.bookings FOR SELECT
  USING (customer_id = auth.uid() OR guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Authenticated create booking" ON public.bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Scoped booking update" ON public.bookings FOR UPDATE
  USING (guide_id = public.current_guide_id() OR public.has_role('admin') OR customer_id = auth.uid());

-- Financials (Read-only for guides on own records; Admin full access)
CREATE POLICY "Commissions admin only" ON public.commissions FOR ALL
  USING (public.has_role('admin'));
CREATE POLICY "Guide earnings scoped read" ON public.guide_earnings FOR SELECT
  USING (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Guide earnings admin write" ON public.guide_earnings FOR ALL
  USING (public.has_role('admin'));
CREATE POLICY "Payouts scoped read" ON public.payouts FOR SELECT
  USING (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Guide request payout" ON public.payouts FOR INSERT
  WITH CHECK (guide_id = public.current_guide_id() OR public.has_role('admin'));
CREATE POLICY "Admin manage payouts" ON public.payouts FOR UPDATE
  USING (public.has_role('admin'));

-- Platform Settings, Notifications, Audit Logs
CREATE POLICY "Settings read" ON public.platform_settings FOR SELECT USING (TRUE);
CREATE POLICY "Settings admin write" ON public.platform_settings FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY "Audit logs admin read" ON public.audit_logs FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Audit logs insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
