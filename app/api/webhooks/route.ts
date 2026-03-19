import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { url, secret, events, label, dbUserId } = await req.json();

    if (!url || !events?.length || !dbUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("webhooks")
      .insert({
        user_id: dbUserId,
        url,
        secret: secret || "",
        events,
        label: label || "",
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Webhook insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ webhook: data });
  } catch (err) {
    console.error("Webhook POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const dbUserId = searchParams.get("dbUserId");

  if (!id || !dbUserId) {
    return NextResponse.json({ error: "Missing id or dbUserId" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("user_id", dbUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
