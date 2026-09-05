"use client";

import { Lock, Settings, Bell } from "lucide-react";

export default function Header({
  myName,
  onChangeName,
  isLeader,
  onRequestPin,
  onOpenSettings,
  onOpenNotifications,
  unreadCount = 0,
}) {
  return (
    <header
      className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line px-5 pb-3 flex items-center justify-between"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
    >
      <div className="md:hidden flex items-center gap-2.5">
        <img
          src="/icons/icon-192.png"
          alt="NHAG Choir"
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
        />
        <div>
          <p className="font-serif text-lg text-ink leading-none">NHAG Choir</p>
          <p className="text-xs text-inkfaint mt-1">
            {myName} ·{" "}
            <button onClick={onChangeName} className="underline">
              not you?
            </button>
          </p>
        </div>
      </div>
      <p className="hidden md:block text-sm text-inkfaint">
        {myName} ·{" "}
        <button onClick={onChangeName} className="underline">
          not you?
        </button>
      </p>
      <div className="flex items-center gap-4">
        <button onClick={onOpenNotifications} className="relative text-inkfaint" aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button onClick={onOpenSettings} className="text-inkfaint" aria-label="Settings">
          <Settings size={18} />
        </button>
        {isLeader ? (
          <span className="text-xs bg-accent/10 text-accent rounded-full px-2.5 py-1 flex items-center gap-1">
            <Lock size={11} /> Leader
          </span>
        ) : (
          <button onClick={onRequestPin} className="text-inkfaint" aria-label="Leader sign in">
            <Lock size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
