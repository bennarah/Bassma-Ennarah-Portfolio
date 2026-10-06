/* Folder burst animation, section fade-ups, nav dots */

gsap.registerPlugin(ScrollTrigger);

// Safari's engine (desktop Safari + every iPhone browser) — the journal uses a
// Safari-safe way of resizing there (see .webkit-book in styles.css).
// Add ?webkitbook to the URL to preview that mode in Chrome.
const ua = navigator.userAgent;
if ((/AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua)) || /[?&]webkitbook/.test(location.search)) {
    document.documentElement.classList.add('webkit-book');
}

// On phones the address bar shrinks/grows while you scroll, which changes the
// window height. Don't treat that as a resize (it would re-measure every
// scroll animation mid-scroll and make the fade-ins fire early, off-screen).
ScrollTrigger.config({ ignoreMobileResize: true });
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/* ──────────────────────────────────────────────────────────────
   1.  FOLDER ENTRANCE  (on page load)
────────────────────────────────────────────────────────────── */
gsap.set('#folder-wrap', { xPercent: -50, yPercent: -50 });

// The entrance animates the folder's *children* (and the hint's text), not
// #folder-wrap / .scroll-hint themselves. Those two are driven by the scroll
// timeline below, and animating the same element twice made the folder pop back
// on top of the open tabs after a reload partway down the page.
gsap.from('.folder-scale > .folder-tab, .folder-scale > .folder-body',
                          { y: 30, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
gsap.from('.meta-bar',    { opacity: 0, duration: 0.8, delay: 0.9,  ease: 'power2.out' });
gsap.from('.scroll-hint span', { opacity: 0, duration: 0.8, delay: 1.4, ease: 'power2.out' });


/* ──────────────────────────────────────────────────────────────
   2.  BURST ANIMATION

   The nav-file elements ARE the peek tabs you see in the folder.
   They start clipped so only their top edge is visible above the
   folder opening — like pages tabbed inside a folder.

   On first scroll: clip-path opens as each file slides upward,
   revealing the full band.  Folder drops off screen simultaneously.
   All five happen at once (0.04 s stagger = simultaneous feel).
────────────────────────────────────────────────────────────── */
let burst = null;   // { tl, st } for the current build

function buildAnimation() {
    // Rebuilding (after a resize): put everything back to the closed-folder
    // state and remove the old pin before measuring again.
    if (burst) {
        burst.tl.progress(0);
        burst.st.kill(true);
        burst.tl.kill();
        burst = null;
    }

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // ── Folder scale (mobile) ─────────────────────────────────────────────────
    // The folder is designed at 600px wide. On narrow screens shrink it so it
    // fits with the page gutter on both sides. Every folder measurement below
    // is multiplied by S so the tabs still line up behind it.
    const GUTTER = vw <= 700 ? 22 : 48;
    const S = Math.min(1, (vw - GUTTER * 2) / 600);
    document.documentElement.style.setProperty('--folder-scale', S.toFixed(4));

    // ── Folder geometry ───────────────────────────────────────────────────────
    const FOLDER_W      = 600 * S;
    const folderBodyTop = vh * 0.52 - 185 * S;   // top of the manila folder body
    const FL            = (vw - FOLDER_W) / 2;

    // ── Final spread positions ────────────────────────────────────────────────
    // tabs shrink a little on short screens so all six fit when spread out
    const FILE_GAP  = vh < 760 ? 14 : 25;
    const FILE_H    = Math.min(88, Math.floor((vh - 100 - 5 * FILE_GAP) / 6));
    // centered vertically, but never higher than 64px so the top tab
    // doesn't cover the "CS Student · Software Engineer" line
    const SPREAD_TOP = Math.max(64, (vh - (6 * FILE_H + 5 * FILE_GAP)) / 2);
    const finalTop  = Array.from({ length: 6 }, (_, i) =>
        SPREAD_TOP + i * (FILE_H + FILE_GAP)
    );

    // ── Peek geometry ─────────────────────────────────────────────────────────
    // Files start BEHIND the folder (z < folder-wrap's 20).
    // The folder body paints on top, masking everything below folderBodyTop.
    // Only the top TAB_SHOW px of each file is visible — a real paper peek.
    const TAB_SHOW = 24 * S;

    // offsets are in "design pixels" and get scaled with the folder
    const tabs = [
        { top: folderBodyTop - TAB_SHOW -  0 * S, left: FL + 28 * S, w: FOLDER_W - 74 * S, rot: -1.8, z: 15 },
        { top: folderBodyTop - TAB_SHOW -  7 * S, left: FL + 12 * S, w: FOLDER_W - 42 * S, rot:  1.2, z: 14 },
        { top: folderBodyTop - TAB_SHOW - 14 * S, left: FL + 22 * S, w: FOLDER_W - 60 * S, rot: -0.6, z: 13 },
        { top: folderBodyTop - TAB_SHOW - 21 * S, left: FL + 16 * S, w: FOLDER_W - 56 * S, rot:  0.8, z: 12 },
        { top: folderBodyTop - TAB_SHOW - 28 * S, left: FL + 24 * S, w: FOLDER_W - 64 * S, rot: -0.4, z: 11 },
        { top: folderBodyTop - TAB_SHOW - 35 * S, left: FL + 18 * S, w: FOLDER_W - 52 * S, rot:  0.6, z: 10 },
    ];

    const domFiles = Array.from(document.querySelectorAll('.nav-file')).reverse();
    // [nf-1 About … nf-6 Beyond]

    domFiles.forEach((f, i) => {
        const t = tabs[i];
        gsap.set(f, {
            top:          t.top,
            left:         t.left,
            width:        t.w,
            height:       FILE_H,
            y:            0,
            x:            0,
            rotation:     t.rot,
            clipPath:     'none',            // no clip — folder body is the mask
            borderRadius: '4px 4px 0 0',
            opacity:      1,
            zIndex:       t.z,              // BEHIND folder-wrap (z:20)
        });
    });

    const dy      = domFiles.map((_, i) => finalTop[i] - tabs[i].top);
    const finalX   = [-14,  18, -10,  14,  -8,  10];
    const finalRot = [-0.9, 0.6, -0.4, 0.5, -0.2, 0.35];

    // ── Scrub timeline (progress 0 → 1 matches scroll position) ─────────────
    const tl = gsap.timeline({ defaults: { ease: 'none' } })

        // Files slide up out of the folder
        .to(domFiles, {
            y:            (i) => dy[i],
            left:         '7%',
            width:        '86%',
            x:            (i) => finalX[i],
            rotation:     (i) => finalRot[i],
            borderRadius: '6px',
            stagger:      0.04,
            duration:     0.65,
        }, 0)

        // Labels appear once the files are mostly spread
        .to('.nf-label',          { opacity: 1,   stagger: 0.04, duration: 0.18 }, 0.58)
        .to('.nf-num, .nf-arrow', { opacity: 0.5, stagger: 0.04, duration: 0.18 }, 0.58)

        // Folder drops away — fromTo so reverse always restores it cleanly
        .fromTo('#folder-wrap',
            { y: 0, opacity: 1, scale: 1 },
            { y: vh * 0.65, opacity: 0, scale: 0.9, duration: 0.65 },
        0)

        .to('.scroll-hint', { opacity: 0, duration: 0.12 }, 0);

    // ── Pin + scrub ───────────────────────────────────────────────────────────
    // scrub: 0.5  → animation chases the scroll with a short lag (feels physical)
    // end: +=150% → 1.5× viewport of scrolling to run the full animation
    const st = ScrollTrigger.create({
        trigger:       '#scene',
        start:         'top top',
        end:           '+=150%',
        pin:           true,
        anticipatePin: 1,
        scrub:         0.5,
        animation:     tl,
    });
    burst = { tl, st };
}
buildAnimation();

// Clicking (or tapping) the folder opens it: the page scrolls itself through
// the pinned section, so the visitor sees the exact same scroll animation.
(function () {
    const folder = document.getElementById('folder-wrap');
    let playing = false;
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function openFolder() {
        if (playing || !burst) return;
        peek(false);
        const start = window.scrollY;
        const end = burst.st.end + 2;           // just past the end of the animation
        if (start >= burst.st.end - 4) return;   // already open
        playing = true;
        const duration = 1600;
        const t0 = performance.now();
        // a wheel/touch from the visitor takes over immediately
        const cancel = () => { playing = false; };
        window.addEventListener('wheel', cancel, { once: true, passive: true });
        window.addEventListener('touchstart', cancel, { once: true, passive: true });
        (function step(now) {
            if (!playing) return;
            const t = Math.min(1, (now - t0) / duration);
            window.scrollTo(0, start + (end - start) * easeInOut(t));
            if (t < 1) requestAnimationFrame(step); else playing = false;
        })(t0);
    }
    // Hover (mouse only): the papers peek up out of the closed folder.
    const scene = document.getElementById('scene');
    const peek = on => scene.classList.toggle('folder-peek', on && !!burst && burst.st.progress < 0.02);
    folder.addEventListener('mouseenter', () => peek(true));
    folder.addEventListener('mouseleave', () => peek(false));
    window.addEventListener('scroll', () => { if (window.scrollY > 4) peek(false); }, { passive: true });

    folder.setAttribute('role', 'button');
    folder.setAttribute('tabindex', '0');
    folder.setAttribute('aria-label', 'Open the folder');
    folder.addEventListener('click', openFolder);
    folder.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFolder(); }
    });
}());

