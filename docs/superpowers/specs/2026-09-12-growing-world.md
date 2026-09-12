# LAPA World — Un mondo che cresce

The user authorizes autonomous design, implementation and immediate production publication at the existing URL. Preserve the enjoyed visual style and existing progress. No additional approval round is needed.

## Experience
40 little-driver missions and 60 explorer missions, organized into eight chapters. Keep the original five missions in order for save compatibility. Expand the physical world with multiple districts, distinct customers, connected drivable roads and a blue passenger car for sales visits. Keep cockpit and overhead cameras. Improve environmental detail, blue sky and water without abandoning the friendly miniature style.

Little drivers retain picture-led loading and delivery (at most four crates on new missions), with occasional simple customer visits. Explorers gradually encounter purchasing missing stock within a sufficient budget, visiting customers to choose requested products, and delivery questions involving counts, remaining stock and simple prices. Mistakes are retryable; no timers, debt or paid purchases.

Campaign completions grant stars and one-time coins. A company panel spends earned coins on a warehouse helper (load remaining crates), a driver (optional assisted driving), and a larger warehouse (reward bonus). Little drivers do not need to manage money. After the campaign, deterministic changing bonus missions remain available, tracking completed rounds independently of campaign stars. Finishing all chapters is not the end of play.

## Architecture and preservation
Keep Vite, Three.js and JavaScript dependencies. Campaign catalog is separate from pure mission state transitions. Keep localStorage key `lapa-world-v1` and version 1; normalize old five-star arrays to the new mode-specific lengths, preserve IDs, names, sound, completed stars and separate profiles. Store earned coins, upgrades and bonus rounds per profile. Clamp malformed data and prevent duplicate campaign rewards.

## Verification and release
Exercise all 100 mission state flows and purchase/visit retry behavior, save migration, optional upgrades and bonus idempotency. Browser checks cover desktop and touch, car visits, purchasing, helper behavior, representative far-district travel, no horizontal overflow, persistence and offline reload. Test the actual service-worker update from the published release. Inspect screenshots. Build, commit source, push and publish gh-pages only after checks. Verify the live release.
