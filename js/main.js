/* Folder burst animation, section fade-ups, nav dots */

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────
   1.  FOLDER ENTRANCE  (on page load)
────────────────────────────────────────────────────────────── */
gsap.set('#folder-wrap', { xPercent: -50, yPercent: -50 });

gsap.from('#folder-wrap', { y: 30, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
gsap.from('.meta-bar',    { opacity: 0, duration: 0.8, delay: 0.9,  ease: 'power2.out' });
gsap.from('.scroll-hint', { opacity: 0, duration: 0.8, delay: 1.4,  ease: 'power2.out' });


/* ──────────────────────────────────────────────────────────────
   2.  BURST ANIMATION

   The nav-file elements ARE the peek tabs you see in the folder.
   They start clipped so only their top edge is visible above the
   folder opening — like pages tabbed inside a folder.

   On first scroll: clip-path opens as each file slides upward,
   revealing the full band.  Folder drops off screen simultaneously.
   All five happen at once (0.04 s stagger = simultaneous feel).
────────────────────────────────────────────────────────────── */
function buildAnimation() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // ── Folder geometry ───────────────────────────────────────────────────────
    const FOLDER_W      = 600;
    const folderBodyTop = vh * 0.52 - 185;   // top of the manila folder body
    const FL            = (vw - FOLDER_W) / 2;

    // ── Final spread positions ────────────────────────────────────────────────
    const FILE_H    = 88;
    const FILE_GAP  = 25;
    const SPREAD_TOP = Math.max(20, (vh - (6 * FILE_H + 5 * FILE_GAP)) / 2);
    const finalTop  = Array.from({ length: 6 }, (_, i) =>
        SPREAD_TOP + i * (FILE_H + FILE_GAP)
    );

    // ── Peek geometry ─────────────────────────────────────────────────────────
    // Files start BEHIND the folder (z < folder-wrap's 20).
    // The folder body paints on top, masking everything below folderBodyTop.
    // Only the top TAB_SHOW px of each file is visible — a real paper peek.
    const TAB_SHOW = 24;

    const tabs = [
        { top: folderBodyTop - TAB_SHOW -  0, left: FL + 28, w: FOLDER_W - 74, rot: -1.8, z: 15 },
        { top: folderBodyTop - TAB_SHOW -  7, left: FL + 12, w: FOLDER_W - 42, rot:  1.2, z: 14 },
        { top: folderBodyTop - TAB_SHOW - 14, left: FL + 22, w: FOLDER_W - 60, rot: -0.6, z: 13 },
        { top: folderBodyTop - TAB_SHOW - 21, left: FL + 16, w: FOLDER_W - 56, rot:  0.8, z: 12 },
        { top: folderBodyTop - TAB_SHOW - 28, left: FL + 24, w: FOLDER_W - 64, rot: -0.4, z: 11 },
        { top: folderBodyTop - TAB_SHOW - 35, left: FL + 18, w: FOLDER_W - 52, rot:  0.6, z: 10 },
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
    ScrollTrigger.create({
        trigger:       '#scene',
        start:         'top top',
        end:           '+=150%',
        pin:           true,
        anticipatePin: 1,
        scrub:         0.5,
        animation:     tl,
    });
}
buildAnimation();



/* ──────────────────────────────────────────────────────────────
   3.  SECTION FADE-UPS
────────────────────────────────────────────────────────────── */
const fadeEls = [
    '.sec-eye', '.sec-title',
    '.about-photo-wrap', '.about-bio p', '.stats',
    '.proj-card', '.desktop-wrap', '.tl-item',
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
        document.getElementById(sections[i]).scrollIntoView({ behavior: 'smooth' });
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
