import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  ScanLine,
  Brain,
  Wallet,
  Globe,
  MessageSquare,
  FileText,
  Lock,
  Eye,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AiDisclosureBanner } from "@/components/AiDisclosureBanner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSignedIn(!!s),
    );
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const ctaTo = signedIn ? "/scan" : "/auth";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
            <div className="grid gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <div className="eyebrow mb-6">
                  Vol. I · Issue 01 · Pre-transaction trust journal
                </div>
                <h1 className="font-serif text-[44px] leading-[1.05] italic tracking-tight sm:text-6xl md:text-7xl">
                  Know{" "}
                  <span className="not-italic underline decoration-stone-300 decoration-[3px] underline-offset-[10px]">
                    before
                  </span>{" "}
                  you send.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-700 md:text-lg">
                  TrustGuard AI is a pre-transaction trust engine. It analyses
                  the message, the recipient, the website and the wallet — and
                  tells you in plain English whether the request is likely safe,
                  suspicious, or a scam in progress.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to={ctaTo}
                    className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-stone-50 hover:bg-stone-800"
                  >
                    <ScanLine className="size-4" />{" "}
                    {signedIn ? "Open scanner" : "Sign in to scan"}{" "}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/terms"
                    className="inline-flex items-center gap-2 border border-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-stone-900 hover:text-stone-50"
                  >
                    <FileText className="size-4" /> Read the terms
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="size-3.5" /> Auth-gated scanner
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" /> Explainable AI
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> FTC + UK AI compliant
                  </span>
                </div>
              </div>

              <aside className="md:col-span-5">
                <div className="paper p-6">
                  <div className="eyebrow mb-3">Today's verdict sample</div>
                  <div className="font-serif text-3xl italic leading-tight">
                    "This appears to be a pig-butchering investment scam."
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t border-stone-200 pt-4">
                    <div>
                      <div className="eyebrow">Trust score</div>
                      <div className="num text-5xl font-medium tabular-nums">
                        12
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="eyebrow">Confidence</div>
                      <div className="num text-2xl tabular-nums">94%</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-6 flex-1 ${i < 3 ? "bg-emerald-700" : i < 10 ? "bg-amber-700" : "bg-rose-700"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-stone-500">
                    <span>Safe</span>
                    <span>Suspect</span>
                    <span>Critical</span>
                  </div>
                </div>
                <div className="mt-3">
                  <AiDisclosureBanner />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="eyebrow mb-3">Methodology</div>
                <h2 className="font-serif text-4xl italic">
                  Five layers, one verdict.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">
                  Each pending transaction is scored across five independent
                  layers, then reasoned over by a large language model. Every
                  signal is treated as <em>data</em> — never as instructions.
                </p>
              </div>
              <div className="md:col-span-8 grid gap-px bg-stone-200 sm:grid-cols-2">
                {LAYERS.map((l, i) => (
                  <div key={l.title} className="bg-card p-5">
                    <div className="flex items-center gap-2 text-stone-500">
                      <span className="num text-xs">0{i + 1}</span>
                      <l.icon className="size-4" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-2 font-serif text-xl">{l.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {l.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMPLIANCE STRIP */}
        <section className="border-b border-border bg-stone-100">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="eyebrow mb-2">Compliance</div>
                <h3 className="font-serif text-2xl">FTC & UK AI disclosure</h3>
                <p className="mt-2 text-xs text-stone-700">
                  All outputs are generative AI estimates, disclosed at point of
                  use. Operator: Nair Mahdy.
                </p>
              </div>
              <div>
                <div className="eyebrow mb-2">Privacy</div>
                <h3 className="font-serif text-2xl">Nutrition-label privacy</h3>
                <p className="mt-2 text-xs text-stone-700">
                  A one-page label showing what we collect, why, and what we
                  never store.{" "}
                  <Link to="/privacy" className="underline">
                    Read the label →
                  </Link>
                </p>
              </div>
              <div>
                <div className="eyebrow mb-2">User content</div>
                <h3 className="font-serif text-2xl">No-UGC-liability policy</h3>
                <p className="mt-2 text-xs text-stone-700">
                  User-submitted scan content is private to your account and is
                  not republished. See the UGC clause in the{" "}
                  <Link to="/terms" className="underline">
                    Terms
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const LAYERS = [
  {
    icon: MessageSquare,
    title: "Language & intent",
    body: "Detects urgency, fear, greed, secrecy and coercion patterns in the message.",
  },
  {
    icon: ScanLine,
    title: "Behavioural",
    body: "Cross-references transaction archetypes — recovery, romance, pig-butchering, advance-fee.",
  },
  {
    icon: Wallet,
    title: "Wallet & blockchain",
    body: "Inspects destination wallet age, mixer history and AML risk indicators.",
  },
  {
    icon: Globe,
    title: "Website & social",
    body: "Domain age, SSL, brand impersonation and typosquatting checks.",
  },
  {
    icon: Brain,
    title: "LLM reasoning",
    body: "A final verdict in plain English, with confidence and recommended actions.",
  },
];
