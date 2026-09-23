// Check runnable do mapa de hotspots (CLAUDE.md §2).
//
//   npm run check:hotspots
//
// Cobre o que quebra em silêncio: um canto sem link, dois links no mesmo canto,
// rótulo duplicado (leitor de tela anuncia dois links idênticos) ou href que
// deixou de ser uma rota absoluta do site.

import assert from "node:assert/strict";
import { HOTSPOTS, HOTSPOT_ANCHORS } from "./hotspots.ts";

const unique = (values: readonly string[]) => new Set(values).size === values.length;

assert.equal(HOTSPOTS.length, 5, "a home tem exatamente 5 hotspots");

assert.deepEqual(
  [...HOTSPOTS.map((h) => h.anchor)].sort(),
  [...HOTSPOT_ANCHORS].sort(),
  "cada âncora (4 cantos + centro) é usada uma única vez",
);

assert.ok(unique(HOTSPOTS.map((h) => h.id)), "ids são únicos");
assert.ok(unique(HOTSPOTS.map((h) => h.href)), "hrefs são únicos");
assert.ok(
  unique(HOTSPOTS.map((h) => h.label.toLowerCase())),
  "rótulos são únicos — nome acessível ambíguo quebra navegação por leitor de tela",
);

for (const { id, label, href } of HOTSPOTS) {
  // Depois da mudança de rotas (spec §3) todo destino vive sob /void. Um href
  // sem o prefixo vira 404 silencioso: o link existe, a página não.
  assert.match(
    href,
    /^\/void\/[a-z0-9-]+$/,
    `href de "${id}" é rota absoluta sob /void, em kebab-case`,
  );
  assert.ok(label.trim().length > 2, `rótulo de "${id}" descreve o destino`);
}

console.log(`ok — ${HOTSPOTS.length} hotspots, âncoras e rótulos válidos`);
