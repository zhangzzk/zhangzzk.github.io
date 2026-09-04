/* cosmo-sim.js — interactive weak-lensing toy.
   Dark-matter particles arranged as a cosmic web. The weak-lensing shear at
   every grid point is computed directly from the particle distribution:

       gamma(z) = -SUM_j  m_j * (z - c_j)^2 / (|z - c_j|^2 + s)^2          (complex)

   which is the spin-2 tangential shear of a (softened) point mass, |gamma| ~ 1/r^2.
   The user can drag across the field to push the particles; the web springs
   back to its rest configuration and the shear updates live every frame. */
(function () {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function CosmoSim(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const accent = opts.accent || '#c8442a';
    const accentRGB = opts.accentRGB || '200,68,42';
    const seed = opts.seed || 7;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1;
    let halos = [];     // heavy dark-matter cores  {x,y,hx,hy,vx,vy,m, links:[]}
    let gals = [];      // light tracer galaxies    {x,y,hx,hy,vx,vy,m,bright}
    let P = [];         // all particles (for physics + shear)
    let grid = [];      // precomputed whisker grid points {x,y,xf}
    const step = opts.step || 34;

    // horizontal emphasis: 0 under the text -> 1 on the open side.
    // `mirror` puts the open side on the left instead of the right.
    const edge0 = opts.fadeStart != null ? opts.fadeStart : 0.15;
    const edgeW = opts.fadeWidth != null ? opts.fadeWidth : 0.50;
    const mirror = !!opts.mirror;
    function xfade(x) {
      const u = mirror ? 1 - x / W : x / W;
      const t = Math.min(1, Math.max(0, (u - edge0) / edgeW));
      return t * t * (3 - 2 * t);
    }

    const pointer = { x: 0, y: 0, active: false, has: false };

    function build() {
      const rnd = mulberry32(seed);
      halos = []; gals = []; P = [];
      const N = opts.nodes || 14;
      // dark-matter halo cores, positions skewed toward the open side
      for (let i = 0; i < N; i++) {
        const u = 0.10 + 0.86 * Math.pow(rnd(), 0.6);
        const x = W * (mirror ? 1 - u : u);
        const y = H * (0.06 + 0.88 * rnd());
        const m = 2.6 + rnd() * 5.5;
        halos.push({ x, y, hx: x, hy: y, vx: 0, vy: 0, m, links: [] });
      }
      // connect each halo to its 2 nearest -> filaments
      for (let i = 0; i < N; i++) {
        const d = halos.map((n, j) => ({ j, r: Math.hypot(n.x - halos[i].x, n.y - halos[i].y) }))
          .filter(o => o.j !== i).sort((a, b) => a.r - b.r);
        for (let k = 0; k < 2; k++) if (d[k] && halos[i].links.indexOf(d[k].j) < 0) {
          halos[i].links.push(d[k].j);
        }
      }
      function gal(x, y, m, bright) {
        gals.push({ x, y, hx: x, hy: y, vx: 0, vy: 0, m: m, bright: !!bright });
      }
      // tracer galaxies strung along filaments
      halos.forEach((a, i) => a.links.forEach(j => {
        const b = halos[j];
        const r = Math.hypot(b.x - a.x, b.y - a.y);
        const n = Math.max(5, Math.floor(r / 9));
        for (let t = 0; t < n; t++) {
          const f = t / n;
          const sp = 8 + rnd() * 12;
          gal(a.x + (b.x - a.x) * f + (rnd() - 0.5) * sp,
              a.y + (b.y - a.y) * f + (rnd() - 0.5) * sp,
              0.25 + rnd() * 0.5);
        }
      }));
      // galaxies clustered around each halo
      halos.forEach((nd, i) => {
        const c = Math.floor(12 + nd.m * 3.0);
        for (let t = 0; t < c; t++) {
          const ang = rnd() * Math.PI * 2;
          const rr = Math.pow(rnd(), 1.7) * (12 + nd.m * 4);
          gal(nd.x + Math.cos(ang) * rr, nd.y + Math.sin(ang) * rr,
              0.3 + rnd() * 0.5, rnd() < 0.12);
        }
      });
      // sparse field galaxies
      for (let t = 0; t < (opts.field || 120); t++) gal(W * rnd(), H * rnd(), 0.15 + rnd() * 0.2);

      P = halos.concat(gals);

      // precompute whisker grid
      grid = [];
      for (let x = step * 0.5; x < W; x += step)
        for (let y = step * 0.5; y < H; y += step) {
          const xf = xfade(x);
          if (xf > 0.02) grid.push({ x, y, xf });
        }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || canvas.parentNode.clientWidth || 1200;
      H = canvas.clientHeight || canvas.parentNode.clientHeight || 600;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    // ---- physics: spring-to-home + damping + pointer push ----
    const SPRING = opts.spring || 5.0;
    const DAMP = opts.damp || 0.90;
    const PR = opts.pushRadius || 130;   // px
    const PF = opts.pushForce || 260;    // px/s^2 scale
    function physics(dt) {
      const pr2 = PR * PR;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        let fx = (p.hx - p.x) * SPRING;
        let fy = (p.hy - p.y) * SPRING;
        if (pointer.active) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < pr2 && r2 > 1e-3) {
            const r = Math.sqrt(r2);
            const fall = (1 - r / PR);
            const f = PF * fall * fall / r;
            fx += dx * f; fy += dy * f;
          }
        }
        p.vx = (p.vx + fx * dt) * DAMP;
        p.vy = (p.vy + fy * dt) * DAMP;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

    // ---- weak-lensing shear from all particles ----
    const SOFT = opts.soft || 16 * 16;   // softening core (px^2)
    function shearAt(x, y) {
      let g1 = 0, g2 = 0;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const dx = x - p.x, dy = y - p.y;
        const r2 = dx * dx + dy * dy + SOFT;
        const inv = p.m / (r2 * r2);
        // -(dx+idy)^2 = -(dx^2-dy^2) - i(2dxdy)
        g1 -= (dx * dx - dy * dy) * inv;
        g2 -= (2 * dx * dy) * inv;
      }
      return [g1, g2];
    }

    const Lmax = opts.whiskerMax || 17;
    const g0 = opts.gScale || 0.012;     // saturation scale for whisker length

    function render() {
      ctx.clearRect(0, 0, W, H);
      // filaments (follow current halo positions)
      ctx.lineWidth = 1;
      halos.forEach((a) => a.links.forEach(j => {
        const b = halos[j];
        const xf = xfade((a.x + b.x) / 2);
        if (xf <= 0.03) return;
        ctx.strokeStyle = `rgba(21,20,15,${0.07 * xf})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }));
      // shear whiskers
      ctx.lineCap = 'round';
      for (let i = 0; i < grid.length; i++) {
        const gp = grid[i];
        const [s1, s2] = shearAt(gp.x, gp.y);
        const mag = Math.hypot(s1, s2);
        if (mag < 1e-5) continue;
        const ori = 0.5 * Math.atan2(s2, s1);
        const len = Lmax * (mag / (mag + g0));
        if (len < 1.4) continue;
        const a = (0.14 + 0.50 * (mag / (mag + g0))) * gp.xf;
        ctx.strokeStyle = `rgba(21,20,15,${a})`;
        ctx.lineWidth = 1 + 1.1 * (mag / (mag + g0));
        const cx = Math.cos(ori) * len, cy = Math.sin(ori) * len;
        ctx.beginPath();
        ctx.moveTo(gp.x - cx, gp.y - cy);
        ctx.lineTo(gp.x + cx, gp.y + cy);
        ctx.stroke();
      }
      // tracer galaxies
      for (let i = 0; i < gals.length; i++) {
        const g = gals[i];
        const xf = xfade(g.x);
        if (xf <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.bright ? 1.7 : 0.5 + g.m * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = g.bright
          ? `rgba(${accentRGB},${Math.min(1, xf)})`
          : `rgba(21,20,15,${(0.40 + g.m * 0.40) * xf})`;
        ctx.fill();
      }
      // halo cores: faint accent glow
      for (let i = 0; i < halos.length; i++) {
        const hc = halos[i];
        const xf = xfade(hc.x);
        if (xf < 0.12) continue;
        const rr = 5 + hc.m * 1.4;
        const gr = ctx.createRadialGradient(hc.x, hc.y, 0, hc.x, hc.y, rr * 3.2);
        gr.addColorStop(0, `rgba(${accentRGB},${0.17 * xf})`);
        gr.addColorStop(1, `rgba(${accentRGB},0)`);
        ctx.fillStyle = gr;
        ctx.fillRect(hc.x - rr * 3.2, hc.y - rr * 3.2, rr * 6.4, rr * 6.4);
      }
    }

    let raf = 0, last = 0, idleFrames = 0;
    function loop(now) {
      try {
      const dt = Math.min(0.033, (last ? (now - last) / 1000 : 0.016));
      last = now;
      physics(dt);
      render();
      // idle detection: stop animating when settled and no pointer
      let moving = pointer.active;
      if (!moving) {
        for (let i = 0; i < P.length; i++) {
          if (Math.abs(P[i].vx) + Math.abs(P[i].vy) > 0.4) { moving = true; break; }
        }
      }
      idleFrames = moving ? 0 : idleFrames + 1;
      } catch (e) { window.__cosmoErr = (e && e.stack) || String(e); }
      if (idleFrames > 45 && !pointer.active) { raf = 0; return; }  // sleep when settled
      raf = requestAnimationFrame(loop);
    }
    function ensureRunning() { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }

    // ---- pointer wiring (listen on host so it works over the text too) ----
    const host = opts.host || canvas.parentNode;
    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }
    function onMove(e) {
      toLocal(e);
      pointer.has = true;
      pointer.active = pointer.x > -40 && pointer.x < W + 40 && pointer.y > -40 && pointer.y < H + 40;
      idleFrames = 0; ensureRunning();
    }
    function onLeave() { pointer.active = false; }
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });

    const ro = ('ResizeObserver' in window) ? new ResizeObserver(() => resize()) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', resize);

    // Apply an impulse to every particle so the web visibly settles into place.
    // Mild outward push from the structure centre + random jitter; the spring
    // pulls everything back home and it eases out via damping.
    function disturb(power) {
      power = power || 320;
      const cx = W * 0.6, cy = H * 0.5;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const dx = p.x - cx, dy = p.y - cy;
        const r = Math.hypot(dx, dy) || 1;
        const m = power * (0.5 + Math.random());
        p.vx += (dx / r) * m * 0.5 + (Math.random() - 0.5) * m;
        p.vy += (dy / r) * m * 0.5 + (Math.random() - 0.5) * m;
      }
      idleFrames = 0;
      ensureRunning();
    }

    resize();
    render();                       // immediate rest-state paint (covers pre-rAF / capture)
    if (!reduce) disturb(opts.loadKick || 320);  // initial disturbance, settles into the web

    return {
      reset() { build(); },
      disturb,
      _debug() { return { P: P.length, gals: gals.length, halos: halos.length, grid: grid.length, W, H, raf, sampleGal: gals[0] && { x: gals[0].x, y: gals[0].y, m: gals[0].m }, sampleHalo: halos[0] && { x: halos[0].x, y: halos[0].y, m: halos[0].m }, sampleShear: shearAt(W * 0.7, H * 0.5) }; },
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerdown', onMove);
        host.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', resize);
      },
    };
  }

  window.CosmoSim = CosmoSim;
})();
