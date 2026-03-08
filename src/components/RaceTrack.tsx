import type { Racer } from "../types";
import { PixelCar } from "./PixelCar";

interface RaceTrackProps {
  racers: Racer[];
  maxHours: number;
}

const ASPHALT = "#6b6b6b";

export function RaceTrack({ racers, maxHours }: RaceTrackProps) {
  const CHECKPOINT_INTERVAL = 25;
  const checkpoints = Array.from(
    { length: Math.floor(maxHours / CHECKPOINT_INTERVAL) },
    (_, i) => ({ hours: (i + 1) * CHECKPOINT_INTERVAL, label: `${(i + 1) * CHECKPOINT_INTERVAL}%` })
  );

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
      {/* Horizontal scroll wrapper for mobile */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto flex flex-col">
        <div className="min-w-[600px] flex-1 flex flex-col">
      {/* Red-white curb top */}
      <div
        className="h-2 shrink-0"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 12px, #ffffff 12px, #ffffff 24px)",
        }}
      />

      {/* Track header with checkpoint labels */}
      <div className="flex shrink-0" style={{ backgroundColor: ASPHALT }}>
        <div className="flex-1 relative py-2 px-2">
          <span className="text-[7px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            START
          </span>
          {checkpoints.map((cp) => (
            <span
              key={cp.hours}
              className="absolute text-[7px] text-white/70 -translate-x-1/2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
              style={{ left: `calc(${88 + 4}px + (100% - ${88 + 16 + 4}px) * ${cp.hours / maxHours})` }}
            >
              {cp.label}
            </span>
          ))}
          <span className="absolute right-0 text-[7px] text-yellow-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            100%
          </span>
        </div>
      </div>

      {/* Lanes wrapper — relative so start/finish lines overlay the scroll area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Start line */}
        {racers.length > 0 && (
          <div className="absolute top-0 bottom-0 w-[3px] bg-white/50 z-30 pointer-events-none" style={{ left: 88 }} />
        )}
        {/* Finish line */}
        {racers.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-[repeating-conic-gradient(#fff_0%_25%,#000_0%_50%)] bg-[length:16px_16px] z-30 pointer-events-none" />
        )}

        <div
          className="h-full overflow-y-auto pt-10"
          style={{ backgroundColor: ASPHALT }}
        >
        {/* Top lane divider */}
        {racers.length > 0 && (
          <div
            className="h-[2px]"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 12px, transparent 12px, transparent 24px)",
            }}
          />
        )}
        {racers.map((racer) => {
          const progress = Math.min((racer.hours / maxHours) * 100, 100);
          // 0% = before start line, >0% = after start line scaled to remaining track
          const START_PX = 88;
          const FINISH_PX = 16;
          const carLeft = progress === 0
            ? '28px'
            : `calc(${START_PX + 4}px + (100% - ${START_PX + FINISH_PX + 4}px) * ${progress / 100})`;

          return (
            <div key={racer.id} className="relative">
              <div className="relative h-16">
                {/* Checkpoint lines */}
                {checkpoints.map((cp) => (
                  <div
                    key={cp.hours}
                    className="absolute top-0 bottom-0 w-px bg-white/15"
                    style={{ left: `calc(${START_PX + 4}px + (100% - ${START_PX + FINISH_PX + 4}px) * ${(cp.hours / maxHours)})` }}
                  />
                ))}

                {/* Car with name above */}
                <div
                  className="absolute bottom-2 transition-all duration-1000 ease-out z-10 flex flex-col items-center"
                  style={{ left: carLeft }}
                >
                  <span className="text-[7px] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] -mb-1">
                    {racer.name.split(" ")[0]}
                  </span>
                  <PixelCar sprite={racer.sprite} size={36} damaged={racer.name.startsWith("Ilsur")} />
                </div>
              </div>

              {/* White dashed lane divider */}
              <div
                className="h-[2px]"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 12px, transparent 12px, transparent 24px)",
                }}
              />
            </div>
          );
        })}

        {racers.length === 0 && (
          <div className="flex items-center justify-center h-48 text-gray-300 text-[8px]">
            No racers yet. Add some in the admin panel!
          </div>
        )}

        </div>
      </div>

      {/* Red-white curb bottom */}
      <div
        className="h-2 shrink-0"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 12px, #ffffff 12px, #ffffff 24px)",
        }}
      />

        </div>{/* close min-w-[600px] */}
      </div>{/* close overflow-x-auto */}
    </div>
  );
}
