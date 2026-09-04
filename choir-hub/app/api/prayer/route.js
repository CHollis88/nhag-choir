import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("prayer_requests")
    .select("id, device_id, name, text, pray_count, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Never send the raw device_id to the browser — only whether *this*
  // requester's device matches, so someone can't correlate an anonymous
  // post with a non-anonymous one by comparing IDs.
  const requests = data.map(({ device_id, ...rest }) => ({
    ...rest,
    isMine: !!device_id && device_id === deviceId,
  }));

  return NextResponse.json({ requests });
}

export async function POST(req) {
  const { device_id, name, text, anonymous } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      device_id: device_id || null,
      name: anonymous ? "Anonymous" : (name || "Anonymous").trim(),
      text: text.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data });
}
