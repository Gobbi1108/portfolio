// Máquina de estado do segredo (spec §8). Pura e sem DOM: o componente só
// liga teclado e sentinela nela, e o check roda no Node.
//
// Janela deslizante em vez de contador de índice: com índice, ↑↑↑↓↓←→←→BA
// falharia — o ArrowUp extra zeraria a contagem em vez de cair para o prefixo
// válido de tamanho 2. Comparar os últimos 10 é menos código e correto em
// todos os casos.

export const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
] as const;

export interface KonamiState {
  /** Só vira true quando o visitante chega a 100% da rota. */
  readonly armed: boolean;
  readonly buffer: readonly string[];
}

export const IDLE: KonamiState = { armed: false, buffer: [] };

/**
 * Chamado pela sentinela do fim da página. Zera o buffer: tecla digitada
 * antes de ler o site não vale.
 */
export function arm(state: KonamiState): KonamiState {
  return state.armed ? state : { armed: true, buffer: [] };
}

export function press(state: KonamiState, key: string): KonamiState {
  if (!state.armed) return state;
  return {
    armed: true,
    buffer: [...state.buffer, key.toLowerCase()].slice(-KONAMI.length),
  };
}

export function isUnlocked(state: KonamiState): boolean {
  return (
    state.armed &&
    state.buffer.length === KONAMI.length &&
    KONAMI.every((expected, i) => expected === state.buffer[i])
  );
}
