# STATE.md — Foto do Momento

Memória de curto/médio prazo do agente. **Arquivo mutável:** atualizar ao fim de toda tarefa
grande. Se algo aqui contradiz o código, o código ganha — e esta linha vira correção.

- **Data da última atualização:** 2026-09-18
- **Branch:** `feat/home-hotspots` → merge na `main`
- **Fase:** **M1 e M2 entregues.** M3/M4 abertos.
- **Rotina de git agora é enforçada por hook** (`.claude/hooks/block-main-commit.mjs`):
  `git commit` com a `main` em HEAD é recusado. Ciclo completo em `CLAUDE.md` §9.

---

## 0. Home nova — entregue em 2026-09-18

Funciona ponta a ponta: campo de pontos, cursor de bola branca, 5 hotspots invisíveis,
placeholder mobile e 5 rotas de destino.

**Arquivos novos**

```
src/lib/hotspots.ts          5 destinos + âncoras (fonte única da verdade)
src/lib/hotspots.check.ts    check runnable — npm run check:hotspots
src/lib/dotGrid.ts           canvas 2D + mola amortecida, sem GSAP e sem React
src/lib/cursorOrb.ts         rastreio do cursor + detecção de hotspot
src/components/UnderConstruction.astro   tela provisória dos 5 destinos
src/pages/{jogos,roadmap,lab-a,lab-b,portfolio}.astro
```

**Modificados:** `src/pages/index.astro` (reescrita), `src/styles/global.css` (tokens do grid
+ estilos da home + mobile gate), `src/layouts/BaseLayout.astro` (prop `bare`, mobile gate,
prop `bare`, mobile gate), `tsconfig.json`, `package.json`, `README.md`, `.gemini/styleguide.md`.

**Decisões tomadas durante a execução (registrar, não re-discutir):**

1. **Nada de ilha React na home.** DotGrid e CursorOrb não têm state nem JSX — viraram
   módulos TS carregados por `<script>`. React só entraria para pagar ~186KB de runtime.
   A home terminou com **3KB de JS inline**.
2. **GSAP saiu de todas as páginas.** O `<script>` do `BaseLayout` importava `sectionReveal`
   de forma estática e arrastava 114KB de GSAP para toda página. Virou import dinâmico e,
   com a v1 apagada, o script sumiu de vez.
3. **`*.check.ts` fora do `astro check`** (`tsconfig.json`), para não instalar `@types/node`
   por causa de um `assert`. O check roda no Node por `npm run check:hotspots`.
4. **M1 fechado no mesmo dia:** a v1 foi apagada (ver §0.1). Recuperável pelo histórico.
5. Pontos do grid: `#3a3f46` com 4px (o primeiro valor, `#23262a` com 3px, ficou
   invisível na tela preta — verificado em screenshot).

**Verificado no navegador (headless Chrome + CDP), não só no build:**

| O quê | Resultado |
|---|---|
| `npm run typecheck` / `lint` / `build` / `check:hotspots` | os quatro passam |
| Hotspot central mede `min(10vw,10vh)` | 74.89px em viewport 1424×749 ✓ |
| Cursor sobre hotspot | `data-over=true`, fill 0.86 → **0** em 1.5s, volta ao sair ✓ |
| Tab após o skip-link | foca `<a class="hotspot" href="/jogos">` ✓ |
| `prefers-reduced-motion: reduce` | cursor custom não monta, `cursor: auto` preservado, grid desenha estático ✓ |
| Placeholder mobile a 390px | tela branca com MOBILE centralizado (texto 108→285) ✓ |
| Lighthouse desktop `/` | a11y 100 · best-practices 100 · SEO 100 · 56KB total |
| Lighthouse desktop `/jogos` | a11y 100 · best-practices 100 · SEO 100 |

---

## 0.1. V1 apagada (M1 concluído em 2026-09-18)

O portfólio neubrutalista antigo saiu do disco. Está no histórico do GitHub (último commit
com ele vivo: `f0cabe6`), então recuperar é `git checkout f0cabe6 -- <arquivo>`.

Removidos: `Hero.astro`, `HeroCanvas.tsx`, `HeroCursor.tsx`, `Timeline.astro`,
`TimelineCharacter.tsx`, `TimelineScrollController.tsx`, `Contact.astro`, `sectionReveal.ts`,
`lib/gsap.ts`, `public/lottie/character.json`, `assets/images/avatar_model.png`, o bloco de
CSS de reveal/skeleton/hero-cursor em `global.css` e o `<script>` de reveal do `BaseLayout`.

