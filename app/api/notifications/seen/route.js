import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const { device_id } = await req.json();
  if (!device_id) return NextResponse.json({ error: "device_id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("people")
    .update({ notifications_last_seen: new Date().toISOString() })
    .eq("device_id", device_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
