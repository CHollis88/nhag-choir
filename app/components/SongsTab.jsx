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
  RefreshCw,
  Link2,
} from "lucide-react";
import EmptyState from "./EmptyState";
import SongForm from "./SongForm";
import { api } from "@/lib/api";

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

function SongRow({ song, isLeader, requestPin, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

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
              {availableLinks.map(([key, label, Icon]) => (
                <a
                  key={key}
                  href={song[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-accent/8 text-accent rounded-full px-3 py-1.5"
                >
                  <Icon size={12} /> {label} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-inkfaint mb-2">Nothing linked yet for this song.</p>
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

function SyncFromSpreadsheet({ onSynced }) {
  const [showSettings, setShowSettings] = useState(false);
  const [url, setUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConfig().then((d) => setUrl(d.config?.song_spreadsheet_url || "")).catch(() => {});
  }, []);

  const saveUrl = async () => {
    setSavingUrl(true);
    try {
      await api.setConfig("song_spreadsheet_url", url.trim());
      setShowSettings(false);
    } finally {
      setSavingUrl(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    setError("");
    setResult(null);
    try {
      const d = await api.syncSongsFromSpreadsheet();
      setResult(d);
      if (d.count > 0) onSynced();
    } catch (err) {
      setError(err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sp-card mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink flex items-center gap-1.5">
          <RefreshCw size={14} className="text-inkfaint" /> Spreadsheet Sync
        </p>
        <button onClick={() => setShowSettings((s) => !s)} className="text-inkfaint">
          <Link2 size={14} />
        </button>
      </div>

      {showSettings && (
        <div className="mt-2.5 space-y-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="OneDrive share link to the spreadsheet"
            className="sp-input text-xs"
          />
          <button onClick={saveUrl} disabled={savingUrl} className="sp-btn-secondary w-full text-xs py-1.5">
            {savingUrl ? "Saving..." : "Save Link"}
          </button>
        </div>
      )}

      <button
        onClick={sync}
        disabled={syncing || !url}
        className="sp-btn-primary w-full mt-2.5 text-sm py-2"
      >
        {syncing ? "Syncing..." : "Sync from Spreadsheet"}
      </button>

      {error && <p className="text-accent text-xs mt-2">{error}</p>}
      {result && !error && (
        <p className="text-xs text-sage mt-2">
          {result.count === 0
            ? "No new songs found — everything's already up to date."
            : `Added ${result.count} new song${result.count === 1 ? "" : "s"}: ${result.added.join(", ")}`}
        </p>
      )}
    </div>
  );
}

export default function SongsTab({ isLeader, requestPin }) {
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
        <button
          onClick={() => (isLeader ? setShowForm((s) => !s) : requestPin(() => setShowForm(true)))}
          className="sp-btn-pill"
        >
          <Plus size={14} /> Add
        </button>
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

      {isLeader && <SyncFromSpreadsheet onSynced={load} />}

      {filtered.length === 0 && !showForm && (
        <EmptyState icon={Music} text={query ? "No songs match that search." : "No songs yet."} />
      )}

      <div className="space-y-2">
        {filtered.map((song) => (
          <SongRow key={song.id} song={song} isLeader={isLeader} requestPin={requestPin} onUpdated={load} />
        ))}
      </div>

      {!query && songs.length > 0 && (
        <p className="text-[11px] text-inkfaint text-center mt-4">{songs.length} songs in the library</p>
      )}
    </div>
  );
}
