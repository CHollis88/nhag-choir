"use client";

import { Lock } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ myName, onChangeName, isLeader, onRequestPin }) {
  return (
    <header
      className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line px-5 pb-3 flex items-center justify-between"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
    >
      <div className="flex items-center gap-2.5">
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
      <div className="flex items-center gap-3.5">
        <ThemeToggle />
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
