"use client";

import { useEffect, useState } from "react";
import { ListMusic, CalendarDays, Megaphone, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { fmtEventDate, fmtEventTime } from "@/lib/format";

function fmtServiceDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p className="text-xs uppercase tracking-wide text-inkfaint">{title}</p>
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-xs text-accent font-medium">
          See all
        </button>
      )}
    </div>
  );
}

export default function HomeTab({ setTab }) {
  const [setlists, setSetlists] = useState(null);
  const [events, setEvents] = useState(null);
  const [news, setNews] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    api.getSetlists().then((d) => {
      const upcoming = d.setlists
        .filter((s) => s.service_date >= today)
        .sort((a, b) => a.service_date.localeCompare(b.service_date));
      setSetlists(upcoming.slice(0, 3));
    });

    api.getEvents().then((d) => {
      const upcoming = d.events
        .filter((e) => e.event_date >= today)
        .sort((a, b) => a.event_date.localeCompare(b.event_date));
      setEvents(upcoming.slice(0, 2));
    });

    api.getAnnouncements().then((d) => {
      const sorted = [...d.announcements].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNews(sorted.slice(0, 2));
    });
  }, []);

  return (
    <div className="px-5 pt-4 pb-6">
      <h2 className="font-serif text-xl text-ink mb-5">Welcome</h2>

      <div className="mb-6">
        <SectionHeader title="Upcoming Services" onSeeAll={() => setTab("setlists")} />
        {setlists === null ? null : setlists.length === 0 ? (
          <p className="text-sm text-inkfaint">No setlists posted yet.</p>
        ) : (
          <div className="space-y-2">
            {setlists.map((s) => (
              <button
                key={s.id}
                onClick={() => setTab("setlists")}
                className="w-full sp-card flex items-center gap-3 text-left"
              >
                <div className="bg-navy/10 rounded-lg p-2 flex-shrink-0">
                  <ListMusic size={16} className="text-navy" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{fmtServiceDate(s.service_date)}</p>
                  <p className="text-xs text-inkfaint">
                    {s.service} Service · {s.songs.length} song{s.songs.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-inkfaint flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <SectionHeader title="Upcoming Events" onSeeAll={() => setTab("events")} />
        {events === null ? null : events.length === 0 ? (
          <p className="text-sm text-inkfaint">No upcoming events.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setTab("events")}
                className="w-full sp-card flex items-center gap-3 text-left"
              >
                <div className="bg-accent/8 rounded-lg p-2 flex-shrink-0">
                  <CalendarDays size={16} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{e.title}</p>
                  <p className="text-xs text-inkfaint">
                    {fmtEventDate(e.event_date)}
                    {e.event_time && ` · ${fmtEventTime(e.event_time)}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader title="Latest News" onSeeAll={() => setTab("news")} />
        {news === null ? null : news.length === 0 ? (
          <p className="text-sm text-inkfaint">No announcements yet.</p>
        ) : (
          <div className="space-y-2">
            {news.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab("news")}
                className="w-full sp-card text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone size={14} className="text-accent flex-shrink-0" />
                  <p className="text-sm font-medium text-ink truncate">{n.title}</p>
                </div>
                <p className="text-xs text-inkfaint line-clamp-2">{n.body}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
