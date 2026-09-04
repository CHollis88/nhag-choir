"use client";

import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    q: "What do the tabs do?",
    a: "Home shows upcoming services, events, and news at a glance. Songs is the searchable song library with lyrics, chords, sheet music, and practice tracks. Setlists shows what's being sung at upcoming services. Prayer is a shared wall for prayer requests. News has announcements.",
  },
  {
    q: "How does posting anonymously work on Prayer?",
    a: "Check \"Post anonymously\" before sharing a request, and your name won't show to anyone — it'll just say \"Anonymous.\" You can still edit or delete your own request later, even if it was posted anonymously.",
  },
  {
    q: "What does \"I'm praying\" do?",
    a: "Tap it to let the person know someone's praying for their request. Tap it again if you want to undo it.",
  },
  {
    q: "How does RSVP work on Events?",
    a: "Tap Going, Maybe, or Can't Go on any event. Tap the same option again to clear your answer back to unanswered.",
  },
  {
    q: "What's the Personal PIN for?",
    a: "The first time you set your name, you also choose a short PIN. If you ever open the app on a different phone, enter that same name and PIN to reconnect as yourself, instead of starting over as a new person.",
  },
  {
    q: "What does the notifications bell do?",
    a: "It shows a feed of recent announcements, events, prayer requests, and new setlists. A dot appears when there's something you haven't seen yet — opening the bell clears it.",
  },
  {
    q: "How do I turn on dark mode?",
    a: "Tap the small sun/moon icon in the header (or find Theme in Settings) to cycle between Auto, Light, and Dark.",
  },
  {
    q: "How do I add this to my home screen?",
    a: "On iPhone: open the app in Safari, tap the Share icon, then \"Add to Home Screen.\" On Android: open it in Chrome, tap the menu (⋮), then \"Add to Home screen\" (or accept the install prompt if one appears). Once added, it opens full-screen like a regular app.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-ink pr-3">{q}</span>
        <ChevronDown
          size={16}
          className={`text-inkfaint flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3.5 border-t border-linesoft pt-3">
          <p className="text-sm text-inksoft leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpView({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
      <div
        className="bg-card w-full max-w-lg mx-auto min-h-screen p-6 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-serif text-xl text-ink">Help &amp; FAQ</p>
          <button onClick={onClose} className="text-inkfaint">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-2">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} sections={f.sections} note={f.note} />
          ))}
        </div>
      </div>
    </div>
  );
}
