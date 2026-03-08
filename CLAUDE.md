# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A gamified "posting completeness" tracker that visualizes team members' progress as a pixel-art car race. Each person is a racer with a car sprite; their posting completeness percentage determines how far along the track they are.

## Commands

- `npm run dev` — Start Vite dev server (frontend on :5173, proxies `/api` to :3000)
- `npm run start` — Start Express backend (port 3000, serves built frontend from `dist/`)
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint

For development, run both `npm run start` and `npm run dev` concurrently.

## Architecture

**Frontend:** React 19 + TypeScript + Tailwind CSS v4 (Vite plugin), retro pixel-art aesthetic using "Press Start 2P" font. All text uses very small font sizes (7-10px).

**Backend:** Express 5 (`server.js`, plain JS) — stores racer data in `data.json` (gitignored). Password-protected admin routes via `PASSWORD` env var and `Authorization` header.

**Key data flow:**
- Frontend polls `GET /api/racers` every 5 seconds
- Admin can manually edit racers via `POST /api/racers` or upload an XLSX file via `POST /api/upload`
- The XLSX parser looks for a "Posting completeness, %" column (preferring the "Total" section) and merges results with existing racers, preserving sprite assignments

**Racer type:** `{ id: string, name: string, sprite: string, hours: number }` — despite the field name, `hours` represents posting completeness percentage (0-100).

## File Layout

- `server.js` — Express API + static file serving (production)
- `src/App.tsx` — Root component, fetches racers, wires up admin panel
- `src/components/RaceTrack.tsx` — Main race visualization with lanes, checkpoints, finish line
- `src/components/Leaderboard.tsx` — Sorted sidebar showing rankings
- `src/components/AdminPanel.tsx` — Password-gated modal for managing racers and uploading XLSX
- `src/components/PixelCar.tsx` — Car sprite renderer (rotates 90° for horizontal racing)
- `src/store.ts` — Sprite assignment logic and legacy localStorage helpers (client-side, mostly superseded by server)
- `public/cars/` — Pixel-art car sprites (mark1_*, mark3_* variants)

## Notes

- The Vite dev server proxies `/api` to `http://localhost:3000` (configured in `vite.config.ts`)
- Car sprites are assigned round-robin from a fixed list of 12 sprites in `server.js` and `store.ts`
- `data.json` is the server-side data store (gitignored, created automatically)
