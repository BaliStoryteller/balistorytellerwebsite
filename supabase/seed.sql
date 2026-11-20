-- ============================================================================
-- BALI STORYTELLER — REFERENCE SEED DATA (DESTINATIONS, CATEGORIES, SETTINGS)
-- Note: Guide profiles & bookings referencing auth.users should be linked
-- after creating Auth users in Supabase or via the Admin onboarding flow.
-- ============================================================================

INSERT INTO public.destinations (slug, name, region, tagline, description, cultural_notes, cover_image_url, best_time_to_visit, highlights, is_featured)
VALUES
  (
    'ubud',
    'Ubud & Keliki',
    'Central Highlands',
    'Sacred river valleys, royal heritage & living arts',
    'Beyond its famed artisan lanes, Ubud is a spiritual heartland of centuries-old water temples, royal family compounds, and quiet subak rice-irrigation cooperatives.',
    'Respectful temple dress (sarong and sash) is required across all royal and village shrines; morning visits reveal daily canang sari offerings before crowds arrive.',
    '/images/dest-ubud.png',
    'April – October (Dry season mornings)',
    ARRAY['Royal Puri Saren heritage', 'Subak irrigation walks', 'Traditional woodcarving villages', 'Sacred Campuhan ridge'],
    TRUE
  ),
  (
    'sidemen',
    'Sidemen Valley',
    'East Bali',
    'Emerald terraces beneath Mount Agung’s quiet gaze',
    'A serene amphitheatre of emerald rice paddies, handloom songket weavers, and bamboo river pavilions where Bali’s agrarian rhythm remains unhurried.',
    'Sidemen honors deep reverence toward Mount Agung; local guides introduce visitors directly to family weaving looms and palm-sugar harvesters.',
    '/images/dest-sidemen.png',
    'May – September (Clear Mount Agung views)',
    ARRAY['Endek & Songket weaving', 'Subak valley trekking', 'Mount Agung sunrise', 'Artisanal arak & palm sugar'],
    TRUE
  ),
  (
    'uluwatu',
    'Uluwatu & Bukit',
    'Southern Peninsula',
    'Limestone sea cliffs, ocean temples & ancient chants',
    'Towering limestone bluffs over the Indian Ocean crowned by Pura Luhur Uluwatu, one of Bali’s six directional sea temples.',
    'Learn the cosmological significance of Dang Hyang Nirartha’s cliffside sanctuary and the storytelling behind sunset Kecak fire dances.',
    '/images/dest-uluwatu.png',
    'April – November (Golden cliffside sunsets)',
    ARRAY['Pura Luhur sea sanctuary', 'Cliffside coastal trails', 'Kecak cultural narration', 'Hidden limestone coves'],
    TRUE
  ),
  (
    'munduk-north',
    'Munduk & North Bali',
    'Northern Lakes & Highlands',
    'Misty clove ridges, crater lakes & hidden canyons',
    'Cool highland ridges scented with clove and wild coffee, cascading canyon waterfalls, and twin caldera lakes steeped in royal Buleleng history.',
    'Highland villages preserve ancient Bali Aga heritage and ceremonial lake traditions centered around Pura Ulun Danu Beratan.',
    '/images/exp-waterfall.png',
    'June – September (Crisp mountain air)',
    ARRAY['Sekumpul & Banyumala falls', 'Heirloom coffee roasting', 'Lake Tamblingan canoes', 'Bali Aga heritage'],
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  cover_image_url = EXCLUDED.cover_image_url,
  is_featured = EXCLUDED.is_featured;
