# Growing World Implementation Plan

**Goal:** Expand the existing game into a lasting, age-appropriate distribution adventure and publish it.
**Architecture:** Pure catalog and mission/economy functions feed the current UI. Three.js expansion is isolated from campaign state through destination IDs and vehicle selection.
**Tech Stack:** Existing Vite, Three.js, JavaScript, node:test, Puppeteer.
**Spec:** docs/superpowers/specs/2026-09-12-growing-world.md

## Global constraints
Preserve five original levels and localStorage key/version; no new external runtime dependencies; touch and keyboard; offline; production publication authorized.

- [x] Campaign/domain: create `src/campaign.js`, extend `game.js` and `storage.js`. Test every mission through completion, invalid actions, purchase budget, repeat rewards and v1 migration in `tests/expansion.test.js`. Exports: `CHAPTERS`, `CUSTOMERS`, `campaignChapter(mode,index)`, `bonusLevel(mode,round)`; game `buyProduct`, `confirmPurchase`, `chooseVisit`, `autoLoad`; storage `UPGRADES`, `buyUpgrade`, `recordBonus`.
- [x] World: expand `world.js` and add `world-expansion.js`; destination IDs pizzeria/bakery/gelateria/trattoria/market/hotel/farm/harbor/mountain/festival/supplier. Existing `prepareTrip(destination)` gains optional vehicle `truck|car`; all existing world methods remain valid. Inspect actual routes, remote destinations and both camera modes in browser.
- [x] Interface: chapter navigator, company modal, purchase and visit stages, bonus mission launch and rewards in `main.js` and `style.css`. Three-way integration: catalog supplies destination IDs, world supplies visuals, domain supplies stage changes. Show only current chapter's missions; persist current chapter progress via unlocked mission, chapter navigation is local UI state.
- [ ] Verify and publish: update existing assertions from five missions, add browser expansion scenarios, capture screenshots, test service-worker migration/offline, run build and all relevant tests, review changes, commit/push/deploy, fetch live document and assets.

## Execution ledger
Ruling: use the existing clean project checkout and a feature branch; user explicitly requested implementation and production release. World implementation can run independently under the subagent-driven-development skill while main agent implements mission and storage behavior. Review all shared destination and stage interfaces before integration.

Validation: 21 unit tests pass; full desktop/touch baseline flow passes; expanded chapter unlock/car visit/purchasing/helper/driver/bonus replay/offline flow passes; all 157 MP3s decode and cockpit controls pass at three sizes; real service-worker upgrade preserves both old profiles and works offline. Concurrent browser runs caused one update timeout; isolated rerun passed. Independent review identified bonus replay opening next round, now fixed and browser-tested. No runtime dependencies added.
