import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Self-service lookup: a device can only ever fetch its own record, since
// it has to know its own device_id to ask -- this never exposes anyone
// else's info.
export async function GET(req) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  if (!deviceId) return NextResponse.json({ error: "device_id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("people")
    .select("name, personal_pin")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ name: data?.name || null, personalPin: data?.personal_pin || null });
}

export async function POST(req) {
  const { device_id, name, personal_pin } = await req.json();
  if (!device_id || !name || !name.trim()) {
    return NextResponse.json({ error: "device_id and name are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const payload = { device_id, name: name.trim(), updated_at: new Date().toISOString() };
  if (personal_pin) payload.personal_pin = personal_pin.trim();

  const { error } = await supabase.from("people").upsert(payload, { onConflict: "device_id" });

  if (error) {
    // Postgres unique_violation on the (name, personal_pin) index --
    // someone else already has this exact name+PIN combination.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That name and PIN combination is already taken. Try a different PIN." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
