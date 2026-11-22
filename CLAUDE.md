# Memory Game

React + TypeScript (Vite) card-matching memory game. Landscape-only, square (1:1) cards.
Published with **GitHub Pages**: https://sewerel.github.io/memory-game/ (repo: https://github.com/sewerel/memory-game, public).
Every push to `main` builds and deploys via `.github/workflows/deploy.yml` (tests → build → Pages). Static build, relative paths.
Target is **Android phones (Chrome)** in landscape — iOS/Safari quirks don't need handling.

## Commands

- `npm run dev -- --host` — dev server (also reachable from a phone on the same Wi-Fi)
- `npm test` — Vitest (game logic only)
- `npm run build` — type-check + production build into `dist/`
- `npm run preview -- --host` — serve the built `dist/` (port 4173); use this to test the PWA, the service worker is not registered in dev
- `npm run icons` — regenerate the app icon (`public/icon.svg`, `icon-192.png`, `icon-512.png`) from `scripts/make-icons.mjs`
- `npm run assets -- "<folder>"` — import images + sounds from one folder (`scripts/import-assets.mjs`): images are square-cropped to 512px WebP → `src/assets/cards/`, sounds are copied as-is → `src/assets/sounds/`. Bulgarian names are transliterated to Latin. Source so far: `C:/Users/X390/Downloads/images`.

## Layout

- `src/game/logic.ts` — pure game rules: `deal`, `shuffle`, `reducer`, `flipOutcome`, `isWon`. Keep it React-free and covered by `logic.test.ts`.
- `src/game/useMemoryGame.ts` — React hook: wires the reducer, mismatch flip-back timer, sounds, win → bravo → automatic new game.
- `src/game/sound.ts` — one Web Audio context for everything: recorded clips (`preloadClips`, `playClip` — a new clip cuts off the previous one, `whenClipDone`) + synthesized fallback effects (flip / match / miss / win) + mute (localStorage, wrapped in try/catch).
- `src/components/Card.tsx` — 3D flip card (CSS `rotateY` + `backface-visibility`).
- `src/App.tsx` — loads card images, grid size (`COLS`/`ROWS`), controls, win modal, rotate overlay.
- `src/index.css` — all styling. Card size is pure CSS: largest square that fits both viewport width and height (`--cols`/`--rows` set from `App.tsx`).
- `src/assets/cards/` — card face images (10 family photos, 512px WebP), picked up automatically via `import.meta.glob`. Add/replace them with `npm run assets`, not by hand.
- `src/pwa.ts` — service worker registration (production only) + `useInstallPrompt` (the ⤓ button in the controls shows only while Chrome offers install).
- `public/manifest.webmanifest` — PWA manifest: `display: fullscreen`, `orientation: landscape` (installed app is locked to landscape), relative `start_url`/`scope` so it works under the Pages sub-path.
- `pwa/sw.js` — service worker template. A small plugin in `vite.config.ts` emits `dist/sw.js` with every built file (+ `public/`) as the precache list and a version hash of that list, so the full game incl. photos/sounds works offline after the first open, and each deploy with changed files gets a fresh cache. Pages are network-first, hashed assets cache-first.
- `src/assets/sounds/` — voice clips (MP3), paired with images by base name (`baba.webp` ↔ `baba.mp3`); `bravo.mp3` is the win sound. Pairing happens in `App.tsx`.

## Design decisions (keep these)

- **PWA without dependencies** — hand-written manifest + service worker; no `vite-plugin-pwa`. Install needs HTTPS (GitHub Pages) or `localhost`; plain `http://192.168.x.x` on a phone won't offer install.
- **No score, no timer, no moves counter.** Just play → win screen → play again.
- **Landscape only.** Portrait on touch devices shows a "rotate your phone" overlay (CSS media query).
- **Static, relative build:** `vite.config.ts` uses `base: './'` (works under `/memory-game/` on Pages and anywhere else), `assetsDir: ''` (flat output) and `assetsInlineLimit: 0` (every image/sound stays a separate file, not inlined).
- Restart turns cards face down first, then deals the new deck after the flip animation, so new faces aren't revealed mid-flip.
- Project lives in `D:/projects/.shared/` on purpose: Laragon auto-creates `{dir}.test` vhosts for every folder directly in `D:/projects`.

## Current setup

- Grid is **4×3 = 6 pairs** (`COLS`/`ROWS` in `src/App.tsx`). With 10 images, each game uses a random 6. `COLS * ROWS` must be even.
- **Sounds:** flipping a card plays that image's voice clip (synth blip if it has none). A match plays a short chime *after* the voice; a miss has no buzz when a voice clip played. The final match skips the chime.
- **Win:** waits for the last voice clip, plays `bravo.mp3`, shows the win screen, then starts a new game automatically (after bravo ends, min 2.5s). "Play again" restarts immediately.
- Mismatched pairs stay visible 1.2s (long enough to hear the voice start).
- Clips are used as recorded (no trimming/normalizing — ffmpeg isn't available here).
