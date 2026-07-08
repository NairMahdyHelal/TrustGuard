import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="font-serif text-xl italic">TrustGuard AI</div>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Pre-transaction trust engine. Operated by Nair Mahdy. Not a bank,
              broker, or regulated financial institution. Information provided
              is for general guidance and does not constitute financial, legal,
              or investment advice.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-3">Legal</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-foreground text-muted-foreground"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-foreground text-muted-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Account</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/auth"
                  className="hover:text-foreground text-muted-foreground"
                >
                  Sign in / Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-4 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Nair Mahdy. All rights reserved.
          </span>
          <span>FTC + UK AI transparency compliant · Advisory tool only</span>
        </div>
      </div>
    </footer>
  );
}
