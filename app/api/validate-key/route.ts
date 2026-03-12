import { NextRequest, NextResponse } from "next/server";
import { lookupKeyByHash } from "@/lib/api-keys";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/validate-key
 *
 * Called by the main CostSignal FastAPI backend to verify API keys.
 * Logs usage atomically and updates last_used_at.
 *
 * Request body:
 * {
 *   key: string;           // raw key (cs_xxxx...)
 *   endpoint?: string;     // e.g. "/series/CPIAUCSL"
 *   series?: string[];     // series IDs requested
 *   status_code?: number;
 *   response_time_ms?: number;
 * }
 *
 * Response:
 * { valid: boolean; user_id?: string; plan?: string; error?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Optional admin secret check (for FastAPI → Portal comms)
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const authHeader = req.headers.get("x-admin-secret");
      if (authHeader !== adminSecret) {
        return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { key, endpoint, series, status_code, response_time_ms } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { valid: false, error: "Missing or invalid key" },
        { status: 400 }
      );
    }

    // Look up key by hash
    const keyRecord = await lookupKeyByHash(key);

    if (!keyRecord || keyRecord.revoked_at) {
      return NextResponse.json({ valid: false, error: "Invalid or revoked key" });
    }

    // Update last_used_at and log usage in parallel
    const now = new Date().toISOString();
    const logEndpoint = endpoint ?? "unknown";

    await Promise.all([
      supabaseAdmin
        .from("api_keys")
        .update({ last_used_at: now })
        .eq("id", keyRecord.id),
      supabaseAdmin.from("usage_logs").insert({
        key_prefix: keyRecord.key_prefix,
        user_id: keyRecord.user_id,
        endpoint: logEndpoint,
        series_requested: series ?? null,
        status_code: status_code ?? null,
        response_time_ms: response_time_ms ?? null,
        created_at: now,
      }),
    ]);

    return NextResponse.json({
      valid: true,
      user_id: keyRecord.user_id,
      plan: "free", // extend when billing is added
    });
  } catch (err) {
    console.error("validate-key error:", err);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
