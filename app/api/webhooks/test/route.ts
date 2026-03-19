import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const SAMPLE_PAYLOAD = {
  event: "data.refreshed",
  timestamp: new Date().toISOString(),
  data: {
    series: "BLS_CU_STEEL_PRIMARY",
    period: "2026-02",
    value: 312.4,
    source: "BLS",
  },
  test: true,
};

export async function POST(req: NextRequest) {
  try {
    const { webhookId, dbUserId } = await req.json();

    if (!webhookId || !dbUserId) {
      return NextResponse.json({ error: "Missing webhookId or dbUserId" }, { status: 400 });
    }

    // Fetch the webhook (verify ownership)
    const { data: webhook, error } = await supabaseAdmin
      .from("webhooks")
      .select("*")
      .eq("id", webhookId)
      .eq("user_id", dbUserId)
      .single();

    if (error || !webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const body = JSON.stringify(SAMPLE_PAYLOAD);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "CostSignal-Webhooks/1.0",
      "X-CostSignal-Event": "data.refreshed",
      "X-CostSignal-Delivery": crypto.randomUUID(),
    };

    // Add signature if secret is set
    if (webhook.secret) {
      const sig = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
      headers["X-CostSignal-Signature"] = `sha256=${sig}`;
    }

    let status = 0;
    let ok = false;
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(8000),
      });
      status = response.status;
      ok = response.ok;
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : "Connection failed";
      // Update last_triggered_at even on failure
      await supabaseAdmin
        .from("webhooks")
        .update({ last_triggered_at: new Date().toISOString(), last_status_code: 0 })
        .eq("id", webhookId);
      return NextResponse.json({ ok: false, error: msg, status: 0 });
    }

    // Update last_triggered_at and status
    await supabaseAdmin
      .from("webhooks")
      .update({ last_triggered_at: new Date().toISOString(), last_status_code: status })
      .eq("id", webhookId);

    return NextResponse.json({ ok, status });
  } catch (err) {
    console.error("Webhook test error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
