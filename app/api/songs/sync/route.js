import { NextResponse } from "next/server";
import { readSheet } from "read-excel-file/node";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";

export async function POST(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }

  const supabase = supabaseServer();

  const { data: configRow, error: configError } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "song_spreadsheet_url")
    .maybeSingle();
  if (configError) return NextResponse.json({ error: configError.message }, { status: 500 });

  const url = configRow?.value;
  if (!url) {
    return NextResponse.json(
      { error: "No spreadsheet link is set up yet. Add one in Songs first." },
      { status: 400 }
    );
  }

  let buffer;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`The link returned an error (status ${res.status}).`);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error(
        "That link opened a webpage instead of the file itself. Make sure it's a direct \"anyone with the link can view\" share link to the file, not a OneDrive folder or preview page."
      );
    }
    buffer = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Couldn't fetch the spreadsheet from that link." },
      { status: 502 }
    );
  }

  let rows;
  try {
    // Prefer the "Song Frequency" sheet if it exists (matches the original
    // import); fall back to whatever the first sheet is otherwise.
    try {
      rows = await readSheet(buffer, "Song Frequency");
    } catch {
      rows = await readSheet(buffer);
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Couldn't read that file as a spreadsheet. Double check the link points to the .xlsx file." },
      { status: 400 }
    );
  }

  // Skip the header row; take column A from every row after it.
  const titles = rows
    .slice(1)
    .map((row) => (row[0] ? String(row[0]).trim() : null))
    .filter(Boolean);

  if (titles.length === 0) {
    return NextResponse.json({ added: [], count: 0 });
  }

  const { data: existingSongs, error: existingError } = await supabase.from("songs").select("title");
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  const existingLower = new Set(existingSongs.map((s) => s.title.toLowerCase()));
  const seenInThisSync = new Set();
  const toInsert = [];
  for (const title of titles) {
    const key = title.toLowerCase();
    if (existingLower.has(key) || seenInThisSync.has(key)) continue;
    seenInThisSync.add(key);
    toInsert.push({ title });
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ added: [], count: 0 });
  }

  const { error: insertError } = await supabase.from("songs").insert(toInsert);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ added: toInsert.map((s) => s.title), count: toInsert.length });
}
