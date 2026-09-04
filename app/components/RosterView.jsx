"use client";

import { useEffect, useState } from "react";
import { X, Users, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

function fmtJoined(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function RosterView({ onClose }) {
  const [roster, setRoster] = useState(null);

  const load = () => api.getRoster().then((d) => setRoster(d.roster));

  useEffect(() => {
    load();
  }, []);

  const remove = async (deviceId) => {
    await api.removeFromRoster(deviceId);
    load();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
      <div
        className="bg-card w-full max-w-lg mx-auto min-h-screen p-6 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-serif text-xl text-ink">Who's Signed In</p>
          <button onClick={onClose} className="text-inkfaint">
            <X size={22} />
          </button>
        </div>
        <p className="text-xs text-inkfaint mb-5">
          Everyone who has set a name in the app. Tap the trash icon to remove a duplicate or
          mistaken entry.
        </p>

        {roster === null ? null : roster.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 text-inkfaint">
            <Users size={28} strokeWidth={1.5} className="opacity-60 mb-2.5" />
            <p className="text-sm">No one has signed in yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-inkfaint mb-1">{roster.length} member{roster.length === 1 ? "" : "s"}</p>
            {roster.map((person) => (
              <div key={person.device_id} className="sp-card relative pr-11">
                <p className="font-serif text-base text-ink">{person.name}</p>
                <p className="text-xs text-inkfaint">Joined {fmtJoined(person.created_at)}</p>
                {person.personal_pin && (
                  <p className="text-[11px] text-inkfaint">
                    PIN: <span className="font-mono">{person.personal_pin}</span>
                  </p>
                )}
                <button
                  onClick={() => remove(person.device_id)}
                  className="absolute top-4 right-3.5 text-inkfaint"
                  aria-label={`Remove ${person.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
