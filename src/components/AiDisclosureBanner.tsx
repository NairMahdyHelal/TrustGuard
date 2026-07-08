export function AiDisclosureBanner() {
  return (
    <div className="border-l-2 border-stone-800 bg-stone-100 p-3 text-[11px] leading-relaxed uppercase tracking-tight text-stone-700">
      <strong className="font-semibold">AI Disclosure (FTC / UK):</strong> This
      tool produces probabilistic risk assessments using generative AI (Gemini /
      GPT-class models). Results are advisory only and do not guarantee safety,
      fraud, or the absence of fraud. Decisions about payments remain your own.
      Operator: Nair Mahdy. See{" "}
      <a href="/terms" className="underline">
        Terms
      </a>{" "}
      and{" "}
      <a href="/privacy" className="underline">
        Privacy
      </a>
      .
    </div>
  );
}
