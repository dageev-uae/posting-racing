interface PixelCarProps {
  sprite: string;
  size?: number;
  rotate?: boolean;
  gray?: boolean;
}

export function PixelCar({ sprite, size = 48, rotate = true, gray = false }: PixelCarProps) {
  return (
    <img
      src={sprite}
      alt="car"
      className={rotate ? "rotate-[90deg]" : ""}
      style={{
        width: size,
        height: "auto",
        imageRendering: "auto",
        filter: gray ? "grayscale(1) brightness(1.6) contrast(0.7)" : undefined,
      }}
      draggable={false}
    />
  );
}
