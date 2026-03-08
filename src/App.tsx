import { useState, useEffect } from "react";
import type { Racer } from "./types";
import { loadRacers, saveRacers } from "./store";
import { RaceTrack } from "./components/RaceTrack";
import { Leaderboard } from "./components/Leaderboard";
import { AdminPanel } from "./components/AdminPanel";
import "./App.css";

function App() {
  const [racers, setRacers] = useState<Racer[]>(loadRacers);

  useEffect(() => {
    saveRacers(racers);
  }, [racers]);

  const TRACK_LENGTH = 40;

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-center py-3 border-b border-gray-700 bg-gray-900">
        <h1 className="text-[12px] text-yellow-400 tracking-widest">
          POSTING RACING
        </h1>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <RaceTrack racers={racers} maxHours={TRACK_LENGTH} />
        <Leaderboard racers={racers} />
      </div>

      {/* Admin panel */}
      <AdminPanel racers={racers} onUpdate={setRacers} />
    </div>
  );
}

export default App;
