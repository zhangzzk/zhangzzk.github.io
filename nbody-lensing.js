(function () {
  function ContactLensing() {
    if (window.__contactLensingStarted) return;
    window.__contactLensingStarted = true;

    const canvas = document.getElementById('nbody-canvas');
    const host = document.querySelector('.contact-orbit');
    if (!canvas || !host) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const GW = 128;
    const GH = 80;
    const CELL_COUNT = GW * GH;
    const density = new Float32Array(CELL_COUNT);
    const rho = new Float32Array(CELL_COUNT);
    const smooth = new Float32Array(CELL_COUNT);
    let psi = new Float32Array(CELL_COUNT);
    let psiNext = new Float32Array(CELL_COUNT);
    const alphaX = new Float32Array(CELL_COUNT);
    const alphaY = new Float32Array(CELL_COUNT);
    const trailCanvas = document.createElement('canvas');
    const trailCtx = trailCanvas.getContext('2d');

    const state = {
      w: 1,
      h: 1,
      dpr: 1,
      n: 0,
      x: new Float32Array(0),
      y: new Float32Array(0),
      vx: new Float32Array(0),
      vy: new Float32Array(0),
      mass: new Float32Array(0),
      visible: false,
      raf: 0,
      last: performance.now(),
      lastScrollY: window.scrollY,
      scrollKick: 0,
      lastPunch: 0,
      pointer: { x: 0, y: 0, vx: 0, vy: 0, active: false, down: false },
    };

    function makeRand(seed) {
      let s = seed >>> 0;
      return function rand() {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }

    function wrap(value, limit) {
      if (value < 0) return value + limit;
      if (value >= limit) return value - limit;
      return value;
    }

    function shortestDelta(delta, limit) {
      if (delta > limit * 0.5) return delta - limit;
      if (delta < -limit * 0.5) return delta + limit;
      return delta;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function gridIndex(ix, iy) {
      return ((iy + GH) % GH) * GW + ((ix + GW) % GW);
    }

    function sampleField(field, px, py) {
      const gx = (px / state.w) * GW;
      const gy = (py / state.h) * GH;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const tx = gx - x0;
      const ty = gy - y0;
      const i00 = gridIndex(x0, y0);
      const i10 = gridIndex(x0 + 1, y0);
      const i01 = gridIndex(x0, y0 + 1);
      const i11 = gridIndex(x0 + 1, y0 + 1);
      const a = field[i00] * (1 - tx) + field[i10] * tx;
      const b = field[i01] * (1 - tx) + field[i11] * tx;
      return a * (1 - ty) + b * ty;
    }

    function seedParticles() {
      const rand = makeRand(977 + Math.floor(state.w * 19 + state.h * 31));
      const count = state.w < 700 ? 1800 : 4100;
      const x = new Float32Array(count);
      const y = new Float32Array(count);
      const vx = new Float32Array(count);
      const vy = new Float32Array(count);
      const mass = new Float32Array(count);
      const cols = Math.ceil(Math.sqrt(count * state.w / state.h));
      const rows = Math.ceil(count / cols);
      const cellW = state.w / cols;
      const cellH = state.h / rows;

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const px = (col + 0.5 + (rand() - 0.5) * 0.42) * cellW;
        const py = (row + 0.5 + (rand() - 0.5) * 0.42) * cellH;
        x[i] = px;
        y[i] = py;
        vx[i] = 0;
        vy[i] = 0;
        mass[i] = 1;
      }

      state.n = count;
      state.x = x;
      state.y = y;
      state.vx = vx;
      state.vy = vy;
      state.mass = mass;
      density.fill(0);
      rho.fill(0);
      smooth.fill(0);
      psi.fill(0);
      psiNext.fill(0);
      alphaX.fill(0);
      alphaY.fill(0);
      trailCtx.clearRect(0, 0, state.w, state.h);
    }

    function depositMass() {
      density.fill(0);
      let total = 0;

      for (let i = 0; i < state.n; i++) {
        const gx = (state.x[i] / state.w) * GW;
        const gy = (state.y[i] / state.h) * GH;
        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const tx = gx - x0;
        const ty = gy - y0;
        const m = state.mass[i];
        density[gridIndex(x0, y0)] += m * (1 - tx) * (1 - ty);
        density[gridIndex(x0 + 1, y0)] += m * tx * (1 - ty);
        density[gridIndex(x0, y0 + 1)] += m * (1 - tx) * ty;
        density[gridIndex(x0 + 1, y0 + 1)] += m * tx * ty;
        total += m;
      }

      const mean = total / CELL_COUNT;
      for (let i = 0; i < CELL_COUNT; i++) rho[i] = density[i] - mean;

      for (let pass = 0; pass < 2; pass++) {
        const src = pass === 0 ? rho : smooth;
        const dst = pass === 0 ? smooth : rho;
        for (let y = 0; y < GH; y++) {
          for (let x = 0; x < GW; x++) {
            const i = y * GW + x;
            dst[i] = (
              src[i] * 4 +
              src[gridIndex(x - 1, y)] +
              src[gridIndex(x + 1, y)] +
              src[gridIndex(x, y - 1)] +
              src[gridIndex(x, y + 1)]
            ) * 0.125;
          }
        }
      }
    }

    function solvePotential() {
      const source = 0.38;
      for (let iter = 0; iter < 24; iter++) {
        for (let y = 0; y < GH; y++) {
          for (let x = 0; x < GW; x++) {
            const i = y * GW + x;
            psiNext[i] = (
              psi[gridIndex(x - 1, y)] +
              psi[gridIndex(x + 1, y)] +
              psi[gridIndex(x, y - 1)] +
              psi[gridIndex(x, y + 1)] +
              rho[i] * source
            ) * 0.25;
          }
        }
        const swap = psi;
        psi = psiNext;
        psiNext = swap;
      }

      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          const i = y * GW + x;
          alphaX[i] = (psi[gridIndex(x + 1, y)] - psi[gridIndex(x - 1, y)]) * 0.5;
          alphaY[i] = (psi[gridIndex(x, y + 1)] - psi[gridIndex(x, y - 1)]) * 0.5;
        }
      }
    }

    function updateParticles(dt) {
      const accel = state.w < 700 ? 0.000143 : 0.000104;
      const kick = state.scrollKick;
      for (let i = 0; i < state.n; i++) {
        const ax = sampleField(alphaX, state.x[i], state.y[i]) * accel;
        const ay = sampleField(alphaY, state.x[i], state.y[i]) * accel;
        const shear = (state.x[i] / state.w - 0.5) * kick * 0.0008;

        let vx = (state.vx[i] + ax * dt) * 0.99988;
        let vy = (state.vy[i] + (ay + shear) * dt) * 0.99988;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = state.w < 700 ? 2.8 : 3.4;
        if (speed > maxSpeed) {
          const s = maxSpeed / speed;
          vx *= s;
          vy *= s;
        }
        state.vx[i] = vx;
        state.vy[i] = vy;
        state.x[i] = wrap(state.x[i] + state.vx[i] * dt, state.w);
        state.y[i] = wrap(state.y[i] + state.vy[i] * dt, state.h);
      }
      state.scrollKick *= 0.88;
    }

    function applyPunch(px, py, power, radius) {
      if (!state.n || reducedMotion) return;
      const r2 = radius * radius;
      const carryX = clamp(state.pointer.vx, -70, 70) * 0.02464;
      const carryY = clamp(state.pointer.vy, -70, 70) * 0.02464;
      for (let i = 0; i < state.n; i++) {
        const dx = shortestDelta(state.x[i] - px, state.w);
        const dy = shortestDelta(state.y[i] - py, state.h);
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const dist = Math.max(2, Math.sqrt(d2));
        const falloff = Math.pow(1 - dist / radius, 2.2);
        state.vx[i] += (dx / dist) * power * falloff + carryX * falloff;
        state.vy[i] += (dy / dist) * power * falloff + carryY * falloff;
      }
    }

    function renderBackground(reset) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = reset ? '#f5f3ec' : 'rgba(245, 243, 236, 0.34)';
      ctx.fillRect(0, 0, state.w, state.h);
      ctx.restore();
    }

    function renderParticles() {
      trailCtx.save();
      trailCtx.clearRect(0, 0, state.w, state.h);
      trailCtx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < state.n; i++) {
        const r = 1.12;
        trailCtx.fillStyle = 'rgba(14, 14, 12, 0.44)';
        trailCtx.beginPath();
        trailCtx.arc(state.x[i], state.y[i], r, 0, Math.PI * 2);
        trailCtx.fill();
      }
      trailCtx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.94;
      ctx.drawImage(trailCanvas, 0, 0, state.w, state.h);
      ctx.restore();
    }

    function render(reset) {
      renderBackground(reset);
      renderParticles();
    }

    function resize() {
      const r = host.getBoundingClientRect();
      const w = Math.max(280, Math.floor(r.width));
      const h = Math.max(340, Math.floor(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (state.w === w && state.h === h && state.dpr === dpr) return;

      state.w = w;
      state.h = h;
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      trailCanvas.width = w;
      trailCanvas.height = h;
      seedParticles();
      depositMass();
      solvePotential();
      render(true);
    }

    function setPointer(e, punchOnMove) {
      const r = host.getBoundingClientRect();
      const prevActive = state.pointer.active;
      const prevX = state.pointer.x;
      const prevY = state.pointer.y;
      state.pointer.x = e.clientX - r.left;
      state.pointer.y = e.clientY - r.top;
      state.pointer.active =
        state.pointer.x >= 0 && state.pointer.x <= r.width &&
        state.pointer.y >= 0 && state.pointer.y <= r.height;
      state.pointer.vx = prevActive ? state.pointer.x - prevX : 0;
      state.pointer.vy = prevActive ? state.pointer.y - prevY : 0;

      if (punchOnMove && state.pointer.active && prevActive) {
        const speed = Math.sqrt(state.pointer.vx * state.pointer.vx + state.pointer.vy * state.pointer.vy);
        const now = performance.now();
        if (speed > 6 && now - state.lastPunch > 26) {
          const power = clamp(speed * (state.pointer.down ? 0.02912 : 0.01568), 0.2016, state.pointer.down ? 1.736 : 0.9408);
          const radius = state.pointer.down ? 133 : 86;
          applyPunch(state.pointer.x, state.pointer.y, power, radius);
          state.lastPunch = now;
        }
      }
    }

    function frame(now) {
      state.raf = 0;
      if (!state.visible) return;

      const dt = Math.min(1.4, Math.max(0.45, (now - state.last) / 16.67));
      state.last = now;
      depositMass();
      solvePotential();
      if (!reducedMotion) updateParticles(dt);
      render(false);
      if (!reducedMotion) state.raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (state.raf) return;
      state.last = performance.now();
      state.raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    host.addEventListener('pointermove', (e) => setPointer(e, true));
    host.addEventListener('pointerenter', (e) => setPointer(e, false));
    host.addEventListener('pointerleave', () => {
      state.pointer.active = false;
      state.pointer.vx = 0;
      state.pointer.vy = 0;
    });
    host.addEventListener('pointerdown', (e) => {
      state.pointer.down = true;
      if (host.setPointerCapture) host.setPointerCapture(e.pointerId);
      setPointer(e, false);
      if (state.pointer.active) applyPunch(state.pointer.x, state.pointer.y, 2.464, 145);
    });
    host.addEventListener('pointerup', (e) => {
      state.pointer.down = false;
      if (host.releasePointerCapture) {
        try {
          host.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Pointer capture may already be gone if the cursor left the block.
        }
      }
    });
    host.addEventListener('pointercancel', () => {
      state.pointer.active = false;
      state.pointer.down = false;
    });
    window.addEventListener('scroll', () => {
      state.lastScrollY = window.scrollY;
    }, { passive: true });

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        state.visible = entries.some((entry) => entry.isIntersecting);
        if (state.visible) wake();
      }, { threshold: 0.04 });
      observer.observe(host);
    } else {
      state.visible = true;
      wake();
    }
  }

  window.ContactLensing = ContactLensing;
})();
