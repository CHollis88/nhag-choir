"use client";

import { useEffect, useState } from "react";
import { X, Bell, Megaphone, MessageCircleQuestion, CalendarDays, Heart, ListMusic } from "lucide-react";
import { api } from "@/lib/api";

const ICONS = {
  announcement: Megaphone,
  discussion: MessageCircleQuestion,
  event: CalendarDays,
  prayer: Heart,
  setlist: ListMusic,
};

function fmtWhen(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffHours = (now - d) / (1000 * 60 * 60);
  if (diffHours < 24) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationsView({ deviceId, onClose, setTab }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.getNotifications(deviceId).then((d) => setItems(d.items));
    // Opening the hub marks everything as seen -- clears the badge for
    // next time, rather than tracking read/unread per individual item.
    if (deviceId) api.markNotificationsSeen(deviceId);
  }, [deviceId]);

  const openItem = (item) => {
    setTab(item.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
      <div
        className="bg-card w-full max-w-lg mx-auto min-h-screen p-6 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-serif text-xl text-ink">Notifications</p>
          <button onClick={onClose} className="text-inkfaint">
            <X size={22} />
          </button>
        </div>

        {items === null ? null : items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 text-inkfaint">
            <Bell size={28} strokeWidth={1.5} className="opacity-60 mb-2.5" />
            <p className="text-sm">Nothing new in the last 30 days.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = ICONS[item.type] || Bell;
              return (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="w-full sp-card flex items-start gap-3 text-left"
                >
                  <div className="bg-accent/8 rounded-lg p-2 flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <span className="text-[11px] text-inkfaint flex-shrink-0 mt-0.5">
                        {fmtWhen(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-inkfaint mt-0.5 line-clamp-2">{item.preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
