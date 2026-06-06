/* randomwalk.js — MCMC sampling field for the CV section.
   Many overdispersed chains run Metropolis random-walk steps against a fixed
   target posterior (a small Gaussian mixture). Accepted moves are drawn, so the
   chains visibly converge from all over the frame into the posterior and then
   fill it in. Chains are continually re-seeded (desynced) so the burn-in
   "convergence" streaks keep appearing. Monochrome ink with a few accent chains. */
(function () {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function RandomWalk(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const accentRGB = opts.accentRGB || '200,68,42';
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rnd = mulberry32(opts.seed || 11);
    const N = opts.chains || 84;
    const stepsPerFrame = opts.stepsPerFrame || 1;
    const fade = opts.fade != null ? opts.fade : 0.013;   // slower fade -> posterior accumulates more
    const maxAge = opts.maxAge || 320;                    // steps before a chain re-seeds (per-chain jitter)
    const stepMs = 1000 / (opts.stepHz || 7);             // even slower, deliberate crawl (steps/sec)

    function gauss() {
      let u = 0, v = 0;
      while (u === 0) u = rnd();
      while (v === 0) v = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    let W = 0, H = 0, dpr = 1, propSig = 18, modes = [], chains = [], defs = null;

    // A fresh target posterior each page load: 1-3 Gaussian modes in the open
    // right area (kept clear of the left-hand text). Uses Math.random so it
    // differs run to run, independent of the chain RNG.
    function makeDefs() {
      const k = 1 + Math.floor(Math.random() * 2.99);   // 1..3 modes
      const arr = [];
      for (let i = 0; i < k; i++) {
        arr.push({
          wx: 0.46 + 0.40 * Math.random(),
          wy: 0.28 + 0.48 * Math.random(),
          sx: 0.06 + 0.09 * Math.random(),
          sy: 0.045 + 0.060 * Math.random(),
          rot: (Math.random() - 0.5) * Math.PI,
          w: i === 0 ? 1.0 : 0.30 + 0.55 * Math.random(),
        });
      }
      return arr;
    }

    // Map the (normalized) posterior to pixels for the current size.
    function buildPosterior() {
      const min = Math.min(W, H);
      if (!defs) defs = makeDefs();
      modes = defs.map((m) => {
        const sx = m.sx * min, sy = m.sy * min;
        const c = Math.cos(m.rot), s = Math.sin(m.rot);
        const ix = 1 / (sx * sx), iy = 1 / (sy * sy);
        return {
          cx: m.wx * W, cy: m.wy * H, lw: Math.log(m.w),
          ixx: c * c * ix + s * s * iy,
          iyy: s * s * ix + c * c * iy,
          ixy: c * s * (ix - iy),
        };
      });
      propSig = 0.030 * min;
    }

    function logp(x, y) {
      let maxe = -1e30;
      const t = [];
      for (let i = 0; i < modes.length; i++) {
        const m = modes[i];
        const dx = x - m.cx, dy = y - m.cy;
        const q = m.ixx * dx * dx + 2 * m.ixy * dx * dy + m.iyy * dy * dy;
        const e = m.lw - 0.5 * q;
        t.push(e); if (e > maxe) maxe = e;
      }
      let s = 0;
      for (let i = 0; i < t.length; i++) s += Math.exp(t[i] - maxe);
      return maxe + Math.log(s);
    }

    function reseed(ch) {
      // overdispersed start: anywhere in the frame, biased to the open right half
      ch.x = W * (0.20 + 0.78 * rnd());
      ch.y = H * (0.04 + 0.92 * rnd());
      ch.lp = logp(ch.x, ch.y);
      ch.age = 0;
      ch.maxAge = maxAge * (0.6 + 0.8 * rnd());   // desynced lifetimes
    }

    function seed() {
      chains = [];
      for (let i = 0; i < N; i++) {
        const ch = { x: 0, y: 0, lp: 0, age: 0, maxAge: maxAge, accent: rnd() < 0.13 };
        reseed(ch);   // all start at age 0 -> first wave walks in from initial points
        chains.push(ch);
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || (canvas.parentNode && canvas.parentNode.clientWidth) || 800;
      H = canvas.clientHeight || (canvas.parentNode && canvas.parentNode.clientHeight) || 400;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      buildPosterior();
      seed();
    }

    function step() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(245,243,236,${fade})`;
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (let s = 0; s < stepsPerFrame; s++) {
        for (let i = 0; i < chains.length; i++) {
          const ch = chains[i];
          const xp = ch.x + gauss() * propSig;
          const yp = ch.y + gauss() * propSig;
          const lpp = logp(xp, yp);
          // Metropolis acceptance
          if (Math.log(rnd() + 1e-12) < lpp - ch.lp) {
            ctx.strokeStyle = ch.accent ? `rgba(${accentRGB},0.26)` : 'rgba(21,20,15,0.18)';
            ctx.lineWidth = ch.accent ? 1.2 : 0.95;
            ctx.beginPath();
            ctx.moveTo(ch.x, ch.y);
            ctx.lineTo(xp, yp);
            ctx.stroke();
            ch.x = xp; ch.y = yp; ch.lp = lpp;
          }
          if (++ch.age > ch.maxAge) reseed(ch);
        }
      }
    }

    let raf = 0, visible = false, lastStep = 0;
    function loop(now) {
      raf = 0;
      if (!visible) return;
      if (!lastStep) lastStep = now;
      if (now - lastStep >= stepMs) { step(); lastStep = now; }
      raf = requestAnimationFrame(loop);
    }
    function wake() { if (!raf && !reduce && visible) { lastStep = 0; raf = requestAnimationFrame(loop); } }

    resize();
    if (reduce) { for (let k = 0; k < 260; k++) step(); }   // static converged field

    const ro = ('ResizeObserver' in window) ? new ResizeObserver(() => resize()) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', resize);

    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) wake();
      }, { threshold: 0.02 });
      io.observe(canvas);
    } else {
      visible = true; wake();
    }

    return {
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', resize);
      },
    };
  }

  window.RandomWalk = RandomWalk;
})();
