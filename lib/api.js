async function j(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  savePerson: (device_id, name, personal_pin) =>
    fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, name, personal_pin }),
    }).then(j),

  getMyInfo: (device_id) =>
    fetch(`/api/people?device_id=${encodeURIComponent(device_id)}`).then(j),

  reconnectPerson: (name, personal_pin) =>
    fetch("/api/people/reconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, personal_pin }),
    }).then(j),

  getSongs: () => fetch("/api/songs").then(j),
  createSong: (song) =>
    fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(song),
    }).then(j),
  updateSong: (id, song) =>
    fetch("/api/songs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...song }),
    }).then(j),
  deleteSong: (id) => fetch(`/api/songs?id=${id}`, { method: "DELETE" }).then(j),

  getSetlists: () => fetch("/api/setlists").then(j),
  createSetlist: (setlist) =>
    fetch("/api/setlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setlist),
    }).then(j),
  updateSetlist: (id, setlist) =>
    fetch("/api/setlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...setlist }),
    }).then(j),
  deleteSetlist: (id) => fetch(`/api/setlists?id=${id}`, { method: "DELETE" }).then(j),

  getEvents: () => fetch("/api/events").then(j),
  createEvent: (event) =>
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).then(j),
  updateEvent: (id, event) =>
    fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...event }),
    }).then(j),
  deleteEvent: (id) => fetch(`/api/events?id=${id}`, { method: "DELETE" }).then(j),
  rsvpEvent: (eventId, device_id, name, status) =>
    fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, name, status }),
    }).then(j),

  getPrayer: (device_id) =>
    fetch(`/api/prayer${device_id ? `?device_id=${encodeURIComponent(device_id)}` : ""}`).then(j),
  createPrayer: (device_id, name, text, anonymous) =>
    fetch("/api/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, name, text, anonymous }),
    }).then(j),
  updatePrayer: (id, device_id, name, text, anonymous) =>
    fetch(`/api/prayer/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, name, text, anonymous }),
    }).then(j),
  deletePrayer: (id, device_id) =>
    fetch(`/api/prayer/${id}?device_id=${encodeURIComponent(device_id)}`, {
      method: "DELETE",
    }).then(j),
  prayFor: (id, device_id) =>
    fetch(`/api/prayer/${id}/pray`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id }),
    }).then(j),

  getAnnouncements: () => fetch("/api/announcements").then(j),
  createAnnouncement: (title, body) =>
    fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    }).then(j),
  updateAnnouncement: (id, title, body) =>
    fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, body }),
    }).then(j),
  deleteAnnouncement: (id) => fetch(`/api/announcements?id=${id}`, { method: "DELETE" }).then(j),

  verifyLeaderPin: (pin) =>
    fetch("/api/leader/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).then(j),
  leaderStatus: () => fetch("/api/leader/verify").then(j),
  leaderSignOut: () => fetch("/api/leader/verify", { method: "DELETE" }).then(j),

  getRoster: () => fetch("/api/roster").then(j),
  removeFromRoster: (device_id) =>
    fetch(`/api/roster?device_id=${encodeURIComponent(device_id)}`, { method: "DELETE" }).then(j),

  getNotifications: (device_id) =>
    fetch(`/api/notifications${device_id ? `?device_id=${encodeURIComponent(device_id)}` : ""}`).then(j),
  markNotificationsSeen: (device_id) =>
    fetch("/api/notifications/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id }),
    }).then(j),
};
