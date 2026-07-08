import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin-access";
import { listAllScans, type ScanRow } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    if (!isAdminEmail(u.user.email ?? null)) throw redirect({ to: "/scan" });
  },
  head: () => ({
    meta: [
      { title: "Admin - TrustGuard AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const callList = useServerFn(listAllScans);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callList({});
      setRows(data);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }, [callList]);

  useEffect(() => {
    load();
  }, [load]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="eyebrow mb-2">Restricted · Admin only</div>
          <h1 className="font-serif text-4xl italic md:text-5xl">
            Audit dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-700">
            Every scan run by every user is recorded here for abuse review,
            fraud-pattern analysis and regulatory audit. Access is gated
            server-side by role; the UI is not load-bearing for security.
          </p>
        </div>

        <div className="paper overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 p-4">
            <div>
              <div className="eyebrow">Recent scans</div>
              <div className="font-serif text-xl italic">
                {loading ? "Loading..." : `${rows.length} records`}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-[10px]">
                  <th>When</th>
                  <th>User</th>
                  <th>Verdict</th>
                  <th>Score</th>
                  <th>Channel</th>
                  <th>Recipient</th>
                  <th>Archetype</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="[&>td]:px-3 [&>td]:py-2 [&>td]:align-top"
                  >
                    <td className="whitespace-nowrap font-mono">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="font-mono">{r.user_id.slice(0, 8)}...</td>
                    <td>
                      <span
                        className="num border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                        style={{
                          borderColor:
                            r.verdict === "Critical" || r.verdict === "High"
                              ? "var(--destructive)"
                              : r.verdict === "Medium"
                                ? "var(--warning)"
                                : "var(--success)",
                        }}
                      >
                        {r.verdict}
                      </span>
                    </td>
                    <td className="font-mono tabular-nums">{r.final_score}</td>
                    <td>{r.channel}</td>
                    <td
                      className="max-w-[260px] truncate font-mono"
                      title={r.recipient}
                    >
                      {r.recipient}
                    </td>
                    <td>{r.scam_archetype || "-"}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-stone-500"
                    >
                      No scans yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
