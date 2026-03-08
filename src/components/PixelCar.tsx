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
          clipPath: "polygon(0% 15%, 8% 5%, 20% 12%, 30% 0%, 100% 0%, 100% 100%, 0% 100%)",
        } : {}),
      }}
      draggable={false}
    />
  );
}
