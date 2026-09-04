"use client";

import { useEffect, useState } from "react";
import { Plus, ListMusic, Trash2, Pencil } from "lucide-react";
import EmptyState from "./EmptyState";
import SetlistForm from "./SetlistForm";
import { api } from "@/lib/api";

function fmtDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SetlistsTab({ isLeader, requestPin }) {
  const [setlists, setSetlists] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.getSetlists().then((d) => setSetlists(d.setlists));

  useEffect(() => {
    load();
    api.getSongs().then((d) => setSongs(d.songs));
  }, []);

  const create = async (payload) => {
    await api.createSetlist(payload);
    setShowForm(false);
    load();
  };

  const saveEdit = async (payload) => {
    await api.updateSetlist(editing.id, payload);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await api.deleteSetlist(id);
    load();
  };

  const openAdd = () => {
    const start = () => setShowForm(true);
    isLeader ? start() : requestPin(start);
  };
  const openEdit = (setlist) => {
    const start = () => setEditing(setlist);
    isLeader ? start() : requestPin(start);
  };

  if (setlists === null) return null;

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-ink">Setlists</h2>
        <button onClick={openAdd} className="sp-btn-pill">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <SetlistForm allSongs={songs} onCancel={() => setShowForm(false)} onSave={create} />
      )}
      {editing && (
        <SetlistForm
          initial={editing}
          allSongs={songs}
          onCancel={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      {setlists.length === 0 && !showForm && (
        <EmptyState icon={ListMusic} text="No setlists posted yet." />
      )}

      <div className="space-y-3">
        {setlists.map((s) => (
          <div key={s.id} className="sp-card relative">
            <div className="flex items-center justify-between mb-2 pr-14">
              <p className="font-serif text-lg text-ink">{fmtDate(s.service_date)}</p>
              <span className="text-[10px] uppercase tracking-wide bg-navy/10 text-navy dark:bg-blue-400/15 dark:text-blue-300 rounded-full px-2 py-0.5 font-semibold">
                {s.service}
              </span>
            </div>
            {s.songs.length === 0 ? (
              <p className="text-sm text-inkfaint">No songs added yet.</p>
            ) : (
              <ol className="space-y-1">
                {s.songs.map((song, i) => (
                  <li key={song.id} className="flex items-baseline gap-2 text-sm">
                    <span className="text-inkfaint w-4 flex-shrink-0">{i + 1}.</span>
                    <span className="text-ink flex-1">{song.title}</span>
                    {song.note && <span className="text-inkfaint text-xs">{song.note}</span>}
                  </li>
                ))}
              </ol>
            )}
            {isLeader && (
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <button onClick={() => openEdit(s)} className="text-inkfaint" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(s.id)} className="text-inkfaint" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
