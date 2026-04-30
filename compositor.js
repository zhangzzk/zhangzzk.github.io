// Lens compositor: treats the dye field as a thickness/height map for an
// imaginary liquid film over the page. Reads the page background (rendered
// to a texture by html2canvas-style snapshot OR a CSS-painted surrogate) and
// refracts + chromatic-aberrates + tints + adds fresnel + spec by thickness.
// Runs as final fullscreen pass into a 2D context for layering over the DOM,
// but in this build we render the lens into a separate canvas overlaid on top
// of the page; the "background" sample is generated from a rasterized snapshot
// of the page (provided via setBackgroundCanvas).
(function () {
  function LensCompositor(displayCanvas, fluid) {
    const gl = fluid.gl;

    const vert = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;

    const frag = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uDye;
      uniform sampler2D uBg;
      uniform vec2 uTexel;     // 1 / dye resolution
      uniform float uStrength; // refraction strength
      uniform float uCA;       // chromatic aberration scale
      uniform float uTint;     // amount of dye color tint
      uniform float uSpec;     // specular intensity
      uniform float uMode;     // 0 lens, 1 dye-only, 2 minimal
      uniform float uDensity;  // mass-conservation scale (1 = at rest, >1 = compressed)
      uniform vec2  uShift;    // physical sample shift (compresses dye toward visible band)

      float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

      void main() {
        // Shift/compress the film toward the visible band, but pin the outer
        // edges so sampling never drags a clamped texture row into view as
        // vertical streaks.
        float xFade = smoothstep(0.02, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 0.98, vUv.x));
        float yFade = smoothstep(0.02, 0.18, vUv.y) * (1.0 - smoothstep(0.58, 0.96, vUv.y));
        vec2 uv = clamp(vUv + uShift * vec2(xFade, yFade), uTexel, vec2(1.0) - uTexel);
        vec4 dC = texture2D(uDye, uv);
        vec4 dL = texture2D(uDye, uv - vec2(uTexel.x, 0.0));
        vec4 dR = texture2D(uDye, uv + vec2(uTexel.x, 0.0));
        vec4 dT = texture2D(uDye, uv + vec2(0.0, uTexel.y));
        vec4 dB = texture2D(uDye, uv - vec2(0.0, uTexel.y));

        // Mass conservation: when the visible area shrinks, the same dye must
        // appear more concentrated. Scale thickness by uDensity.
        float thickness = lum(dC.rgb) * uDensity;
        vec2 grad = vec2(lum(dR.rgb) - lum(dL.rgb), lum(dT.rgb) - lum(dB.rgb)) * uDensity;
        float gmag = length(grad);

        vec3 dyeColor = dC.rgb * uDensity;

        // Specular + fresnel from gradient
        vec2 lightDir = normalize(vec2(-0.4, 0.7));
        float spec = pow(max(dot(normalize(grad + 1e-6), lightDir), 0.0), 2.0);
        spec *= smoothstep(0.02, 0.2, thickness) * uSpec;
        float fresnel = pow(clamp(gmag * 6.0, 0.0, 1.0), 1.5);

        // Color of the wet film: dye + sparkle
        vec3 filmColor = dyeColor + vec3(spec * 0.5 + fresnel * 0.25);

        // Coverage: how much we tint the underlying page.
        // Combines thickness (body of fluid) + gradient (rim).
        float coverage = clamp(thickness * (uTint * 2.5) + gmag * 8.0 + fresnel * 0.6 + spec * 0.4, 0.0, 1.0);
        // A soft solid wall at the display edges keeps compressed fluid from
        // showing texture-edge curtains. Top of screen is high vUv.y here.
        float wallMask = smoothstep(0.015, 0.10, vUv.y) * (1.0 - smoothstep(0.72, 0.995, vUv.y));
        coverage *= wallMask;

        if (uMode > 1.5) {
          // minimal: rim/specular only — almost colorless
          coverage = clamp(gmag * 4.0 + spec * 0.5 + fresnel * 0.3, 0.0, 0.6);
          filmColor = vec3(0.95) + vec3(spec * 0.6);
        } else if (uMode > 0.5 && uMode < 1.5) {
          // ink: hard tint, less rim
          coverage = clamp(thickness * 2.5 + gmag * 4.0, 0.0, 1.0);
          filmColor = dyeColor;
        }

        // Premultiplied output: the canvas blends over the DOM with normal alpha.
        gl_FragColor = vec4(filmColor * coverage, coverage);
      }`;

    function compile(type, src) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); }
      return s;
    }
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    const u = {
      uDye: gl.getUniformLocation(program, 'uDye'),
      uBg: gl.getUniformLocation(program, 'uBg'),
      uTexel: gl.getUniformLocation(program, 'uTexel'),
      uStrength: gl.getUniformLocation(program, 'uStrength'),
      uCA: gl.getUniformLocation(program, 'uCA'),
      uTint: gl.getUniformLocation(program, 'uTint'),
      uSpec: gl.getUniformLocation(program, 'uSpec'),
      uMode: gl.getUniformLocation(program, 'uMode'),
      uDensity: gl.getUniformLocation(program, 'uDensity'),
      uShift: gl.getUniformLocation(program, 'uShift'),
    };

    // Background texture: created from a 2D canvas snapshot we update on demand.
    let bgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    function updateBackground(canvas2d) {
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    let strength = 0.06, ca = 0.006, tint = 0.5, spec = 1.0, mode = 0;
    let density = 1.0, shiftX = 0.0, shiftY = 0.0;
    function setParams(p) {
      if (p.strength != null) strength = p.strength;
      if (p.ca != null) ca = p.ca;
      if (p.tint != null) tint = p.tint;
      if (p.spec != null) spec = p.spec;
      if (p.mode != null) mode = p.mode;
      if (p.density != null) density = p.density;
      if (p.shiftX != null) shiftX = p.shiftX;
      if (p.shiftY != null) shiftY = p.shiftY;
    }

    function render() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(u.uTexel, 1.0 / fluid.dyeWidth, 1.0 / fluid.dyeHeight);
      gl.uniform1f(u.uStrength, strength);
      gl.uniform1f(u.uCA, ca);
      gl.uniform1f(u.uTint, tint);
      gl.uniform1f(u.uSpec, spec);
      gl.uniform1f(u.uMode, mode);
      gl.uniform1f(u.uDensity, density);
      gl.uniform2f(u.uShift, shiftX, shiftY);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fluid.dyeTexture); gl.uniform1i(u.uDye, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex); gl.uniform1i(u.uBg, 1);
      gl.disable(gl.BLEND);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    return { render, setParams, updateBackground };
  }

  window.LensCompositor = LensCompositor;
})();
