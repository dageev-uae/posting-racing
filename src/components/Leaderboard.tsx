import type { Racer } from "../types";
import { PixelCar } from "./PixelCar";

interface LeaderboardProps {
  racers: Racer[];
}

export function Leaderboard({ racers }: LeaderboardProps) {
  const sorted = [...racers].sort((a, b) => b.hours - a.hours);

  return (
    <div className="md:w-72 border-t md:border-t-0 md:border-l border-gray-700 bg-gray-900/80 flex flex-col shrink-0 max-h-[40vh] md:max-h-none">
      <h2 className="text-[10px] text-center py-2 md:py-3 border-b border-gray-700 text-yellow-400 tracking-wider">
        LEADERBOARD
      </h2>

      <div className="flex-1 overflow-y-auto">
        {sorted.map((racer, i) => (
          <div
            key={racer.id}
            className={`flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 border-b border-gray-800 ${
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
            <div className="shrink-0">
              <PixelCar sprite={racer.sprite} size={28} rotate={false} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[8px] truncate">{racer.name.split(" ")[0]}</div>
              <div className="text-[7px] text-gray-400">{racer.hours}%</div>
            </div>

            {/* Trophies */}
            {i === 0 && <span className="text-sm">🥇</span>}
            {i === 1 && <span className="text-sm">🥈</span>}
            {i === 2 && <span className="text-sm">🥉</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
