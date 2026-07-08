import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — TrustGuard AI" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 md:px-8 md:py-16">
        <div className="eyebrow mb-3">
          Legal · Effective{" "}
          {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1 className="font-serif text-5xl italic">Terms &amp; Conditions</h1>
        <p className="mt-4 text-sm text-stone-600">
          Operated by <strong>Nair Mahdy</strong> (the "Operator"). By using
          TrustGuard AI (the "Service") you agree to these Terms in full. If you
          do not agree, do not use the Service.
        </p>

        <Section n="1" title="The Service is advisory only">
          TrustGuard AI is an experimental, AI-assisted information tool. Its
          outputs are <strong>probabilistic estimates</strong>, not statements
          of fact, financial advice, legal advice, regulated investment advice,
          accounting, or tax advice. The Operator is not a bank, broker, payment
          institution, e-money issuer, exchange or registered financial advisor.
          Always verify independently before sending money.
        </Section>

        <Section n="2" title="AI disclosure (FTC & UK)">
          Outputs are generated, in whole or in part, by large language models
          (currently Google Gemini via the Lovable AI Gateway). AI models can be
          wrong, can "hallucinate", and can be biased. Each scan result is
          marked with an AI disclosure. The Operator complies with the U.S.
          Federal Trade Commission guidance on AI marketing claims and with UK
          guidance from the ICO, CMA and FCA on transparency, accuracy, fairness
          and explainability of automated decision support.
        </Section>

        <Section n="3" title="No guarantee of fraud detection">
          The Service may produce <strong>false positives</strong> (flagging a
          legitimate transaction as risky) and <strong>false negatives</strong>{" "}
          (failing to flag an actual scam). The Operator gives no warranty,
          express or implied, that the Service will prevent any loss. You bear
          sole responsibility for any payment you choose to make or not make.
        </Section>

        <Section n="4" title="Acceptable use">
          You will not (a) submit data you have no right to submit; (b) use the
          Service to harass, defame or dox any individual; (c) attempt to
          reverse-engineer, scrape, overload or probe the Service; (d) submit
          prompt-injection payloads intended to alter the verdict for fraudulent
          purposes; (e) use the Service in violation of any law. We may suspend
          or terminate accounts that breach this section.
        </Section>

        <Section
          n="5"
          title="User-generated content (UGC) — no liability assumed"
        >
          Text, addresses, links and other material you submit ("User Content")
          remain yours. You grant the Operator a limited, non-exclusive,
          revocable licence to process User Content solely to provide the
          Service to you and to perform abuse and safety review.{" "}
          <strong>
            The Operator does not publish, share, redistribute or display User
            Content to any other end user.
          </strong>{" "}
          The Operator acts as a passive processor of information submitted at
          your direction and, to the maximum extent permitted by law (including
          under §230 of the U.S. Communications Decency Act, the EU Digital
          Services Act intermediary safe-harbours, and the UK eCommerce
          Directive equivalents), disclaims liability for the content of User
          Content. You represent that your submissions do not infringe any
          third-party right and you indemnify the Operator against any claim
          arising from your User Content.
        </Section>

        <Section n="6" title="Disclaimer of warranties">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </Section>

        <Section n="7" title="Limitation of liability">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE OPERATOR'S TOTAL
          CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THE SERVICE SHALL
          NOT EXCEED ONE HUNDRED POUNDS STERLING (£100). THE OPERATOR SHALL NOT
          BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL,
          PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING LOST PROFITS, LOST DATA OR
          LOST GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY. Nothing in these
          Terms limits liability for fraud, fraudulent misrepresentation, death
          or personal injury caused by negligence, or any other liability that
          cannot be excluded by law.
        </Section>

        <Section n="8" title="Governing law">
          These Terms are governed by the laws of England and Wales, without
          regard to its conflict-of-laws principles.
        </Section>

        <Section n="9" title="Binding arbitration (UK)">
          <strong>
            Please read carefully — this clause affects your legal rights.
          </strong>{" "}
          Any dispute, controversy or claim arising out of or in connection with
          these Terms, the Service or any related matter (a "Dispute") shall be
          referred to and finally resolved by{" "}
          <strong>
            binding arbitration administered by the London Court of
            International Arbitration (LCIA) under the LCIA Arbitration Rules
          </strong>
          , which Rules are deemed incorporated by reference. The seat of the
          arbitration shall be <strong>London, England</strong>. The tribunal
          shall consist of one (1) arbitrator. The language of the arbitration
          shall be English. Judgment on the award may be entered in any court of
          competent jurisdiction.
          <br />
          <br />
          <strong>Class-action waiver:</strong> Disputes shall be brought solely
          in an individual capacity and not as a plaintiff or class member in
          any purported class, collective or representative proceeding.
          <br />
          <br />
          <strong>Opt-out:</strong> You may opt out of this arbitration
          agreement by sending written notice to the Operator within thirty (30)
          days of first accepting these Terms. Nothing in this clause prevents
          either party from seeking urgent injunctive or equitable relief from a
          court, or pursuing a small-value claim in a small-claims court of
          competent jurisdiction.
        </Section>

        <Section n="10" title="Termination & changes">
          We may suspend or terminate access at any time for breach of these
          Terms. We may update these Terms; material changes will be notified
          via the Service. Continued use after a change constitutes acceptance.
        </Section>

        <Section n="11" title="Contact">
          Operator: Nair Mahdy. For legal notices, abuse reports or arbitration
          opt-out, please use the in-app support channel.
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-stone-200 pt-6">
      <div className="flex items-baseline gap-3">
        <span className="num text-stone-400 text-sm">§{n}</span>
        <h2 className="font-serif text-2xl italic">{title}</h2>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-stone-700">
        {children}
      </div>
    </section>
  );
}
