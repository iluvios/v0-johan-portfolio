// A field of light particles drawn behind the whole site (WebGL2, no dependencies).
// Particles drift on curl noise (creativity), turn into straight lanes inside
// [data-flow-order] (logic), and pour into [data-flow-attract] when it's on screen
// (the page is a funnel too). They scroll with the page and leave light trails.

export type FlowMode = "full" | "calm";

type Options = { mode: FlowMode; reducedMotion: boolean };

const UPDATE_VS = `#version 300 es
precision highp float;
in vec4 aState;
out vec4 vState;
uniform vec2 uRes;
uniform float uTime;
uniform float uDt;
uniform float uScroll;
uniform vec3 uMouse;
uniform vec4 uOrder;
uniform vec3 uAttract;
uniform float uSpeed;

vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}
// 2D simplex noise (Ashima / Ian McEwan)
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
vec2 curl(vec2 p) {
  float e = 0.01;
  float n1 = snoise(p + vec2(0.0, e));
  float n2 = snoise(p - vec2(0.0, e));
  float n3 = snoise(p + vec2(e, 0.0));
  float n4 = snoise(p - vec2(e, 0.0));
  return vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
}

void main() {
  vec2 p = aState.xy;
  float age = aState.z;
  float seed = aState.w;

  // Stay attached to the page while it scrolls.
  p.y -= uScroll;

  // Chaos: slow curl noise, two octaves.
  vec2 q = p / max(uRes.y, 600.0);
  vec2 v = curl(q * 1.6 + vec2(uTime * 0.018, -uTime * 0.012)) * 0.75
         + curl(q * 4.1 - vec2(uTime * 0.03, 0.0)) * 0.25;
  v *= 46.0;

  // Order: inside the order rect the flow straightens into lanes.
  vec2 lo = uOrder.xy;
  vec2 hi = uOrder.xy + uOrder.zw;
  vec2 dEdge = min(p - lo, hi - p);
  float inside = smoothstep(-120.0, 80.0, min(dEdge.x, dEdge.y)) * step(1.0, uOrder.z);
  float lane = sin(p.y * 0.045 + seed * 6.2831);
  vec2 laminar = vec2(70.0 + 50.0 * seed, lane * 6.0);
  v = mix(v, laminar, inside * 0.92);

  // The cursor stirs the light.
  vec2 d = p - uMouse.xy;
  float r = length(d) + 1.0;
  float near = exp(-(r * r) / (2.0 * 150.0 * 150.0)) * uMouse.z;
  v += vec2(-d.y, d.x) / r * 190.0 * near + d / r * 60.0 * near;

  // The funnel: when the target is on screen, everything pours into it.
  vec2 a = uAttract.xy - p;
  float al = length(a) + 1.0;
  v = mix(v, a / al * (140.0 + 260.0 * seed), clamp(uAttract.z * (0.35 + 0.65 * smoothstep(900.0, 120.0, al)), 0.0, 1.0));

  p += v * uDt * uSpeed;
  age += uDt * uSpeed;

  float life = 5.0 + seed * 9.0;
  bool gone = p.x < -60.0 || p.x > uRes.x + 60.0 || p.y < -80.0 || p.y > uRes.y + 80.0;
  bool converted = uAttract.z > 0.05 && al < 16.0;
  if (age > life || gone || converted) {
    vec3 h = hash3(vec2(seed * 97.13, uTime * 1.31 + age));
    p = vec2(h.x * uRes.x, h.y * uRes.y);
    age = 0.0;
  }
  vState = vec4(p, age, seed);
}
`;

const UPDATE_FS = `#version 300 es
precision mediump float;
out vec4 o;
void main() { o = vec4(0.0); }
`;

const DRAW_VS = `#version 300 es
precision highp float;
in vec4 aState;
uniform vec2 uRes;
uniform float uPx;
uniform float uAlpha;
uniform vec3 uColors[4];
out vec4 vColor;
void main() {
  vec2 ndc = aState.xy / uRes * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
  float seed = aState.w;
  float age = aState.z;
  float life = 5.0 + seed * 9.0;
  float fade = smoothstep(0.0, 1.0, age) * (1.0 - smoothstep(life - 1.5, life, age));
  float pick = fract(seed * 13.37);
  vec3 c = pick < 0.5 ? uColors[0] : pick < 0.78 ? uColors[1] : pick < 0.93 ? uColors[2] : uColors[3];
  gl_PointSize = (0.9 + fract(seed * 7.1) * 1.8) * uPx;
  vColor = vec4(c, fade * (0.2 + 0.65 * fract(seed * 3.7)) * uAlpha);
}
`;

