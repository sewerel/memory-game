# Memory Game

React + TypeScript (Vite) card-matching memory game. Landscape-only, square (1:1) cards.
Will be published as a GitHub Gist web app, so the build must stay flat and static.

## Commands

- `npm run dev -- --host` — dev server (also reachable from a phone on the same Wi-Fi)
- `npm test` — Vitest (game logic only)
- `npm run build` — type-check + production build into `dist/`

## Layout

- `src/game/logic.ts` — pure game rules: `deal`, `shuffle`, `reducer`, `flipOutcome`, `isWon`. Keep it React-free and covered by `logic.test.ts`.
- `src/game/useMemoryGame.ts` — React hook: wires the reducer, mismatch flip-back timer, restart, sounds.
- `src/game/sound.ts` — synthesized Web Audio effects (flip / match / miss / win) + mute (localStorage, wrapped in try/catch).
- `src/components/Card.tsx` — 3D flip card (CSS `rotateY` + `backface-visibility`).
- `src/App.tsx` — loads card images, grid size (`COLS`/`ROWS`), controls, win modal, rotate overlay.
- `src/index.css` — all styling. Card size is pure CSS: largest square that fits both viewport width and height (`--cols`/`--rows` set from `App.tsx`).
- `src/assets/cards/` — card face images, picked up automatically via `import.meta.glob`.

## Design decisions (keep these)

- **No score, no timer, no moves counter.** Just play → win screen → play again.
- **Landscape only.** Portrait on touch devices shows a "rotate your phone" overlay (CSS media query).
- **Gist-friendly build:** `vite.config.ts` uses `base: './'`, `assetsDir: ''` (flat output, gists have no folders) and `assetsInlineLimit: 0` (every image stays a separate file, not inlined).
- Restart turns cards face down first, then deals the new deck after the flip animation, so new faces aren't revealed mid-flip.
- Project lives in `D:/projects/.shared/` on purpose: Laragon auto-creates `{dir}.test` vhosts for every folder directly in `D:/projects`.

## Planned next steps

1. **Real images** — the user will provide square images. Drop them in `src/assets/cards/` and delete the `placeholder-*.svg` files. Optionally resize/compress (~256–512px WebP) to keep the gist light.
2. **Smaller grid** — lower `COLS`/`ROWS` in `src/App.tsx` (currently 6×4 = 12 pairs). `COLS * ROWS` must be even and the board should stay wider than tall (e.g. 4×3 = 6 pairs, 5×4 = 10 pairs). Pairs are capped by the number of images available.
3. **Per-image sound** — each image gets its own sound that plays when that card is flipped (or matched). Suggested convention: `src/assets/sounds/<same-basename-as-image>.mp3`, loaded with `import.meta.glob` and paired by file name; fall back to the synthesized `sound.flip()` when an image has no sound. Sounds stay separate files in the build (same as images) and must respect mute.
