---
name: bali-storyteller-product
description: Product architecture, guide-first marketplace model, user roles, booking lifecycle, verification & approval rules, commission & payout logic, and Supabase security requirements for Bali Storyteller.
---

# Bali Storyteller Product & Architecture Specification

## 1. Marketplace Business Model
**Tagline**: *DISCOVER BALI THROUGH LOCAL EYES*

Bali Storyteller is a **curated, guide-first cultural travel marketplace**. Unlike generic OTA tour catalogs, travelers discover **licensed, vetted Balinese guides first**—exploring their personal story, qualifications, languages, specialties, and destinations—before booking experiences led by that guide.

### Three Interconnected Applications
1. **Public Customer Website (`/`, `/guides`, `/experiences`, `/destinations`, `/booking/[id]`, `/account`, `/my-bookings`, etc.)**: Editorial discovery, guide profiles, curated experiences, multi-step booking flow, and traveler booking management.
2. **Admin Dashboard (`/admin`, `/admin/*`)**: Cirrel-inspired operations hub for guide verification, experience approval, booking oversight, configurable commission rates, payout approvals, analytics, and audit logs.
3. **Guide Dashboard (`/guide`, `/guide/*`)**: Mobile-first practical workspace for guides to manage booking requests, availability calendar, approved/proposed experiences, profile details, and read-only earnings/payout history.

## 2. User Roles & Authorization Rules
Three strict roles stored in `user_roles` / `profiles`:
- **`customer`**: Can browse published guides/experiences, submit & view their own bookings, leave reviews on completed bookings, manage their own profile. Cannot access `/admin` or `/guide`.
- **`guide`**: Can manage their own `guide_profiles`, `guide_availability`, view bookings assigned to them, accept/decline pending requests per platform rules, propose new experiences (unpublished until admin approval), and view their own earnings/payouts. Cannot edit financial records, commission percentages, or verification badges, and cannot view other guides' private data.
- **`admin`**: Full platform oversight—approve/suspend guides, verify credentials (`guide_documents`), publish/archive experiences, manage all bookings with audit trail, configure commission percentages, approve/record payouts.

### Security & RLS Enforcement
- Server-side authorization checks in Next.js Route Handlers / Server Actions / middleware + Supabase Row-Level Security (RLS).
- Never rely solely on hiding navigation links.
- Public visitors only see `status = 'approved'` guides and `status = 'published'` experiences.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or payment secrets to client bundles.

## 3. Guide Verification & Experience Approval Workflow
1. Prospective guide applies via `/become-a-guide` or registers and submits `guide_profiles` + `guide_documents` (HPI / Bali Tourism License, ID, certifications).
2. Status starts as `pending_review`. Guide is NOT publicly visible.
3. Admin reviews documents in `/admin` (Guide Verification queue) and transitions guide to `approved`, `rejected`, or `suspended`.
4. Experiences: Guides can propose experiences (`status = 'pending_approval'`), or Admins can create/assign experiences (`status = 'published'`). Only `published` experiences associated with `approved` guides appear publicly.

## 4. Booking Workflow & Statuses
Supported booking types:
- `hourly` (Hourly guide hire)
- `full_day` (Full-day guide hire)
- `curated_experience` (Curated cultural experience)
- `custom_itinerary` (Custom itinerary request)

### Booking Steps
1. Select Guide -> 2. Select Experience or Guide Service -> 3. Choose Date -> 4. Select Duration -> 5. Choose Language -> 6. Select Guests -> 7. Enter Customer Details -> 8. Review Summary -> 9. Submit Booking Request -> 10. Confirmation / Pending Status.

### Server-Side Rules
- **Availability check**: Reject overlapping `confirmed` bookings or `blocked` dates in `guide_availability`.
- **No blind auto-confirmation**: Requests enter `pending` status until availability, guide rules, and payment/test-checkout checks pass.
- **Price Snapshot**: Store `unit_price_snapshot`, `subtotal_snapshot`, `commission_rate_snapshot`, `commission_amount_snapshot`, and `guide_earnings_snapshot` on the `bookings` / `commissions` record at booking creation time so later rate edits never mutate historical transactions.
- **Booking Statuses**: `pending`, `confirmed`, `completed`, `cancelled`, `refunded`.

## 5. Commissions, Earnings & Payouts
- **Configurable Commission**: Platform commission percentage is stored in `platform_settings` / `commissions` config (never hardcoded in financial formulas; e.g., default 18% configurable by Admin).
- **Financial Ledger**:
  - `gross_amount` = total booking charge
  - `commission_amount` = `round(gross_amount * commission_rate_snapshot)`
  - `guide_net_amount` = `gross_amount - commission_amount`
- **Auditability**: Every manual booking status override, commission rate change, refund, adjustment, and payout approval writes an immutable row to `audit_logs` (`actor_id`, `action`, `entity_type`, `entity_id`, `previous_state`, `new_state`, `reason`, `created_at`).
- **Demo / Test Mode Separation**: When live Supabase env vars or payment gateway keys are absent, clearly label demo/sandbox mode in UI and separate demo seed data from live authenticated records.
