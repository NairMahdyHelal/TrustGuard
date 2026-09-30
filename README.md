# TrustGuard AI

TrustGuard is a pre-transaction scam-risk checker. It combines deterministic checks with an optional AI assessment to help people pause and verify a recipient, payment request, message, or linked website before sending money.

## What problem is this solving?

Scam requests often combine urgency, secrecy, impersonation, suspicious links, and irreversible payment methods. TrustGuard brings those clues into one review and presents a risk verdict, supporting signals, and practical next steps before a transaction is made.

## What did Nair build?

- An authenticated scanner for recipient details, payment amount and channel, message text, and an optional website.
- A heuristic analysis layer that identifies language, payment-behaviour, wallet-format, and website signals.
- An optional AI assessment that returns a risk score, confidence, explanation, scam archetype, red flags, and recommended actions.
- Supabase-backed authentication and scan records, plus a restricted audit dashboard for allowlisted administrators.
- Privacy, terms, and AI-disclosure pages, with optional analytics, error reporting, and rate limiting.

## How does it work?

1. A user signs in through Supabase and submits transaction context through the scanner.
2. The client computes a deterministic baseline score. The server validates the request, requires authentication, and applies rate limiting to non-admin users when Upstash Redis is configured.
3. When `LOVABLE_API_KEY` is configured, the server asks the Lovable AI gateway to run Gemini 2.5 Flash and blends its assessment with the heuristic result. If the gateway is unavailable or unconfigured, the scanner falls back to the deterministic assessment.
4. The scan result is saved to Supabase and shown with a verdict and recommended actions.

**Prototype limitation:** wallet age, scam reports, mixer history, and some domain-reputation signals in the current heuristic implementation are simulated from the input string. They are not live blockchain or domain-intelligence lookups. Results are estimates, not guarantees or financial advice.

## What technologies are used?

- **App:** React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS, Radix UI, and TanStack Query.
- **Analysis:** deterministic TypeScript heuristics, the AI SDK, and the Lovable AI gateway using Gemini 2.5 Flash.
- **Authentication and storage:** Supabase Auth and Supabase database.
- **Validation and operations:** Zod, optional Upstash Redis rate limiting, Sentry error reporting, and PostHog analytics.

## How do I run it?

Requirements: Node.js and npm (or Bun). Create a Supabase project and configure its authentication redirect URLs for your local app.

```bash
npm install
npm run dev
```

Open [http://localhost:4173](http://localhost:4173) (the configured Vite port). The app needs Supabase configuration to use authentication and protected scan routes. Create a local `.env` file with the appropriate project values:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
LOVABLE_API_KEY=your-lovable-ai-gateway-key
```

The `VITE_` Supabase values are client-visible publishable configuration. **Never** put `SUPABASE_SERVICE_ROLE_KEY` or other secrets in a `VITE_` variable or commit them. `LOVABLE_API_KEY` enables the AI layer; without it, deterministic fallback analysis is used. Upstash, Sentry, and PostHog settings are optional; see [DEPLOYMENT_NOTES.md](DEPLOYMENT_NOTES.md) for their variable names and deployment configuration.

## What would Nair improve next?

- Replace simulated wallet and domain-reputation values with documented, reliable threat-intelligence sources and show when a signal is unavailable.
- Build a labelled test set to measure false positives, false negatives, and score calibration across different scam types and payment channels.
- Add automated tests for the full authenticated scan flow, AI fallback, persistence, and access control.
- Make setup reproducible with a checked-in environment template and documented Supabase migration/bootstrap steps.
- Explain the limits of each signal in the interface so users can distinguish measured evidence from heuristic estimates.