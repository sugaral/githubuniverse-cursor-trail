# cursor-trail/ · GitHub Universe cursor trail demo

English · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

A dependency-free recreation of the block trail that follows the cursor on **githubuniverse.com**: when the pointer enters a new cell of a 20px grid, one block from a fixed pool is reused, gets a random brand color and ASCII glyph, and shrinks away after 100–400ms.

No build step, no dependencies, no framework — three static files plus one effect script.

![Cursor trail preview](preview.png)

## Run

Open `index.html` directly, or serve the folder:

```powershell
python -m http.server 8000
# open http://localhost:8000
```

> The effect listens for mouse events, so touch devices will not trigger it.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Demo page: hero, parameter panel, explanation |
| `styles.css` | Page styles + the core trail CSS |
| `trail.js` | The effect, exposes `createCursorTrail()` |
| `demo.js` | Wires the parameter panel to `trail.js` |

## Behavior

- listens to `mousemove` only on `.trailAnimationArea` elements;
- skips `.trailAnimationIgnore` subtrees, `<a>`, `<button>`, form controls and text-only leaf nodes;
- rounds the pointer position to the `grid`, and never fires twice for the same cell;
- recycles `pool` blocks, keeping the DOM size constant;
- each activation picks a random color (6 brand colors) and glyph (11 ASCII characters, 30% chance of a blank);
- removes `is-active` after `minLife`–`maxLife` ms; CSS handles the shrink;
- disables itself for `prefers-reduced-motion: reduce`, including live preference changes.

## Mapping to the original site

These facts come from static analysis of the production bundle (the original site was not executed):

| Original site | This demo |
| --- | --- |
| `CursorTrailAnimation` component, lazy-loaded via `next/dynamic` (chunk `2834` + CSS `7583`) | `createCursorTrail()` in `trail.js` |
| `trailAnimationArea` / `trailAnimationIgnore` class names | same names |
| 20px grid, `Math.floor(clientX / 20) * 20` | `grid: 20` by default, adjustable in the panel |
| 10 fixed-position blocks in rotation | `pool: 10` by default |
| 6 brand colors `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | identical |
| 11 glyphs `- / ) . + = > < * & (` | identical |
| random lifetime of 100–400ms | `minLife: 100` / `maxLife: 400` |
| `.Color` scales `0 → 1` in 0.1s | same curve and duration |
| desktop `mousemove`, ignoring text/links/buttons | same (links and buttons use `closest`) |

## Reuse

Include `trail.js` and the `.trail-layer` / `.trail-block` rules from `styles.css`, then:

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">The heading does not trigger</h1>
  <p>This empty background will grow blocks.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| Option | Default | Description |
| --- | --- | --- |
| `grid` | `20` | Grid size in px; also the block size |
| `pool` | `10` | Number of blocks in the pool |
| `minLife` / `maxLife` | `100` / `400` | Lifetime range per block (ms) |
| `blankChance` | `0.3` | Chance a block shows no glyph |
| `colors` | 6 brand colors | Color pool |
| `glyphs` | 11 ASCII characters | Glyph pool |
| `areaSelector` | `.trailAnimationArea` | Areas where blocks may appear |
| `ignoreSelector` | `.trailAnimationIgnore` | Subtrees to exclude |
| `onChange` | `null` | State callback receiving `{ spawned, active, reduced, paused }` |

Returns a controller:

| Method | Description |
| --- | --- |
| `destroy()` | Remove listeners, timers and DOM |
| `setPaused(value)` | Pause or resume the trail |
| `isReduced()` | Whether it is currently disabled by reduced motion |
| `getState()` | Current counters |

## Intentional differences

- The original is a React component; this demo is plain JS and renders blocks in a fixed layer instead of the React tree.
- The original checks only whether the event target's `tagName` is `A`/`BUTTON`; this demo uses `closest`, so children inside links do not trigger either.
- Glyphs are centered inside the block here, and the demo adds a parameter panel, counters and a grid overlay.
- The original also listens on `River` heading elements; this demo does not. Add `trailAnimationArea` to a heading if you need that.

## Verified

Tested with headless Chrome + CDP:

- moving over empty areas spawns blocks, and the counters match the number of `is-active` nodes;
- `trailAnimationIgnore` regions (headings, body text) do not trigger, and leaving them resumes the trail;
- the pause toggle works, and resuming continues the trail;
- emulating `prefers-reduced-motion: reduce` hides the layer, removes all listeners and shows the page notice;
- changing the grid or pool size updates the block count and `--trail-size` together.

`preview.png` is the trail captured during that run.

## Notes

- Blocks are `position: fixed` and positioned in viewport coordinates, so they stay aligned to the 20px grid while scrolling.
- Blocks linger briefly after leaving their area until their lifetime ends; that is original behavior, not a bug.
- Mouse events inside an `iframe` do not bubble out, so content embedded in an iframe will not spawn blocks above it.
