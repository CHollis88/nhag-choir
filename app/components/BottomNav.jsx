"use client";

import { Music, ListMusic, CalendarDays, Heart, Megaphone } from "lucide-react";

export const TABS = [
  { id: "songs", label: "Songs", icon: Music },
  { id: "setlists", label: "Setlists", icon: ListMusic },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "prayer", label: "Prayer", icon: Heart },
  { id: "news", label: "News", icon: Megaphone },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="sticky bottom-0 z-30 bg-card border-t border-line px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto flex justify-between">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-1.5"
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 1.8} className={active ? "text-accent" : "text-inkfaint"} />
              <span className={`text-[10px] font-medium ${active ? "text-accent" : "text-inkfaint"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
