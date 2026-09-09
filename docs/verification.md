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

Commands: `npm test`, `npm run build`, `npm run test:browser` with `npm run preview` serving the built game.

Physical iPhone/Android devices have not been tested. The app uses WebGL; performance and locally available speech voices depend on the device. This release contains the two children's paths; adult strategy and horses are separate future chapters.
