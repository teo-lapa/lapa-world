# First chapter verification

Validated on 9 September 2026.

- 11 Node tests: valid levels, exact cargo, state transitions, retryable questions, immutable cargo changes, profile isolation, sequential unlocks, corrupt save recovery and rename persistence.
- Production Vite build and PWA precache succeed; all game dependencies, fonts and icons bundled locally.
- Headless Chrome desktop 1440×900: completed little-driver delivery, correct unlock, persistence after reload, profile rename and keyboard focus after loading.
- Chrome mobile emulation 390×844 with touch input: completed explorer delivery and quantity quiz, recovered from a wrong answer, preserved all cargo after releasing the drive control.
- Separate new profile began with zero stars and only the first level unlocked.
- Offline reload retained the 3D world, profile stars and ability to start the next mission.
- Chrome mobile landscape 844×390: no horizontal document overflow; scene/UI screenshots inspected.
- Browser flow has no JavaScript errors or HTTP asset failures.
- Independent code review and scoped follow-up approved fixes to editable names, keyboard focus, update notification, offline readiness and pointer activation.
- Public GitHub Pages deployment verified at https://teo-lapa.github.io/lapa-world/: HTTPS, correct manifest, all app icons HTTP 200, 3D rendering and a fresh offline reload followed by loading cargo. Public browser smoke check reported zero JavaScript/HTTP errors.

Commands: `npm test`, `npm run build`, `npm run test:browser` with `npm run preview` serving the built game.

Public deployment check: `node scripts/check-public.mjs`. The installed worker takes control on the next navigation; the public check verifies activation and then reloads before the offline scenario.

Physical iPhone/Android devices have not been tested. The app uses WebGL; performance depends on the device. This release contains the two children's paths; adult strategy and horses are separate future chapters.

## Version 1.1: engine, cab and narration

Validated on 9 September 2026 before publishing:

- Original 11 Node tests, production build and complete desktop/touch delivery regression checks pass.
- `npm run test:audio`: renders the actual engine graph with OfflineAudioContext. Off is silent; driving has higher output than idle; narration ducking reduces output below half. UI holding the drive button increases oscillator frequency.
- All 37 included MP3s decode successfully (1.56–7.23 seconds per clip). The voice manifest covers every fixed instruction. Total compressed voice content is approximately 1 MB; full PWA precache is approximately 2.6 MB.
- Included instructions play after offline reload without using device speech synthesis. Nicknames remain in local storage and are not sent for narration.
- Cab entry/exit, assisted travel and touch release preserve the delivery flow. A completed trip returns to the exterior without accidentally unloading a crate.
- Cab screenshots inspected at 1440×900, 390×844 and 844×390. Drive control also checked at 375×667. Wheel and instruments fit the viewport; controls remain visible without horizontal overflow.
- `npm run test:update`: serves the actual previous gh-pages build, installs its service worker, saves two version-1 profiles with stars, then serves the new build. Updating does not interrupt the trip. The map offers the update; accepting it preserves the complete saved data, caches all 37 voice clips and enables the new cockpit offline.
- Independent scoped code review approved the enhancement. The minor focus/visibility lifecycle suggestion was implemented: the engine resumes at idle on return without resuming movement.
- No JavaScript errors or failed HTTP asset requests in the integrated browser checks.

Voice quality and performance on physical phones still need the family's listening/play feedback; browser tests verify valid audio and playback, not a subjective naturalness score.
