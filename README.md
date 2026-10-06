# Bassma Ennarah | Portfolio

My personal portfolio site, live at **[bassma-ennarah.vercel.app](https://bassma-ennarah.vercel.app)**.

The landing page is a manila file folder: scroll down and the colored papers slide out to become the navigation, scroll back up and they tuck back in.

## Sections

1. **About:** bio, polaroid, quick stats and a link to my resume
2. **Projects:** Coffee Tenet (social café discovery app), Rey (AI terminal assistant), Nanuk (FullyHacks 2026 sustainability scanner), Fitness App
3. **Skills:** my tech stack as an iOS home screen on an iMac, plus a readable grouped list and coursework
4. **Experience:** a timeline of my roles
5. **Beyond:** a journal that flips like a real book, with the things that aren't on my resume
6. **Contact:** email, LinkedIn, GitHub, resume

## Built with

- HTML, CSS and vanilla JavaScript (no build step)
- [GSAP](https://gsap.com/) + ScrollTrigger for the scroll animations
- Google Fonts (Playfair Display, Dancing Script, DM Sans) and [Devicon](https://devicon.dev/) 2.17.0
- Hosted on Vercel: every push to `main` deploys automatically
- Works on desktop and phones (tested at 360–430px wide)

## Run it locally

Open `index.html` in a browser. You'll need an internet connection, because GSAP and the fonts load from a CDN.

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
├── index.html              # page markup + link-preview tags
├── css/
│   └── styles.css          # all styles (mobile rules at the bottom)
├── js/
│   ├── main.js             # folder animation, fade-ups, nav dots, iMac scaling
│   ├── rey-sprite.js       # Rey pixel-dog sprite animation
│   └── journal.js          # Beyond section book: page turns, sizing, photo viewer
└── assets/
    ├── icons/              # favicon + iPhone home-screen icon
    ├── images/
    │   ├── headshot.jpg
    │   ├── og-image.jpg    # link-preview image (iMessage, LinkedIn, etc.)
    │   ├── projects/       # project screenshots
    │   ├── beyond/         # journal photos and film posters
    │   ├── mockups/        # device frames (iMac)
    │   └── textures/       # background paper texture
    ├── sprites/            # pixel-art sprite sheets
    └── resume/             # resume PDF
```

## Roadmap

- [ ] Coffee Tenet walkthrough video in the phone mockup
- [ ] Compress the larger project screenshots
- [ ] Pixel-art animated version of me, on the landing page or in About
- [ ] Skills: hover a skill to see which project it was used in (e.g. "Python · used in Rey")
- [ ] Finalize the color palette
- [ ] Accessibility pass (keyboard nav, reduced motion)
- [ ] Custom domain
- [ ] Port to Next.js + Tailwind (optional)
