import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

let initialized = false;

function getWindow() {
  return typeof window !== "undefined" ? window : undefined;
}

export function initObservability() {
  if (initialized || !getWindow()) return;

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost =
    import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
  const appEnv = import.meta.env.MODE || "development";

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: appEnv,
      tracesSampleRate: 0.1,
    });
  }

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }

  initialized = true;
}

export function trackPageview(url: string) {
  if (!getWindow()) return;
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture("$pageview", { $current_url: url });
  }
}

export function identifyUser(userId: string, email: string | null | undefined) {
  if (!getWindow()) return;

  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.identify(userId, email ? { email } : undefined);
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email: email ?? undefined,
    });
  }
}

export function clearObservedUser() {
  if (!getWindow()) return;

  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.reset();
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

export function captureClientError(
  error: unknown,
  context?: Record<string, string>,
) {
  if (!getWindow() || !import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error, {
    tags: context,
  });
}
