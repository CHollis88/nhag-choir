"use client";

import { useEffect, useState } from "react";
import { Heart, Pencil, Trash2 } from "lucide-react";
import EmptyState from "./EmptyState";
import { api } from "@/lib/api";

const PRAYED_KEY = "sp_prayed_ids";

function getPrayedIds() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PRAYED_KEY) || "{}");
  } catch {
    return {};
  }
}
function setPrayedIds(ids) {
  localStorage.setItem(PRAYED_KEY, JSON.stringify(ids));
}

function EditForm({ request, onCancel, onSave }) {
  const [text, setText] = useState(request.text);
  const [anonymous, setAnonymous] = useState(request.name === "Anonymous");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(text.trim(), anonymous);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sp-card space-y-2.5">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="sp-textarea" />
      <label className="flex items-center gap-2 text-sm text-inksoft cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        Post anonymously
      </label>
      <div className="flex gap-2">
        <button onClick={onCancel} className="sp-btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={submit} disabled={saving} className="sp-btn-sage flex-1">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function PrayerTab({ deviceId, myName, isLeader }) {
  const [requests, setRequests] = useState(null);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [prayed, setPrayed] = useState({});
  const [editingId, setEditingId] = useState(null);

  const load = () => api.getPrayer(deviceId).then((d) => setRequests(d.requests));

  useEffect(() => {
    load();
    setPrayed(getPrayedIds());
  }, []);

  const submit = async () => {
    if (!text.trim()) return;
    await api.createPrayer(deviceId, myName, text, anonymous);
    setText("");
    setAnonymous(false);
    load();
  };

  const pray = async (id) => {
    if (prayed[id]) return;
    await api.prayFor(id, deviceId);
    const next = { ...prayed, [id]: true };
    setPrayed(next);
    setPrayedIds(next);
    load();
  };

  const saveEdit = async (id, newText, newAnonymous) => {
    await api.updatePrayer(id, deviceId, myName, newText, newAnonymous);
    setEditingId(null);
    load();
  };

  const remove = async (id) => {
    await api.deletePrayer(id, deviceId);
    load();
  };

  if (requests === null) return null;

  return (
    <div className="px-5 pt-4 pb-6">
      <h2 className="font-serif text-xl text-ink mb-4">Prayer Requests</h2>

      <div className="sp-card mb-5 space-y-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your heart?"
          rows={2}
          className="sp-textarea"
        />
        <label className="flex items-center gap-2 text-sm text-inksoft cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-3.5 h-3.5"
          />
          Post anonymously
        </label>
        <p className="text-xs text-inkfaint">
          {anonymous ? "Posting as Anonymous" : `Posting as ${myName || "you"}`}
        </p>
        <button onClick={submit} className="sp-btn-sage w-full">
          Share Request
        </button>
      </div>

      {requests.length === 0 && <EmptyState icon={Heart} text="No prayer requests yet. Be the first to share." />}

      <div className="space-y-2.5">
        {requests.map((r) => {
          const canManage = r.isMine || isLeader;

          if (editingId === r.id) {
            return (
              <EditForm
                key={r.id}
                request={r}
                onCancel={() => setEditingId(null)}
                onSave={(newText, newAnon) => saveEdit(r.id, newText, newAnon)}
              />
            );
          }

          return (
            <div key={r.id} className="sp-card relative">
              <p className="text-sm text-ink leading-relaxed mb-2 pr-6">{r.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-inkfaint">{r.name}</span>
                <button
                  onClick={() => pray(r.id)}
                  disabled={!!prayed[r.id]}
                  className={`sp-pill-outline ${prayed[r.id] ? "active" : ""}`}
                >
                  <Heart size={12} fill={prayed[r.id] ? "rgb(var(--color-sage))" : "none"} />
                  {prayed[r.id] ? "Praying" : "I'm praying"} · {r.pray_count || 0}
                </button>
              </div>
              {canManage && (
                <div className="absolute top-4 right-4 flex items-center gap-2.5">
                  {r.isMine && (
                    <button onClick={() => setEditingId(r.id)} className="text-inkfaint" aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(r.id)} className="text-inkfaint" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
