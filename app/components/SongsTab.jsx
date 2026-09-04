"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Music,
  FileText,
  Guitar,
  FileMusic,
  Mic2,
  Trash2,
  Pencil,
  ExternalLink,
  X,
} from "lucide-react";
import EmptyState from "./EmptyState";
import SongForm from "./SongForm";
import { api } from "@/lib/api";
import { getDriveEmbedUrl } from "@/lib/googleDrive";

const LINK_BUTTONS = [
  ["lyrics_url", "Lyrics", FileText],
  ["chords_url", "Chords", Guitar],
  ["sheet_music_url", "Sheet Music", FileMusic],
  ["soprano_url", "Soprano", Mic2],
  ["alto_url", "Alto", Mic2],
  ["tenor_url", "Tenor", Mic2],
  ["bass_url", "Bass", Mic2],
  ["full_mix_url", "Full Mix", Mic2],
];

function SongRow({ song, isLeader, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activePreview, setActivePreview] = useState(null); // which link key is embedded open, if any

  const availableLinks = LINK_BUTTONS.filter(([key]) => song[key]);

  const saveEdit = async (fields) => {
    await api.updateSong(song.id, fields);
    setEditing(false);
    onUpdated();
  };

  const remove = async () => {
    await api.deleteSong(song.id);
    onUpdated();
  };

  const tapLink = (key, url) => {
    const embedUrl = getDriveEmbedUrl(url);
    if (embedUrl) {
      // Google Drive links play/preview right here in the app.
      setActivePreview(activePreview === key ? null : key);
    } else {
      // Anything else just opens normally -- we can't guarantee in-app
      // playback for an arbitrary link.
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (editing) {
    return <SongForm initial={song} onCancel={() => setEditing(false)} onSave={saveEdit} />;
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="min-w-0">
          <p className="font-serif text-base text-ink truncate">{song.title}</p>
          {song.composer && <p className="text-xs text-inkfaint truncate">{song.composer}</p>}
        </div>
      </button>

      {open && (
        <div className="border-t border-linesoft px-4 py-3">
          {availableLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {availableLinks.map(([key, label, Icon]) => {
                const embeddable = !!getDriveEmbedUrl(song[key]);
                const active = activePreview === key;
                return (
                  <button
                    key={key}
                    onClick={() => tapLink(key, song[key])}
                    className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 ${
                      active ? "bg-accent text-white" : "bg-accent/8 text-accent"
                    }`}
                  >
                    <Icon size={12} /> {label} {embeddable ? (active ? <X size={10} /> : null) : <ExternalLink size={10} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-inkfaint mb-2">Nothing linked yet for this song.</p>
          )}

          {activePreview && getDriveEmbedUrl(song[activePreview]) && (
            <div className="mb-3 rounded-lg overflow-hidden border border-line">
              <iframe
                src={getDriveEmbedUrl(song[activePreview])}
                className="w-full"
                style={{ height: 160 }}
                allow="autoplay"
                title={`${song.title} - ${activePreview}`}
              />
            </div>
          )}

          {song.notes && <p className="text-sm text-inksoft mb-2">{song.notes}</p>}

          {isLeader && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-inkfaint flex items-center gap-1"
              >
                <Pencil size={12} /> Edit
              </button>
              <button onClick={remove} className="text-xs text-inkfaint flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SongsTab({ isLeader }) {
  const [songs, setSongs] = useState(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => api.getSongs().then((d) => setSongs(d.songs));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!songs) return [];
    if (!query.trim()) return songs;
    const q = query.toLowerCase();
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || (s.composer && s.composer.toLowerCase().includes(q))
    );
  }, [songs, query]);

  const create = async (fields) => {
    await api.createSong(fields);
    setShowForm(false);
    load();
  };

  if (songs === null) return null;

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-ink">Songs</h2>
        {isLeader && (
          <button onClick={() => setShowForm((s) => !s)} className="sp-btn-pill">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkfaint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or composer..."
          className="sp-input pl-9"
        />
      </div>

      {showForm && <SongForm onCancel={() => setShowForm(false)} onSave={create} />}

      {filtered.length === 0 && !showForm && (
        <EmptyState icon={Music} text={query ? "No songs match that search." : "No songs yet."} />
      )}

      <div className="space-y-2">
        {filtered.map((song) => (
          <SongRow key={song.id} song={song} isLeader={isLeader} onUpdated={load} />
        ))}
      </div>

      {!query && songs.length > 0 && (
        <p className="text-[11px] text-inkfaint text-center mt-4">{songs.length} songs in the library</p>
      )}
    </div>
  );
}
