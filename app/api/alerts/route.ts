import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/alerts — create a new series alert
export async function POST(req: NextRequest) {
  try {
    const { series_slug, series_label, operator, threshold, notification_email, dbUserId } =
      await req.json();

    if (!series_slug || !operator || threshold == null || !notification_email || !dbUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validOps = [">", "<", ">=", "<="];
    if (!validOps.includes(operator)) {
      return NextResponse.json({ error: "Invalid operator" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("series_alerts")
      .insert({
        user_id: dbUserId,
        series_slug,
        series_label: series_label || series_slug,
        operator,
        threshold: Number(threshold),
        notification_email,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Alert insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data });
  } catch (err) {
    console.error("Alert POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/alerts — delete an alert by id
export async function DELETE(req: NextRequest) {
  try {
    const { id, dbUserId } = await req.json();
    if (!id || !dbUserId) {
      return NextResponse.json({ error: "Missing id or dbUserId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("series_alerts")
      .delete()
      .eq("id", id)
      .eq("user_id", dbUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Alert DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH /api/alerts — toggle enabled
export async function PATCH(req: NextRequest) {
  try {
    const { id, enabled, dbUserId } = await req.json();
    if (!id || dbUserId == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("series_alerts")
      .update({ enabled })
      .eq("id", id)
      .eq("user_id", dbUserId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data });
  } catch (err) {
    console.error("Alert PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
