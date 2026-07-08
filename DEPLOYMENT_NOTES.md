# Deployment Notes

## Email

This app already uses Supabase Auth for email sign-in/sign-up and confirmation emails.

Required env vars:

```env
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Rules:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Never expose the service role key as a `VITE_*` variable.
- Google OAuth settings belong in the Supabase dashboard, not in client code.

Current admin access is restricted in code by email allowlist in:

- `src/lib/admin-access.ts`

## DNS

DNS is not handled inside this repo. It must be configured where the domain is managed.

Typical production flow:

1. Deploy the app to Vercel, Netlify, or Render.
2. Copy the deployment target domain they provide.
3. In your DNS provider, add the required records:
   - `A` record or `CNAME`
   - optional `www` record
4. In Supabase Auth settings, add the final production URL:
   - Site URL
   - Redirect URLs
5. In Google OAuth, add the production origin and redirect URL.

## Before Production

Update these to your real production URL:

- Supabase `Site URL`
- Supabase `Redirect URLs`
- Google OAuth authorized origins
- Google OAuth redirect URI

## Analytics And Error Tracking

This repo now supports:

- PostHog client analytics
- Sentry client error tracking
- Upstash Redis-backed server rate limiting

Set these env vars to enable them:

```env
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

If the keys are blank, tracking stays disabled.

If the Redis keys are blank, scan rate limiting is bypassed.

## Rate Limiting

- Allowlisted admin emails bypass scan rate limits for testing.
- Non-admin signed-in users are limited to `25` scan analysis requests per hour.
- Redis is optional. Without Upstash keys, the limiter is bypassed.

## Deployment Guide

1. Choose a host such as Vercel, Netlify, or Render.
2. Add production environment variables in the host dashboard.
3. Deploy the app.
4. Copy the deployed URL.
5. In Supabase Auth:
   - set `Site URL` to the deployed URL
   - add the deployed URL to `Redirect URLs`
6. In Google OAuth:
   - add the deployed origin to authorized origins
   - keep Google's redirect URI set to Supabase's callback URL for Supabase OAuth
7. Test:
   - email sign-in
   - Google sign-in
   - scan submission
   - admin dashboard with allowlisted email
   - analytics/events if PostHog is configured
   - captured client error if Sentry is configured

## Key Checklist

From your screenshot list:

- `GEMINI_API_KEY`
  Not used directly in this app right now.
  The code currently looks for `LOVABLE_API_KEY` instead.

- `SUPABASE_URL`
  Required.

- `SUPABASE_ANON_KEY`
  Required in concept, but this project uses the newer publishable-key naming:
  - `SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

- `SUPABASE_SERVICE_ROLE_KEY`
  Required for server-side admin operations.
  Never expose it as a `VITE_*` variable.

- `DATABASE_URL`
  Not currently needed by this codebase.
  The app talks to Supabase through the Supabase client, not through direct Postgres connections.

- `JWT_SECRET`
  Not currently needed by this codebase.
  Auth is handled by Supabase.

- `SENTRY_DSN`
  Optional, but in this app the client-side env name is:
  - `VITE_SENTRY_DSN`

## Security Checklist Mapping

- `API key hidden`
  Yes, as long as `.env` and `env` are not shared and no secret is stored in `VITE_*`.

- `.env ignored`
  Added now in `gitignore`.

- `HTTPS enabled`
  Depends on your deployment platform. Vercel/Netlify/Render usually handle this automatically.

- `Rate limiting enabled`
  Yes for non-admin users if Upstash Redis is configured.

- `Input validation`
  Yes. The scan server function validates inputs with `zod`.

- `SQL injection protection`
  Reasonably yes. This app uses Supabase client queries rather than raw SQL string building in app code.

- `Prompt injection protection`
  Yes. The AI prompt explicitly treats user content as untrusted and strips trusted-tag collisions.

- `Authentication works`
  Yes, via Supabase Auth, assuming env vars and provider settings are correct.

- `Passwords hashed`
  Yes, handled by Supabase Auth rather than custom password storage in app code.

- `No console secrets`
  Mostly yes after removing exposed `VITE_SUPABASE_SERVICE_ROLE_KEY`; do not log secrets manually.
