# In-Progress Work

> **Metadata**
> - last-updated-by: fix-build
> - last-verified-against-code: 2026-07-05

**Status:** Complete — Fix Build completed.

**Fixes Applied:**
1. `lib/auth.ts` — Added `secret` and `baseURL` from `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` env vars with dev fallbacks — resolves Better Auth default secret error during Vercel static generation
2. `components/booking/BookingDrawer.tsx` — Fixed `window as Record<string, unknown>` TypeScript error with `window as unknown as Record<string, unknown>` double-cast
3. `package.json` — Updated `next` from `^15.3.1` to `^15.5.20` — resolves CVE-2025-66478 (critical RCE vulnerability) that was blocking Vercel deployment

**Build Status:** ✅ Clean build — 33 pages, middleware, zero errors/warnings. Next.js 15.5.20.
