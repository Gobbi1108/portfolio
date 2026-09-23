// Fonte única da verdade das 5 regiões clicáveis da home secreta em /void.
//
// Só dados. A geometria (quadrado de `min(10vw, 10vh)` colado em um canto ou
// no centro) vive no CSS, em `.hotspot[data-anchor]` dentro de global.css —
// assim o mesmo dado serve desktop, o futuro modelo mobile (M5) e qualquer
// menu textual, sem duplicar posição em JS.
//
// A ordem do array é a ordem do DOM e, portanto, a ordem de Tab: canto
// superior esquerdo → superior direito → centro → inferior esquerdo →
// inferior direito, que é a ordem de leitura da tela.

export type HotspotAnchor =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export interface Hotspot {
  id: string;
  /** Nome acessível do link e texto do rótulo revelado no foco. Único por hotspot. */
  label: string;
  href: string;
  anchor: HotspotAnchor;
}

export const HOTSPOT_ANCHORS: readonly HotspotAnchor[] = [
  "top-left",
  "top-right",
  "center",
  "bottom-left",
  "bottom-right",
];

export const HOTSPOTS: readonly Hotspot[] = [
  { id: "jogos", label: "Jogos", href: "/void/jogos", anchor: "top-left" },
  {
    id: "lab-a",
    label: "Laboratório A — ideia em construção",
    href: "/void/lab-a",
    anchor: "top-right",
  },
  { id: "portfolio", label: "Portfólio", href: "/void/portfolio", anchor: "center" },
  {
    id: "roadmap",
    label: "Roadmap pessoal",
    href: "/void/roadmap",
    anchor: "bottom-left",
  },
  {
    id: "lab-b",
    label: "Laboratório B — ideia em construção",
    href: "/void/lab-b",
    anchor: "bottom-right",
  },
];
