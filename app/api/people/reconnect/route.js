import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Deliberately returns the same generic error whether the name doesn't
// exist or the PIN is wrong -- avoids confirming to a guesser whether a
// given name is registered at all.
const GENERIC_ERROR = "We couldn't find a match for that name and PIN.";

export async function POST(req) {
  const { name, personal_pin } = await req.json();
  if (!name || !name.trim() || !personal_pin || !personal_pin.trim()) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("people")
    .select("device_id, name")
    .ilike("name", name.trim())
    .eq("personal_pin", personal_pin.trim())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });

  return NextResponse.json({ device_id: data.device_id, name: data.name });
}
