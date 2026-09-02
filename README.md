# cs180-project0

Project 0 webpage — *Becoming Friends with My Camera* (CS180, Fall 2026, Andrew Boldi).

Static site: Three.js (brass lens rings + dust behind the hero) and GSAP
(aperture-iris loader, ScrollSmoother, scroll-triggered reveals). No build step.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(A server is needed because `main.js` is an ES module.)

## Easter eggs

- **V** (or the aperture button in the nav) — viewfinder HUD: thirds grid, REC
  counter, a real luminance histogram of Fig. 2b, AF bracket following the cursor.
- **Click any photo** — shutter blink + film counter.
- **"Run corner detection"** under Part 2 — actual Harris corner detection
  (grayscale → Sobel → structure tensor → NMS) running in-browser on the photos.
- **Type `180`** — the page performs its own dolly zoom.
- The EXIF strip is live: shutter speed tracks scroll velocity, focal length
  climbs 26→200 mm with page depth, f-stop follows the pointer, ISO follows the
  local hour.

## Media pipeline

Originals live in `media/` (`face_*.jpeg`, `building_*.jpeg`, `dolly-*.jpeg`).
The site serves resized, EXIF-stripped copies (`part1-*.jpg`, `part2-*.jpg`)
made with ImageMagick, and the looping GIF built with:

```sh
ffmpeg -framerate 12 -i dolly-%02d.jpg \
  -vf "split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a" \
  -loop 0 part3-dollyzoom.gif
```

Part 1 shows all three portraits: close, far, and super-far.

## Files

- `index.html` — content and structure
- `styles.css` — beige/espresso/brass theme
- `main.js` — Three.js scene + GSAP animation + camera extras
