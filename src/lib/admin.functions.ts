import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAdminEmail, normalizeEmail } from "@/lib/admin-access";
import { z } from "zod";

export type ScanRow = {
  id: string;
  user_id: string;
  recipient: string;
  channel: string;
  website: string | null;
  amount: number | null;
  currency: string | null;
  heuristic_score: number;
  ai_score: number | null;
  final_score: number;
  verdict: string;
  scam_archetype: string | null;
  headline: string | null;
  created_at: string;
};

type AuthCtxSupabase = {
  from: (n: string) => {
    select: (s: string) => {
      eq: (
        k: string,
        v: unknown,
      ) => Promise<{
        data: Array<{ role: string }> | null;
        error: { message: string } | null;
      }>;
      order: (
        col: string,
        opts: { ascending: boolean },
      ) => {
        limit: (
          n: number,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
      limit: (n: number) => Promise<{
        data: Array<{ user_id: string }> | null;
        error: { message: string } | null;
      }>;
    };
    insert: (
      row: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
};

async function assertAdmin(supabase: AuthCtxSupabase, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error("Failed to verify role");
  if (!data?.some((r) => r.role === "admin"))
    throw new Error("Forbidden: admin only");
}

function assertAdminEmail(email: unknown) {
  if (!isAdminEmail(typeof email === "string" ? email : null)) {
    throw new Error("Forbidden: admin only");
  }
}

export const listAllScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    assertAdminEmail(context.claims.email);
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select(
        "id,user_id,recipient,channel,website,amount,currency,heuristic_score,ai_score,final_score,verdict,scam_archetype,headline,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as ScanRow[];
  });

export const claimAdminBootstrap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    throw new Error("Admin bootstrap is disabled");
  });

const PromoteSchema = z.object({ email: z.string().email().max(320) });

export const promoteByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PromoteSchema.parse(d))
  .handler(async ({ data, context }) => {
    assertAdminEmail(context.claims.email);
    if (!isAdminEmail(data.email)) {
      throw new Error(
        `Only allowlisted admin emails can access statistics. Requested: ${normalizeEmail(data.email)}`,
      );
    }
    return { ok: true };
  });
