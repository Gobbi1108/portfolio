// Campo de pontos reativo da home (ROADMAP.md §3.1).
//
// Porte do `reactbits.dev/backgrounds/dot-grid` para esta stack: canvas 2D e um
// RAF próprio. Sem GSAP/InertiaPlugin — a física é uma mola amortecida de duas
// linhas e não vale 45KB gzip de lib. Sem React — não há state nem JSX aqui, e
// montar uma ilha só para chamar `useEffect` colocaria o runtime inteiro do
// React no caminho do primeiro paint (CLAUDE.md §4 e §8).
//
// O canvas é `pointer-events: none` e os listeners são de janela, então os
// hotspots invisíveis por cima continuam clicáveis e o grid segue reagindo sob
// eles. O grid não sabe que hotspot existe — quem reage a hotspot é o cursor.
//
// ponytail: limpeza fica por conta do unload da página, que é o único jeito de
// sair daqui hoje. Se as View Transitions do Astro entrarem, `initDotGrid`
// precisa devolver um dispose e ser chamado em `astro:before-swap`.

type Rgb = [number, number, number];

interface Dot {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

const GAP = 32; // distância entre centros, px CSS
const DOT_SIZE = 4;
const PROXIMITY = 140; // raio de influência do ponteiro na cor
const PUSH_RADIUS = 160; // raio do empurrão que o ponteiro dá ao passar
// Velocidade injetada por px percorrido pelo ponteiro. O empurrão é medido em
// distância, não em taxa de eventos: mouse de 1000Hz e de 60Hz produzem o mesmo
// resultado no mesmo gesto.
const PUSH_PER_PX = 0.09;
const MAX_TRAVEL = 40; // px por evento — um salto maior que isso é teletransporte
const SHOCK_RADIUS = 240;
const SHOCK_STRENGTH = 16;

// Espelham os tokens `--color-grid-dot` / `--color-grid-active` de global.css e
// só entram em cena se a variável não resolver.
const FALLBACK_DOT: Rgb = [58, 63, 70];
const FALLBACK_ACTIVE: Rgb = [0, 122, 51];

const SPRING = 0.12; // puxa o ponto de volta à origem
const DAMPING = 0.82; // acima de ~0.9 o grid vira gelatina
const SLEEP = 0.05; // energia abaixo disso é invisível: para de redesenhar
const MAX_DPR = 2; // CLAUDE.md §8
const SHADES = 24; // buckets de cor, para não alocar string por ponto por frame

const parseHex = (value: string, fallback: Rgb): Rgb => {
  const hex = value.trim().replace("#", "");
  if (hex.length !== 6) return fallback;
  const n = Number.parseInt(hex, 16);
  return Number.isNaN(n) ? fallback : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function initDotGrid(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const styles = getComputedStyle(canvas);
  const dotColor = parseHex(styles.getPropertyValue("--color-grid-dot"), FALLBACK_DOT);
  const activeColor = parseHex(
    styles.getPropertyValue("--color-grid-active"),
    FALLBACK_ACTIVE,
  );
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Uma string de cor por bucket de intensidade, calculada uma vez.
  const shades = Array.from({ length: SHADES + 1 }, (_, i) => {
    const t = i / SHADES;
    const [r, g, b] = dotColor.map((c, k) => Math.round(c + (activeColor[k] - c) * t));
    return `rgb(${r} ${g} ${b})`;
  });

  let dots: Dot[] = [];
  let rect = canvas.getBoundingClientRect();
  let pointerX = Number.NEGATIVE_INFINITY;
  let pointerY = Number.NEGATIVE_INFINITY;
  // Última posição do ponteiro, para medir quanto ele andou entre dois eventos.
  let last: { x: number; y: number } | null = null;
  let moved = false;
  let raf = 0;
  let awake = false;

  const build = () => {
    rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === 0 || h === 0) return;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.max(Math.floor(w / GAP), 1);
    const rows = Math.max(Math.floor(h / GAP), 1);
    // Sobra dividida nas duas pontas: o grid fica centrado em vez de colado no
    // canto superior esquerdo quando a tela não é múltipla do gap.
    const offsetX = (w - (cols - 1) * GAP) / 2;
    const offsetY = (h - (rows - 1) * GAP) / 2;

    dots = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        dots.push({
          x: offsetX + col * GAP,
          y: offsetY + row * GAP,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        });
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    const radius = DOT_SIZE / 2;
    const prox2 = PROXIMITY * PROXIMITY;

    for (const dot of dots) {
      const x = dot.x + dot.ox;
      const y = dot.y + dot.oy;
      const dx = x - pointerX;
      const dy = y - pointerY;
      const d2 = dx * dx + dy * dy;
      const t = d2 < prox2 ? 1 - Math.sqrt(d2) / PROXIMITY : 0;

      ctx.fillStyle = shades[Math.round(t * SHADES)];
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /** Avança a mola um frame e devolve a energia restante do campo. */
  const step = () => {
    let energy = 0;
    for (const dot of dots) {
      dot.vx = (dot.vx - dot.ox * SPRING) * DAMPING;
      dot.vy = (dot.vy - dot.oy * SPRING) * DAMPING;
      dot.ox += dot.vx;
      dot.oy += dot.vy;
      energy = Math.max(energy, Math.abs(dot.vx) + Math.abs(dot.vy));
    }
    return energy;
  };

  const frame = () => {
    const energy = step();
    const wasMoved = moved;
    moved = false;
    draw();

    if (energy < SLEEP && !wasMoved) {
      awake = false; // nada mais se move: dorme até o próximo evento
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (awake || reduced || document.hidden) return;
    awake = true;
    raf = requestAnimationFrame(frame);
  };

  /**
   * Afasta de (cx, cy) os pontos dentro do raio. `strength` é a velocidade
   * máxima injetada, em px por frame — a mola cuida da volta.
   *
   * Mesmo empurrão para o movimento e para o clique: o que muda entre os dois
   * é só raio e força. Duas físicas diferentes para o mesmo gesto é o tipo de
   * divergência que só aparece quando uma delas quebra.
   */
  const push = (cx: number, cy: number, radius: number, strength: number) => {
    for (const dot of dots) {
      const dx = dot.x + dot.ox - cx;
      const dy = dot.y + dot.oy - cy;
      // Caixa antes do círculo: `pointermove` dispara até 120x/s e a raiz
      // quadrada em ~1200 pontos por evento é trabalho que ninguém vê.
      if (dx > radius || dx < -radius || dy > radius || dy < -radius) continue;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;
      // Divisor evita explodir o ponto exatamente sob o ponteiro (dist ~ 0).
      const force = (strength * (1 - dist / radius)) / Math.max(dist, 8);
      dot.vx += dx * force;
      dot.vy += dy * force;
    }
    moved = true;
    wake();
  };

  const onPointerMove = (e: PointerEvent) => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const travel = last ? Math.hypot(x - last.x, y - last.y) : 0;
    last = { x, y };
    pointerX = x;
    pointerY = y;

    // Passar o cursor tem que mexer no campo, não só recolorir: é o empurrão
    // por inércia do dot grid original. Sem ele, só o clique dava sinal de vida.
    if (travel > 0) push(x, y, PUSH_RADIUS, Math.min(travel, MAX_TRAVEL) * PUSH_PER_PX);

    moved = true;
    wake();
  };

  const onPointerOut = () => {
    pointerX = Number.NEGATIVE_INFINITY;
    pointerY = Number.NEGATIVE_INFINITY;
    // Sem isto, voltar o mouse pela outra ponta da tela contaria como um gesto
    // de mil pixels.
    last = null;
    moved = true;
    wake();
  };

  const onPointerDown = (e: PointerEvent) => {
    push(e.clientX - rect.left, e.clientY - rect.top, SHOCK_RADIUS, SHOCK_STRENGTH);
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      awake = false;
    } else {
      moved = true;
      wake();
    }
  };

  new ResizeObserver(() => {
    build();
    if (reduced) {
      draw();
      return;
    }
    moved = true;
    wake();
  }).observe(canvas);

  build();
  draw();
  document.addEventListener("visibilitychange", onVisibility);

  if (!reduced) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerleave", onPointerOut);
  }
}

const canvas = document.querySelector<HTMLCanvasElement>("[data-dot-grid]");
if (canvas) initDotGrid(canvas);
