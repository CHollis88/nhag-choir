import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isLeaderRequest } from "@/lib/requireLeader";
import { sendPushToAll } from "@/lib/push";

export async function GET() {
  const supabase = supabaseServer();

  const { data: setlists, error } = await supabase
    .from("setlists")
    .select("id, service_date, service, created_at")
    .order("service_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: entries, error: entriesError } = await supabase
    .from("setlist_songs")
    .select("id, setlist_id, song_id, note, position, songs(id, title)")
    .order("position", { ascending: true });
  if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 });

  const bySetlist = {};
  for (const e of entries) {
    if (!bySetlist[e.setlist_id]) bySetlist[e.setlist_id] = [];
    bySetlist[e.setlist_id].push({
      id: e.id,
      song_id: e.song_id,
      title: e.songs?.title || "(deleted song)",
      note: e.note,
    });
  }

  const withSongs = setlists.map((s) => ({ ...s, songs: bySetlist[s.id] || [] }));
  return NextResponse.json({ setlists: withSongs });
}

export async function POST(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const { service_date, service, songs } = await req.json();
  if (!service_date || !["AM", "PM"].includes(service)) {
    return NextResponse.json({ error: "service_date and a valid service (AM/PM) are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: setlist, error } = await supabase
    .from("setlists")
    .insert({ service_date, service })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(songs) && songs.length > 0) {
    const rows = songs.map((s, i) => ({
      setlist_id: setlist.id,
      song_id: s.song_id,
      note: s.note || null,
      position: i,
    }));
    const { error: songsError } = await supabase.from("setlist_songs").insert(rows);
    if (songsError) return NextResponse.json({ error: songsError.message }, { status: 500 });
  }

  sendPushToAll({
    title: "New setlist posted",
    body: `${service} service — ${service_date}`,
    url: "/?tab=setlists",
  }).catch(() => {});

  return NextResponse.json({ setlist });
}

// Replaces the whole song list for a setlist -- simplest reliable way to
// handle reordering/adding/removing in one save, given setlists are short.
export async function PATCH(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const { id, service_date, service, songs } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = supabaseServer();

  const { error: updateError } = await supabase
    .from("setlists")
    .update({ service_date, service, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const { error: deleteError } = await supabase.from("setlist_songs").delete().eq("setlist_id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (Array.isArray(songs) && songs.length > 0) {
    const rows = songs.map((s, i) => ({
      setlist_id: id,
      song_id: s.song_id,
      note: s.note || null,
      position: i,
    }));
    const { error: insertError } = await supabase.from("setlist_songs").insert(rows);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  if (!isLeaderRequest(req)) {
    return NextResponse.json({ error: "Leader access required." }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = supabaseServer();
  const { error } = await supabase.from("setlists").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
