"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import CoverScreen from "./components/CoverScreen";
import NameGate from "./components/NameGate";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import PinGate from "./components/PinGate";
import RosterView from "./components/RosterView";
import SettingsView from "./components/SettingsView";
import NotificationsView from "./components/NotificationsView";
import HelpView from "./components/HelpView";
import NotifyBanner, { shouldShowNotifyBanner } from "./components/NotifyBanner";
import HomeTab from "./components/HomeTab";
import SongsTab from "./components/SongsTab";
import SetlistsTab from "./components/SetlistsTab";
import EventsTab from "./components/EventsTab";
import PrayerTab from "./components/PrayerTab";
import NewsTab from "./components/NewsTab";
import { getDeviceId, adoptDeviceId, getStoredName, setStoredName, clearStoredName } from "@/lib/device";
import { api } from "@/lib/api";

export default function Home() {
  const [showCover, setShowCover] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [myName, setMyName] = useState(null); // null = loading, "" = needs name
  const [tab, setTab] = useState("home");
  const [isLeader, setIsLeader] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
    const storedName = getStoredName();
    setMyName(storedName);
    api.leaderStatus().then((d) => setIsLeader(!!d.isLeader)).catch(() => {});
    if (storedName) {
      api.getNotifications(id).then((d) => setUnreadCount(d.unreadCount || 0)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (myName && shouldShowNotifyBanner()) {
      const t = setTimeout(() => setShowNotifyBanner(true), 1500);
      return () => clearTimeout(t);
    }
  }, [myName]);

  const saveName = useCallback(
    async (name, personalPin) => {
      if (!name) {
        clearStoredName();
        setMyName("");
        return;
      }
      if (deviceId && personalPin) {
        await api.savePerson(deviceId, name, personalPin);
      }
      setStoredName(name);
      setMyName(name);
    },
    [deviceId]
  );

  const reconnectName = useCallback(async (name, personalPin) => {
    const result = await api.reconnectPerson(name, personalPin);
    adoptDeviceId(result.device_id);
    setDeviceId(result.device_id);
    setStoredName(result.name);
    setMyName(result.name);
  }, []);

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
    return <NameGate onSave={saveName} onReconnect={reconnectName} />;
  }

  return (
    <div className="min-h-screen bg-paper flex md:flex-row flex-col">
      <Sidebar tab={tab} setTab={setTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          myName={myName}
          onChangeName={() => saveName("")}
          isLeader={isLeader}
          onRequestPin={() => requestPin(() => {})}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadCount={unreadCount}
        />

        {showNotifyBanner && (
          <NotifyBanner deviceId={deviceId} onDone={() => setShowNotifyBanner(false)} />
        )}

        <main className="flex-1 w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto md:mx-0 md:px-6">
        {tab === "home" && <HomeTab setTab={setTab} />}
        {tab === "songs" && <SongsTab isLeader={isLeader} requestPin={requestPin} />}
        {tab === "setlists" && <SetlistsTab isLeader={isLeader} requestPin={requestPin} />}
        {tab === "events" && (
          <EventsTab deviceId={deviceId} myName={myName} isLeader={isLeader} requestPin={requestPin} />
        )}
        {tab === "prayer" && <PrayerTab deviceId={deviceId} myName={myName} isLeader={isLeader} />}
        {tab === "news" && <NewsTab isLeader={isLeader} requestPin={requestPin} />}
      </main>

        <BottomNav tab={tab} setTab={setTab} />
      </div>

      <PinGate open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSuccess} />
      {rosterOpen && <RosterView onClose={() => setRosterOpen(false)} />}
      {settingsOpen && (
        <SettingsView
          deviceId={deviceId}
          myName={myName}
          isLeader={isLeader}
          onClose={() => setSettingsOpen(false)}
          onOpenRoster={() => {
            setSettingsOpen(false);
            setRosterOpen(true);
          }}
          onOpenHelp={() => {
            setSettingsOpen(false);
            setHelpOpen(true);
          }}
          onLeaderSignOut={() => {
            setIsLeader(false);
            setSettingsOpen(false);
          }}
          rosterLabel="Who's Signed In"
        />
      )}
      {notificationsOpen && (
        <NotificationsView
          deviceId={deviceId}
          onClose={() => {
            setNotificationsOpen(false);
            setUnreadCount(0);
          }}
          setTab={setTab}
        />
      )}
      {helpOpen && <HelpView onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
