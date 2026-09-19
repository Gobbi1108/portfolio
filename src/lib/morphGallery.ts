// Galeria em morph da tela "in construction" (ROADMAP.md §5.1).
//
// Porte do `morph-gallery` (21st.dev) para esta stack: WebGL cru e um RAF
// próprio. Sem React — o componente original só usava `useEffect` para montar o
// contexto e não há state nem JSX aqui; a ilha custaria ~186KB de runtime nas 5
// rotas para animar um crossfade (CLAUDE.md §4 e §8). Sem GSAP pelo mesmo
// motivo: a única curva é um `smoothstep` dentro do shader.
//
// Este módulo não se auto-inicializa: o componente que tem o canvas é quem
// chama `initMorphGallery`. Isso mantém o arquivo importável no Node, que é o
// que permite o check runnable de `coverScale` (`npm run check:gallery`).
//
// Quem garante o fallback é o HTML: a primeira foto já está na página como
// <img> por baixo do canvas. Se não houver WebGL, se a textura não carregar ou
// se o contexto se perder, o canvas simplesmente nunca fica visível e a foto
// estática continua lá — inclusive em `prefers-reduced-motion`, onde o morph
// nem chega a montar.
//
// ponytail: sem dispose, igual ao dot grid — só se sai daqui pelo unload. Se as
// View Transitions do Astro entrarem, `initMorphGallery` precisa devolver um
// dispose e ser chamado em `astro:before-swap`, ou o contexto vaza por
// navegação.

const HOLD_MS = 4200; // tempo parado em cada foto
const MORPH_MS = 1400; // duração da transição entre duas fotos
const MAX_DPR = 2; // CLAUDE.md §8

export type Vec2 = [number, number];

/**
 * Fator de escala das UVs que enquadra a imagem em `cover`: preenche o canvas
 * inteiro cortando a sobra do eixo maior, sem deformar.
 *
 * É o `object-fit: cover` do CSS feito em coordenada de textura — o shader
 * sampleia `(uv - 0.5) * escala + 0.5`. Os dois fatores são sempre <= 1, senão
 * a amostragem sairia da imagem e repetiria a borda.
 */
export function coverScale(canvasAspect: number, imageAspect: number): Vec2 {
  return imageAspect > canvasAspect
    ? [canvasAspect / imageAspect, 1]
    : [1, imageAspect / canvasAspect];
}

const VERTEX_SRC = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromScale;
uniform vec2 uToScale;
uniform float uProgress;

vec2 cover(vec2 uv, vec2 scale) {
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  float p = smoothstep(0.0, 1.0, uProgress);
  // 0 -> 1 -> 0: a distorção só existe durante a troca e some nas pontas, para
  // que a foto parada nunca apareça deformada.
  float wave = p * (1.0 - p) * 4.0;
  vec2 centered = vUv - 0.5;
  // Barril cúbico: empurra as bordas para fora e deixa o centro quieto, que é
  // o que dá a leitura de "morph" em vez de crossfade chapado.
  vec2 warp = centered * dot(centered, centered) * 0.5 * wave;
  vec4 from = texture2D(uFrom, cover(vUv + warp, uFromScale));
  vec4 to = texture2D(uTo, cover(vUv - warp, uToScale));
  gl_FragColor = mix(from, to, p);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // Shaders já estão linkados no programa; manter os objetos só ocupa memória.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`falha ao carregar ${src}`));
    image.src = src;
  });
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // As fotos não são potência de dois, então mipmap e REPEAT estão fora: só
  // CLAMP_TO_EDGE + LINEAR (e o clamp ainda segura a distorção nas bordas).
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  return texture;
}

interface Frame {
  texture: WebGLTexture;
  aspect: number;
}

export function initMorphGallery(canvas: HTMLCanvasElement): void {
  // A foto estática por baixo já é a versão sem movimento da tela: em reduced
  // motion o canvas nem monta (CLAUDE.md §6).
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let sources: unknown;
  try {
    sources = JSON.parse(canvas.dataset.frames ?? "[]");
  } catch {
    return;
  }
  const urls = Array.isArray(sources) ? sources.filter((s): s is string => typeof s === "string") : [];
  if (urls.length < 2) return; // com uma foto só não há morph: a <img> basta

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return;

  const program = createProgram(gl);
  if (!program) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Triângulo único cobrindo o viewport: mais barato que dois triângulos e
  // dispensa índice.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  const uProgress = gl.getUniformLocation(program, "uProgress");
  const uFromScale = gl.getUniformLocation(program, "uFromScale");
  const uToScale = gl.getUniformLocation(program, "uToScale");
  gl.uniform1i(gl.getUniformLocation(program, "uFrom"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "uTo"), 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let frames: Frame[] = [];
  let index = 0;
  let anchor = 0;
  let pausedAt = 0;
  let lastProgress = -1;
  let raf = 0;
  let alive = true;

  // Medir o canvas dentro do RAF forçaria um reflow por frame, então quem
  // dispara isto é um ResizeObserver — só quando o tamanho muda de verdade.
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (width === 0 || height === 0 || (canvas.width === width && canvas.height === height)) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    lastProgress = -1; // força um redraw com o novo enquadramento
  };

  const draw = (progress: number) => {
    const canvasAspect = canvas.width / canvas.height;
    const from = frames[index];
    const to = frames[(index + 1) % frames.length];

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, from.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, to.texture);

    gl.uniform2fv(uFromScale, coverScale(canvasAspect, from.aspect));
    gl.uniform2fv(uToScale, coverScale(canvasAspect, to.aspect));
    gl.uniform1f(uProgress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    lastProgress = progress;
  };

  const frame = (now: number) => {
    if (!alive) return;

    const elapsed = now - anchor;
    const progress = elapsed <= HOLD_MS ? 0 : Math.min((elapsed - HOLD_MS) / MORPH_MS, 1);

    if (progress >= 1) {
      index = (index + 1) % frames.length;
      anchor = now;
      draw(0);
    } else if (progress !== lastProgress) {
      // Durante a pausa entre fotos nada muda: pular o draw economiza o frame
      // inteiro de GPU sem mexer no relógio.
      draw(progress);
    }

    raf = requestAnimationFrame(frame);
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      pausedAt = performance.now();
      return;
    }
    // Devolve o tempo parado ao relógio, senão a transição saltaria ao voltar.
    anchor += performance.now() - pausedAt;
    raf = requestAnimationFrame(frame);
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    alive = false;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVisibility);
    // Sem contexto o canvas sai de cena e a foto estática volta a ser a tela.
    delete canvas.dataset.ready;
  };

  canvas.addEventListener("webglcontextlost", onContextLost);

  Promise.all(urls.map(loadImage))
    .then((images) => {
      if (!alive) return;
      frames = images.reduce<Frame[]>((acc, image) => {
        const texture = createTexture(gl, image);
        if (texture) acc.push({ texture, aspect: image.naturalWidth / image.naturalHeight });
        return acc;
      }, []);
      if (frames.length < 2) return;

      resize();
      draw(0);
      new ResizeObserver(() => {
        resize();
        if (alive && lastProgress < 0) draw(0);
      }).observe(canvas);
      canvas.dataset.ready = "true";
      anchor = performance.now();
      document.addEventListener("visibilitychange", onVisibility);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    })
    .catch(() => {
      // Rede caiu ou a URL sumiu: a <img> de fallback continua na tela.
      alive = false;
    });
}
