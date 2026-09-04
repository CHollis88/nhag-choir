import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Toggles: tapping "I'm praying" again removes it and decrements the
// count, so the count always reflects how many people currently have it
// marked, not a one-way running total.
export async function POST(req, { params }) {
  const { id: requestId } = await params;
  const { device_id } = await req.json();
  if (!device_id) {
    return NextResponse.json({ error: "device_id is required." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: existing } = await supabase
    .from("prayer_prayed")
    .select("device_id")
    .eq("request_id", requestId)
    .eq("device_id", device_id)
    .maybeSingle();

  const { data: current, error: fetchError } = await supabase
    .from("prayer_requests")
    .select("pray_count")
    .eq("id", requestId)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  if (existing) {
    const { error: deleteError } = await supabase
      .from("prayer_prayed")
      .delete()
      .eq("request_id", requestId)
      .eq("device_id", device_id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    const { error: updateError } = await supabase
      .from("prayer_requests")
      .update({ pray_count: Math.max(0, (current.pray_count || 0) - 1) })
      .eq("id", requestId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ ok: true, praying: false });
  }

  const { error: insertError } = await supabase
    .from("prayer_prayed")
    .insert({ request_id: requestId, device_id });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const { error: updateError } = await supabase
    .from("prayer_requests")
    .update({ pray_count: (current.pray_count || 0) + 1 })
    .eq("id", requestId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, praying: true });
}
