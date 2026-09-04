import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { device_id, text, name, anonymous } = await req.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: existing, error: fetchError } = await supabase
    .from("prayer_requests")
    .select("device_id")
    .eq("id", id)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const isOwner = existing.device_id && existing.device_id === device_id;
  if (!isOwner && !isLeaderRequest(req)) {
    return NextResponse.json({ error: "You can only edit your own request." }, { status: 403 });
  }

  const { error } = await supabase
    .from("prayer_requests")
    .update({
      text: text.trim(),
      name: anonymous ? "Anonymous" : (name || "Anonymous").trim(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const deviceId = req.nextUrl.searchParams.get("device_id");

  const supabase = supabaseServer();

  const { data: existing, error: fetchError } = await supabase
    .from("prayer_requests")
    .select("device_id")
    .eq("id", id)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const isOwner = existing.device_id && existing.device_id === deviceId;
  if (!isOwner && !isLeaderRequest(req)) {
    return NextResponse.json({ error: "You can only delete your own request." }, { status: 403 });
  }

  const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
