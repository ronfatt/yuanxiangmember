# MetaEnergy (元象) Membership + Referral + Points MVP

Next.js App Router MVP for member auth, referral commissions, keep-alive resets, points, and simple frequency tools.

## Stack

- Next.js 14 App Router
- Supabase Auth + Postgres
- Tailwind CSS
- Vercel deployment target

## Environment

Copy [`.env.example`](/Users/rms/Desktop/元像/yuanxiang%20app/.env.example) to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL_ALLOWLIST`
- `CRON_SECRET`

## Database setup

Run the Supabase SQL migrations in order:

1. [`supabase/migrations/0001_init.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0001_init.sql)
2. [`supabase/migrations/0002_metaenergy_mvp.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0002_metaenergy_mvp.sql)

`0002_metaenergy_mvp.sql` adds:

- `users_profile`
- `referral_orders`
- `points_ledger`
- `monthly_stats`
- `frequency_reports`
- `weekly_reminders`
- `orders` extensions for `amount_total`, `cash_paid`, and `points_redeemed`
- updated `handle_new_user()` trigger logic for profile bootstrap + referral linking

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth and referral flow

- Visit `/r/[code]` to store the `ref_code` cookie and redirect to registration.
- Register on `/register`; the signup payload passes the referral code in auth metadata.
- The Supabase trigger creates both `public.users` and `public.users_profile`, generates a unique referral code, and links `referred_by` when the code exists.

## API routes

- `POST /api/orders/create`
  - Admin-only via Supabase session and `ADMIN_EMAIL_ALLOWLIST` or `admin_roles`
  - Creates a paid order, handles point redemption/earning, updates monthly stats, and credits referral commission using the referrer tier before this order
- `POST /api/frequency/generate`
  - Authenticated member route
  - Builds and stores a simple birthday-based frequency report
- `POST /api/reminder/generate`
  - Authenticated member route
  - Generates or updates the current week reminder
- `POST /api/points/redeem`
  - Authenticated simulator route for redemption cap and cash-required preview
- `POST /api/cron/keepalive`
  - Protected by `CRON_SECRET` in `Authorization: Bearer ...` or `x-cron-secret`
  - Checks the previous month, updates `monthly_stats`, increments strikes, and resets tier progress after 2 consecutive sub-RM50 months

## Business rules implemented

- Referral tier thresholds:
  - `< RM1000` => `0%`
  - `>= RM1000` => `15%`
  - `>= RM3000` => `20%`
  - `>= RM10000` => `25%`
- Strict non-retroactive commission:
  - commission rate is read before the new referred order updates cumulative sales
  - the order that crosses a threshold still uses the old rate
- Points:
  - 10 points earned for each full RM100 of cash paid
  - 1 point = RM0.10
  - redemption is capped at 50% of order total

## Dashboard routes

- `/dashboard`
- `/dashboard/referrals`
- `/dashboard/points`
- `/dashboard/frequency`
- `/admin/orders`

## Vercel deployment

1. Create a Supabase project and run both migrations.
2. Add the environment variables in Vercel.
3. Deploy the repository to Vercel.
4. Create a Vercel cron or external scheduler that `POST`s to `/api/cron/keepalive` with `CRON_SECRET`.

## Notes

- This workspace already contained a legacy `orders` table, so the MVP migration extends that table instead of dropping it.
- Admin creation currently uses the Supabase service role in the route handler for simplicity and predictable writes.
