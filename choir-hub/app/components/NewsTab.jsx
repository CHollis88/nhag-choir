"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone, Trash2, Pencil } from "lucide-react";
import EmptyState from "./EmptyState";
import { api } from "@/lib/api";

function PostForm({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await onSave(title.trim(), body.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sp-card mb-4 space-y-2.5">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="sp-input" />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's the news?"
        rows={3}
        className="sp-textarea"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="sp-btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={submit} disabled={saving} className="sp-btn-primary flex-1">
          {saving ? "Saving..." : initial ? "Save Changes" : "Post"}
        </button>
      </div>
    </div>
  );
}

export default function NewsTab({ isLeader, requestPin }) {
  const [posts, setPosts] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.getAnnouncements().then((d) => setPosts(d.announcements));

  useEffect(() => {
    load();
  }, []);

  const create = async (title, body) => {
    await api.createAnnouncement(title, body);
    setShowForm(false);
    load();
  };

  const saveEdit = async (title, body) => {
    await api.updateAnnouncement(editing.id, title, body);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await api.deleteAnnouncement(id);
    load();
  };

  const openAdd = () => {
    const start = () => setShowForm(true);
    isLeader ? start() : requestPin(start);
  };
  const openEdit = (post) => {
    const start = () => setEditing(post);
    isLeader ? start() : requestPin(start);
  };

  if (posts === null) return null;
  const sorted = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-ink">Announcements</h2>
        <button onClick={openAdd} className="sp-btn-pill">
          <Plus size={14} /> Post
        </button>
      </div>

      {showForm && <PostForm onCancel={() => setShowForm(false)} onSave={create} />}
      {editing && <PostForm initial={editing} onCancel={() => setEditing(null)} onSave={saveEdit} />}

      {sorted.length === 0 && !showForm && <EmptyState icon={Megaphone} text="No announcements yet." />}

      <div className="space-y-2.5">
        {sorted.map((p) => (
          <div key={p.id} className="sp-card relative">
            <div className="flex items-start justify-between gap-2 mb-1.5 pr-12">
              <p className="font-serif text-lg text-ink">{p.title}</p>
              <span className="text-[11px] text-inkfaint flex-shrink-0 mt-1">{fmt(p.created_at)}</span>
            </div>
            <p className="text-sm text-inksoft leading-relaxed whitespace-pre-wrap">{p.body}</p>
            {isLeader && (
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button onClick={() => openEdit(p)} className="text-inkfaint" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(p.id)} className="text-inkfaint" aria-label="Delete">
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
