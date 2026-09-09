# LAPA World Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for the independent 3D world task; the owner implements gameplay, integrates, reviews and publishes. Tasks use checkboxes for tracking.

**Goal:** Deliver a public, playable, installable 3D LAPA family game first chapter.
**Architecture:** Pure tested game state drives an accessible HTML interface and an independently implemented Three.js world. Vite bundles all runtime dependencies and the PWA caches the built assets. Local profile progress is versioned and validated.
**Tech Stack:** Vite, Three.js, vanilla JavaScript, vite-plugin-pwa, local Fontsource fonts, Node tests, browser end-to-end checks.
**Spec:** docs/superpowers/specs/2026-09-09-lapa-world.md

## Global Constraints
- Preserve the existing Joy game.
- Public repository contains game code/assets only, no credentials or business records.
- Italian interface; two playable modes, five levels each, independent local progress.
- Touch-first; usable on portrait and landscape phone screens and desktop.
- Bundle assets locally and verify offline reload.

### Task 1: World
Files: src/world.js and src/world-models.js. Exact bounded requirements: .superpowers/world-brief.md.
- [ ] Create an attractive miniature 3D scene with depot, truck, road and customer buildings.
- [ ] Implement createWorld(host, { onArrive }) and documented drive/cargo/view API.
- [ ] Validate module syntax and integration visually; review spec and code.

### Task 2: Playable chapter
Files: src/game.js, src/storage.js, tests/game.test.js, tests/storage.test.js, src/main.js, src/style.css, index.html.
- [ ] Test exact cargo validation, drive/unload state transitions, Joy answer validation, unlock boundaries and isolated save data before implementing state.
- [ ] Implement profiles, level map, load/drive/unload/quiz/reward loop and replay.
- [ ] Connect truck movement and camera states to world interface.
- [ ] Add audio guidance, keyboard support and mobile layouts.

### Task 3: Install and publish
Files: vite.config.js, public/icons, src/install.js, README.md, scripts/deploy.mjs.
- [ ] Bundle fonts/logo, generate icons and configure PWA precache.
- [ ] Test full small-driver and Joy flows, bad answers, reload persistence, profile separation, mobile layout and offline reload.
- [ ] Review complete code and correct material issues.
- [ ] Build, create public repository and publish built game via gh-pages branch.
- [ ] Verify public URL, manifest, service worker and provide game/repository links.
