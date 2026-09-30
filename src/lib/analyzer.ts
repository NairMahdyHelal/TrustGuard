// Mock TrustGuard analysis engine — pure client-side, deterministic-ish.

export type RiskLevel = "Safe" | "Low" | "Medium" | "High" | "Critical";

export interface AnalysisInput {
  recipient: string; // wallet / account / email / phone
  website?: string;
  message?: string;
  amount?: number;
  currency?: string;
  channel:
    | "Crypto"
    | "Bank Transfer"
    | "Payment Link"
    | "Email"
    | "SMS"
    | "WhatsApp"
    | "Other";
}

export interface RedFlag {
  layer: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  detail: string;
}

export interface LayerScore {
  name: string;
  score: number; // 0-100 risk
  summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "user" | "recipient" | "website" | "message" | "scam" | "amount";
  risk: number; // 0-100
}
export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  risk: number;
}

export interface AnalysisResult {
  id: string;
  createdAt: number;
  input: AnalysisInput;
  trustScore: number; // 0-100, higher = safer
  riskScore: number; // 100 - trustScore
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  layers: LayerScore[];
  redFlags: RedFlag[];
  recommendation: string;
  explanation: string;
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  ai?: {
    headline: string;
    explanation: string;
    verdict: RiskLevel;
    scamArchetype: string;
    recommendedActions: string[];
    confidence: number;
    aiRiskScore: number;
  };
}

const URGENCY = [
  "urgent",
  "immediately",
  "today",
  "right now",
  "asap",
  "hurry",
  "limited time",
  "expires",
  "last chance",
  "act fast",
  "don't miss",
];
const AUTHORITY = [
  "police",
  "irs",
  "hmrc",
  "bank",
  "officer",
  "agent",
  "ceo",
  "court",
];
const GREED = [
  "double",
  "guaranteed",
  "profit",
  "investment",
  "returns",
  "roi",
  "100%",
  "x10",
  "10x",
];
const FEAR = [
  "account",
  "suspended",
  "blocked",
  "frozen",
  "arrested",
  "lawsuit",
  "fine",
];
const ISOLATION = [
  "don't tell",
  "secret",
  "between us",
  "confidential",
  "no one",
];
const REWARD = [
  "winner",
  "prize",
  "lottery",
  "claim",
  "reward",
  "selected",
  "congratulations",
];

function scoreText(text: string) {
  const t = text.toLowerCase();
  const hit = (arr: string[]) => arr.filter((w) => t.includes(w));
  const u = hit(URGENCY),
    a = hit(AUTHORITY),
    g = hit(GREED),
    f = hit(FEAR),
    i = hit(ISOLATION),
    r = hit(REWARD);
  const buckets = [
    { tag: "urgency", words: u, weight: 14 },
    { tag: "authority", words: a, weight: 12 },
    { tag: "greed", words: g, weight: 16 },
    { tag: "fear", words: f, weight: 14 },
    { tag: "isolation", words: i, weight: 18 },
    { tag: "reward bait", words: r, weight: 12 },
  ];
  let risk = 0;
  const findings: { tag: string; words: string[]; weight: number }[] = [];
  for (const b of buckets) {
    if (b.words.length) {
      risk += b.weight + Math.min(8, b.words.length * 3);
      findings.push(b);
    }
  }
  return { risk: Math.min(100, risk), findings };
}

function looksLikeCryptoWallet(s: string) {
  return (
    /^0x[a-fA-F0-9]{6,}/.test(s) ||
    /^[13][a-km-zA-HJ-NP-Z1-9]{20,}/.test(s) ||
    /^bc1[a-z0-9]{20,}/.test(s)
  );
}

function analyzeWallet(addr: string) {
  if (!looksLikeCryptoWallet(addr)) return null;
  let risk = 10;
  const reasons: string[] = [];
  if (addr.toLowerCase().includes("dead") || /(.)\1{5,}/.test(addr)) {
    risk += 15;
    reasons.push("Unusual address pattern");
  }
  return { risk: Math.min(100, risk), reasons };
}

