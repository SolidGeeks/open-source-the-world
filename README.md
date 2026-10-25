# Open Source the World

An open-world hacking game that runs in the browser. The Grid runs on code nobody is allowed to read: walk its districts, breach proprietary nodes, outrun the ICE, and help the Solid Geeks crew set every line free.

**Play:** https://solidgeeks.github.io/open-source-the-world/

## The Grid

Seven districts, each with a member of the crew, its own quests and a locked core. Liberate 60% of a district's nodes to drop its core's firewall; liberate three cores and most of the Legacy Mainframes to face THE MONOLITH.

| District | Crew member | Core |
|---|---|---|
| The Commons | Term · the host | |
| CI Yards | Rep · the coach | BUILD FARM |
| Badge Bazaar | Brax · the logo | THE MINT |
| Arcade Row | Bit · the arcade kid | HISCORE |
| Shadow Stack | Null · the rebel | BLACK BOX |
| Strata Heights | Atlas · the elder | COLD STORAGE |
| Legacy Mainframes | Brick · the builder | THE MONOLITH |

Breaching a node is a timed puzzle: pick codes from the highlighted row or column to complete ROOT ACCESS before the buffer fills; bonus daemons pay extra. Packets, bracket badges and lore shards are scattered across the Grid, and commits buy upgrades in your `package.json`.

## Controls

- Move: WASD, ZQSD or the arrow keys · Sprint: Shift
- Talk or breach: E · Fork pulse: Space
- Map: M · Upgrades: Tab · Menu: Esc
- In a breach: click a code, or arrows and Enter
- Touch: left stick to move, buttons for act, fork, run, map, upgrades and menu

## How it is built

One `index.html` file, no build step, no dependencies: Canvas 2D, a world generated from a fixed seed, sound and music synthesized with Web Audio, progress saved in the browser (`localStorage`). Only the fonts come from Google Fonts; without a connection the game falls back to system fonts.

To try it locally: open `index.html` in a browser, or run `python3 -m http.server` in this folder and go to http://localhost:8000.

To run the tests (Node.js 22 or later; the game itself needs nothing, Playwright is only for the tests):

```bash
npm install
npx playwright install chromium   # once
npm test   # boots the game, plays a breach, talks to the crew, opens the overlays, checks the phone layout
```

Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Contributions follow the [Solid standard](https://github.com/SolidGeeks/.github/blob/main/CONTRIBUTING.md): sign off every commit with `git commit -s` (DCO), no CLA. The code is licensed [AGPL-3.0-or-later](LICENSE). To report a vulnerability, see [SECURITY.md](SECURITY.md).
