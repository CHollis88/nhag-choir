import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const { device_id, name } = await req.json();
  if (!device_id || !name || !name.trim()) {
    return NextResponse.json({ error: "device_id and name are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("people")
    .upsert(
      { device_id, name: name.trim(), updated_at: new Date().toISOString() },
      { onConflict: "device_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
