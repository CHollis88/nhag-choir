import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const { device_id, subscription } = await req.json();
  if (!device_id || !subscription) {
    return NextResponse.json(
      { error: "device_id and subscription are required." },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("push_subscriptions").upsert(
    { device_id, subscription },
    { onConflict: "device_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  if (!deviceId) return NextResponse.json({ error: "device_id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase.from("push_subscriptions").delete().eq("device_id", deviceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
