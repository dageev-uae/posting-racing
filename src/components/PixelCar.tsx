interface PixelCarProps {
  sprite: string;
  size?: number;
  rotate?: boolean;
  damaged?: boolean;
}

export function PixelCar({ sprite, size = 48, rotate = true, damaged = false }: PixelCarProps) {
  // When rotated 90deg, the sprite top becomes the car's right (front).
  // Clip the top of the original image to damage the front bumper.
  const damageClip = damaged
    ? "polygon(0% 8%, 4% 3%, 10% 6%, 18% 0%, 100% 0%, 100% 100%, 0% 100%)"
    : undefined;

  return (
    <img
      src={sprite}
      alt="car"
      className={rotate ? "rotate-[90deg]" : ""}
      style={{
        width: size,
        height: "auto",
        imageRendering: "auto",
        clipPath: damageClip,
      }}
      draggable={false}
    />
  );
}
