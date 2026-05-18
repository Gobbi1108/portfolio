// Section entry animations.
//
// Procura `[data-reveal]` no DOM, oculta-os via CSS (estado inicial só
// aplicado quando `<html data-reveal-ready>` é marcado por este módulo) e
// adiciona `is-revealed` quando o elemento cruza o viewport, usando
// ScrollTrigger.
//
// Elementos que já estão acima/dentro do viewport no momento do bootstrap
// são revelados imediatamente sem trigger — evita o flash de conteúdo
// invisível em seções acima da dobra (ex.: hero) e dispensa um
// ScrollTrigger desnecessário para algo que já cruzou o ponto de gatilho.
//
// prefers-reduced-motion: reveals são marcados como visíveis sem montar
// triggers. O CSS fallback em `global.css` zera as transições.

const REVEAL_SELECTOR = "[data-reveal]";
const REVEALED_CLASS = "is-revealed";
const READY_ATTR = "data-reveal-ready";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let started = false;

export function initSectionReveal(): void {
  if (typeof window === "undefined" || started) return;
  started = true;

  const html = document.documentElement;
  html.setAttribute(READY_ATTR, "");

  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
  );

  if (reduced) {
    for (const el of elements) el.classList.add(REVEALED_CLASS);
    return;
  }

  const viewportH = window.innerHeight;
  const enterThreshold = viewportH * 0.85;
  const pending: HTMLElement[] = [];
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.top < enterThreshold) {
      // Já está visível (ou acima do gatilho) — revela sem ScrollTrigger.
      el.classList.add(REVEALED_CLASS);
    } else {
      pending.push(el);
    }
  }

  if (pending.length === 0) return;

  void (async () => {
    const { ScrollTrigger } = await import("./gsap");
    for (const el of pending) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => el.classList.add(REVEALED_CLASS),
      });
    }
  })();
}
