"use client";

import { useState } from "react";
import InfoTooltip from "./InfoTooltip";

export default function NameGate({ onSave, onReconnect }) {
  const [mode, setMode] = useState("new"); // "new" | "reconnect"
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !pin.trim()) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "new") {
        await onSave(name.trim(), pin.trim());
      } else {
        await onReconnect(name.trim(), pin.trim());
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "new" ? "reconnect" : "new");
    setError("");
    setPin("");
  };

  return (
    <div
      className="min-h-screen bg-paper flex items-center justify-center px-7"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-sm w-full text-center">
        <p className="font-serif text-2xl text-ink mb-2">
          {mode === "new" ? "What's your name?" : "Welcome back"}
        </p>
        <p className="text-sm text-inksoft mb-6 leading-relaxed">
          {mode === "new"
            ? "This is how your posts will be signed. Choose a short PIN too — it lets you sign back in as yourself if you ever use a different phone."
            : "Enter the name and PIN you set up before, to reconnect on this device."}
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name or full name"
          className="sp-input text-center text-base mb-2.5"
        />
        {mode === "new" && (
          <p className="text-xs text-inkfaint mb-1.5">
            Choose a PIN
            <InfoTooltip text="This lets you sign back in as yourself if you ever use a different phone." />
          </p>
        )}
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={mode === "new" ? "Choose a PIN" : "Your PIN"}
          className="sp-input text-center text-base mb-1"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && <p className="text-accent text-sm mt-2 mb-1">{error}</p>}

        <button onClick={submit} disabled={loading} className="sp-btn-primary w-full mt-4 mb-4">
          {loading ? "Please wait..." : mode === "new" ? "Continue" : "Reconnect"}
        </button>

        <button onClick={switchMode} className="text-xs text-inkfaint underline">
          {mode === "new" ? "Already have a PIN? Reconnect instead" : "New here? Set up a name and PIN"}
        </button>
      </div>
    </div>
  );
}
