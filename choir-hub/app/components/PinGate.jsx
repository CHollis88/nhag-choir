"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { api } from "@/lib/api";

export default function PinGate({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(false);
    try {
      await api.verifyLeaderPin(pin);
      setPin("");
      setLoading(false);
      onSuccess();
    } catch {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:w-96 bg-card rounded-t-2xl sm:rounded-2xl border border-line p-6 pb-8 sm:pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-ink">
            <Lock size={16} strokeWidth={2} />
            <span className="font-serif text-lg">Leader PIN</span>
          </div>
          <button onClick={onClose} className="text-inkfaint">
            <X size={20} />
          </button>
        </div>
        <input
          autoFocus
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          placeholder="Enter PIN"
          className="sp-input text-center text-lg tracking-widest"
          style={{ borderColor: error ? "rgb(var(--color-accent))" : undefined }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && (
          <p className="text-accent text-sm mt-2 text-center">That's not it — try again.</p>
        )}
        <button onClick={submit} disabled={loading} className="sp-btn-primary w-full mt-4">
          {loading ? "Checking..." : "Unlock"}
        </button>
      </div>
    </div>
  );
}
