interface PixelCarProps {
  sprite: string;
  size?: number;
}

export function PixelCar({ sprite, size = 48 }: PixelCarProps) {
  return (
    <img
      src={sprite}
      alt="car"
      className="rotate-[90deg]"
      style={{ width: size, height: "auto", imageRendering: "auto" }}
      draggable={false}
    />
  );
}
