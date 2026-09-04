import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";

export async function GET(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("people")
    .select("device_id, name, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ roster: data });
}

export async function DELETE(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const deviceId = req.nextUrl.searchParams.get("device_id");
  if (!deviceId) return NextResponse.json({ error: "device_id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase.from("people").delete().eq("device_id", deviceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
