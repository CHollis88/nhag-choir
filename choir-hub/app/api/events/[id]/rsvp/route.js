import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
  const { id: eventId } = await params;
  const { device_id, name, status } = await req.json();

  if (!device_id || !name || !["yes", "no", "maybe"].includes(status)) {
    return NextResponse.json(
      { error: "device_id, name, and a valid status are required." },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("event_rsvps").upsert(
    {
      event_id: eventId,
      device_id,
      name,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,device_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
