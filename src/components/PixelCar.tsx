interface PixelCarProps {
  sprite: string;
  size?: number;
  rotate?: boolean;
}

export function PixelCar({ sprite, size = 48, rotate = true }: PixelCarProps) {
  return (
    <img
      src={sprite}
      alt="car"
      className={rotate ? "rotate-[90deg]" : ""}
      style={{ width: size, height: "auto", imageRendering: "auto" }}
      draggable={false}
    />
  );
}
