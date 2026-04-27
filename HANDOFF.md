# Portfolio Prototype — Handoff Notes

> For the next Claude session picking up this project.

---

## What exists right now

A single-file HTML prototype: **`prototype.html`**

It validates the core interaction design before any framework is introduced. Everything — HTML, CSS, JS — is inline in one file. It is NOT yet a Next.js app.

Open it by double-clicking the file or running `open prototype.html` from the project folder.

---

## The design concept

**Landing page = a manila file folder.**

- The folder sits centered on screen, showing Bassma's name in a handwritten + serif type combination, and a polaroid headshot attached with a paperclip SVG.
- Five colored paper tabs peek out from the top of the folder — these ARE the navigation items (About, Projects, Skills, Experience, Contact).
- As you **scroll down**, the papers slide up and out of the folder, spreading into a full-screen navigation menu. The folder drops off the bottom of the screen simultaneously.
- Scrolling **back up** reverses the animation exactly — papers slide back into the folder, folder rises back into frame.
- Once spread, clicking any tab navigates to the corresponding section below.

---

## Tech stack (prototype)

| Concern | Choice |
|---|---|
| Animation | GSAP 3.12.5 + ScrollTrigger (from cdnjs CDN) |
| Fonts | Google Fonts: Dancing Script (script), Playfair Display (serif), DM Sans (body) |
| Framework | None yet — pure HTML/CSS/JS |
| Hosting | None yet — local file only |

**Planned stack for the real build:**
- Next.js (App Router)
- Tailwind CSS
- GSAP (same library, via npm)
- Deployed to Vercel

---

## Color palette

```css
--c1: #F2C4CE;  /* pink   — About Me */
--c2: #3B1636;  /* burgundy — Projects */
--c3: #EDE3C8;  /* cream  — Skills */
--c4: #6E8F5C;  /* sage   — Experience */
--c5: #1C3454;  /* navy   — Contact */
--cream:       #F2EDE4;  /* page background */
--manila:      #E8C97A;  /* folder body */
--manila-dark: #C9A84C;  /* folder tab */
```

Each color has a paired text color (`--c1t`, `--c2t`, etc.) for contrast.

---

## File structure

```
Bassma-Ennarah-Portfolio/
├── prototype.html      ← entire prototype, single file
├── HANDOFF.md          ← this file
├── README.md           ← GitHub default
└── headshot.jpg        ← ADD THIS: Bassma's photo (not yet added)
```

---

## Key HTML structure

```html
<div id="scene">                          <!-- pinned viewport -->
  <!-- Nav files — in DOM order nf-5 → nf-1 (reverse so nf-1 is on top) -->
  <a class="nav-file nf-5">Contact</a>
  <a class="nav-file nf-4">Experience</a>
  <a class="nav-file nf-3">Skills</a>
  <a class="nav-file nf-2">Projects</a>
  <a class="nav-file nf-1">About Me</a>

  <div id="folder-wrap">
    <div class="folder-tab"></div>        <!-- the manila name-tab top-left -->
    <div class="folder-body">
      <!-- paperclip SVG + polaroid + name text -->
    </div>
  </div>

  <div class="scroll-hint">scroll ↓</div>
</div>

<!-- Content sections below the fold -->
<section id="about"> … </section>
<section id="projects"> … </section>
<section id="skills"> … </section>
<section id="experience"> … </section>
<section id="contact"> … </section>
```

---

## How the animation works

### Key insight: z-index layering

- `#folder-wrap` has `z-index: 20`
- `.nav-file` elements start at `z-index: 11–15` (BEHIND the folder)
- The folder body physically covers the lower portion of the nav-files — no clip-path tricks, the folder IS the mask
- Only the top ~24px of each nav-file peeks above the folder body opening

### GSAP setup (`buildAnimation()` in the `<script>`)

1. **`gsap.set()`** positions all five nav-files at their peek positions (stacked just above `folderBodyTop`, slightly offset in x/rotation to look like a real paper stack)
2. A **scrubbed GSAP timeline** (`scrub: 0.5`) ties animation progress directly to scroll position
3. The timeline simultaneously:
   - Slides each nav-file upward to its final spread position (`left: 7%, width: 86%`)
   - Fades the folder down and off-screen (`y: vh * 0.65, opacity: 0`)
   - Fades in the text labels (`.nf-label`) near the end of the animation
4. ScrollTrigger pins `#scene` for `+=150%` of viewport scroll so the user has full control over animation speed
5. `fromTo` (not `to`) is used for the folder tween so reversing always restores `opacity: 1`