Dependências removidas junto: `three`, `@types/three`, `@react-three/fiber`,
`@react-three/drei`, `lottie-web`, `@lottiefiles/react-lottie-player`, `clsx`, `tailwind-merge`.
**Mantidos sem consumidor:** `react` + `@astrojs/react` (M3) e `gsap` (M4) — reservados, não
importados por ninguém hoje.

**Sobrou de propósito:** `src/pages/styleguide.astro` e os tokens `--color-brutal-*`, porque a
home, a tela de construção e o placeholder mobile usam essas cores e fontes. Quando a direção
visual nova fechar, essa página é a próxima a revisar.

---

## 1. Herança da v1 que segue em uso

- `src/layouts/BaseLayout.astro` — head/meta/OG/favicons, skip-link, header e footer (que hoje
  só aparecem em `/styleguide`, já que as outras páginas usam `bare`).
- `src/styles/global.css` — tokens `--color-brutal-*`, `--shadow-brutal-*`, fontes Archivo
  Black + Inter, utilitárias `btn-brutal`/`card-brutal`/`brutal-link`.
- `src/pages/styleguide.astro` — catálogo desses tokens.
- `public/` — favicons e `og.png`.
- Contraste AA já auditado na v1 (`--color-brutal-magenta`, `--color-brutal-blue`); relatórios
  Lighthouse antigos em `.lh/`.

---

## 2. Pivô decidido nesta sessão (2026-09-17)

Home vira campo de pontos com 5 regiões invisíveis descobertas pelo cursor. Spec completa:
`ROADMAP.md` §2–§5. Resumo do combinado:

- Grid: `reactbits.dev/backgrounds/dot-grid`, `activeColor` **`#007A33`**.
- Cursor: bola branca ~12px, borda 2px sempre visível, fade a 0% de opacidade em **1.5s**
  sobre hotspot, reversível ao sair, clique opcional.
- Hotspots: quadrados de `min(10vw, 10vh)` — 4 cantos + centro.
- Destinos: TL `/jogos`, BL `/roadmap`, TR e BR a definir, centro `/portfolio`.
- Hoje todos caem na tela "in construction" (`morph-gallery`); erro/404 cai na tela de
  erro (`prisma-hero` sem navbar).
- **Mobile: placeholder.** Tela branca, palavra `MOBILE` centralizada, CSS puro no
  `BaseLayout`, sem JS. Temporário até M5 (`ROADMAP.md` §4).

**Aprovado pelo Gabriel em 2026-09-17** (não reabrir sem pedido dele):

1. Sem `framer-motion`, `lucide-react` e `animejs` — GSAP + SVG inline.
2. Hotspot = `min(10vw, 10vh)`, sempre quadrado.
3. Hotspot é `<a>` com `aria-label`, visível no `:focus-visible`, mais menu textual `sr-only`.
4. Assets dos componentes de terceiro são auto-hospedados (shader exige CORS).
5. Mobile = placeholder `MOBILE`, temporário.

Tudo isso está **implementado** desde 2026-09-18 — ver §0.

---

## 3. Decisões técnicas já verificadas (não re-investigar)

| Verificado | Resultado |
|---|---|
| `gsap@3.15.0` no `node_modules` | inclui `ScrollTrigger.js`, `Observer.js` e **`InertiaPlugin.js`** — o dot grid não precisa de plugin pago nem de dep nova |
| `framer-motion`, `motion`, `lucide-react`, `animejs` | **não instalados** — `prisma-hero` precisa ser portado pra GSAP + SVG inline |
| `morph-gallery.tsx` | WebGL cru + React apenas → **zero dep nova**, já tem fallback DOM e cleanup de contexto |
| shadcn | **não usado** neste repo; os dois componentes de 21st.dev não dependem de shadcn, então basta `src/components/ui/` |
| Tailwind | v4 CSS-first, sem `tailwind.config.*` — configuração inteira em `src/styles/global.css` |
| anime.js v4 (se um dia entrar) | ESM: `import { animate, createScope } from 'animejs'`; em React usar `createScope({ root })` + `scope.revert()` no cleanup |

---

## 4. Bugs e pendências abertas

