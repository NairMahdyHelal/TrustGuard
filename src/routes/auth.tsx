import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AiDisclosureBanner } from "@/components/AiDisclosureBanner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const authSearchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign in - TrustGuard AI" },
      {
        name: "description",
        content: "Sign in or create a TrustGuard AI account to run scans.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: rawMode } = Route.useSearch();
  const mode = rawMode ?? "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  const authRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth`
      : "http://localhost:4173/auth";
  const googleHref = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(authRedirectTo)}`;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) return;
        if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;

        await router.invalidate();
        navigate({ to: "/" });
      },
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [navigate, router]);

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: authRedirectTo,
          },
        });
        if (error) throw error;

        if (data.session) {
          toast.success("Account created. You're signed in.");
          await router.invalidate();
          navigate({ to: "/" });
          return;
        }

        toast.success("Account created. Check your email to confirm sign-in.");
        setPassword("");
        navigate({
          to: "/auth",
          search: { mode: "signin" },
          replace: true,
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      await router.invalidate();
      navigate({ to: "/" });
    } catch (err) {
      const authError = err as { message?: string };
      toast.error(authError.message || "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-md px-4 py-12 md:py-20">
        <AiDisclosureBanner />
        <div className="paper mt-6 p-6 md:p-8">
          <div className="mb-6 flex rounded-md border border-border p-1">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className={cn(
                "flex-1 rounded-sm px-3 py-2 text-center text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className={cn(
                "flex-1 rounded-sm px-3 py-2 text-center text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Create account
            </Link>
          </div>

          <h1 className="mb-1 font-serif text-3xl italic">
            {mode === "signup" ? "Create account" : "Sign in"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Create an account to save scan history and come back to it later."
              : "Required to run scans. Scans are tied to your account so you can review history and so administrators can audit misuse."}
          </p>

          <a
            href={googleHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mb-4 w-full",
              busy && "pointer-events-none opacity-50",
            )}
          >
            Continue with Google
          </a>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-card px-2 text-muted-foreground">
                or email
              </span>
            </div>
          </div>

          <form onSubmit={emailSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Working..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          <Link
            to="/auth"
            search={{ mode: mode === "signup" ? "signin" : "signup" }}
            className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "No account? Create one"}
          </Link>

          <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground">
            By continuing you agree to the{" "}
            <Link to="/terms" className="underline">
              Terms &amp; Conditions
            </Link>{" "}
            (including the binding arbitration clause) and acknowledge the{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
