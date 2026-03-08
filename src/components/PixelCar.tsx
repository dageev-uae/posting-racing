interface PixelCarProps {
  sprite: string;
  size?: number;
  rotate?: boolean;
  damaged?: boolean;
}

export function PixelCar({ sprite, size = 48, rotate = true, damaged = false }: PixelCarProps) {
  return (
    <img
      src={sprite}
      alt="car"
      className={rotate ? "rotate-[90deg]" : ""}
      style={{
        width: size,
        height: "auto",
        imageRendering: "auto",
        ...(damaged ? {
          clipPath: "polygon(0% 20%, 5% 8%, 12% 18%, 20% 3%, 28% 15%, 35% 0%, 100% 0%, 100% 92%, 95% 100%, 0% 100%)",
        } : {}),
      }}
      draggable={false}
    />
  );
}
