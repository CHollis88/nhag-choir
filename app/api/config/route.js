import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";

export async function GET(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("app_config").select("key, value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const config = {};
  for (const row of data) config[row.key] = row.value;
  return NextResponse.json({ config });
}

export async function POST(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("app_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
