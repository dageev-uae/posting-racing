import { useState, useEffect, useCallback } from "react";
import type { Racer } from "./types";
import { RaceTrack } from "./components/RaceTrack";
import { Leaderboard } from "./components/Leaderboard";
import { AdminPanel } from "./components/AdminPanel";
import "./App.css";

const API = "/api/racers";

function App() {
  const [racers, setRacers] = useState<Racer[]>([]);

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

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <header className="flex items-center justify-center py-3 border-b border-gray-700 bg-gray-900">
        <h1 className="text-[12px] text-yellow-400 tracking-widest">
          POSTING RACING
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <RaceTrack racers={racers} maxHours={TRACK_LENGTH} />
        <Leaderboard racers={racers} />
      </div>

      <AdminPanel racers={racers} onUpdate={handleUpdate} onRefresh={fetchRacers} />
    </div>
  );
}

export default App;
