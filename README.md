# Bassma Ennarah — Portfolio

My personal portfolio site. The landing page is a manila file folder: scroll down and the colored papers slide out to become the navigation, scroll back up and they tuck back in.

## Sections

- **About:** a short bio, polaroid and quick stats
- **Projects:** Rey (AI terminal assistant), Nanuk (FullyHacks 2026 sustainability scanner), Fitness App
- **Skills:** my tech stack, shown as an iOS home screen on an iMac
- **Experience:** a timeline of my roles
- **Beyond:** a flip-through journal of the things that aren't on my resume
- **Contact:** email, LinkedIn, GitHub, resume

## Built with

- HTML, CSS and vanilla JavaScript
- [GSAP](https://gsap.com/) + ScrollTrigger for the scroll animations
- Google Fonts (Playfair Display, Dancing Script, DM Sans) and Devicon

## Run it locally

Open `index.html` in a browser. You'll need an internet connection, because GSAP and the fonts load from a CDN.

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
├── index.html              # page markup
├── css/
│   └── styles.css          # all styles
├── js/
│   ├── main.js             # folder burst animation, fade-ups, nav dots
│   ├── rey-sprite.js       # Rey pixel-dog sprite animation
│   └── journal.js          # Beyond section journal page-flip
└── assets/
    ├── images/
    │   ├── headshot.jpg
    │   ├── projects/       # project screenshots
    │   ├── mockups/        # device frames (iMac)
    │   └── textures/       # background paper texture
    ├── sprites/            # pixel-art sprite sheets
    └── resume/             # resume PDF
```

## Roadmap

- [ ] Finalize the color palette
- [ ] Mobile-responsive layout
- [ ] Accessibility pass (keyboard nav, reduced motion)
- [ ] Port to Next.js + Tailwind and deploy on Vercel
