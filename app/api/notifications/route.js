import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const WINDOW_DAYS = 30;

export async function GET(req) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  const supabase = supabaseServer();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [announcements, events, prayer, setlists] = await Promise.all([
    supabase.from("announcements").select("id, title, body, created_at").gte("created_at", since),
    supabase.from("events").select("id, title, event_date, created_at").gte("created_at", since),
    supabase
      .from("prayer_requests")
      .select("id, name, text, created_at")
      .gte("created_at", since),
    supabase
      .from("setlists")
      .select("id, service, service_date, created_at")
      .gte("created_at", since),
  ]);

  for (const r of [announcements, events, prayer, setlists]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  }

  const items = [
    ...announcements.data.map((a) => ({
      id: `announcement-${a.id}`,
      type: "announcement",
      title: a.title,
      preview: a.body,
      createdAt: a.created_at,
      tab: "news",
    })),
    ...events.data.map((e) => ({
      id: `event-${e.id}`,
      type: "event",
      title: e.title,
      preview: "New event posted.",
      createdAt: e.created_at,
      tab: "events",
    })),
    ...prayer.data.map((p) => ({
      id: `prayer-${p.id}`,
      type: "prayer",
      title: `New prayer request — ${p.name}`,
      preview: p.text,
      createdAt: p.created_at,
      tab: "prayer",
    })),
    ...setlists.data.map((s) => ({
      id: `setlist-${s.id}`,
      type: "setlist",
      title: `New setlist — ${s.service} · ${s.service_date}`,
      preview: "New setlist posted.",
      createdAt: s.created_at,
      tab: "setlists",
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let unreadCount = items.length;
  if (deviceId) {
    const { data: person } = await supabase
      .from("people")
      .select("notifications_last_seen")
      .eq("device_id", deviceId)
      .maybeSingle();
    const lastSeen = person?.notifications_last_seen;
    unreadCount = lastSeen ? items.filter((i) => new Date(i.createdAt) > new Date(lastSeen)).length : items.length;
  }

  return NextResponse.json({ items, unreadCount });
}