const DRAW_FS = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = vColor.a * smoothstep(0.5, 0.05, d);
  o = vec4(vColor.rgb * a, a);
}
`;

const QUAD_VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FADE_FS = `#version 300 es
precision mediump float;
uniform vec4 uColor;
out vec4 o;
void main() { o = uColor; }
`;

const BLIT_FS = `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uTex;
out vec4 o;
void main() {
  vec3 c = texture(uTex, vUv).rgb;
  o = vec4(c, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "shader error");
  }
  return s;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string, feedback?: string[]) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  if (feedback) gl.transformFeedbackVaryings(p, feedback, gl.INTERLEAVED_ATTRIBS);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "link error");
  }
  return p;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// cyan, blue-white, warm amber, coral
const PALETTE = ["#5fe1f7", "#c9dcff", "#ffc04d", "#ff7a6e"].flatMap(hexToRgb);
const BACKGROUND = hexToRgb("#080e1c");

export function startFlow(canvas: HTMLCanvasElement, { mode, reducedMotion }: Options) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const small = window.matchMedia("(max-width: 767px)").matches;
  // Buffers hold the full field; calm pages (case studies, CV, articles) draw part of it, dimmer.
  const count = small ? 2600 : 6500;
  const settings = (m: FlowMode) =>
    m === "calm" ? { active: small ? 1200 : 3000, alpha: 0.55 } : { active: count, alpha: 0.85 };
  let { active, alpha } = settings(mode);
  let alphaTarget = alpha;

  const update = program(gl, UPDATE_VS, UPDATE_FS, ["vState"]);
  const draw = program(gl, DRAW_VS, DRAW_FS);
  const fade = program(gl, QUAD_VS, FADE_FS);
  const blit = program(gl, QUAD_VS, BLIT_FS);

  // Particle state lives in two buffers that swap every frame (transform feedback).
  // Sized in CSS pixels of the canvas (100vw × 100lvh), so mobile URL-bar resizes don't reset it.
  const cssSize = () => [canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight];
  const [W0, H0] = cssSize();
  const init = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    init[i * 4] = Math.random() * W0;
    init[i * 4 + 1] = Math.random() * H0;
    init[i * 4 + 2] = Math.random() * 6;
    init[i * 4 + 3] = Math.random();
  }
  const buffers = [gl.createBuffer()!, gl.createBuffer()!];
  const updateVaos = [gl.createVertexArray()!, gl.createVertexArray()!];
  const drawVaos = [gl.createVertexArray()!, gl.createVertexArray()!];
  const updateLoc = gl.getAttribLocation(update, "aState");
  const drawLoc = gl.getAttribLocation(draw, "aState");
  for (let i = 0; i < 2; i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
    gl.bufferData(gl.ARRAY_BUFFER, init, gl.DYNAMIC_COPY);
    gl.bindVertexArray(updateVaos[i]);
    gl.enableVertexAttribArray(updateLoc);
    gl.vertexAttribPointer(updateLoc, 4, gl.FLOAT, false, 16, 0);
    gl.bindVertexArray(drawVaos[i]);
    gl.enableVertexAttribArray(drawLoc);
    gl.vertexAttribPointer(drawLoc, 4, gl.FLOAT, false, 16, 0);
  }
  gl.bindVertexArray(null);
  const tf = gl.createTransformFeedback()!;

  const quad = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const quadVao = gl.createVertexArray()!;
  gl.bindVertexArray(quadVao);
  for (const p of [fade, blit]) {
    const loc = gl.getAttribLocation(p, "aPos");
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
  }
  gl.bindVertexArray(null);

  // Trails accumulate in an offscreen texture that fades a little every frame.
  let trailTex: WebGLTexture | null = null;
  let fbo: WebGLFramebuffer | null = null;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    const [cw, ch] = cssSize();
    const w = Math.round(cw * dpr);
    const h = Math.round(ch * dpr);
    if (w === width && h === height) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    if (trailTex) gl!.deleteTexture(trailTex);
    if (fbo) gl!.deleteFramebuffer(fbo);
    trailTex = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, trailTex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    fbo = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, trailTex, 0);
    gl!.clearColor(0, 0, 0, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
  }
  resize();

  const u = {
    res: gl.getUniformLocation(update, "uRes"),
    time: gl.getUniformLocation(update, "uTime"),
    dt: gl.getUniformLocation(update, "uDt"),
    scroll: gl.getUniformLocation(update, "uScroll"),
    mouse: gl.getUniformLocation(update, "uMouse"),
    order: gl.getUniformLocation(update, "uOrder"),
    attract: gl.getUniformLocation(update, "uAttract"),
    speed: gl.getUniformLocation(update, "uSpeed"),
    dRes: gl.getUniformLocation(draw, "uRes"),
    px: gl.getUniformLocation(draw, "uPx"),
    alpha: gl.getUniformLocation(draw, "uAlpha"),
    colors: gl.getUniformLocation(draw, "uColors"),
    fadeColor: gl.getUniformLocation(fade, "uColor"),
    tex: gl.getUniformLocation(blit, "uTex"),
  };

  const mouse = { x: -9999, y: -9999, on: 0, target: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.target = 1;
  };
  const onLeave = () => (mouse.target = 0);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let lastScroll = window.scrollY;
  let attract = 0;
  let current = 0;
  let raf = 0;
  let last = performance.now();
  const start = last;

  function rectOf(selector: string) {
    const el = document.querySelector(selector);
    return el ? el.getBoundingClientRect() : null;
  }

  function step(dt: number, time: number, scroll: number) {
    const g = gl!;
    const [W, H] = cssSize();

    const order = rectOf("[data-flow-order]");
    const visibleOrder = order && order.bottom > -200 && order.top < H + 200;
    const target = rectOf("[data-flow-attract]");
    const targetOn = !!target && target.top < H * 0.92 && target.bottom > H * 0.08;
    attract += ((targetOn ? 1 : 0) - attract) * Math.min(1, dt * 1.6);
    mouse.on += (mouse.target - mouse.on) * Math.min(1, dt * 4);

    // 1. Move particles.
    g.useProgram(update);
    g.uniform2f(u.res, W, H);
    g.uniform1f(u.time, time);
    g.uniform1f(u.dt, Math.min(dt, 1 / 20));
    g.uniform1f(u.scroll, scroll);
    g.uniform3f(u.mouse, mouse.x, mouse.y, mouse.on);
    if (visibleOrder && order) g.uniform4f(u.order, order.left, order.top, order.width, order.height);
    else g.uniform4f(u.order, 0, 0, 0, 0);
    if (target && attract > 0.01) {
      g.uniform3f(u.attract, target.left + target.width / 2, target.top + target.height / 2, attract);
    } else g.uniform3f(u.attract, -9999, -9999, 0);
    g.uniform1f(u.speed, 1);
    g.bindVertexArray(updateVaos[current]);
    g.bindTransformFeedback(g.TRANSFORM_FEEDBACK, tf);
    g.bindBufferBase(g.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[1 - current]);
    g.enable(g.RASTERIZER_DISCARD);
    g.beginTransformFeedback(g.POINTS);
    g.drawArrays(g.POINTS, 0, active);
    g.endTransformFeedback();
    g.disable(g.RASTERIZER_DISCARD);
    g.bindBufferBase(g.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    g.bindTransformFeedback(g.TRANSFORM_FEEDBACK, null);
    current = 1 - current;

    // 2. Fade the trails, then add this frame's particles.
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.viewport(0, 0, width, height);
    g.enable(g.BLEND);
    g.useProgram(fade);
    g.bindVertexArray(quadVao);
    const keep = Math.max(0.78, 0.94 - Math.min(Math.abs(scroll), 60) / 600);
    g.blendEquation(g.FUNC_ADD);
    g.blendFunc(g.ZERO, g.SRC_ALPHA);
    g.uniform4f(u.fadeColor, 0, 0, 0, keep);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    // Subtract a hair so 8-bit trails fully disappear instead of leaving ghosts.
    g.blendEquation(g.FUNC_REVERSE_SUBTRACT);
    g.blendFunc(g.ONE, g.ONE);
    g.uniform4f(u.fadeColor, 1.5 / 255, 1.5 / 255, 1.5 / 255, 0);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);

    g.blendEquation(g.FUNC_ADD);
    g.blendFunc(g.ONE, g.ONE);
    g.useProgram(draw);
    g.uniform2f(u.dRes, W, H);
    g.uniform1f(u.px, dpr);
    alpha += (alphaTarget - alpha) * Math.min(1, dt * 2);
    g.uniform1f(u.alpha, alpha);
    g.uniform3fv(u.colors, PALETTE);
    g.bindVertexArray(drawVaos[current]);
    g.drawArrays(g.POINTS, 0, active);
    g.disable(g.BLEND);

    // 3. Show the trails over the page background.
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.viewport(0, 0, width, height);
    g.clearColor(BACKGROUND[0], BACKGROUND[1], BACKGROUND[2], 1);
    g.clear(g.COLOR_BUFFER_BIT);
    g.enable(g.BLEND);
    g.blendFunc(g.ONE, g.ONE);
    g.useProgram(blit);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, trailTex);
    g.uniform1i(u.tex, 0);
    g.bindVertexArray(quadVao);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    g.disable(g.BLEND);
    g.bindVertexArray(null);
  }

  function frame(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    const y = window.scrollY;
    const scroll = y - lastScroll;
    lastScroll = y;
    step(dt, (now - start) / 1000, scroll);
    raf = requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    // One still frame: let the field settle for a few seconds, then stop.
    for (let i = 0; i < 160; i++) step(1 / 30, i / 30, 0);
  } else {
    raf = requestAnimationFrame(frame);
  }

  const onVisibility = () => {
    if (reducedMotion) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      last = performance.now();
      lastScroll = window.scrollY;
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  function setMode(next: FlowMode) {
    const s = settings(next);
    active = s.active;
    alphaTarget = s.alpha;
    if (reducedMotion) {
      alpha = alphaTarget;
      for (let i = 0; i < 60; i++) step(1 / 30, i / 30, 0);
    }
  }

  const stop = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("pointerleave", onLeave);
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  return { stop, setMode };
}
