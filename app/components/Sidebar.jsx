"use client";

import { TABS } from "./BottomNav";

export default function Sidebar({ tab, setTab }) {
  return (
    <aside
      className="hidden md:flex md:flex-col w-60 flex-shrink-0 bg-card border-r border-line"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-5 py-6 flex items-center gap-2.5 border-b border-line">
        <img
          src="/icons/icon-192.png"
          alt="NHAG Choir"
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
        />
        <p className="font-serif text-lg text-ink leading-tight">NHAG Choir</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                active ? "bg-accent/10 text-accent" : "text-inksoft hover:bg-paper"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
