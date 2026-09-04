"use client";

import { useState } from "react";

export default function NameGate({ onSave }) {
  const [name, setName] = useState("");

  return (
    <div
      className="min-h-screen bg-paper flex items-center justify-center px-7"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-sm w-full text-center">
        <p className="font-serif text-2xl text-ink mb-2">What's your name?</p>
        <p className="text-sm text-inksoft mb-6 leading-relaxed">
          This is how your posts and prayer requests will be signed. Your journal always
          stays private, no matter what.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name or full name"
          className="sp-input text-center text-base mb-3.5"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
          }}
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          className="sp-btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
