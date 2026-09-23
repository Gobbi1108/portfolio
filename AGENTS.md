> **Espelho gerado.** A fonte é `CLAUDE.md` — edite lá e regenere este arquivo, nunca o
> contrário. Regenerar: substituir `CLAUDE.md` por `AGENTS.md` no texto do original.

# AGENTS.md — Regras do Jogo

Prompt de sistema persistente deste repositório. **Estático e enxuto.** Nada de histórico,
status ou bug aqui — isso vive em `STATE.md` (agora) e `ROADMAP.md` (futuro).

---

## 0. Ritual obrigatório

Antes de **qualquer tarefa grande** (feature nova, refactor, pivô, PR):

1. Ler `AGENTS.md` — como codar e testar aqui.
2. Ler `STATE.md` — onde o código está travado agora.
3. Ler `ROADMAP.md` — o que não pode ser quebrado no futuro.
4. Ao terminar: **atualizar `STATE.md`** (sempre) e `ROADMAP.md` (se um marco mudou).

Tarefa pequena (typo, comentário, um token de cor): só `STATE.md` no fim, e só se o estado mudou.

Não peça permissão pra ler esses arquivos. Leia.

---

## 1. Stack (versões reais, não aspiracionais)

| Camada | Escolha | Nota |
|---|---|---|
| Framework | **Astro 6**, saída estática | rotas em `src/pages/` |
| UI interativa | **nenhuma** — Astro puro + `<script>` de módulo | React saiu em 2026-09-22 por falta de consumidor |
| Estilo | **Tailwind v4 CSS-first** | `@theme` / `@utility` em `src/styles/global.css` |
| Animação | **CSS scroll-driven** (`animation-timeline`) | contrato obrigatório na §6.1 |
| 3D / Lottie / GSAP / React | **removidos** | nada no roadmap precisa; se voltar, volta com plano |
| Tipos | **TypeScript 6 strict** (`astro/tsconfigs/strict`) | `any` é erro de lint |
| Node | **>= 22.12** | CI usa 22 |

Deploy: build estático + FTP manual (Locaweb). **Não existe runtime de servidor.** Não escreva
código que dependa de SSR, API route ou env var em runtime.

---

## 2. Comandos exatos

```bash
npm run dev        # astro dev -> http://localhost:4321
npm run build      # astro build -> dist/
npm run preview    # serve o dist/
npm run typecheck  # astro check   (gate de CI)
npm run lint       # eslint . --ext .ts,.tsx,.astro   (gate de CI)
npm run lint:fix
npm run check:hotspots   # mapa dos 5 hotspots do /void
npm run check:konami     # máquina de estado do easter egg
```

**Definição de pronto:** `npm run typecheck`, `npm run lint` e `npm run build` passam.
Rode os três antes de commitar. Não anuncie sucesso sem ter rodado — cole a saída.

Não existe suíte de testes. Lógica não-trivial nova (cálculo de geometria, máquina de
estado do cursor, parser) entra com **um** check runnable — um `demo()` com `assert` ou um
arquivo pequeno chamado por `node` —, não com framework de teste novo.

---

## 3. Arquitetura — regras duras

- **Astro renderiza, CSS anima, JS é exceção.** Página nova é `.astro`. Hoje o site inteiro
  roda com ~700 bytes de JS (o Konami); qualquer coisa que passe disso precisa de motivo.
- **Sem framework de UI.** Se um dia uma ilha for inevitável, ela volta como decisão
  explícita: `client:visible` ou `client:idle`, **nunca `client:load`** (mata o LCP).
- **Um módulo, uma responsabilidade.** Cursor não conhece rota; hotspot não desenha grid;
  grid não sabe o que é botão; capítulo não conhece outro capítulo.
- Animação é CSS (§6.1). Se um dia uma cena provar que CSS não resolve, GSAP volta como dep
  nova, com `src/lib/gsap.ts` como único ponto de `registerPlugin` e import dinâmico.
- Todo listener, RAF e contexto WebGL tem cleanup. Sem exceção.
- Sem estado global (store/context provider) até existirem 2+ consumidores reais.

---

## 4. Dependências — a régua

Ordem obrigatória antes de instalar qualquer coisa:

1. Precisa existir? → 2. Já está no repo? → 3. Plataforma nativa resolve (CSS, `<dialog>`,
View Transitions, WebGL cru)? → 4. Dep instalada resolve? → 5. Cabe em ~20 linhas próprias?

**Ausentes de propósito. Não instale sem aprovação explícita:**

