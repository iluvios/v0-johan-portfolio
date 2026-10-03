// The living portrait: the hero photo redrawn in WebGL2 with a depth map, so it
// shifts in 3D with the cursor (or drifts on its own), with a rim of light around
// the matte and a soft light that follows the pointer. Draws the same image as the
// static fallback, then fades the effects in.

type Options = {
  colorSrc: string;
  dataSrc: string;
  /** CSS object-position of the fallback image, as fractions. */
  position: [number, number];
  reducedMotion: boolean;
  onReady: () => void;
};

const VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uColor;
uniform sampler2D uData;
uniform vec2 uView;
uniform vec2 uImage;
uniform vec2 uPos;
uniform vec2 uMouse;
uniform vec2 uLight;
uniform vec2 uTexel;
uniform float uTime;
uniform float uFx;
out vec4 o;

// Same math as CSS object-fit: cover + object-position.
vec2 cover(vec2 uv) {
  float va = uView.x / uView.y;
  float ia = uImage.x / uImage.y;
  vec2 s = va > ia ? vec2(1.0, ia / va) : vec2(va / ia, 1.0);
  return (1.0 - s) * uPos + uv * s;
}

void main() {
  vec2 base = cover(vUv);
  vec2 shift = uMouse * vec2(0.011, 0.007) * uFx;
  vec2 uv = base;
  for (int i = 0; i < 4; i++) {
    float d = texture(uData, uv).r;
    uv = base - shift * (d - 0.72);
  }
  vec4 data = texture(uData, uv);
  float depth = data.r;
  float matte = data.g;
  vec3 col = texture(uColor, uv).rgb;

  // Faded, mostly grey background, then the person on top (premultiplied).
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 ghost = mix(vec3(luma), col, 0.35) * 0.9;
  float ghostA = 0.12 * (0.45 + 0.55 * depth);
  vec3 c = ghost * ghostA;
  float a = ghostA;
  vec3 person = col * 0.96;
  c = c * (1.0 - matte) + person * matte;
  a = a * (1.0 - matte) + matte;

  // Rim light on the edge of the matte, and a halo just outside it.
  vec2 t = uTexel * 2.5;
  float mx = texture(uData, uv + vec2(t.x, 0.0)).g - texture(uData, uv - vec2(t.x, 0.0)).g;
  float my = texture(uData, uv + vec2(0.0, t.y)).g - texture(uData, uv - vec2(0.0, t.y)).g;
  float edge = clamp(length(vec2(mx, my)) * 1.4, 0.0, 1.0);
  float halo = max(textureLod(uData, uv, 3.5).g - matte, 0.0);
  float wave = 0.5 + 0.5 * sin(uTime * 0.45 + uv.y * 5.0 - uv.x * 3.0);
  vec3 rim = mix(vec3(0.37, 0.88, 0.97), vec3(1.0, 0.74, 0.32), wave);

  // A warm light that follows the pointer, shaded with normals from the depth map.
  float dx = texture(uData, uv + vec2(t.x, 0.0)).r - texture(uData, uv - vec2(t.x, 0.0)).r;
  float dy = texture(uData, uv + vec2(0.0, t.y)).r - texture(uData, uv - vec2(0.0, t.y)).r;
  vec3 n = normalize(vec3(-dx * 16.0, -dy * 16.0, 1.0));
  vec2 toLight = (uLight - vUv) * vec2(uView.x / uView.y, 1.0);
  vec3 L = normalize(vec3(toLight, 0.5));
  float spot = exp(-dot(toLight, toLight) * 3.0);
  float lambert = max(dot(n, L), 0.0);
  vec3 lit = person * lambert * spot * 0.32 * vec3(1.0, 0.88, 0.7) * matte;

  c += (rim * (edge * 0.42 + halo * 0.32) + lit) * uFx;
  o = vec4(c, a);
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

function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

export function startHero(canvas: HTMLCanvasElement, opts: Options) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  let disposed = false;
  let raf = 0;
  let visible = true;
  const cleanups: (() => void)[] = [];

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

  const quad = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uni = {
    color: u("uColor"),
    data: u("uData"),
    view: u("uView"),
    image: u("uImage"),
    pos: u("uPos"),
    mouse: u("uMouse"),
    light: u("uLight"),
    texel: u("uTexel"),
    time: u("uTime"),
    fx: u("uFx"),
  };

  function texture(img: HTMLImageElement, mipmaps: boolean) {
    const tex = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    if (mipmaps) {
      gl!.generateMipmap(gl!.TEXTURE_2D);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    } else {
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    }
    return tex;
  }

  // Pointer → parallax and light. Touch screens get a slow drift instead.
  const pointer = { x: 0, y: 0, lx: 0.62, ly: 0.32, last: -1e9 };
  const state = { mx: 0, my: 0, lx: 0.62, ly: 0.32, fx: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    pointer.lx = (e.clientX - r.left) / r.width;
    pointer.ly = (e.clientY - r.top) / r.height;
    pointer.last = performance.now();
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  cleanups.push(() => window.removeEventListener("pointermove", onMove));

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !opts.reducedMotion && !raf && ready) raf = requestAnimationFrame(frame);
  });
  io.observe(canvas);
  cleanups.push(() => io.disconnect());

  let ready = false;
  let imgW = 1;
  let imgH = 1;
  let dataW = 1;
  let dataH = 1;
  let start = performance.now();
  let last = start;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function render(now: number) {
    const g = gl!;
    size();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const time = (now - start) / 1000;

    const idle = now - pointer.last > 2500;
    const tx = idle ? Math.sin(time * 0.31) * 0.55 : pointer.x;
    const ty = idle ? Math.cos(time * 0.23) * 0.35 : pointer.y;
    const tlx = idle ? 0.6 + Math.sin(time * 0.27) * 0.18 : pointer.lx;
    const tly = idle ? 0.3 + Math.cos(time * 0.19) * 0.1 : pointer.ly;
    const k = 1 - Math.exp(-dt * 2.5);
    state.mx += (tx - state.mx) * k;
    state.my += (ty - state.my) * k;
    state.lx += (tlx - state.lx) * k;
    state.ly += (tly - state.ly) * k;
    state.fx = opts.reducedMotion ? 1 : Math.min(1, state.fx + dt / 1.6);

    g.viewport(0, 0, canvas.width, canvas.height);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);
    g.useProgram(prog);
    g.bindVertexArray(vao);
    g.uniform1i(uni.color, 0);
    g.uniform1i(uni.data, 1);
    g.uniform2f(uni.view, canvas.clientWidth || 1, canvas.clientHeight || 1);
    g.uniform2f(uni.image, imgW, imgH);
    g.uniform2f(uni.pos, opts.position[0], opts.position[1]);
    g.uniform2f(uni.mouse, opts.reducedMotion ? 0 : state.mx, opts.reducedMotion ? 0 : state.my);
    g.uniform2f(uni.light, state.lx, state.ly);
    g.uniform2f(uni.texel, 1 / dataW, 1 / dataH);
    g.uniform1f(uni.time, time);
    g.uniform1f(uni.fx, state.fx);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  }

  function frame(now: number) {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    render(now);
    raf = requestAnimationFrame(frame);
  }

  const onVisibility = () => {
    if (!document.hidden && visible && ready && !raf && !opts.reducedMotion) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

  Promise.all([loadImage(opts.colorSrc), loadImage(opts.dataSrc)])
    .then(([color, data]) => {
      if (disposed) return;
      imgW = color.naturalWidth;
      imgH = color.naturalHeight;
      dataW = data.naturalWidth;
      dataH = data.naturalHeight;
      gl.activeTexture(gl.TEXTURE0);
      texture(color, false);
      gl.activeTexture(gl.TEXTURE1);
      texture(data, true);
      ready = true;
      start = last = performance.now();
      render(start);
      opts.onReady();
      if (!opts.reducedMotion) raf = requestAnimationFrame(frame);
    })
    .catch(() => {
      /* Keep the static image. */
    });

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    cleanups.forEach((fn) => fn());
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
