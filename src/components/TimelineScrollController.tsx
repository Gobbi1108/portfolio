import { useEffect, useState } from "react";
import type { TimelineCharacterController } from "./TimelineCharacter.tsx";

// Scroll/keyboard controller for Timeline (PR #6).
//
// Connects scroll progress over `.timeline` to the Lottie character frame
// exposed by PR #5 (`window.__timelineCharacter`). Adds keyboard navigation
// (Arrow Up/Down, PageUp/Down), and falls back to anchor links when the user
// prefers reduced motion.
//
// Rendered as a React island via `client:visible` so GSAP only ships once the
// Timeline is on screen. GSAP and ScrollTrigger are pulled from the central
// registration module `src/lib/gsap.ts` via dynamic import.

// Type-only import — does not pull GSAP into the bundle here.
type GsapModule = typeof import("../lib/gsap");
type ScrollTriggerInstance = InstanceType<GsapModule["ScrollTrigger"]>;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TIMELINE_SELECTOR = ".timeline";
const SCENE_IDS = ["scene-baby", "scene-child", "scene-scout", "scene-tech"] as const;
const SCENE_LABELS: Record<(typeof SCENE_IDS)[number], string> = {
  "scene-baby": "Bebê",
  "scene-child": "Criança",
  "scene-scout": "Escoteiro",
  "scene-tech": "Tech",
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

function getCharacterController(): TimelineCharacterController | undefined {
  return typeof window === "undefined" ? undefined : window.__timelineCharacter;
}

export default function TimelineScrollController() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    setReducedMotion(mql.matches);

    let cancelled = false;
    let scrollTrigger: ScrollTriggerInstance | null = null;
    let gsapModule: GsapModule | null = null;
    let controller: TimelineCharacterController | undefined;
    let lastFrame = -1;

    const updateFrame = (progress: number) => {
      if (!controller) return;
      const total = controller.totalFrames;
      if (!total || total <= 0) return;
      const clamped = Math.max(0, Math.min(1, progress));
      // Round to avoid redundant lottie work on sub-pixel scroll deltas.
      const frame = Math.round(clamped * (total - 1));
      if (frame === lastFrame) return;
      lastFrame = frame;
      controller.goToAndStop(frame, true);
    };

    const buildScrollTrigger = async () => {
      if (cancelled || mql.matches || scrollTrigger) return;
      controller = getCharacterController();
      if (!controller) return;

      if (!gsapModule) {
        gsapModule = await import("../lib/gsap");
        if (cancelled) return;
      }

      const trigger = document.querySelector(TIMELINE_SELECTOR);
      if (!trigger) return;

      // Pause autoplay so scrub fully owns the frame.
      controller.pause();

      scrollTrigger = gsapModule.ScrollTrigger.create({
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => updateFrame(self.progress),
      });

      // Seed initial frame for current scroll position.
      updateFrame(scrollTrigger.progress ?? 0);
    };

    const teardownScrollTrigger = () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
        scrollTrigger = null;
      }
      lastFrame = -1;
      // Resume looping playback when scrub is disabled.
      controller = getCharacterController();
      if (controller && !mql.matches) controller.play();
    };

    const handleReady = (event: Event) => {
      const detail = (event as CustomEvent<TimelineCharacterController>).detail;
      controller = detail ?? getCharacterController();
      void buildScrollTrigger();
    };

    const handleMotionChange = () => {
      setReducedMotion(mql.matches);
      if (mql.matches) {
        teardownScrollTrigger();
      } else {
        void buildScrollTrigger();
      }
    };

    // Brutalism is dry — instant scroll, no smooth easing. Also matches the
    // behaviour required when prefers-reduced-motion is active.
    const scrollViewport = (deltaVh: number) => {
      const distance = (window.innerHeight * deltaVh) / 100;
      window.scrollBy({ top: distance, left: 0, behavior: "auto" });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          scrollViewport(90);
          return;
        case "ArrowUp":
          event.preventDefault();
          scrollViewport(-90);
          return;
        case "PageDown":
          event.preventDefault();
          scrollViewport(100);
          return;
        case "PageUp":
          event.preventDefault();
          scrollViewport(-100);
          return;
        default:
          return;
      }
    };

    // Controller might already be ready before mount (race with client:visible).
    if (getCharacterController()) {
      void buildScrollTrigger();
    }
    window.addEventListener("timeline:character:ready", handleReady);
    window.addEventListener("keydown", handleKeydown);
    mql.addEventListener("change", handleMotionChange);

    return () => {
      cancelled = true;
      window.removeEventListener("timeline:character:ready", handleReady);
      window.removeEventListener("keydown", handleKeydown);
      mql.removeEventListener("change", handleMotionChange);
      teardownScrollTrigger();
    };
  }, []);

  if (!reducedMotion) return null;

  return (
    <nav
      aria-label="Atalhos da timeline"
      className="border-brutal-thick bg-brutal-paper shadow-brutal-md fixed right-4 bottom-4 z-40 flex flex-col gap-1 p-3 text-sm"
    >
      <p className="font-display text-xs uppercase tracking-widest opacity-70">
        Cenas
      </p>
      <ul className="flex flex-col gap-1">
        {SCENE_IDS.map((id, index) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="font-display text-brutal-ink hover:text-brutal-blue hover:-translate-y-1 transition-transform duration-100 inline-block uppercase tracking-wider"
            >
              {String(index + 1).padStart(2, "0")} — {SCENE_LABELS[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