function analyzeWebsite(url: string) {
  let host = url.trim().toLowerCase();
  try {
    host = new URL(host.startsWith("http") ? host : `https://${host}`).hostname;
  } catch {
    /* keep */
  }
  const tld = host.split(".").pop() || "";
  const risky = [
    "xyz",
    "top",
    "click",
    "loan",
    "zip",
    "country",
    "work",
    "support",
  ];
  const trusted = ["com", "org", "net", "io", "co", "uk", "gov", "edu"];
  const brandImpersonation =
    /(paypa1|amaz0n|micros0ft|app1e|g00gle|binanace|coinbas[e3])/i.test(host);
  const typo =
    /-?(secure|verify|wallet|login|support|gift|claim|airdrop)-?/i.test(host);
  const hyphens = (host.match(/-/g) || []).length;
  const len = host.length;

  let risk = 5;
  const reasons: string[] = [];
  if (risky.includes(tld)) {
    risk += 28;
    reasons.push(`Uses risky TLD .${tld}`);
  } else if (!trusted.includes(tld)) {
    risk += 10;
    reasons.push(`Uncommon TLD .${tld}`);
  }
  if (brandImpersonation) {
    risk += 40;
    reasons.push("Brand impersonation detected in domain");
  }
  if (typo) {
    risk += 18;
    reasons.push("Domain contains phishing-style keywords");
  }
  if (hyphens >= 2) {
    risk += 10;
    reasons.push(`Multiple hyphens in domain (${hyphens})`);
  }
  if (len > 28) {
    risk += 8;
    reasons.push("Unusually long domain");
  }
  if (!url.startsWith("https")) {
    risk += 12;
    reasons.push("No HTTPS in supplied URL");
  }
  return { risk: Math.min(100, risk), host, reasons };
}

function analyzeBehaviour(input: AnalysisInput) {
  let risk = 8;
  const reasons: string[] = [];
  const amt = input.amount ?? 0;
  if (amt >= 5000) {
    risk += 30;
    reasons.push(`Large payment amount (${amt.toLocaleString()})`);
  } else if (amt >= 1000) {
    risk += 15;
    reasons.push("Above-average payment amount");
  }
  if (input.channel === "Crypto") {
    risk += 18;
    reasons.push("Irreversible crypto payment");
  }
  if (input.channel === "Payment Link") {
    risk += 10;
    reasons.push("Payment via third-party link");
  }
  if (input.channel === "WhatsApp" || input.channel === "SMS") {
    risk += 14;
    reasons.push(`Financial request received via ${input.channel}`);
  }
  // First-time recipient assumption
  risk += 8;
  reasons.push("First payment to this recipient");
  return { risk: Math.min(100, risk), reasons };
}

function levelFor(risk: number): RiskLevel {
  if (risk >= 80) return "Critical";
  if (risk >= 60) return "High";
  if (risk >= 40) return "Medium";
  if (risk >= 20) return "Low";
  return "Safe";
}

