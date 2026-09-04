import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const RETENTION_DAYS = 30;

// Vercel automatically sends "Authorization: Bearer <CRON_SECRET>" on cron
// requests when CRON_SECRET is set as an environment variable, which is how
// this route confirms the request is really coming from Vercel's scheduler
// and not a random visitor hitting the URL.
export async function GET(req) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const cutoffDate = cutoff.toISOString().slice(0, 10); // YYYY-MM-DD, for date columns
  const cutoffTimestamp = cutoff.toISOString(); // full ISO, for timestamptz columns

  const supabase = supabaseServer();
  const [events, announcements, setlists] = await Promise.all([
    supabase.from("events").delete().lt("event_date", cutoffDate).select("id"),
    supabase.from("announcements").delete().lt("created_at", cutoffTimestamp).select("id"),
    supabase.from("setlists").delete().lt("service_date", cutoffDate).select("id"),
  ]);

  const errors = [events.error, announcements.error, setlists.error].filter(Boolean);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Cleanup failed", details: errors.map((e) => e.message) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    eventsRemoved: events.data?.length || 0,
    announcementsRemoved: announcements.data?.length || 0,
    setlistsRemoved: setlists.data?.length || 0,
  });
}
