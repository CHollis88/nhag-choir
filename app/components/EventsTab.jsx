"use client";

import { useEffect, useState } from "react";
import { Plus, CalendarDays, Clock, MapPin, Trash2, Check, Pencil } from "lucide-react";
import EmptyState from "./EmptyState";
import { api } from "@/lib/api";

function EventForm({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(initial?.event_date || "");
  const [time, setTime] = useState(initial?.event_time || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !date) return;
    setSaving(true);
    try {
      await onSave({ title, event_date: date, event_time: time, location, notes });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sp-card mb-4 space-y-2.5">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="sp-input" />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sp-input" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="sp-input" />
      </div>
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="sp-input" />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="sp-textarea"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="sp-btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={submit} disabled={saving} className="sp-btn-primary flex-1">
          {saving ? "Saving..." : initial ? "Save Changes" : "Post Event"}
        </button>
      </div>
    </div>
  );
}

function RsvpRow({ event, deviceId, onRsvp }) {
  const mine = event.rsvps.find((r) => r.device_id === deviceId);
  const counts = { yes: 0, no: 0, maybe: 0 };
  event.rsvps.forEach((r) => (counts[r.status] = (counts[r.status] || 0) + 1));

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {["yes", "maybe", "no"].map((status) => {
          const active = mine?.status === status;
          const labels = { yes: "Going", maybe: "Maybe", no: "Can't go" };
          return (
            <button
              key={status}
              onClick={() => onRsvp(event.id, status)}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium flex items-center justify-center gap-1 transition ${
                active ? "bg-sage border-sage text-white" : "bg-card border-line text-inksoft"
              }`}
            >
              {active && <Check size={12} />}
              {labels[status]}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-inkfaint mt-1.5">
        {counts.yes} going · {counts.maybe} maybe · {counts.no} can't go
      </p>
    </div>
  );
}

export default function EventsTab({ deviceId, myName, isLeader, requestPin }) {
  const [events, setEvents] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const load = () => api.getEvents().then((d) => setEvents(d.events));

  useEffect(() => {
    load();
  }, []);

  const save = async (payload) => {
    await api.createEvent(payload);
    setShowForm(false);
    load();
  };

  const saveEdit = async (payload) => {
    await api.updateEvent(editingEvent.id, payload);
    setEditingEvent(null);
    load();
  };

  const remove = async (id) => {
    await api.deleteEvent(id);
    load();
  };

  const rsvp = async (eventId, status) => {
    await api.rsvpEvent(eventId, deviceId, myName, status);
    load();
  };

  const openEdit = (event) => {
    const start = () => setEditingEvent(event);
    isLeader ? start() : requestPin(start);
  };

  if (events === null) return null;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today);

  const fmtDate = (d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-ink">Events</h2>
        <button
          onClick={() => (isLeader ? setShowForm((s) => !s) : requestPin(() => setShowForm(true)))}
          className="sp-btn-pill"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && <EventForm onCancel={() => setShowForm(false)} onSave={save} />}
      {editingEvent && (
        <EventForm initial={editingEvent} onCancel={() => setEditingEvent(null)} onSave={saveEdit} />
      )}

      {upcoming.length === 0 && !showForm && <EmptyState icon={CalendarDays} text="No upcoming events yet." />}

      <div className="space-y-2.5">
        {upcoming.map((e) => (
          <div key={e.id} className="sp-card relative">
            <p className="font-serif text-lg text-ink mb-1.5 pr-14">{e.title}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-inksoft">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} /> {fmtDate(e.event_date)}
              </span>
              {e.event_time && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> {e.event_time}
                </span>
              )}
              {e.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {e.location}
                </span>
              )}
            </div>
            {e.notes && <p className="text-sm text-inksoft mt-2">{e.notes}</p>}
            <RsvpRow event={e} deviceId={deviceId} onRsvp={rsvp} />
            {isLeader && (
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <button onClick={() => openEdit(e)} className="text-inkfaint" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(e.id)} className="text-inkfaint" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-inkfaint cursor-pointer">Past events ({past.length})</summary>
          <div className="space-y-2 mt-2">
            {past.map((e) => (
              <div key={e.id} className="bg-paper border border-linesoft rounded-xl p-3.5 opacity-70">
                <p className="font-serif text-base text-ink">{e.title}</p>
                <p className="text-xs text-inkfaint">{fmtDate(e.event_date)}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