function recommendationFor(level: RiskLevel) {
  switch (level) {
    case "Critical":
      return "DO NOT SEND. Strong indicators of fraud — block the contact and report.";
    case "High":
      return "Hold the payment. Verify the recipient through an independent, trusted channel.";
    case "Medium":
      return "Pause and verify. Several signals suggest this could be a scam.";
    case "Low":
      return "Proceed with caution. Confirm details before sending.";
    case "Safe":
      return "Looks safe based on current signals. Always verify large transfers.";
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function analyze(input: AnalysisInput): AnalysisResult {
  const flags: RedFlag[] = [];
  const layers: LayerScore[] = [];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Language
  const text = input.message ?? "";
  const lang = text ? scoreText(text) : { risk: 0, findings: [] };
  layers.push({
    name: "Language",
    score: lang.risk,
    summary: lang.findings.length
      ? `${lang.findings.length} manipulation pattern(s) detected`
      : "No manipulation patterns detected",
  });
  for (const f of lang.findings) {
    flags.push({
      layer: "Language",
      severity: f.weight >= 16 ? "high" : f.weight >= 12 ? "medium" : "low",
      title: `Detected ${f.tag}`,
      detail: `Keywords: ${f.words.slice(0, 4).join(", ")}`,
    });
  }

  // Behaviour
  const beh = analyzeBehaviour(input);
  layers.push({
    name: "Financial Behaviour",
    score: beh.risk,
    summary: `${input.channel} · ${input.amount ? input.currency || "£" : ""}${input.amount?.toLocaleString() ?? "—"}`,
  });
  for (const r of beh.reasons) {
    flags.push({
      layer: "Behaviour",
      severity: "medium",
      title: r,
      detail: "",
    });
  }

  // Wallet
  const wallet = analyzeWallet(input.recipient);
  if (wallet) {
    layers.push({
      name: "Crypto Wallet",
      score: wallet.risk,
      summary: "Address format and visible pattern checks only",
    });
    for (const r of wallet.reasons) {
      flags.push({
        layer: "Wallet",
        severity: "medium",
        title: r,
        detail: "",
      });
    }
  }

  // Website
  let site: ReturnType<typeof analyzeWebsite> | null = null;
  if (input.website && input.website.trim()) {
    site = analyzeWebsite(input.website);
    layers.push({
      name: "Website",
      score: site.risk,
      summary: `${site.host} · URL pattern checks only`,
    });
    for (const r of site.reasons) {
      flags.push({
        layer: "Website",
        severity: r.toLowerCase().includes("impersonation")
          ? "critical"
          : "medium",
        title: r,
        detail: site.host,
      });
    }
  }

  // Weighted aggregate (risk)
  const weights = {
    Language: 0.22,
    "Financial Behaviour": 0.22,
    "Crypto Wallet": 0.3,
    Website: 0.26,
  } as Record<string, number>;
  let totalW = 0,
    weightedRisk = 0;
  for (const l of layers) {
    const w = weights[l.name] ?? 0.2;
    totalW += w;
    weightedRisk += l.score * w;
  }
  const riskScore = Math.round(totalW ? weightedRisk / totalW : 0);
  const trustScore = 100 - riskScore;
  const riskLevel = levelFor(riskScore);
  const confidence = Math.min(
    98,
    55 + layers.length * 8 + (text ? 8 : 0) + (site ? 6 : 0),
  );

  // Graph
  nodes.push({ id: "user", label: "You", type: "user", risk: 0 });
  nodes.push({
    id: "recipient",
    label: looksLikeCryptoWallet(input.recipient)
      ? `${input.recipient.slice(0, 6)}…${input.recipient.slice(-4)}`
      : input.recipient.slice(0, 24),
    type: "recipient",
    risk: wallet ? wallet.risk : 30,
  });
  edges.push({
    from: "user",
    to: "recipient",
    label: input.channel,
    risk: beh.risk,
  });

  if (text) {
    nodes.push({
      id: "msg",
      label: "Message",
      type: "message",
      risk: lang.risk,
    });
    edges.push({
      from: "recipient",
      to: "msg",
      label: "claims",
      risk: lang.risk,
    });
  }
  if (site) {
    nodes.push({
      id: "site",
      label: site.host,
      type: "website",
      risk: site.risk,
    });
    edges.push({
      from: "recipient",
      to: "site",
      label: "linked",
      risk: site.risk,
    });
  }
  if (input.amount) {
    nodes.push({
      id: "amount",
      label: `${input.currency || "£"}${input.amount.toLocaleString()}`,
      type: "amount",
      risk: beh.risk,
    });
    edges.push({
      from: "user",
      to: "amount",
      label: "transfers",
      risk: beh.risk,
    });
    edges.push({
      from: "amount",
      to: "recipient",
      label: "to",
      risk: beh.risk,
    });
  }
  // Explanation
  const topReasons = flags
    .sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
    .slice(0, 4)
    .map((f) => `• ${f.title}`)
    .join("\n");
  const explanation =
    riskLevel === "Safe"
      ? "No significant risk indicators were detected in the supplied message, payment details, address pattern, or URL. No external wallet or domain reputation lookup was performed."
      : `This request shows characteristics typical of ${
          riskLevel === "Critical"
            ? "an active scam"
            : riskLevel === "High"
              ? "a high-risk scam attempt"
              : riskLevel === "Medium"
                ? "a suspicious transaction"
                : "a minor-risk transaction"
        }. Key signals:\n${topReasons}`;

  return {
    id: uid(),
    createdAt: Date.now(),
    input,
    trustScore,
    riskScore,
    riskLevel,
    confidence,
    layers,
    redFlags: flags,
    recommendation: recommendationFor(riskLevel),
    explanation,
    graph: { nodes, edges },
  };
}

function sevRank(s: RedFlag["severity"]) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}

// History (localStorage)
const KEY = "trustguard.history.v1";
export function saveToHistory(r: AnalysisResult) {
  if (typeof window === "undefined") return;
  try {
    const list = loadHistory();
    list.unshift(r);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 25)));
  } catch {
    /* ignore */
  }
}
export function loadHistory(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult[]) : [];
  } catch {
    return [];
  }
}
export function clearHistory() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