- `framer-motion` / `motion` → **CSS scroll-driven já faz** (§6.1), e sem runtime de React.
- `lucide-react` → SVG inline. Um ícone não vale um pacote.
- `gsap` / `animejs` → só se uma cena **concreta** provar que CSS não resolve. Nesse caso
  entra com import dinâmico e cleanup, nunca no bundle inicial.
- `shadcn/ui` e component libs → não temos e não precisamos. `clsx`/`tailwind-merge` saíram
  junto com a v1; se a composição de classes voltar a doer, um `cn()` de 3 linhas resolve.
- `react`, `react-dom`, `@astrojs/react` e `gsap` **foram desinstalados em 2026-09-22** por
  não terem consumidor. `dist/_astro` não tem nenhum `.js`. Reinstalar é decisão, não detalhe.

Componente copiado de fora (ReactBits, 21st.dev) entra em `src/components/ui/` **reescrito
pra esta stack**: zero deps novas, zero `any`, cleanup completo, cores vindas do `@theme`.
Asset externo (vídeo/imagem em CDN de terceiro) é copiado pro projeto — não linkamos CDN alheio.

---

## 5. Estilo de código

**TypeScript**
- `any` proibido (erro de lint). Use `unknown` + narrowing.
- `interface` pra objeto exportado, `type` pra união/composição. `PascalCase`, sem prefixo `I`.
- Tipo de um arquivo fica inline; tipo compartilhado vai pra `src/types/`.

**Tailwind v4**
- **Proibido criar `tailwind.config.*`.** Tokens em `@theme`, padrão recorrente em `@utility`,
  ambos em `src/styles/global.css`.
- Sem CSS solto em `<style>`, exceto `@keyframes` que Tailwind não expressa.
- Cor/sombra/medida nova vira token nomeado antes de virar valor arbitrário. Arbitrário
  (`bg-[#007A33]`) só com comentário justificando.
- `!important` proibido (salvo override comentado).
- Classe condicional: `cn()` de 3 linhas se voltar a doer; hoje não existe e não faz falta.

**Astro**
- Imagem de conteúdo usa `<Image />` de `astro:assets`. `public/` é só pra asset servido cru.
- `<script>` inline só pra one-liner. Mais de uma condição → vira ilha.

**Geral**
- Nome descritivo ganha de comentário. Comentário explica **por quê**, nunca o quê.
- Sem `console.log` mergeado, sem código comentado "pra depois".
- Deletar ganha de adicionar. O diff mais curto que resolve **a raiz** ganha.

---

## 6. Invariantes de interação do `/void` (não negocie sem perguntar)

**Valem só para o easter egg** (`/void` e filhas), não para o portfólio. O portfólio é
responsivo, tem cursor nativo e não conhece hotspot. Spec completa em `ROADMAP.md`.
Aqui ficam os números que o código do `/void` **não pode** violar:

- **Cursor:** bola branca ~12px, **borda 2px sempre visível**, inclusive quando o
  preenchimento chega a 0% de opacidade. Fade branco → transparente dura **1.5s**, é
  reversível, e sair do hotspot sem clicar volta ao branco. Nada além do cursor revela o hotspot.
- **Hotspot:** quadrado de `min(10vw, 10vh)`. Sempre quadrado, sempre responsivo.
  Posições: 4 cantos + centro exato.
- **Dot grid:** cor ativa `#007A33`.
- **`prefers-reduced-motion: reduce`:** cursor custom desliga (cursor nativo volta), fade
  vira troca instantânea, grid para de reagir. Site segue 100% navegável.
- **`pointer: coarse` / celular:** cursor custom não existe e o `/void` não é servido. Mobile
  vê **placeholder**: tela branca, palavra `MOBILE` centralizada, CSS puro, sem JS, via prop
  `mobileGate` do `BaseLayout`. **O portfólio nunca usa esse gate** — ele é responsivo.

---

## 6.1. Contrato de cena (toda animação do portfólio)

Regra única, obrigatória em toda cena animada:

> **O CSS base de um elemento de cena é o ESTADO FINAL legível.** A animação só existe
> dentro da dupla guarda `@supports (animation-timeline: view())` +
> `@media (prefers-reduced-motion: no-preference)`.

Escrever o estado **inicial** no CSS base quebra de uma vez o navegador sem scroll-driven
animations, o usuário com `reduced-motion`, o crawler e a impressão.

Duas armadilhas já pagas, não repita:

1. **Cena dentro de `sticky-stage` não pode usar `animation-timeline: view()`.** Elemento
   preso não se move na viewport, então a timeline dele congela. Declare
   `view-timeline: --nome` na **seção alta** e consuma com `animation-timeline: --nome`.
2. **`animation-range: contain` é degenerado** quando o sujeito é mais alto que a viewport.
   Use `cover`.

