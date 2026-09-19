// Check runnable do enquadramento da galeria (CLAUDE.md §2).
//
//   npm run check:gallery
//
// `coverScale` é a única conta do shader que quebra em silêncio: errar o eixo
// deforma a foto, e inverter a razão faz a amostragem sair da textura e repetir
// a borda esticada. As 3 fotos têm proporções diferentes (uma retrato), então
// os dois ramos da função rodam em produção.

import assert from "node:assert/strict";
import { coverScale } from "./morphGallery.ts";

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// Mesma proporção: nada é cortado.
assert.deepEqual(coverScale(1, 1), [1, 1]);
assert.deepEqual(coverScale(16 / 9, 16 / 9), [1, 1]);

// Foto mais larga que a tela: corta na horizontal, altura intacta.
assert.deepEqual(coverScale(1, 2), [0.5, 1]);
// Foto mais alta que a tela (retrato da floresta em tela wide): corta na vertical.
assert.deepEqual(coverScale(2, 1), [1, 0.5]);

const CANVAS_ASPECTS = [16 / 9, 4 / 3, 1, 3 / 4, 21 / 9, 0.5];
const IMAGE_ASPECTS = [4032 / 3024, 683 / 911, 4608 / 3456, 1, 3 / 1];

for (const canvas of CANVAS_ASPECTS) {
  for (const image of IMAGE_ASPECTS) {
    const [sx, sy] = coverScale(canvas, image);

    assert.ok(
      sx > 0 && sx <= 1 && sy > 0 && sy <= 1,
      `escala fora de (0,1] em canvas ${canvas} / imagem ${image}: amostraria fora da textura`,
    );

    // A região visível tem que ter exatamente a proporção do canvas — é o que
    // garante que a foto preenche sem esticar.
    assert.ok(
      near((sx / sy) * image, canvas),
      `recorte deforma em canvas ${canvas} / imagem ${image}`,
    );

    // Cover, não contain: um dos eixos usa a imagem inteira.
    assert.ok(near(sx, 1) || near(sy, 1), `sobrou tarja em canvas ${canvas} / imagem ${image}`);
  }
}

console.log(
  `ok — coverScale válido em ${CANVAS_ASPECTS.length * IMAGE_ASPECTS.length} combinações`,
);