### Critical variable: `folderBodyTop`
```js
const folderBodyTop = vh * 0.52 - 185;
```
This is the pixel Y position of the top of the folder body. Everything (peek positions, final spread positions, folder drop distance) is calculated relative to this value. If you change `#folder-wrap`'s CSS `top`, update this formula.

---

## What's still placeholder / TODO

### Immediate (before showing anyone)
- [ ] **Add real headshot** — drop `headshot.jpg` in the project root, then in `prototype.html` find `<div class="polaroid-img">BE</div>` and replace with `<img class="polaroid-img" src="headshot.jpg" alt="Bassma Ennarah" style="object-fit:cover;">`
- [ ] **Fill in About bio** — find the three `<p>` tags in `#about` and replace placeholder text with real copy
- [ ] **Add real projects** — three `.proj-card` divs in `#projects` with real names, descriptions, tech tags, and GitHub/demo links
- [ ] **Update skills** — the skills grid reflects a reasonable starter set; swap emojis and names for actual stack
- [ ] **Add real experience** — three `.tl-item` entries in `#experience`
- [ ] **LinkedIn / GitHub URLs** — update the `href` values in `#contact`

### Next engineering steps (scaffolding the real site)
- [ ] **Scaffold Next.js app** — `npx create-next-app@latest` in the repo, App Router, TypeScript, Tailwind
- [ ] **Port prototype to React** — convert the single HTML file into Next.js page components; GSAP goes in a `useEffect` with `ScrollTrigger.refresh()` on mount
- [ ] **GSAP in Next.js gotcha** — use `gsap.context()` for cleanup and wrap all ScrollTrigger setup in `useLayoutEffect` (or use the `@gsap/react` package)
- [ ] **Replace Google Fonts link** with `next/font` for better performance
- [ ] **Add `next/image`** for the polaroid headshot (automatic optimization)
- [ ] **Deploy to Vercel** — connect GitHub repo in Vercel dashboard, zero-config deploy

### Stretch / polish
- [ ] Mobile responsive layout (folder concept may need to adapt significantly for small screens)
- [ ] Add subtle hover states to the spread nav-file cards
- [ ] Animate the section content on scroll (fade-up — basic version already exists in prototype)
- [ ] Custom cursor (small paperclip that follows mouse — would fit the theme perfectly)
- [ ] Sound design (optional — subtle paper shuffle on the burst animation)

---

## Design decisions & history (why things are the way they are)

**Why are files behind the folder, not in front?**
Early attempts put nav-files above the folder (higher z-index) and used `clip-path` to hide the lower portion. This was rejected because the files looked like a colored overlay floating on top of the folder rather than papers physically inside it. Switching to z-index below the folder means the folder body literally paints over the file contents — much more realistic.

**Why scrub instead of a one-shot animation?**
First version fired the animation once on scroll past 4% progress, non-reversible. User wanted it to feel physical and scroll-controlled. `scrub: 0.5` on the ScrollTrigger gives a slight lag that makes it feel like you're physically pulling the papers out.

**Why `fromTo` on the folder tween?**
Using `.to('#folder-wrap', ...)` caused the folder to disappear when scrolling back up, because GSAP captured `opacity: 0` (from the entrance animation's initial state) as the reverse target. `fromTo` with explicit `{ opacity: 1, scale: 1, y: 0 }` start values fixes this.

**Why DOM order nf-5 → nf-1 (reversed)?**
DOM order determines default paint order. nf-5 (Contact/navy) is painted first (bottom of stack), nf-1 (About/pink) is painted last (top of stack). This means About peeks above the others and is the "topmost" paper — correct visual stacking.

---

## Known limitations of the prototype

- Not responsive — hardcoded at 520px folder width for typical laptop screens
- No `window.onresize` handler — animation positions break if viewport is resized after load
- All content is placeholder text — not connected to any data source
- No accessibility work yet (keyboard nav, screen reader labels, reduced-motion query)

---

## Bassma's preferences (noted during build)

- Wants the animation to feel **simultaneous** — all tabs come out at once, not one at a time over a long scroll
- Prefers **scroll-controlled, reversible** animation over a one-shot trigger
- Wants the folder to look **physically real** — papers inside, not overlays on top
- Text labels on the tabs should **only appear after the animation fires** (not visible in the peek state)
- Using pure HTML prototype to validate design **before** scaffolding Next.js

---

*Last updated: April 2026. Prototype is at commit "Add portfolio prototype with folder animation" on the `main` branch.*
