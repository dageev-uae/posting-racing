import { useState, useEffect, useCallback } from "react";
import type { Racer } from "./types";
import { RaceTrack } from "./components/RaceTrack";
import { Leaderboard } from "./components/Leaderboard";
import { AdminPanel } from "./components/AdminPanel";
import "./App.css";

const API = "/api/racers";

type Tab = "today" | "total";

function App() {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [tab, setTab] = useState<Tab>("today");

  const fetchRacers = useCallback(async () => {
    try {
      const res = await fetch(API);
      if (res.ok) setRacers(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchRacers();
    const id = setInterval(fetchRacers, 5000);
    return () => clearInterval(id);
  }, [fetchRacers]);

  const handleUpdate = async (updated: Racer[], password: string) => {
    setRacers(updated);
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: password },
      body: JSON.stringify(updated),
    });
  };

  const TRACK_LENGTH = 100;

  // Map racers based on selected tab
  const displayRacers = racers.map((r) =>
    tab === "total" ? { ...r, hours: r.hoursTotal ?? r.hours } : r
  );

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <header className="flex items-center justify-center py-3 border-b border-gray-700 bg-gray-900 gap-6">
        <h1 className="text-[12px] text-yellow-400 tracking-widest">
          POSTING RACING
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("today")}
            className={`text-[9px] px-3 py-1 border ${
              tab === "today"
                ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                : "border-gray-600 text-gray-400 hover:text-gray-200"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => setTab("total")}
            className={`text-[9px] px-3 py-1 border ${
              tab === "total"
                ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                : "border-gray-600 text-gray-400 hover:text-gray-200"
            }`}
          >
            MONTH
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <RaceTrack racers={displayRacers} maxHours={TRACK_LENGTH} key={tab} />
        <Leaderboard racers={displayRacers} />
      </div>

      <AdminPanel racers={racers} onUpdate={handleUpdate} onRefresh={fetchRacers} />
    </div>
  );
}

export default App;
