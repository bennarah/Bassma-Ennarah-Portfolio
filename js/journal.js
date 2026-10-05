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
    leaves.forEach((leaf, i) => { leaf.style.zIndex = restingZ(i, false); });

    function turn(i, forward) {
        const leaf = leaves[i];
        clearTimeout(timers.get(leaf));
        leaf.style.zIndex = 60 + (forward ? i : N - i);   // lift above everything while moving
        leaf.classList.toggle('flipped', forward);
        timers.set(leaf, setTimeout(() => {
            leaf.style.zIndex = restingZ(i, forward);
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
        if (e.target.closest('a, button')) return;
        const face = e.target.closest('.face');
        if (!face) return;
        goTo(face.classList.contains('front') ? spread + 1 : spread - 1);
    });

    // Arrow keys while the section is on screen
    document.addEventListener('keydown', e => {
        const r = document.getElementById('beyond').getBoundingClientRect();
        if (r.top > window.innerHeight || r.bottom < 0) return;
        if (e.key === 'ArrowLeft')  goTo(spread - 1);
        if (e.key === 'ArrowRight') goTo(spread + 1);
    });

    // Scale the book down to fit narrow screens
    function fit() {
        const full  = 600 + 32;                               // two pages + cover overhang
        const avail = wrap.clientWidth - 16;
        const s = Math.min(1, avail / full);
        book.style.setProperty('--book-scale', s.toFixed(3));
        wrap.style.height = Math.ceil((420 + 24) * s + 24) + 'px';
    }
    window.addEventListener('resize', fit);
    fit();
    updateUI();
}());
