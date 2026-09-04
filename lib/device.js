const DEVICE_ID_KEY = "sp_device_id";
const NAME_KEY = "sp_name";

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getStoredName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) || "";
}

export function setStoredName(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
}

export function clearStoredName() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(NAME_KEY);
}
