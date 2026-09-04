import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";
import { sendPushToAll } from "@/lib/push";

export async function GET() {
  const supabase = supabaseServer();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, location, notes, created_at")
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: rsvps, error: rsvpError } = await supabase
    .from("event_rsvps")
    .select("event_id, device_id, name, status");

  if (rsvpError) return NextResponse.json({ error: rsvpError.message }, { status: 500 });

  const rsvpsByEvent = {};
  for (const r of rsvps) {
    if (!rsvpsByEvent[r.event_id]) rsvpsByEvent[r.event_id] = [];
    rsvpsByEvent[r.event_id].push(r);
  }

  const withRsvps = events.map((e) => ({ ...e, rsvps: rsvpsByEvent[e.id] || [] }));
  return NextResponse.json({ events: withRsvps });
}

export async function POST(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }

  const { title, event_date, event_time, location, notes } = await req.json();
  if (!title || !event_date) {
    return NextResponse.json({ error: "title and event_date are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .insert({ title, event_date, event_time, location, notes })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  sendPushToAll({
    title: "New event",
    body: title,
    url: "/?tab=events",
  }).catch(() => {});

  return NextResponse.json({ event: data });
}

export async function DELETE(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const { id, title, event_date, event_time, location, notes } = await req.json();
  if (!id || !title || !event_date) {
    return NextResponse.json({ error: "id, title, and event_date are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("events")
    .update({ title, event_date, event_time, location, notes })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
