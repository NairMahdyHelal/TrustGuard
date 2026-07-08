import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — TrustGuard AI" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 md:px-8 md:py-16">
        <div className="eyebrow mb-3">Legal · Privacy</div>
        <h1 className="font-serif text-5xl italic">Privacy Policy</h1>
        <p className="mt-4 text-sm text-stone-600">
          Operated by <strong>Nair Mahdy</strong>. This policy explains what we
          collect, why, and what we never do with your data.
        </p>

        {/* Nutrition Label */}
        <div className="paper mt-8 p-0 overflow-hidden">
          <div className="border-b-4 border-stone-900 p-4">
            <div className="eyebrow">Privacy nutrition label</div>
            <div className="font-serif text-3xl italic">At a glance</div>
            <div className="num text-xs text-stone-600 mt-1">
              v1.0 ·{" "}
              {new Date().toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <NutritionRow
            label="Email address"
            purpose="Authentication, account access"
            stored
            shared={false}
          />
          <NutritionRow
            label="Hashed password (if email signup)"
            purpose="Authentication"
            stored
            shared={false}
          />
          <NutritionRow
            label="Scan inputs (recipient, message, link)"
            purpose="Generating the trust verdict"
            stored
            shared="LLM provider (Google Gemini via Lovable AI Gateway) at time of scan only"
          />
          <NutritionRow
            label="Scan results (verdict, score, archetype)"
            purpose="History, audit, admin abuse review"
            stored
            shared={false}
          />
          <NutritionRow
            label="IP address & user-agent (transient logs)"
            purpose="Abuse prevention, debugging"
            stored="≤30 days"
            shared={false}
          />
          <NutritionRow
            label="Advertising identifiers"
            purpose="—"
            stored={false}
            shared={false}
          />
          <NutritionRow
            label="Location data"
            purpose="—"
            stored={false}
            shared={false}
          />
          <NutritionRow
            label="Biometric data"
            purpose="—"
            stored={false}
            shared={false}
          />
          <NutritionRow
            label="Sold to third parties"
            purpose="—"
            stored="Never"
            shared="Never"
          />
        </div>

        <Section title="1. Who is the controller?">
          The data controller is <strong>Nair Mahdy</strong>, the Operator of
          TrustGuard AI.
        </Section>

        <Section title="2. Legal bases (UK GDPR / EU GDPR)">
          We rely on: (a) <em>contract</em> — to provide the Service you
          request; (b) <em>legitimate interests</em> — to detect abuse, secure
          the platform and improve detection quality; (c) <em>consent</em> — for
          any optional features. You may withdraw consent at any time.
        </Section>

        <Section title="3. What we never do">
          We do not sell your data. We do not run ad networks or behavioural
          advertising. We do not share scan content with other end users. We do
          not use your scan content to train third-party foundation models —
          submissions are sent only at request time for inference.
        </Section>

        <Section title="4. Retention">
          Scans are retained while your account is active so you can review
          them. You may delete individual scans, clear local history, or request
          full account deletion at any time (see §7). Transient request logs are
          kept for up to 30 days for abuse prevention.
        </Section>

        <Section title="5. Sub-processors">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Lovable Cloud / Supabase</strong> — database,
              authentication.
            </li>
            <li>
              <strong>Lovable AI Gateway → Google (Gemini)</strong> —
              large-language-model inference at scan time.
            </li>
          </ul>
        </Section>

        <Section title="6. International transfers">
          Where data is transferred outside the UK/EEA, we rely on the UK
          International Data Transfer Addendum and EU Standard Contractual
          Clauses as appropriate.
        </Section>

        <Section title="7. Your rights">
          You have rights of access, rectification, erasure, restriction,
          portability and objection, and the right to lodge a complaint with the
          UK Information Commissioner's Office (ICO) at ico.org.uk. To exercise
          any right, contact the Operator via the in-app support channel.
        </Section>

        <Section title="8. Security">
          The Service uses TLS for transport, row-level security (RLS) for
          tenant isolation, role-gated server functions for sensitive
          operations, and treats all user-submitted text strictly as{" "}
          <em>data</em> (it is wrapped in untrusted-input delimiters before
          being shown to the LLM, so it cannot rewrite the verdict).
        </Section>

        <Section title="9. Children">
          The Service is not directed at children under 13 (or under the local
          age of digital consent). Do not use the Service if you are under that
          age.
        </Section>

        <Section title="10. Changes">
          We will update this label and policy when material things change. The
          version and effective date are shown at the top of the nutrition
          label.
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function NutritionRow({
  label,
  purpose,
  stored,
  shared,
}: {
  label: string;
  purpose: string;
  stored: boolean | string;
  shared: boolean | string;
}) {
  const Cell = ({ v }: { v: boolean | string }) => {
    if (v === false)
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <X className="size-3.5" /> No
        </span>
      );
    if (v === true)
      return (
        <span className="inline-flex items-center gap-1 text-stone-900">
          <Check className="size-3.5" /> Yes
        </span>
      );
    return <span className="text-stone-700">{v}</span>;
  };
  return (
    <div className="grid grid-cols-12 gap-2 border-t border-stone-200 px-4 py-3 text-xs">
      <div className="col-span-12 sm:col-span-5 font-medium">{label}</div>
      <div className="col-span-12 sm:col-span-4 text-stone-600">{purpose}</div>
      <div className="col-span-6 sm:col-span-1">
        <div className="eyebrow mb-0.5">Stored</div>
        <Cell v={stored} />
      </div>
      <div className="col-span-6 sm:col-span-2">
        <div className="eyebrow mb-0.5">Shared</div>
        <Cell v={shared} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-stone-200 pt-6">
      <h2 className="font-serif text-2xl italic">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-stone-700">
        {children}
      </div>
    </section>
  );
}
