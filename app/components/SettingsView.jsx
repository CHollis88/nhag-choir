"use client";

import { useEffect, useState } from "react";
import {
  X,
  Sun,
  Moon,
  MonitorSmartphone,
  Bell,
  Lock,
  LogOut,
  Users,
  HelpCircle,
  Pencil,
  Check,
} from "lucide-react";
import { getStoredPreference, applyTheme } from "@/lib/theme";
import { api } from "@/lib/api";

const THEME_OPTIONS = [
  { id: "system", label: "Auto", icon: MonitorSmartphone },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

function Row({ children }) {
  return <div className="sp-card mb-2.5">{children}</div>;
}

function SectionLabel({ children }) {
  return <p className="text-xs uppercase tracking-wide text-inkfaint mb-2 mt-5 first:mt-0">{children}</p>;
}

export default function SettingsView({
  deviceId,
  myName,
  isLeader,
  onClose,
  onOpenRoster,
  onOpenHelp,
  onLeaderSignOut,
  rosterLabel = "Group Progress",
}) {
  const [theme, setTheme] = useState("system");
  const [personalPin, setPersonalPin] = useState(null);
  const [editingPin, setEditingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [savingPin, setSavingPin] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");
  const [version, setVersion] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setTheme(getStoredPreference());
    if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);
    if (deviceId) api.getMyInfo(deviceId).then((d) => setPersonalPin(d.personalPin));
    fetch("/version.json")
      .then((r) => r.json())
      .then(setVersion)
      .catch(() => {});
  }, [deviceId]);

  const chooseTheme = (id) => {
    setTheme(id);
    applyTheme(id);
  };

  const savePin = async () => {
    if (!newPin.trim()) return;
    setSavingPin(true);
    setPinError("");
    try {
      await api.savePerson(deviceId, myName, newPin.trim());
      setPersonalPin(newPin.trim());
      setEditingPin(false);
      setNewPin("");
    } catch (err) {
      setPinError(err.message || "Couldn't save that PIN.");
    } finally {
      setSavingPin(false);
    }
  };

  const requestNotifications = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const signOutLeader = async () => {
    setSigningOut(true);
    try {
      await api.leaderSignOut();
      onLeaderSignOut();
    } finally {
      setSigningOut(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
      <div
        className="bg-card w-full max-w-lg mx-auto min-h-screen p-6 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-serif text-xl text-ink">Settings</p>
          <button onClick={onClose} className="text-inkfaint">
            <X size={22} />
          </button>
        </div>

        <SectionLabel>Theme</SectionLabel>
        <Row>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => chooseTheme(id)}
                className={`rounded-lg border py-2.5 flex flex-col items-center gap-1 text-xs font-medium ${
                  theme === id ? "bg-accent border-accent text-white" : "border-line text-inksoft"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </Row>

        <SectionLabel>Personal PIN</SectionLabel>
        <Row>
          {editingPin ? (
            <div className="space-y-2">
              <input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN"
                className="sp-input text-sm"
                onKeyDown={(e) => e.key === "Enter" && savePin()}
              />
              {pinError && <p className="text-accent text-xs">{pinError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPin(false);
                    setPinError("");
                  }}
                  className="sp-btn-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
                <button onClick={savePin} disabled={savingPin} className="sp-btn-primary flex-1 text-xs py-2">
                  {savingPin ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink">
                {personalPin ? (
                  <>
                    Current PIN: <span className="font-mono">{personalPin}</span>
                  </>
                ) : (
                  "No PIN set yet"
                )}
              </p>
              <button
                onClick={() => setEditingPin(true)}
                className="text-xs text-accent font-medium flex items-center gap-1"
              >
                <Pencil size={12} /> Change
              </button>
            </div>
          )}
        </Row>

        <SectionLabel>Notifications</SectionLabel>
        <Row>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-inkfaint" />
              <p className="text-sm text-ink">
                {notifPermission === "granted"
                  ? "Notifications are on"
                  : notifPermission === "denied"
                  ? "Notifications are blocked"
                  : "Notifications are off"}
              </p>
            </div>
            {notifPermission === "default" && (
              <button onClick={requestNotifications} className="text-xs text-accent font-medium">
                Turn on
              </button>
            )}
          </div>
          {notifPermission === "denied" && (
            <p className="text-xs text-inkfaint mt-2">
              Enable notifications for this app in your phone's system settings to turn them back on.
            </p>
          )}
        </Row>

        {isLeader && (
          <>
            <SectionLabel>Leader</SectionLabel>
            <Row>
              <button
                onClick={onOpenRoster}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <Users size={16} className="text-inkfaint" /> {rosterLabel}
                </span>
              </button>
            </Row>
            <Row>
              <button
                onClick={signOutLeader}
                disabled={signingOut}
                className="w-full flex items-center gap-2 text-left text-sm text-accent"
              >
                <LogOut size={16} /> {signingOut ? "Signing out..." : "Sign Out of Leader Access"}
              </button>
            </Row>
          </>
        )}

        <SectionLabel>About</SectionLabel>
        <Row>
          <button onClick={onOpenHelp} className="w-full flex items-center gap-2 text-left text-sm text-ink">
            <HelpCircle size={16} className="text-inkfaint" /> Help &amp; FAQ
          </button>
        </Row>
        <Row>
          <p className="text-xs text-inkfaint">
            Version: <span className="font-mono">{version?.commit || "—"}</span>
            {version?.builtAt && <> · Updated {fmtDate(version.builtAt)}</>}
          </p>
        </Row>
      </div>
    </div>
  );
}
