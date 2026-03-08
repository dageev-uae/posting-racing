import type { Racer } from "../types";
import { PixelCar } from "./PixelCar";

interface RaceTrackProps {
  racers: Racer[];
  maxHours: number;
}

const ASPHALT = "#6b6b6b";

export function RaceTrack({ racers, maxHours }: RaceTrackProps) {
  const CHECKPOINT_INTERVAL = 8;
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const checkpoints = Array.from(
    { length: Math.floor(maxHours / CHECKPOINT_INTERVAL) },
    (_, i) => ({ hours: (i + 1) * CHECKPOINT_INTERVAL, label: DAY_LABELS[i] ?? `${(i + 1) * CHECKPOINT_INTERVAL}h` })
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Red-white curb top */}
      <div
        className="h-2 shrink-0"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 12px, #ffffff 12px, #ffffff 24px)",
        }}
      />

      {/* Track header with checkpoint labels */}
      <div className="flex shrink-0" style={{ backgroundColor: ASPHALT }}>
        <div className="w-24 shrink-0 px-2 py-2 text-[7px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          START
        </div>
        <div className="flex-1 relative py-2">
          {checkpoints.map((cp) => (
            <span
              key={cp.hours}
              className="absolute text-[7px] text-white/70 -translate-x-1/2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
              style={{ left: `${(cp.hours / maxHours) * 100}%` }}
            >
              {cp.label}
            </span>
          ))}
          <span className="absolute right-0 text-[7px] text-yellow-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {maxHours}h
          </span>
        </div>
      </div>

      {/* Lanes */}
      <div
        className="relative flex-1 overflow-y-auto"
        style={{ backgroundColor: ASPHALT }}
      >
        {racers.map((racer) => {
          const progress = Math.min((racer.hours / maxHours) * 100, 100);

          return (
            <div key={racer.id} className="relative">
              <div className="flex items-center h-20">
                {/* Name label */}
                <div className="w-24 shrink-0 px-2 text-[7px] truncate text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {racer.name}
                </div>

                {/* Track area */}
                <div className="flex-1 relative h-full">
                  {/* Checkpoint lines */}
                  {checkpoints.map((cp) => (
                    <div
                      key={cp.hours}
                      className="absolute top-0 bottom-0 w-px bg-white/15"
                      style={{ left: `${(cp.hours / maxHours) * 100}%` }}
                    />
                  ))}

                  {/* Car */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
                    style={{ left: `calc(${progress}% - 36px)` }}
                  >
                    <PixelCar sprite={racer.sprite} size={56} />
                  </div>
                </div>
              </div>

              {/* White dashed lane divider */}
              <div
                className="h-[4px]"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 20px, transparent 20px, transparent 40px)",
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

        {/* Finish line */}
        {racers.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-[repeating-conic-gradient(#fff_0%_25%,#000_0%_50%)] bg-[length:16px_16px] z-20" />
        )}
      </div>

      {/* Red-white curb bottom */}
      <div
        className="h-2 shrink-0"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 12px, #ffffff 12px, #ffffff 24px)",
        }}
      />

    </div>
  );
}
