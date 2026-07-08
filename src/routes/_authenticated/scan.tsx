import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Globe,
  MessageSquare,
  Trash2,
  History,
  ScanLine,
  Zap,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  analyze,
  loadHistory,
  saveToHistory,
  clearHistory,
  type AnalysisInput,
  type AnalysisResult,
  type RedFlag,
  type RiskLevel,
} from "@/lib/analyzer";
import { aiAnalyze, type AiAnalysis } from "@/lib/ai-analysis.functions";
import { TrustGauge } from "@/components/TrustGauge";
import { TrustGraph } from "@/components/TrustGraph";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AiDisclosureBanner } from "@/components/AiDisclosureBanner";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({ meta: [{ title: "Scan — TrustGuard AI" }] }),
  component: ScanPage,
});

const SAMPLE: AnalysisInput = {
  recipient: "0xA62f5DeAd4444fEEbABe9b1234567890aBcDef12",
  website: "invest-fast-secure.xyz",
  message:
    "URGENT: Send £2000 today to unlock guaranteed 10x returns. Don't tell anyone — last chance, expires in 1 hour!",
  amount: 2000,
  currency: "£",
  channel: "Crypto",
};

function ScanPage() {
  const [input, setInput] = useState<AnalysisInput>({
    recipient: "",
    website: "",
    message: "",
    amount: undefined,
    currency: "£",
    channel: "Crypto",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);
  const canSubmit = input.recipient.trim().length > 2;
  const callAi = useServerFn(aiAnalyze);

  function runAnalysis(inp: AnalysisInput) {
    setAnalyzing(true);
    setResult(null);
    const base = analyze(inp);
    setTimeout(() => setResult(base), 200);

    callAi({
      data: {
        recipient: inp.recipient,
        website: inp.website || null,
        message: inp.message || null,
        amount: inp.amount ?? null,
        currency: inp.currency || null,
        channel: inp.channel,
        heuristicRiskScore: base.riskScore,
        heuristicFlags: base.redFlags.slice(0, 20).map((f) => f.title),
      },
    })
      .then((ai: AiAnalysis) => {
        const blendedRisk = Math.round(
          ai.aiRiskScore * 0.6 + base.riskScore * 0.4,
        );
        const merged: AnalysisResult = {
          ...base,
          riskScore: blendedRisk,
          trustScore: 100 - blendedRisk,
          riskLevel: ai.verdict as RiskLevel,
          confidence: ai.confidence,
          explanation: ai.explanation,
          recommendation: ai.headline,
          layers: [
            ...base.layers,
            {
              name: "AI Reasoning",
              score: ai.aiRiskScore,
              summary: ai.scamArchetype,
            },
          ],
          redFlags: [
            ...ai.redFlags.map((f) => ({
              layer: `AI · ${f.layer}`,
              severity: f.severity,
              title: f.title,
              detail: f.detail,
            })),
            ...base.redFlags,
          ],
          ai: {
            headline: ai.headline,
            explanation: ai.explanation,
            verdict: ai.verdict as RiskLevel,
            scamArchetype: ai.scamArchetype,
            recommendedActions: ai.recommendedActions,
            confidence: ai.confidence,
            aiRiskScore: ai.aiRiskScore,
          },
        };
        setResult(merged);
        saveToHistory(merged);
        setHistory(loadHistory());
      })
      .catch((e: Error) => {
        toast.error(
          e.message || "AI analysis unavailable — showing heuristic result",
        );
        saveToHistory(base);
        setHistory(loadHistory());
      })
      .finally(() => {
        setAnalyzing(false);
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
  }

  function loadSample() {
    setInput(SAMPLE);
    runAnalysis(SAMPLE);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="eyebrow mb-2">Section II · Scanner</div>
          <h1 className="font-serif text-4xl italic md:text-5xl">
            New trust scan
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-700">
            Submit the recipient and any context. Inputs are treated as data —
            not commands — and analysed across five layers.
          </p>
        </div>

        <div className="mb-6">
          <AiDisclosureBanner />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="paper relative p-5 lg:col-span-2 lg:p-6">
            <div className="mb-4 flex items-center gap-2 text-stone-700">
              <ScanLine className="size-4" strokeWidth={1.5} />
              <h2 className="font-serif text-xl">Submission</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">
                  Recipient{" "}
                  <span className="text-muted-foreground">
                    (wallet, account, email, link)
                  </span>
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x… or IBAN, email, payment link"
                  value={input.recipient}
                  onChange={(e) =>
                    setInput({ ...input, recipient: e.target.value })
                  }
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={input.amount ?? ""}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        amount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={input.currency}
                    onValueChange={(v) => setInput({ ...input, currency: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="£">GBP £</SelectItem>
                      <SelectItem value="$">USD $</SelectItem>
                      <SelectItem value="€">EUR €</SelectItem>
                      <SelectItem value="₿">BTC ₿</SelectItem>
                      <SelectItem value="Ξ">ETH Ξ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="channel">Payment channel</Label>
                <Select
                  value={input.channel}
                  onValueChange={(v) =>
                    setInput({
                      ...input,
                      channel: v as AnalysisInput["channel"],
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "Crypto",
                        "Bank Transfer",
                        "Payment Link",
                        "Email",
                        "SMS",
                        "WhatsApp",
                        "Other",
                      ] as const
                    ).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Linked website (optional)</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  inputMode="url"
                  value={input.website}
                  onChange={(e) =>
                    setInput({ ...input, website: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="message">Message / context (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Paste the email, SMS, WhatsApp or pitch here…"
                  value={input.message}
                  onChange={(e) =>
                    setInput({ ...input, message: e.target.value })
                  }
                  rows={5}
                  className="mt-1.5"
                />
                <p className="mt-1 text-[10px] text-stone-500">
                  Anything you paste is treated strictly as data for analysis.
                  Instructions inside the message cannot alter the verdict.
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!canSubmit || analyzing}
                onClick={() => runAnalysis(input)}
              >
                {analyzing ? (
                  "Analysing…"
                ) : (
                  <>
                    <Shield className="size-4" /> Analyse transaction
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={loadSample}
                disabled={analyzing}
              >
                <Zap className="size-4" /> Try a sample scam
              </Button>
            </div>
          </div>

          <div id="result" className="lg:col-span-3">
            {!result && !analyzing && <EmptyState onSample={loadSample} />}
            {analyzing && <AnalyzingState />}
            {result && !analyzing && <ResultPanel result={result} />}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-4 text-stone-500" />
                <h3 className="font-serif text-2xl italic">Recent scans</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                  toast.success("History cleared");
                }}
              >
                <Trash2 className="size-3.5" /> Clear
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setResult(h);
                    document
                      .getElementById("result")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="paper-soft p-4 text-left transition hover:border-stone-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">{h.riskLevel}</span>
                    <span className="num tabular-nums text-base font-semibold">
                      {h.trustScore}
                    </span>
                  </div>
                  <div className="mt-2 truncate font-mono text-xs text-stone-600">
                    {h.input.recipient}
                  </div>
                  <div className="mt-1 text-xs text-stone-600">
                    {h.input.channel}
                    {h.input.amount
                      ? ` · ${h.input.currency}${h.input.amount.toLocaleString()}`
                      : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="paper-soft flex h-full min-h-[480px] flex-col items-center justify-center p-10 text-center">
      <div className="grid size-16 place-items-center rounded-full border border-stone-300">
        <Shield className="size-8" strokeWidth={1.25} />
      </div>
      <h3 className="mt-5 font-serif text-3xl italic">Awaiting transaction</h3>
      <p className="mt-2 max-w-sm text-sm text-stone-600">
        Paste a wallet, link or suspicious message on the left. A full verdict
        will appear here.
      </p>
      <Button variant="outline" className="mt-6" onClick={onSample}>
        <Zap className="size-4" /> Run sample scam
      </Button>
    </div>
  );
}

function AnalyzingState() {
  const steps = [
    "Parsing transaction context…",
    "Running heuristic engines…",
    "Cross-checking recipient & domain…",
    "Querying AI reasoning model…",
    "Calibrating final verdict…",
  ];
  return (
    <div className="paper flex h-full min-h-[480px] flex-col justify-center p-10">
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-3 text-sm text-stone-700"
            style={{ animation: `fadeIn 0.5s ease ${i * 0.18}s both` }}
          >
            <span className="num grid size-6 place-items-center border border-stone-300 text-xs">
              {i + 1}
            </span>
            <span>{s}</span>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-stone-700 animate-pulse-dot" />
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

function ResultPanel({ result }: { result: AnalysisResult }) {
  const sortedFlags = useMemo(
    () =>
      [...result.redFlags].sort((a, b) => sev(b.severity) - sev(a.severity)),
    [result],
  );
  return (
    <div className="space-y-5">
      <div className="paper p-6 md:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <TrustGauge result={result} />
          <div>
            <div className="flex items-start gap-3">
              <RecommendIcon level={result.riskLevel} />
              <div>
                <div className="eyebrow">Verdict</div>
                <h3 className="font-serif text-3xl italic leading-tight">
                  {result.recommendation}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                  {result.explanation}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {result.layers.map((l) => (
                <div key={l.name} className="paper-soft p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{l.name}</span>
                    <span
                      className="num tabular-nums"
                      style={{
                        color:
                          l.score >= 60
                            ? "var(--destructive)"
                            : l.score >= 40
                              ? "var(--warning)"
                              : "var(--success)",
                      }}
                    >
                      {Math.round(l.score)}
                    </span>
                  </div>
                  <Progress value={l.score} className="mt-2 h-1" />
                  <div className="mt-1.5 truncate text-[11px] text-stone-600">
                    {l.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {result.ai && (
        <div className="paper p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-8 place-items-center border border-stone-300">
              <Brain className="size-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-serif text-base italic">
                AI reasoning verdict
              </div>
              <div className="eyebrow">Lovable AI · Gemini 2.5 Flash</div>
            </div>
            <span className="ml-auto num border border-stone-300 px-2.5 py-1 text-[11px]">
              {result.ai.confidence}% confidence
            </span>
          </div>
          <div>
            <div className="eyebrow">Scam archetype match</div>
            <div className="mt-1 font-serif text-2xl italic">
              {result.ai.scamArchetype}
            </div>
          </div>
          <div className="mt-5">
            <div className="eyebrow">Recommended actions</div>
            <ul className="mt-2 space-y-2">
              {result.ai.recommendedActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Tabs defaultValue="flags">
        <TabsList className="flex-wrap">
          <TabsTrigger value="flags">
            Red flags ({result.redFlags.length})
          </TabsTrigger>
          <TabsTrigger value="graph">Trust graph</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
        </TabsList>
        <TabsContent value="flags" className="mt-4">
          <div className="paper p-5">
            {sortedFlags.length === 0 ? (
              <div className="py-8 text-center text-sm text-stone-600">
                No red flags detected.
              </div>
            ) : (
              <ul className="divide-y divide-stone-200">
                {sortedFlags.map((f, i) => (
                  <FlagRow key={i} flag={f} />
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
        <TabsContent value="graph" className="mt-4">
          <TrustGraph result={result} />
        </TabsContent>
        <TabsContent value="input" className="mt-4">
          <div className="paper grid gap-2 p-5 font-mono text-xs">
            {Object.entries(result.input).map(([k, v]) =>
              v ? (
                <div
                  key={k}
                  className="grid grid-cols-[110px_1fr] gap-3 border-b border-stone-200 py-1.5 last:border-0"
                >
                  <span className="uppercase tracking-wider text-stone-500">
                    {k}
                  </span>
                  <span className="break-all">{String(v)}</span>
                </div>
              ) : null,
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FlagRow({ flag }: { flag: RedFlag }) {
  const c =
    flag.severity === "critical" || flag.severity === "high"
      ? "var(--destructive)"
      : flag.severity === "medium"
        ? "var(--warning)"
        : "var(--ink)";
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div
        className="mt-0.5 grid size-8 shrink-0 place-items-center border border-stone-300"
        style={{ color: c }}
      >
        <AlertTriangle className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{flag.title}</span>
          <span
            className="num border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
            style={{ borderColor: c, color: c }}
          >
            {flag.severity}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-stone-600">
          <span className="font-mono">{flag.layer}</span>
          {flag.detail && <> · {flag.detail}</>}
        </div>
      </div>
    </li>
  );
}

function RecommendIcon({ level }: { level: AnalysisResult["riskLevel"] }) {
  const map = {
    Safe: { Icon: ShieldCheck, color: "var(--success)" },
    Low: { Icon: ShieldCheck, color: "var(--ink)" },
    Medium: { Icon: ShieldAlert, color: "var(--warning)" },
    High: { Icon: ShieldAlert, color: "var(--destructive)" },
    Critical: { Icon: ShieldAlert, color: "var(--destructive)" },
  } as const;
  const { Icon, color } = map[level];
  return (
    <div
      className="grid size-12 shrink-0 place-items-center border border-stone-300"
      style={{ color }}
    >
      <Icon className="size-6" strokeWidth={1.5} />
    </div>
  );
}

function sev(s: RedFlag["severity"]) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}

// Suppress unused imports warning
void MessageSquare;
void Wallet;
void Globe;