// The tab positions above are measured from the window size, so rebuild when
// the window is resized (browser resize, dev tools, fullscreen, side panels).
// Keeps the visitor at the same point in the animation / page.
let lastW = window.innerWidth, lastH = window.innerHeight, resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const widthChanged  = window.innerWidth !== lastW;
        const heightChanged = window.innerHeight !== lastH;
        // Phones: only rebuild when the width changes (rotating the phone).
        // Height-only changes there are just the address bar.
        if (!widthChanged && (!heightChanged || isTouch)) return;
        lastW = window.innerWidth; lastH = window.innerHeight;

        const old = burst.st;
        const y = window.scrollY;
        const inPin = y <= old.end;
        const progress = old.progress;
        const pastEnd = y - old.end;

        buildAnimation();
        ScrollTrigger.refresh();

        const now = burst.st;
        const target = inPin ? now.start + progress * (now.end - now.start) : now.end + pastEnd;
        window.scrollTo(0, target);
        burst.tl.progress(now.progress);
    }, 200);
});



/* ──────────────────────────────────────────────────────────────
   3.  SECTION FADE-UPS
────────────────────────────────────────────────────────────── */
const fadeEls = [
    '.sec-eye', '.sec-title',
    '.about-photo-wrap', '.about-bio p', '.stats',
    '.proj-card', '.desktop-wrap', '.stack-group', '.tl-item',
    '.contact-title', '.contact-sub', '.contact-links'
];

