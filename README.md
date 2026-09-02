# cs180-project0

Project 0 webpage — *Becoming Friends with My Camera* (CS180, Fall 2026).

Static site: Three.js (brass lens rings + dust behind the hero) and GSAP
(aperture-iris loader, ScrollSmoother, scroll-triggered reveals). No build step.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(A server is needed because `main.js` is an ES module.)

## Fill in your content

- Replace the placeholder SVGs in `media/` with your photos/GIF, keeping the
  same file names (or update the `src` attributes in `index.html`):
  - `part1-close.svg` / `part1-zoom.svg` — selfie pair (3:4)
  - `part2-zoom.svg` / `part2-wide.svg` — building pair (4:3)
  - `part3-dollyzoom.svg` — animated GIF (4:3)
- Replace "Your Name" (nav + colophon) and the bracketed `[ Your explanation… ]`
  placeholders in `index.html`.

## Files

- `index.html` — content and structure
- `styles.css` — beige/espresso/brass theme
- `main.js` — Three.js scene + GSAP animation
