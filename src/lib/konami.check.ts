// Check runnable do segredo (CLAUDE.md §2). Roda no Node, fora do astro
// check:
//
//   npm run check:konami
//
// Cobre o que quebra em silêncio: contar tecla antes de armar, prefixo
// repetido derrubando uma sequência válida, caixa da tecla, e a porta ficar
// aberta depois de completar.

import assert from "node:assert/strict";
import { IDLE, KONAMI, arm, press, isUnlocked, type KonamiState } from "./konami.ts";

const type = (state: KonamiState, keys: readonly string[]): KonamiState =>
  keys.reduce<KonamiState>((acc, key) => press(acc, key), state);

// 1. Desarmado não conta tecla nenhuma. Quem digita o código no hero e só
//    depois rola até o fim precisa digitar de novo.
{
  const afterTyping = type(IDLE, KONAMI);
  assert.equal(isUnlocked(afterTyping), false, "sequência contou antes de armar");
  assert.equal(afterTyping.buffer.length, 0, "buffer encheu antes de armar");
  assert.equal(
    isUnlocked(arm(afterTyping)),
    false,
    "armar não pode reaproveitar tecla digitada antes",
  );
}

// 2. Sequência correta depois de armar abre.
{
  assert.equal(isUnlocked(type(arm(IDLE), KONAMI)), true, "sequência correta não abriu");
}

// 3. Prefixo repetido ainda abre: o ArrowUp extra não invalida os dois
//    seguintes. É por isso que o redutor é janela deslizante e não índice.
{
  assert.equal(
    isUnlocked(type(arm(IDLE), ["arrowup", ...KONAMI])),
    true,
    "prefixo repetido invalidou a sequência",
  );
}

// 4. Tecla errada no meio derruba a tentativa.
{
  const wrong = [...KONAMI.slice(0, 5), "x", ...KONAMI.slice(5)];
  assert.equal(isUnlocked(type(arm(IDLE), wrong)), false, "tecla errada não derrubou a sequência");
}

// 5. Caixa não importa: CapsLock não pode quebrar o segredo.
{
  const shouted = KONAMI.map((key) =>
    key.startsWith("arrow") ? "Arrow" + key.slice(5, 6).toUpperCase() + key.slice(6) : key.toUpperCase(),
  );
  assert.equal(isUnlocked(type(arm(IDLE), shouted)), true, "maiúsculas quebraram a sequência");
}

// 6. Lixo depois de completar não mantém a porta aberta.
{
  assert.equal(
    isUnlocked(type(arm(IDLE), [...KONAMI, "z"])),
    false,
    "buffer continuou válido depois de tecla extra",
  );
}

console.log(`ok — konami com ${KONAMI.length} teclas, armado só no fim da rota`);
