import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const DATA_FILE = path.join(__dirname, "data.json");

const CAR_SPRITES = [
  "/cars/mark1_1.png", "/cars/mark3_4.png", "/cars/mark1_3.png",
  "/cars/mark3_3.png", "/cars/mark3_1.png",
  "/cars/mark3_5.png", "/cars/mark1_2.png",
  "/cars/mark3_6.png", "/cars/mark1_6.png", "/cars/mark3_2.png",
];
// Reserved sprites (not in general pool)
// mark1_5.png — Ilsur (silver)
// mark1_4.png — Snezhana (red)

let racers = loadData();

function loadData() {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveData() {
  writeFileSync(DATA_FILE, JSON.stringify(racers, null, 2));
}

function getNextSprite(existing) {
  const used = new Set(existing.map((r) => r.sprite));
  return CAR_SPRITES.find((s) => !used.has(s)) ?? CAR_SPRITES[existing.length % CAR_SPRITES.length];
}

// Auth middleware for admin routes
function requireAuth(req, res, next) {
  const password = process.env.PASSWORD;
  if (!password) return next();
  const token = req.headers.authorization;
  if (token !== password) {
    return res.status(401).json({ error: "Wrong password" });
  }
  next();
}

app.post("/api/login", express.json(), (req, res) => {
  const password = process.env.PASSWORD;
  if (!password || req.body.password === password) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Wrong password" });
});

// API
app.get("/api/racers", (_req, res) => {
  res.json(racers);
});

app.post("/api/racers", requireAuth, express.json(), (req, res) => {
  racers = req.body;
  saveData();
  res.json(racers);
});

app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    // Find "Posting completeness, %" column index in the Total section
    // Row 1 (idx 0): section headers — find "Total" column
    // Row 2 (idx 1): sub-headers — find "Posting completeness, %" relative to Total
    const header1 = rows[0] || [];
    const header2 = rows[1] || [];

    // Find "Current Posting completeness, %" and "Posting completeness, %" columns in Total section
    let currentCol = -1;
    let totalCol = -1;

    for (let c = 0; c < header2.length; c++) {
      const h = String(header2[c] || "").trim();
      const section = header1[c] || header1.slice(0, c + 1).reverse().find(Boolean);
      if (section !== "Total") continue;
      const hasData = rows.slice(2).some((r) => r[0] && r[c] != null);
      if (!hasData) continue;
      if (h === "Current Posting completeness, %" && currentCol < 0) currentCol = c;
      if (h === "Posting completeness, %" && totalCol < 0) totalCol = c;
    }

    if (currentCol < 0 && totalCol < 0) {
      return res.status(400).json({ error: "Could not find posting completeness columns" });
    }

    // Parse officers
    const parsed = [];
    for (let i = 2; i < rows.length; i++) {
      const name = rows[i][0];
      const dateCol = rows[i][1];
      const SKIP_NAMES = ["total"];
      const workDays = rows[i][5]; // 6th column (0-indexed: 5) = Work days
      if (name && typeof name === "string" && name.trim() && (dateCol == null || dateCol === "") && !SKIP_NAMES.includes(name.trim().toLowerCase()) && workDays != null && workDays !== "") {
        const current = currentCol >= 0 ? Number(rows[i][currentCol]) || 0 : 0;
        const total = totalCol >= 0 ? Number(rows[i][totalCol]) || 0 : 0;
        parsed.push({ name: name.trim(), progress: current, progressTotal: total });
      }
    }

    if (parsed.length === 0) {
      return res.status(400).json({ error: "No officers found in file" });
    }

    // Merge with existing racers (preserve sprites, add new ones)
    const existingByName = new Map(racers.map((r) => [r.name.toLowerCase(), r]));
    const updated = [];

    for (const p of parsed) {
      const existing = existingByName.get(p.name.toLowerCase());
      if (existing) {
        updated.push({ ...existing, hours: p.progress, hoursTotal: p.progressTotal });
      } else {
        updated.push({
          id: crypto.randomUUID(),
          name: p.name,
          sprite: getNextSprite([...racers, ...updated]),
          hours: p.progress,
          hoursTotal: p.progressTotal,
        });
      }
    }

    // Ilsur always gets the silver car
    const ilsur = updated.find((r) => r.name.toLowerCase().startsWith("ilsur"));
    if (ilsur) {
      ilsur.sprite = "/cars/mark1_5.png";
    }

    // Rename duplicates
    const eugeny = updated.find((r) => r.name.toLowerCase() === "eugeny");
    if (eugeny) {
      eugeny.name = "Eugeny A.";
    }
    const evgeny = updated.find((r) => r.name.toLowerCase() === "evgeny");
    if (evgeny) {
      evgeny.name = "Evgeny Z.";
    }

    // Snezhana always gets the red car
    const snezhana = updated.find((r) => r.name.toLowerCase().startsWith("snezhana"));
    if (snezhana) {
      snezhana.sprite = "/cars/mark1_4.png";
    }

    racers = updated;
    saveData();
    res.json({ racers, parsed: parsed.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse file: " + err.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
