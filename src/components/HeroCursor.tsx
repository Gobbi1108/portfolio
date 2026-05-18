import { useEffect, useRef } from "react";

// Cursor customizado opcional para o Hero (PR polish).
//
// - Desativado em touch (pointer: coarse) e em prefers-reduced-motion: reduce.
// - Procura `[data-hero-cursor]` no DOM. Quando habilitado, adiciona a classe
//   `hero-cursor-active` no host (que aplica `cursor: none` via global.css) e
//   posiciona um quadradinho rosa seguindo o ponteiro.
// - Atualiza posição via `style.transform` direto na ref (sem rerender por
//   frame) e usa `data-visible` para fade in/out controlado por CSS.

const COARSE_POINTER_QUERY = "(pointer: coarse)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const HOST_SELECTOR = "[data-hero-cursor]";
const ACTIVE_CLASS = "hero-cursor-active";

export default function HeroCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarse = window.matchMedia(COARSE_POINTER_QUERY).matches;
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (coarse || reduced) return;

    const host = document.querySelector<HTMLElement>(HOST_SELECTOR);
    const cursor = cursorRef.current;
    if (!host || !cursor) return;

    host.classList.add(ACTIVE_CLASS);

    const setPos = (x: number, y: number) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onMove = (e: PointerEvent) => {
      setPos(e.clientX, e.clientY);
      cursor.dataset.visible = "true";
    };
    const onLeave = () => {
      cursor.dataset.visible = "false";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      host.classList.remove(ACTIVE_CLASS);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hero-cursor"
      aria-hidden="true"
      data-visible="false"
    />
  );
}
