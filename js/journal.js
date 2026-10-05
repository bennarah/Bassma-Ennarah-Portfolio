/* Beyond section — journal fan / page-flip */

/* ── Journal page-flip ──────────────────────────────────────── */
(function () {
    const pages   = Array.from(document.querySelectorAll('.j-page'));
    const prevBtn = document.getElementById('jnavPrev');
    const nextBtn = document.getElementById('jnavNext');
    const pips    = Array.from(document.querySelectorAll('.j-pip'));
    if (!pages.length || !prevBtn || !nextBtn) return;

    let current   = 0;
    let animating = false;

    /*
     * Fan slots — ALL pages share transform-origin: left center (set in CSS).
     * rotZ rotates each page clockwise around the LEFT SPINE, fanning the right
     * side outward like a real journal.  rotY adds 3-D depth so further pages
     * recede away from the viewer.  slot 0 = front (current page).
     */
    const FAN = [
        { rotZ:  0, rotY:   0, s: 1,    op: 1,    z: 10, shadow: 0    },
        { rotZ:  8, rotY:  -9, s: 0.97, op: 1,    z: 9,  shadow: 0.10 },
        { rotZ: 15, rotY: -16, s: 0.94, op: 0.92, z: 8,  shadow: 0.18 },
        { rotZ: 21, rotY: -22, s: 0.91, op: 0.83, z: 7,  shadow: 0.26 },
    ];

    // Exit transform: page flips back around the left spine and slides away
    const EXIT_FWD  = 'rotateY(-175deg) rotateZ(-4deg) scale(0.92)';
    // Entry transform for backward nav: page starts folded behind the spine
    const ENTRY_BWD = 'rotateY(-175deg) rotateZ(-4deg) scale(0.92)';

    function fanCSS(f) {
        return `rotateZ(${f.rotZ}deg) rotateY(${f.rotY}deg) scale(${f.s})`;
    }

    // Darkening overlay so fanned pages look physically layered behind each other
    function applyFanShadow(page, opacity) {
        let shade = page.querySelector('.j-fan-shade');
        if (!shade) {
            shade = document.createElement('div');
            shade.className = 'j-fan-shade';
            shade.style.cssText = 'position:absolute;inset:0;border-radius:10px;pointer-events:none;z-index:20;transition:background 0.45s;';
            page.appendChild(shade);
        }
        shade.style.background = opacity > 0
            ? `rgba(0,0,0,${opacity})`
            : 'none';
    }

    function showPage(p, f, instant) {
        if (instant) p.style.transition = 'none';
        // Inline position:absolute overrides .jp { position:relative } which
        // comes later in the stylesheet and would otherwise win the cascade.
        p.style.display       = 'block';
        p.style.position      = 'absolute';
        p.style.top           = '0';
        p.style.left          = '0';
        p.style.zIndex        = f.z;
        p.style.opacity       = f.op;
        p.style.transform     = fanCSS(f);
        p.style.pointerEvents = 'auto';
        applyFanShadow(p, f.shadow);
        if (instant) { void p.offsetWidth; p.style.transition = ''; }
    }

    function hidePage(p, instant) {
        if (instant) p.style.transition = 'none';
        p.style.opacity       = '0';
        p.style.pointerEvents = 'none';
        setTimeout(() => {
            if (p.style.opacity === '0') p.style.display = 'none';
        }, instant ? 0 : 460);
    }

    function positionPages(instant) {
        pages.forEach((p, i) => {
            const slot = i - current;
            if (slot < 0 || slot >= FAN.length) hidePage(p, instant);
            else showPage(p, FAN[slot], instant);
        });
    }

    function updateUI() {
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === pages.length - 1;
        pips.forEach((p, i) => p.classList.toggle('active', i === current));
    }

    function goTo(nextIdx) {
        if (animating || nextIdx === current || nextIdx < 0 || nextIdx >= pages.length) return;
        animating = true;
        const direction = nextIdx > current ? 1 : -1;

        if (direction > 0) {
            // ── Forward: front page flips around the left spine and exits ──
            const front = pages[current];
            front.style.transition = 'transform 0.44s ease-in, opacity 0.32s ease-in';
            front.style.transform  = EXIT_FWD;
            front.style.opacity    = '0';
            front.style.zIndex     = '1';

            setTimeout(() => {
                front.style.display = 'none';
                current = nextIdx;
                updateUI();
                positionPages(false);          // fan shifts forward
                setTimeout(() => { animating = false; }, 520);
            }, 200);

        } else {
            // ── Backward: previous page unfolds in from behind the spine ──
            const dest = pages[nextIdx];
            // Start it folded behind the spine (no transition)
            dest.style.transition = 'none';
            dest.style.display    = 'block';
            dest.style.position   = 'absolute';
            dest.style.top        = '0';
            dest.style.left       = '0';
            dest.style.zIndex     = '11';
            dest.style.opacity    = '0';
            dest.style.transform  = ENTRY_BWD;
            void dest.offsetWidth;

            current = nextIdx;
            updateUI();

            // Unfold it to the front fan position
            dest.style.transition = 'transform 0.46s ease-out, opacity 0.36s ease-out';
            dest.style.transform  = fanCSS(FAN[0]);
            dest.style.opacity    = '1';
            applyFanShadow(dest, FAN[0].shadow);

            setTimeout(() => { positionPages(false); }, 70);
            setTimeout(() => { animating = false; }, 500);
        }
    }

    // Wire up controls
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    pips.forEach((p, i) => p.addEventListener('click', () => goTo(i)));

    // Click a fanned page to jump to it
    pages.forEach((p, i) => p.addEventListener('click', () => { if (i !== current) goTo(i); }));

    // Keyboard navigation when Beyond is on-screen
    document.addEventListener('keydown', e => {
        const r = document.getElementById('beyond').getBoundingClientRect();
        if (r.top > window.innerHeight || r.bottom < 0) return;
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Initial layout — no animation
    positionPages(true);
    updateUI();
}());