**Corrigido em 2026-09-19 (`fix/dot-grid-hover`):** o grid só reagia ao clique. O porte tinha
trazido a cor por proximidade e a onda de choque do `pointerdown`, mas **não** o empurrão por
movimento do ponteiro que o dot grid original faz por inércia — então passar o mouse só
recolorina os pontos, sem mexer neles, e o único sinal de vida era clicar. Agora `push()` é
uma função só, chamada pelos dois gatilhos (mover e clicar), variando apenas raio e força.
Medido no navegador: deslocamento de pico **5.86px** no hover contra **10-12px** no clique, e
o campo volta exatamente ao repouso nos dois casos.

Outros bugs: nenhum conhecido (comportamentos medidos em §0). Pendências reais:

- **Não existe `404.astro`** (é o M4). Hoje uma URL inválida cai no 404 do servidor. O host é
  Apache/Locaweb: `404.html` estático só é usado com `ErrorDocument` no `.htaccess`.
- **Lighthouse não pontua performance da home** (`performance 0`, LCP `null`): a página só tem
  canvas e texto `sr-only`, e canvas não é candidato a LCP. Não é lentidão — são 56KB no total —,
  mas toda auditoria vai reportar zero até existir conteúdo com texto ou imagem. Não inventar
  conteúdo para agradar a ferramenta.
- **Mobile gate esconde o conteúdo do crawler mobile** enquanto durar (comentado no código).
- **`react`, `@astrojs/react` e `gsap` estão instalados sem nenhum import.** Reservados para
  M3 e M4. Se esses marcos mudarem de rumo, desinstalar.
- **Contraste do texto "in construction"** sobre a galeria em movimento: medir quando o M3
  trocar a tela estática pelo shader. Hoje é texto claro sobre preto chapado, AA folgado.
- **Assets de terceiro:** galeria do M3 e hero de erro do M4 apontam para CDNs alheias —
  auto-hospedar (o shader exige CORS).
- **`styleguide.astro` documenta a paleta da v1.** Segue válido porque os tokens continuam em
  uso, mas é a próxima coisa a revisar quando a direção visual nova fechar.

---

## 5. Atacar em seguida (ordem)

1. **M3** — `morph-gallery` portada + imagens auto-hospedadas, substituindo o conteúdo de
   `UnderConstruction.astro`.
2. **M4** — `error-hero` portada para GSAP + SVG inline, `404.astro` e `.htaccess` com
   `ErrorDocument /404.html`.
3. **M5** — modelo mobile de verdade (escolher (a), (b) ou (c) do `ROADMAP.md` §4) e remover
   o placeholder.
4. Perguntas de **conteúdo** ainda abertas: o que são TR e BR, formato do `/roadmap`, se
   `#007A33` é cor do sistema ou só do grid.

---

## 6. Arquivos que a próxima sessão vai tocar

Novos: `src/components/ui/morph-gallery.*`, `src/components/ui/error-hero.*`,
`src/pages/404.astro`, `public/.htaccess`, imagens em `src/assets/`.

Modificados: `src/components/UnderConstruction.astro` (vira casca da galeria) e
`src/styles/global.css`.

---

## 7. Histórico de sessões (mais recente primeiro)

- **2026-09-19** — `fix/dot-grid-hover`: o empurrão do ponteiro no dot grid, que o porte do
  M2 tinha deixado de fora (§4). Um `push()` só para mover e clicar.

- **2026-09-18** — M2 e M1 na branch `feat/home-hotspots`: dot grid, cursor de bola,
  5 hotspots, placeholder mobile, 5 rotas provisórias (3KB de JS na home, medido no
  navegador — ver §0); depois a v1 foi apagada com suas 8 dependências (§0.1). Rotina de git
  virou hook em `.claude/`, `README.md` e `.gemini/styleguide.md` reescritos.

- **2026-09-17** — Pivô definido (dot grid + cursor + 5 hotspots invisíveis). Criados
  `CLAUDE.md`, `STATE.md`, `ROADMAP.md`. Verificado: InertiaPlugin disponível no GSAP 3.15;
  `framer-motion`/`lucide-react`/`animejs` ausentes; `morph-gallery` não exige dep nova.
  Gabriel aprovou as 4 decisões técnicas e definiu mobile como placeholder `MOBILE`
  temporário. Zero código de produção alterado.
- **Antes (PRs #1–#12, `main`)** — v1 neubrutalista completa: layout base e tipografia, hero
  estático, elemento 3D, personagem Lottie na timeline, scroll-driven frames + navegação por
  setas, transições de cenário, card de contato, micro-interações, auditoria final de
  SEO/a11y/performance.