fadeEls.forEach(selector => {
    gsap.utils.toArray(selector).forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
            y: 22, opacity: 0, duration: 0.65, ease: 'power2.out'
        });
    });
});


/* ──────────────────────────────────────────────────────────────
   4.  NAV DOTS
────────────────────────────────────────────────────────────── */
const navDots  = document.getElementById('nav-dots');
const dots     = Array.from(document.querySelectorAll('.dot'));
const sections = ['scene','about','projects','skills','experience','beyond','contact'];
const darkSecs = new Set(['projects','experience','contact']);

// Show dots after pinned scene ends
ScrollTrigger.create({
    trigger: '#about',
    start:   'top 70%',
    onEnter:     () => navDots.classList.add('vis'),
    onLeaveBack: () => navDots.classList.remove('vis'),
});

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        // "Home" goes to the very top (closed folder). scrollIntoView on the pinned
        // scene would land at the end of the animation instead.
        if (sections[i] === 'scene') window.scrollTo({ top: 0, behavior: 'smooth' });
        else document.getElementById(sections[i]).scrollIntoView({ behavior: 'smooth' });
    });
});

sections.forEach((id, i) => {
    ScrollTrigger.create({
        trigger: '#' + id,
        start:   'top 50%',
        end:     'bottom 50%',
        onEnter:     () => setDot(i, id),
        onEnterBack: () => setDot(i, id),
    });
});

function setDot(i, secId) {
    dots.forEach((d, j) => {
        d.classList.toggle('active', j === i);
        d.classList.toggle('dot-l',  darkSecs.has(secId));
    });
}


/* ──────────────────────────────────────────────────────────────
   6.  SMOOTH IN-PAGE LINKS
   (done here instead of CSS scroll-behavior: smooth, which interferes with
   ScrollTrigger's measurements)
────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    a.addEventListener('click', e => {
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});


/* ──────────────────────────────────────────────────────────────
   7.  iMAC SCREEN SCALING
   The iOS screen contents are designed at 677x387 (the screen size when the
   iMac is 740px wide) and scaled to whatever size the iMac actually is,
   so all three rows of icons + the dock fit on every screen size.
────────────────────────────────────────────────────────────── */
(function () {
    const screen = document.querySelector('.imac-screen');
    if (!screen || !('ResizeObserver' in window)) return;
    const DESIGN_W = 677;
    new ResizeObserver(([entry]) => {
        const w = entry.contentRect.width;
        if (w) screen.style.setProperty('--imac-scale', (w / DESIGN_W).toFixed(4));
    }).observe(screen);
}());
