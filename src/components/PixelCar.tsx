interface PixelCarProps {
  sprite: string;
  size?: number;
  rotate?: boolean;
  damaged?: boolean;
}

export function PixelCar({ sprite, size = 48, rotate = true, damaged = false }: PixelCarProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={sprite}
        alt="car"
        className={rotate ? "rotate-[90deg]" : ""}
        style={{
          width: size,
          height: "auto",
          imageRendering: "auto",
          ...(damaged ? {
            clipPath: "polygon(0% 0%, 92% 0%, 100% 12%, 96% 20%, 100% 100%, 0% 100%)",
            transform: rotate ? "rotate(90deg) skewX(-2deg)" : "skewX(-2deg)",
          } : {}),
        }}
        draggable={false}
      />
      {damaged && (
        <>
          {/* Scratch marks */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: rotate ? "2px" : undefined,
              right: rotate ? "1px" : undefined,
              bottom: rotate ? undefined : "2px",
              left: rotate ? undefined : "1px",
              width: 4,
              height: 6,
              background: "linear-gradient(135deg, #333 1px, transparent 1px, transparent 2px, #333 2px, transparent 3px)",
              opacity: 0.7,
            }}
          />
        </>
      )}
    </div>
  );
}
