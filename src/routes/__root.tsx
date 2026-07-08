import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import {
  captureClientError,
  clearObservedUser,
  identifyUser,
  initObservability,
  trackPageview,
} from "../lib/observability";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    captureClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Refresh or head back to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { title: "TrustGuard AI — Know before you send" },
        {
          name: "description",
          content:
            "Pre-transaction AI trust engine. Check payments, wallets, links, and messages for scams before money leaves your account.",
        },
        { name: "author", content: "Nair Mahdy" },
        { name: "theme-color", content: "#F9F8F6" },
        {
          property: "og:title",
          content: "TrustGuard AI — Know before you send",
        },
        {
          property: "og:description",
          content:
            "Pre-transaction AI trust engine for scam, phishing and fraud detection.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    initObservability();
  }, []);

  useEffect(() => {
    trackPageview(href);
  }, [href]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        identifyUser(data.user.id, data.user.email ?? null);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      )
        return;
      if (session?.user) {
        identifyUser(session.user.id, session.user.email ?? null);
      } else {
        clearObservedUser();
      }
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
