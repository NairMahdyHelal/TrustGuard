import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin-access";
import { LogOut, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let live = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!live) return;
      const nextEmail = data.user?.email ?? null;
      setEmail(nextEmail);
      setIsAdmin(isAdminEmail(nextEmail));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const nextEmail = session?.user?.email ?? null;
      setEmail(nextEmail);
      setIsAdmin(isAdminEmail(nextEmail));
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`transition-colors hover:text-foreground ${pathname === to ? "text-foreground" : "text-muted-foreground"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <ShieldCheck className="size-5" strokeWidth={1.5} />
          <span className="font-serif text-2xl italic">TrustGuard AI</span>
          <span className="hidden rounded bg-stone-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-stone-600 sm:inline-block">
            v2.4
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          {email && isAdmin && <NavLink to="/admin" label="Admin" />}
          <NavLink to="/terms" label="Terms" />
          <NavLink to="/privacy" label="Privacy" />
          <span className="hidden text-stone-300 sm:inline">|</span>
          {email ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {email}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
