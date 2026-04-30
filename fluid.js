// Stam-style fluid solver: real-time 2D Navier-Stokes on the GPU
// Curl -> vorticity -> divergence -> pressure (Jacobi) -> gradient subtract
// -> velocity self-advection -> dye advection
// Reference: Pavel Dobryakov's WebGL Fluid Simulation (MIT)
// Adapted as a single-file ES module-free global.

(function () {
  const SIM_RES = 128;
  const DYE_RES = 512;
  const PRESSURE_ITERS = 20;
  const VELOCITY_DISSIPATION = 0.2;
  const DENSITY_DISSIPATION = 1.0;
  const CURL = 30;
  const PRESSURE = 0.8;
  const SPLAT_RADIUS = 0.25;
  const SPLAT_FORCE = 3000;

  function FluidSim(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: true };
    let gl = canvas.getContext('webgl2', params);
    let isWebGL2 = !!gl && gl.getContextAttributes().alpha === true;
    if (!isWebGL2) {
      // WebGL2 not honoring alpha — fall back to WebGL1 which is more reliable for transparent overlays.
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
      isWebGL2 = false;
    }
    if (!gl) return null;

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);
    const formatRGBA = getSupportedFormat(gl, isWebGL2 ? gl.RGBA16F : gl.RGBA, gl.RGBA, halfFloatTexType);
    const formatRG = getSupportedFormat(gl, isWebGL2 ? gl.RG16F : gl.RGBA, isWebGL2 ? gl.RG : gl.RGBA, halfFloatTexType);
    const formatR = getSupportedFormat(gl, isWebGL2 ? gl.R16F : gl.RGBA, isWebGL2 ? gl.RED : gl.RGBA, halfFloatTexType);

    function getSupportedFormat(gl, internalFormat, format, type) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        if (isWebGL2) {
          if (internalFormat === gl.R16F) return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          if (internalFormat === gl.RG16F) return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        }
        return null;
      }
      return { internalFormat, format };
    }
    function supportRenderTextureFormat(gl, internalFormat, format, type) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    // --- Shaders ---
    const baseVert = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;

    const clearFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

    const splatFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }`;

    const advectionFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        ${supportLinearFiltering ? '' : '#define MANUAL_FILTER'}
        #ifdef MANUAL_FILTER
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }`;

    const divergenceFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }`;

    const curlFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }`;

    const vorticityFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`;

    const pressureFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }`;

    const gradientSubtractFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`;

    function compileShader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    function createProgram(vert, frag) {
      const p = gl.createProgram();
      gl.attachShader(p, vert); gl.attachShader(p, frag); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
      const uniforms = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const u = gl.getActiveUniform(p, i).name;
        uniforms[u] = gl.getUniformLocation(p, u);
      }
      return { program: p, uniforms };
    }

    const vert = compileShader(gl.VERTEX_SHADER, baseVert);
    const programs = {
      clear: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, clearFrag)),
      splat: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, splatFrag)),
      advection: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, advectionFrag)),
      divergence: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, divergenceFrag)),
      curl: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, curlFrag)),
      vorticity: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, vorticityFrag)),
      pressure: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, pressureFrag)),
      gradient: createProgram(vert, compileShader(gl.FRAGMENT_SHADER, gradientSubtractFrag)),
    };

    // Quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target) {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const texelSizeX = 1.0 / w, texelSizeY = 1.0 / h;
      return {
        texture: tex, fbo, width: w, height: h, texelSizeX, texelSizeY,
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
      };
    }
    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        get read() { return fbo1; }, set read(v) { fbo1 = v; },
        get write() { return fbo2; }, set write(v) { fbo2 = v; },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
      };
    }

    let dye, velocity, divergence, curlFBO, pressureFBO;

    function initFramebuffers() {
      const filter = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      const dyeRes = DYE_RES, simRes = SIM_RES;
      gl.disable(gl.BLEND);
      dye = createDoubleFBO(dyeRes, dyeRes, formatRGBA.internalFormat, formatRGBA.format, halfFloatTexType, filter);
      velocity = createDoubleFBO(simRes, simRes, formatRG.internalFormat, formatRG.format, halfFloatTexType, filter);
      divergence = createFBO(simRes, simRes, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);
      curlFBO = createFBO(simRes, simRes, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);
      pressureFBO = createDoubleFBO(simRes, simRes, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);
    }
    initFramebuffers();

    function useProgram(p) { gl.useProgram(p.program); }

    function step(dt) {
      gl.disable(gl.BLEND);

      // curl
      useProgram(programs.curl);
      gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      // vorticity
      useProgram(programs.vorticity);
      gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(programs.vorticity.uniforms.uCurl, curlFBO.attach(1));
      gl.uniform1f(programs.vorticity.uniforms.curl, CURL);
      gl.uniform1f(programs.vorticity.uniforms.dt, dt);
      blit(velocity.write); velocity.swap();

      // divergence
      useProgram(programs.divergence);
      gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // clear pressure (dissipate)
      useProgram(programs.clear);
      gl.uniform1i(programs.clear.uniforms.uTexture, pressureFBO.read.attach(0));
      gl.uniform1f(programs.clear.uniforms.value, PRESSURE);
      blit(pressureFBO.write); pressureFBO.swap();

      // pressure jacobi
      useProgram(programs.pressure);
      gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl.uniform1i(programs.pressure.uniforms.uPressure, pressureFBO.read.attach(1));
        blit(pressureFBO.write); pressureFBO.swap();
      }

      // gradient subtract
      useProgram(programs.gradient);
      gl.uniform2f(programs.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.gradient.uniforms.uPressure, pressureFBO.read.attach(0));
      gl.uniform1i(programs.gradient.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      // velocity self-advection
      useProgram(programs.advection);
      gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering)
        gl.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velId = velocity.read.attach(0);
      gl.uniform1i(programs.advection.uniforms.uVelocity, velId);
      gl.uniform1i(programs.advection.uniforms.uSource, velId);
      gl.uniform1f(programs.advection.uniforms.dt, dt);
      gl.uniform1f(programs.advection.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      // dye advection
      useProgram(programs.advection);
      gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering)
        gl.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(programs.advection.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    }

    function splat(x, y, dx, dy, color) {
      // velocity splat
      useProgram(programs.splat);
      gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x, y);
      gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(programs.splat.uniforms.radius, SPLAT_RADIUS / 100.0);
      blit(velocity.write); velocity.swap();
      // dye splat
      gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(programs.splat.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    }

    function splatVelOnly(x, y, dx, dy, radiusScale) {
      useProgram(programs.splat);
      gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x, y);
      gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(programs.splat.uniforms.radius, (SPLAT_RADIUS / 100.0) * (radiusScale || 1.0));
      blit(velocity.write); velocity.swap();
    }

    function applySplat(nx, ny, ndx, ndy, color) {
      splat(nx, ny, ndx * SPLAT_FORCE, ndy * SPLAT_FORCE, color);
    }

    function applyVelOnly(nx, ny, ndx, ndy, radiusScale) {
      splatVelOnly(nx, ny, ndx * SPLAT_FORCE, ndy * SPLAT_FORCE, radiusScale);
    }

    return {
      gl, canvas,
      step, applySplat, applyVelOnly,
      get dyeTexture() { return dye.read.texture; },
      get dyeWidth() { return dye.width; },
      get dyeHeight() { return dye.height; },
    };
  }

  window.FluidSim = FluidSim;
})();
