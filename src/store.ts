import type { Racer } from "./types";

const STORAGE_KEY = "posting-racing-v3";

const CAR_SPRITES = [
  "/cars/mark1_1.png",
  "/cars/mark3_4.png",
  "/cars/mark1_3.png",
  "/cars/mark3_3.png",
  "/cars/mark1_4.png",
  "/cars/mark3_1.png",
  "/cars/mark1_5.png",
  "/cars/mark3_5.png",
  "/cars/mark1_2.png",
  "/cars/mark3_6.png",
  "/cars/mark1_6.png",
  "/cars/mark3_2.png",
];

export function loadRacers(): Racer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as Record<string, unknown>[];
    // Migrate old format (color) to new format (sprite)
    return parsed.map((r, i) => ({
      id: String(r.id ?? crypto.randomUUID()),
      name: String(r.name ?? ""),
      sprite: typeof r.sprite === "string" ? r.sprite : CAR_SPRITES[i % CAR_SPRITES.length],
      hours: Number(r.hours ?? 0),
    }));
  } catch {
    return [];
  }
}

export function saveRacers(racers: Racer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(racers));
}

export function getNextSprite(racers: Racer[]): string {
  const used = new Set(racers.map((r) => r.sprite));
  return CAR_SPRITES.find((s) => !used.has(s)) ?? CAR_SPRITES[racers.length % CAR_SPRITES.length];
}

export function getAllSprites(): string[] {
  return CAR_SPRITES;
}
