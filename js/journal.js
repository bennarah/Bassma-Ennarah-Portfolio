/* Beyond section — journal that flips like a real book
 *
 * Spread 0  : contents (left)  | page 1 (right)
 * Spread 1  : page 2           | page 3
 * Spread 2  : page 4           | page 5
 * Spread 3  : page 6           | page 7 (the end)
 *
 * Each .leaf is one sheet hinged on the spine. Turning forward adds
 * .flipped (rotateY -180deg); turning back removes it.
 */
(function () {
    const wrap    = document.getElementById('bookWrap');
    const book    = document.getElementById('book');
    const prevBtn = document.getElementById('jnavPrev');
    const nextBtn = document.getElementById('jnavNext');
    if (!wrap || !book || !prevBtn || !nextBtn) return;

    const leaves = Array.from(book.querySelectorAll('.leaf'));
    const pips   = Array.from(document.querySelectorAll('.j-pip'));
    const N      = leaves.length;            // number of sheets
    const TURN_MS = 950;                     // keep in sync with CSS transition
    const STAGGER = 140;                     // delay between sheets on multi-page jumps

    let spread = 0;                          // 0 … N
    const timers = new Map();

    // Stack order: unturned sheets on the right (first sheet on top),
    // turned sheets on the left (most recently turned on top).
    function restingZ(i, flipped) {
        return flipped ? 10 + i : 10 + (N - i);
    }
    // Matching 3D depth: the sheet on top of each pile sits slightly higher.
    function restingLift(i, flipped) {
        return ((flipped ? i + 1 : N - i) * 0.5) + 'px';
    }
    leaves.forEach((leaf, i) => {
        leaf.style.zIndex = restingZ(i, false);
        leaf.style.setProperty('--lift', restingLift(i, false));
    });

    function turn(i, forward) {
        const leaf = leaves[i];
        clearTimeout(timers.get(leaf));
        leaf.style.zIndex = 60 + (forward ? i : N - i);   // lift above everything while moving
        leaf.style.setProperty('--lift', (N + 2) * 0.5 + 'px');
        leaf.classList.toggle('flipped', forward);
        timers.set(leaf, setTimeout(() => {
            leaf.style.zIndex = restingZ(i, forward);
            leaf.style.setProperty('--lift', restingLift(i, forward));
        }, TURN_MS));
    }

    function goTo(target) {
        target = Math.max(0, Math.min(N, target));
        if (target === spread) return;
        const forward = target > spread;
        const steps = [];
        if (forward) for (let i = spread; i < target; i++) steps.push(i);
        else         for (let i = spread - 1; i >= target; i--) steps.push(i);
        steps.forEach((leafIdx, k) => setTimeout(() => turn(leafIdx, forward), k * STAGGER));
        spread = target;
        updateUI();
    }

    function updateUI() {
        prevBtn.disabled = spread === 0;
        nextBtn.disabled = spread === N;
        pips.forEach((p, i) => {
            p.classList.toggle('active', i === spread);
            p.setAttribute('aria-current', i === spread ? 'true' : 'false');
        });
    }

    // Controls
    prevBtn.addEventListener('click', () => goTo(spread - 1));
    nextBtn.addEventListener('click', () => goTo(spread + 1));
    pips.forEach((p, i) => p.addEventListener('click', () => goTo(i)));
    book.querySelectorAll('.toc button').forEach(b =>
        b.addEventListener('click', e => { e.stopPropagation(); goTo(+b.dataset.spread); }));

    // Click a page to turn it: right-hand page → forward, left-hand page → back.
    // Links and buttons inside pages keep working normally.
    book.addEventListener('click', e => {
        if (e.target.closest('a, button, .zoomable')) return;
        const face = e.target.closest('.face');
        if (!face) return;
        goTo(face.classList.contains('front') ? spread + 1 : spread - 1);
    });

    // Arrow keys while the section is on screen
    document.addEventListener('keydown', e => {
        const r = document.getElementById('beyond').getBoundingClientRect();
        if (r.top > window.innerHeight || r.bottom < 0) return;
        if (lb && !lb.hidden) return;
        if (e.key === 'ArrowLeft')  goTo(spread - 1);
        if (e.key === 'ArrowRight') goTo(spread + 1);
    });

    // Size the book to the screen: up to 1.35x on big screens (easier to read),
    // shrinks on phones. Also keeps the whole book + controls visible vertically.
    const MAX_ZOOM = 1.35;
    function fit() {
        const fullW = 600 + 32;                                // two pages + cover overhang
        const fullH = 420 + 24;
        // same side margin as the rest of the site (the --gutter in styles.css)
        const gutter   = window.innerWidth <= 700 ? 22 : 48;
        const byWidth  = (wrap.clientWidth - gutter * 2) / fullW;
        const byHeight = (window.innerHeight - 150) / fullH;   // leave room for the arrows/dots
        const z = Math.max(0.3, Math.min(MAX_ZOOM, byWidth, Math.max(byHeight, 1)));
        wrap.style.setProperty('--book-zoom', z.toFixed(3));   // inherited by .book
    }
    // Photos open full-size in a lightbox
    const lb    = document.getElementById('photoLightbox');
    const lbImg = document.getElementById('photoLightboxImg');
    const lbCap = document.getElementById('photoLightboxCap');
    let lastFocus = null;
    function openPhoto(img) {
        lastFocus = document.activeElement;
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        const cap = img.closest('figure')?.querySelector('figcaption');
        lbCap.textContent = cap ? cap.textContent : '';
        lb.hidden = false;
        lb.querySelector('.photo-lightbox-close').focus();
    }
    function closePhoto() {
        lb.hidden = true;
        lbImg.src = '';
        if (lastFocus) lastFocus.focus();
    }
    book.querySelectorAll('.zoomable').forEach(img => {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.addEventListener('click', e => { e.stopPropagation(); openPhoto(img); });
        img.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhoto(img); }
        });
    });
    if (lb) {
        lb.addEventListener('click', closePhoto);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closePhoto(); });
    }

    window.addEventListener('resize', fit);
    fit();
    updateUI();
}());
