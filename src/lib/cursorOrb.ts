// Cursor da home (ROADMAP.md §3.2): bola branca de 12px com borda de 2px.
//
// Sobre um hotspot o preenchimento some em 1.5s e **só a borda fica**; sair sem
// clicar reverte na mesma curva. É a única pista de que existe um botão ali,
// então a transição vive no CSS (`.cursor-orb`) e aqui fica só o rastreamento e
// a detecção de alvo.
//
// Não roda em ponteiro grosso nem em `prefers-reduced-motion`: nesses casos o
// cursor nativo continua sendo o cursor (CLAUDE.md §6). Sem React pelo mesmo
// motivo do dot grid — é DOM puro, o runtime não pagaria por si.

const HOTSPOT_SELECTOR = "[data-hotspot]";
const ACTIVE_CLASS = "cursor-orb-active";

export function initCursorOrb(orb: HTMLElement): void {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (coarse || reduced) return;

  document.documentElement.classList.add(ACTIVE_CLASS);

  const onMove = (e: PointerEvent) => {
    // `transform` direto no elemento: qualquer caminho que passe por re-render
    // ou por layout custaria trabalho a cada frame de movimento do mouse.
    orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    orb.dataset.visible = "true";

    const target = e.target instanceof Element ? e.target : null;
    orb.dataset.over = target?.closest(HOTSPOT_SELECTOR) ? "true" : "false";
  };

  const onLeave = () => {
    orb.dataset.visible = "false";
    orb.dataset.over = "false";
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
}

const orb = document.querySelector<HTMLElement>("[data-cursor-orb]");
if (orb) initCursorOrb(orb);