`@keyframes` ficam no `<style>` do componente da cena. Padrão recorrente sobe para
`@utility` no `global.css`.

---

## 7. Acessibilidade — não negociável

Interface construída sobre elemento invisível é armadilha de a11y. Portanto:

- Hotspot é **`<a href>` real** (nunca `div` com `onClick`), com `aria-label` do destino,
  dentro de `<nav>`.
- Foco de teclado é **visível**: `:focus-visible` revela o hotspot (borda/halo) mesmo ele
  sendo invisível ao mouse. Tab order segue ordem de leitura.
- Existe rota de escape sempre disponível: skip-link + menu textual das 5 seções (pode ser
  `sr-only` até receber foco). Descoberta por exploração é camada visual, **não** o único caminho.
- Contraste WCAG AA (4.5:1) em todo texto — inclusive o "in construction" sobre imagem em movimento.
- HTML semântico, headings em ordem, `alt=""` apenas em decorativo.

---

## 8. Performance (em portfólio, performance É produto)

- LCP < 2.5s · CLS < 0.1 · INP < 200ms · JS inicial < 100KB gzip.
- Import fragmentado e nomeado; nunca `import * as X`. Sem bundle de runtime de framework.
- Import fragmentado e nomeado; nunca `import * as X`. Sem runtime de framework no bundle.
- `devicePixelRatio` clampado em 2. RAF pausa em `document.hidden`.
- Imagem em WebP/AVIF; fonte com `font-display: swap` + preload da principal.

---

## 9. Git — rotina obrigatória

**Nenhuma alteração, de nenhum tipo, é commitada direto na `main`.** Vale para código,
markdown, config, correção de typo. Sem exceção, sem "é só uma linha".

O ciclo, sempre nesta ordem:

```bash
git checkout -b <tipo>/<assunto>   # ANTES de editar qualquer arquivo
# ...trabalho + npm run typecheck && npm run lint && npm run build...
git add -A && git commit -m "tipo(escopo): assunto"
git push -u origin <tipo>/<assunto>   # o código vai pro remoto primeiro
git checkout main && git pull --ff-only
git merge --no-ff <tipo>/<assunto>
git push                              # main atualizada
git branch -d <tipo>/<assunto> && git push origin --delete <tipo>/<assunto>
```

- Esqueceu de abrir a branch e já editou? `git checkout -b <branch>` leva as mudanças junto.
  Não commite antes de trocar.
- `--no-ff` sempre: o merge vira um ponto de reversão único no histórico.
- Prefixos: `feat/`, `fix/`, `refactor/`, `docs/`, `perf/`, `chore/`.
- Conventional Commits, assunto ≤ 50 chars, imperativo. Corpo só quando o "por quê" não é óbvio.
- Quer revisão do `gemini-code-assist[bot]`? Abra PR (`gh pr create`) em vez do merge local e
  trate os comentários com a skill `babysit-pr` até ficar verde. O merge direto pula a revisão —
  use para docs e ajustes pequenos, PR para features.
- CI (`.github/workflows/quality-gate.yml`): typecheck + lint + build em PR pra `main`.
- `.gemini/styleguide.md` é o que o bot lê. Regra daqui que muda revisão → atualizar os dois
  na mesma branch.

**Isto é enforçado, não sugerido:** `.claude/settings.json` roda
`.claude/hooks/block-main-commit.mjs` antes de todo comando Bash e **recusa** `git commit`
com a `main` em HEAD. `git merge`, `git push` e a finalização de um merge continuam liberados —
são o resto do ciclo.

---

## 10. Estrutura de pastas

```
src/
  pages/            # rotas (.astro) — 1 arquivo = 1 rota; /void é o easter egg
  layouts/          # BaseLayout e afins
  components/
    chapters/       # um capítulo do portfólio por arquivo
    scenes/         # cenas animadas, autocontidas (SVG/HTML + @keyframes)
  i18n/             # pt-br.ts (fonte), en.ts (tipado contra ela), index.ts
  lib/              # dotGrid, cursorOrb, hotspots, konami + seus *.check.ts
  styles/global.css # @theme + @utility — única fonte de estilo
  assets/           # imagens processadas pelo Astro
  types/            # tipos exportados
public/             # servido cru (favicon, og, robots)
```

---

## 11. Como responder aqui

Código primeiro, prosa depois e curta. Simplificação deliberada com teto conhecido leva
comentário `ponytail:` nomeando o teto e o upgrade. Ambiguidade: entregue a versão default,
diga a suposição em uma linha e siga — não pare pra perguntar o que dá pra assumir.
