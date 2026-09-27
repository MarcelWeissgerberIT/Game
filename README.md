# Hotel Nocturne

A mobile-first escape-room puzzle game in the spirit of *100 Doors*. Every level is one door of a mysterious
art deco hotel. Find the trick, open the door, move on.

**Play:** https://marcelweissgerberit.github.io/Game/

## Rooms (Floor One)

| Room | Puzzle | Interaction |
|------|--------|-------------|
| 101 | The Key | tap, inventory |
| 102 | The Clock | read a clue, keypad |
| 103 | The Mirror | wipe fog with your finger |
| 104 | The Labyrinth | tilt the phone (or arrows) |
| 105 | The Sconces | tap in sequence |
| 106 | The Vault | combination dials |
| 107 | The Chandelier | shake the phone |
| 108 | The Switchboard | lights-out logic |
| 109 | The Wallpaper | drag a magnifying glass |
| 110 | The Elevator | drag wires to terminals |

## Rooms (Floor Two)

| Room | Puzzle | Interaction |
|------|--------|-------------|
| 201 | The Signal | decode a blinking Morse lamp |
| 202 | The Painting | sliding-tile puzzle, then keypad |
| 203 | The Plaque | turn the phone upside down |
| 204 | The Tally | remember details from Floor One |
| 205 | The Lever | memorise and tap in order against the clock |
| 206 | The Piano | play the melody on the sheet |
| 207 | The Scale | balance the box with weights |
| 208 | The Cipher | align a cipher wheel |
| 209 | The Memory | repeat a growing lamp sequence |
| 210 | The Fuse | restore power, pick the right floor |

## Floors Three to Ten (rooms 301-1010)

Eighty more rooms, described as data in `js/floors.js` and mounted by the generic room engine in `js/lib/`.
Each floor has its own decor (ballroom, library, baths, kitchens, observatory, gallery, penthouse, rooftop)
and two fixed layouts, so hotspots line up without per-room tuning. Puzzle types include keypad codes from
roman numerals, mirrored text, clocks, counting, tallies, binary, dominoes, letters, riddles and symbol
legends; Morse lamps; fog wiping; magnifier search; cipher wheels; dial combinations; lights-out switches;
wire matching; balance scales; tilt mazes; piano melodies; sliding pictures; pattern locks; tap sequences;
growing memory sequences; timed sequences; and gated objects that need an item first.

## Tech

- Plain HTML, CSS and ES modules. No build step, no dependencies.
- Installable PWA with offline cache (`sw.js`, `manifest.webmanifest`).
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
- Artwork generated with OpenArt (Nano Banana Pro / Nano Banana 2) from one style reference, see `tools/fetch_assets.py` and `tools/fetch_floors.py`.

## Develop

```bash
python3 -m http.server 8080
# open http://localhost:8080/?debug  -> shows hotspot outlines
```

## Adding a room on a generated floor

Add an entry to the floor array in `js/floors.js`: pick layout A or B, list the objects (clues, items, locks)
and drop the artwork in `assets/rooms/<id>.webp`. Widgets live in `js/lib/widgets.js`, clue cards in
`js/lib/clues.js`, slot positions in `js/lib/room.js`.

## Adding a hand-made room

1. Generate the artwork (9:16) and drop it in `assets/rooms/<id>.webp`.
2. Create `js/puzzles/<id>.js` exporting `mount(ctx)`; use `ctx.hotspot`, `ctx.showCard`, `ctx.showKeypad`,
   `ctx.inventory` and call `ctx.solve()` when the door opens. Return a cleanup function if you add window listeners.
3. Register it in `js/levels.js` and add its files to `sw.js`.

## GitHub Pages setup (once)

Repository → Settings → Pages → Source: **GitHub Actions**. Then push to `main`.
