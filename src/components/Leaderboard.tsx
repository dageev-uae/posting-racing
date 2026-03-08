import type { Racer } from "../types";
import { PixelCar } from "./PixelCar";

interface LeaderboardProps {
  racers: Racer[];
}

export function Leaderboard({ racers }: LeaderboardProps) {
  const sorted = [...racers].sort((a, b) => b.hours - a.hours);

  return (
    <div className="w-72 border-l border-gray-700 bg-gray-900/80 flex flex-col">
      <h2 className="text-[10px] text-center py-3 border-b border-gray-700 text-yellow-400 tracking-wider">
        LEADERBOARD
      </h2>

      <div className="flex-1 overflow-y-auto">
        {sorted.map((racer, i) => (
          <div
            key={racer.id}
            className={`flex items-center gap-3 px-3 py-2 border-b border-gray-800 ${
              i === 0 ? "bg-yellow-900/20" : ""
            }`}
          >
            {/* Position */}
            <span
              className={`text-[10px] w-5 font-bold ${
                i === 0
                  ? "text-yellow-400"
                  : i === 1
                    ? "text-gray-300"
                    : i === 2
                      ? "text-amber-600"
                      : "text-gray-500"
              }`}
            >
              {i + 1}.
            </span>

            {/* Mini car */}
            <PixelCar sprite={racer.sprite} size={28} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[8px] truncate">{racer.name}</div>
              <div className="text-[7px] text-gray-400">{racer.hours}%</div>
            </div>

            {/* Trophy for first */}
            {i === 0 && <span className="text-sm">&#x1F3C6;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
