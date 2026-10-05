/* Rey the dog — pixel sprite animation in the Projects section */

/* ──────────────────────────────────────────────────────────────
   5.  REY MASCOT SPRITE ANIMATION
────────────────────────────────────────────────────────────── */
(function () {
    const el = document.querySelector('.rey-mascot');
    if (!el) return;

    const SRC         = 'assets/sprites/rey-sprite.png';
    const COLS        = 2;
    const TOTAL       = 5;   // 5 frames (last cell in 2x3 grid is empty)
    const SCALE       = 2.5; // pixel-art upscale
    const FPS         = 7;

    const probe = new Image();
    probe.onload = function () {
        const fw = probe.naturalWidth  / COLS;
        const fh = probe.naturalHeight / Math.ceil(TOTAL / COLS); // 3 rows
        const dw = Math.round(fw * SCALE);
        const dh = Math.round(fh * SCALE);

        el.style.width           = dw + 'px';
        el.style.height          = dh + 'px';
        el.style.backgroundImage = `url('${SRC}')`;
        el.style.backgroundSize  = `${Math.round(probe.naturalWidth * SCALE)}px ${Math.round(probe.naturalHeight * SCALE)}px`;
        el.style.backgroundRepeat = 'no-repeat';

        // Pre-compute [x, y] background-position for each frame
        const positions = Array.from({ length: TOTAL }, (_, i) => [
            (i % COLS) * dw,
            Math.floor(i / COLS) * dh
        ]);

        let f = 0;
        setInterval(() => {
            const [x, y] = positions[f % TOTAL];
            el.style.backgroundPosition = `-${x}px -${y}px`;
            f++;
        }, 1000 / FPS);
    };

    probe.src = SRC;
}());
