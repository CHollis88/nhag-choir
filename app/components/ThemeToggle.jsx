"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { getStoredPreference, applyTheme, watchSystemTheme } from "@/lib/theme";

const ORDER = ["system", "light", "dark"];
const ICONS = { system: MonitorSmartphone, light: Sun, dark: Moon };
const LABELS = { system: "Auto", light: "Light", dark: "Dark" };

export default function ThemeToggle() {
  const [pref, setPref] = useState("system");

  useEffect(() => {
    setPref(getStoredPreference());
    const unwatch = watchSystemTheme();
    return unwatch;
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
    setPref(next);
    applyTheme(next);
  };

  const Icon = ICONS[pref];

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1 text-inkfaint"
      aria-label={`Theme: ${LABELS[pref]} (tap to change)`}
      title={`Theme: ${LABELS[pref]}`}
    >
      <Icon size={16} />
    </button>
  );
}
