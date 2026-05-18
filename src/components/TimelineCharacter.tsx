import { useEffect, useRef } from "react";

// Lottie character for Timeline sticky window (PR #5).
//
// - `lottie-web` is loaded via dynamic import so it stays in its own chunk and
//   only ships when the timeline island mounts (Astro `client:visible`).
// - Loops by default; honors `prefers-reduced-motion: reduce` by parking at
//   frame 0 (no animation).
// - Exposes an imperative controller on `window.__timelineCharacter` so the
//   upcoming scroll-driven scene work (PR #6) can drive frames manually via
//   `goToAndStop` without re-mounting the player. A `timeline:character:ready`
//   CustomEvent fires once the animation is loaded.

export interface TimelineCharacterController {
  goToAndStop(value: number, isFrame?: boolean): void;
  goToAndPlay(value: number, isFrame?: boolean): void;
  play(): void;
  pause(): void;
  stop(): void;
  getDuration(inFrames?: boolean): number;
  readonly totalFrames: number;
}

declare global {
  interface Window {
    __timelineCharacter?: TimelineCharacterController;
  }
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export default function TimelineCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    // `any` here because we type lottie-web via the controller surface we
    // expose, not the full vendor types (would force a static import).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anim: any = null;
    let mql: MediaQueryList | null = null;

    const handleMotionChange = () => {
      if (!anim) return;
      if (mql?.matches) {
        anim.goToAndStop(0, true);
      } else {
        anim.goToAndPlay(0, true);
      }
    };

    (async () => {
      const lottie = (await import("lottie-web")).default;
      if (cancelled || !container) return;

      mql = window.matchMedia(REDUCED_MOTION_QUERY);
      const reduced = mql.matches;

      anim = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: !reduced,
        autoplay: !reduced,
        path: "/lottie/character.json",
        rendererSettings: {
          progressiveLoad: true,
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      anim.addEventListener("DOMLoaded", () => {
        if (cancelled) return;
        if (reduced) anim.goToAndStop(0, true);

        // Sinaliza ao slot host (`[data-character-slot]`) que o lottie está
        // pronto, escondendo o `.brutal-skeleton` overlay via CSS.
        container.closest("[data-character-slot]")?.setAttribute("data-state", "loaded");

        const controller: TimelineCharacterController = {
          goToAndStop: (value, isFrame = true) => anim.goToAndStop(value, isFrame),
          goToAndPlay: (value, isFrame = true) => anim.goToAndPlay(value, isFrame),
          play: () => anim.play(),
          pause: () => anim.pause(),
          stop: () => anim.stop(),
          getDuration: (inFrames = true) => anim.getDuration(inFrames),
          get totalFrames() {
            return anim.totalFrames;
          },
        };

        window.__timelineCharacter = controller;
        window.dispatchEvent(
          new CustomEvent<TimelineCharacterController>(
            "timeline:character:ready",
            { detail: controller },
          ),
        );
      });

      mql.addEventListener("change", handleMotionChange);
    })();

    return () => {
      cancelled = true;
      if (mql) mql.removeEventListener("change", handleMotionChange);
      if (window.__timelineCharacter) delete window.__timelineCharacter;
      if (anim) anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="img"
      aria-label="Personagem da timeline"
    />
  );
}
