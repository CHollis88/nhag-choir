"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import CoverScreen from "./components/CoverScreen";
import NameGate from "./components/NameGate";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import PinGate from "./components/PinGate";
import NotifyBanner, { shouldShowNotifyBanner } from "./components/NotifyBanner";
import SongsTab from "./components/SongsTab";
import SetlistsTab from "./components/SetlistsTab";
import EventsTab from "./components/EventsTab";
import PrayerTab from "./components/PrayerTab";
import NewsTab from "./components/NewsTab";
import { getDeviceId, getStoredName, setStoredName, clearStoredName } from "@/lib/device";
import { api } from "@/lib/api";

export default function Home() {
  const [showCover, setShowCover] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [myName, setMyName] = useState(null); // null = loading, "" = needs name
  const [tab, setTab] = useState("songs");
  const [isLeader, setIsLeader] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [showNotifyBanner, setShowNotifyBanner] = useState(false);
  const pinCallback = useRef(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    setMyName(getStoredName());
    api.leaderStatus().then((d) => setIsLeader(!!d.isLeader)).catch(() => {});
  }, []);

  useEffect(() => {
    if (myName && shouldShowNotifyBanner()) {
      const t = setTimeout(() => setShowNotifyBanner(true), 1500);
      return () => clearTimeout(t);
    }
  }, [myName]);

  const saveName = useCallback(
    async (name) => {
      if (!name) {
        clearStoredName();
        setMyName("");
        return;
      }
      setStoredName(name);
      setMyName(name);
      if (deviceId) await api.savePerson(deviceId, name);
    },
    [deviceId]
  );

  const requestPin = useCallback((cb) => {
    pinCallback.current = cb;
    setPinOpen(true);
  }, []);

  const handlePinSuccess = () => {
    setIsLeader(true);
    setPinOpen(false);
    if (pinCallback.current) {
      pinCallback.current();
      pinCallback.current = null;
    }
  };

  if (showCover) {
    return <CoverScreen onEnter={() => setShowCover(false)} />;
  }

  if (myName === null || deviceId === null) return null;

  if (!myName) {
    return <NameGate onSave={saveName} />;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header
        myName={myName}
        onChangeName={() => saveName("")}
        isLeader={isLeader}
        onRequestPin={() => requestPin(() => {})}
      />

      {showNotifyBanner && (
        <NotifyBanner deviceId={deviceId} onDone={() => setShowNotifyBanner(false)} />
      )}

      <main className="flex-1 max-w-lg w-full mx-auto">
        {tab === "songs" && <SongsTab isLeader={isLeader} requestPin={requestPin} />}
        {tab === "setlists" && <SetlistsTab isLeader={isLeader} requestPin={requestPin} />}
        {tab === "events" && (
          <EventsTab deviceId={deviceId} myName={myName} isLeader={isLeader} requestPin={requestPin} />
        )}
        {tab === "prayer" && <PrayerTab deviceId={deviceId} myName={myName} isLeader={isLeader} />}
        {tab === "news" && <NewsTab isLeader={isLeader} requestPin={requestPin} />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />

      <PinGate open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSuccess} />
    </div>
  );
}
