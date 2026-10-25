# Changelog

All notable changes to Open Source the World. The game is served from `main` at https://solidgeeks.github.io/open-source-the-world/: every change merged there is live, so entries are dated rather than versioned.

## 2026-10-25 — first release

### Added
- An open world of seven districts generated from a fixed seed, each with a crew member, quests and a locked core; THE MONOLITH as the final breach.
- Breach protocol puzzles, ICE that chase the player, the fork pulse, packets, bracket badges, lore shards, upgrades, ranks and achievements.
- Keyboard and touch controls, sound and music synthesized with Web Audio, progress saved in the browser.
- Smoke test (`npm test`): the game boots, a session starts, a breach is played to its end, every crew member talks, the overlays open and close, and touch controls show on a phone, without a JavaScript error. CI runs it on every push and pull request.
- CodeQL scans the game's code (inline in `index.html`).
- AGPL-3.0 license, `SECURITY.md`, first-merge card for new contributors.
