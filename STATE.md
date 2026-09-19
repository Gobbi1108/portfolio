# STATE.md — Foto do Momento

Memória de curto/médio prazo do agente. **Arquivo mutável:** atualizar ao fim de toda tarefa
grande. Se algo aqui contradiz o código, o código ganha — e esta linha vira correção.

- **Data da última atualização:** 2026-09-19
- **Branch:** `feat/morph-gallery` → merge na `main`
- **Fase:** **M1, M2 e M3 entregues.** M4/M5 abertos.
- **Rotina de git agora é enforçada por hook** (`.claude/hooks/block-main-commit.mjs`):
  `git commit` com a `main` em HEAD é recusado. Ciclo completo em `CLAUDE.md` §9.

---

## 0. Galeria "in construction" — entregue em 2026-09-19 (M3)

As 5 rotas provisórias deixaram de ser tela preta chapada: agora rodam 3 fotos do Gabriel
em loop, com morph em WebGL, e o recado fica numa pastilha preta por cima.

**Arquivos novos**

```
src/assets/gallery/{por-do-sol,floresta,praia}.jpg   fotos do Gabriel (originais)
src/lib/morphGallery.ts          WebGL cru + RAF, sem React e sem GSAP
src/lib/morphGallery.check.ts    check runnable — npm run check:gallery
```

**Modificados:** `src/components/UnderConstruction.astro` (virou a galeria),
`src/styles/global.css` (bloco `.gallery-*`), `package.json`, `README.md`.

**Decisões tomadas com o Gabriel em 2026-09-19 (registrar, não re-discutir):**

1. **Galeria única nas 5 rotas**, não uma foto por rota. Ordem do morph:
   **pôr do sol → floresta → praia**. A primeira também é a foto estática de fallback.
2. **TS puro + WebGL, sem ilha React** — mesma lógica do dot grid: o `morph-gallery` do
   21st.dev só usava `useEffect` para montar o contexto, e o runtime do React custaria
   ~186KB nas 5 rotas para animar um crossfade.
3. **Contraste por pastilha chapada**, não por `mix-blend-mode`: o texto nunca encosta na
   foto, então o contraste é paper sobre black (19:1) em qualquer frame — AA sem depender
   de medir pixel de imagem em movimento.
4. As fotos são **do Gabriel**, então a pendência de "auto-hospedar asset de CDN alheia"
   morreu para o M3 (segue valendo para o M4).

**Verificado no navegador (Chrome headless por CDP), não só no build:**

| O quê | Resultado |
|---|---|
| `typecheck` / `lint` / `build` / `check:hotspots` / `check:gallery` | os cinco passam |
| Ciclo do morph em `/jogos` | pôr do sol (t=1.8s) → floresta (t=5s) → praia (t=11s) ✓ |
| `cover` nas 3 proporções (4:3, 3:4 e 4:3) | preenche sem deformar e sem tarja ✓ |
| `prefers-reduced-motion: reduce` | canvas não monta (`data-ready` ausente), foto estática fica ✓ |
| LCP de `/jogos` | **16ms** (elemento `H1`) — a pendência de "performance 0" acabou nessas rotas |
| JS da rota | **2.1KB** transferidos, 1 arquivo |
| Imagens da rota | 405KB nos 3 webp (2892KB+1420KB+358KB de origem) |

**Bug achado e corrigido na verificação:** o `font-size: clamp(2rem, 8vw, 5rem)` do título
estourava a pastilha em telas largas — a linha "CONSTRUCTION" saía por cima da foto, que é
justamente o que a pastilha evita. Virou `9cqw` sobre a pastilha (`.gallery-title`). O
`container-type: inline-size` obrigou a pastilha a ter `width` definida: com `max-width`, a
containment corta a contribuição do conteúdo e a caixa colapsa para a largura do padding.

**Limitação do harness (não é bug do código):** `chrome --headless --screenshot` não executa
`requestAnimationFrame` nenhum, nem com `--virtual-time-budget`. Animação só se verifica por
CDP com espera real — medido com um driver de ~40 linhas no scratchpad.

---

## 0.0. Home nova — entregue em 2026-09-18

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

Nenhum bug conhecido (comportamentos medidos em §0). Pendências reais:

- **Não existe `404.astro`** (é o M4). Hoje uma URL inválida cai no 404 do servidor. O host é
  Apache/Locaweb: `404.html` estático só é usado com `ErrorDocument` no `.htaccess`.
- **Lighthouse não pontua performance da home** (`performance 0`, LCP `null`): a página só tem
  canvas e texto `sr-only`, e canvas não é candidato a LCP. Não é lentidão — são 56KB no total —,
  mas toda auditoria vai reportar zero até existir conteúdo com texto ou imagem. Não inventar
  conteúdo para agradar a ferramenta. **Vale só para `/`**: as 5 rotas da galeria têm LCP de
  16ms medido desde o M3.
- **`floresta.jpg` é a foto fraca do conjunto: 683×911**, contra 4032×3024 e 4608×3456 das
  outras duas. Em tela cheia ela fica visivelmente mais mole, e o webp dela pesa 242KB (mais
  que as outras duas somadas) porque folhagem é textura densa. Se o Gabriel tiver o original
  em resolução cheia, trocar o arquivo resolve sem tocar em código.
- **Mobile gate esconde o conteúdo do crawler mobile** enquanto durar (comentado no código).
- **`react`, `react-dom`, `@astrojs/react`, `@types/react*` e `gsap` seguem sem nenhum
  import — e agora sem marco que os justifique.** O M3 fechou sem React, pelo mesmo motivo
  que a home fechou: não há state nem JSX. Pior: a integração faz o build emitir
  `dist/_astro/client.*.js` (~193KB) que **nenhuma página referencia** — peso morto que sobe
  por FTP. Só o M4 poderia usar `gsap`. Ver a auditoria de 2026-09-19 no §8.
- **Contraste do texto "in construction":** resolvido por pastilha chapada (paper sobre
  black, 19:1), independente do frame da galeria.
- **Assets de terceiro:** resolvido no M3 (as fotos são do Gabriel). Segue aberto para o M4 —
  o vídeo do `prisma-hero` continua em CDN alheia.
- **`styleguide.astro` documenta a paleta da v1.** Segue válido porque os tokens continuam em
  uso, mas é a próxima coisa a revisar quando a direção visual nova fechar.

---

## 5. Atacar em seguida (ordem)

1. **M4** — `error-hero` portada para GSAP + SVG inline, `404.astro` e `.htaccess` com
   `ErrorDocument /404.html`.
2. **M5** — modelo mobile de verdade (escolher (a), (b) ou (c) do `ROADMAP.md` §4) e remover
   o placeholder.
3. **Limpeza pendente do §8** — decidir o que cai (React, `/styleguide`, rota dinâmica).
4. Perguntas de **conteúdo** ainda abertas: o que são TR e BR, formato do `/roadmap`, se
   `#007A33` é cor do sistema ou só do grid.

---

## 6. Arquivos que a próxima sessão vai tocar

Novos: `src/lib/errorHero.ts`, `src/pages/404.astro`, `public/.htaccess`.

Modificados: `src/styles/global.css` e, se a limpeza do §8 for aprovada, `package.json`,
`astro.config.mjs`, `tsconfig.json`, `src/layouts/BaseLayout.astro` e as 5 rotas.

---

## 7. Histórico de sessões (mais recente primeiro)

- **2026-09-19** — M3 na branch `feat/morph-gallery`: as 3 fotos do Gabriel entraram em
  `src/assets/gallery/` e a tela "in construction" virou galeria em morph WebGL sem React
  (§0). Junto, a auditoria de clean code do §8.

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

---

## 8. Auditoria de clean code — 2026-09-19 (nada aplicado, esperando decisão)

Varredura do repo inteiro pedida pelo Gabriel junto do M3. Ordenado por peso, não por
esforço. **Nenhum item foi aplicado nesta sessão** — todos mudam escopo ou apagam trabalho
anterior, e essa decisão é dele.

### 8.1 React instalado sem nenhum consumidor — e emitindo 193KB mortos

`react`, `react-dom`, `@astrojs/react`, `@types/react`, `@types/react-dom` não são
importados por arquivo nenhum. A integração ainda assim faz o build emitir
`dist/_astro/client.*.js` (193KB) que **nenhum HTML referencia** — medido por
`grep -rl client. dist/*/index.html` → zero. É peso morto no FTP, não no browser.

Removendo a integração saem também `jsx`/`jsxImportSource` do `tsconfig.json` e a pasta
`src/components/ui/` do `CLAUDE.md` §10 perde sentido. O M4 (`error-hero`) é o último marco
que poderia trazer React de volta — e o M2 e o M3 já fecharam sem ele.

### 8.2 `/styleguide` é o único consumidor de metade do design system

`brutal-lime`, `brutal-bone`, `brutal-yellow`, `brutal-pink`, `brutal-blue`,
`border-brutal-thick`, `card-brutal`, `btn-brutal-hover` **só aparecem em
`src/pages/styleguide.astro`**. É também a única rota sem `bare`, ou seja, a única razão de
o `BaseLayout` ainda ter header, footer e `brutal-link`.

Apagar `/styleguide` derruba em cadeia ~8 tokens, 4 utilitárias, o header, o footer e o
ramo `!bare` do layout. Não é uma decisão de código: é decidir se o catálogo da paleta da v1
ainda serve para alguma coisa.

### 8.3 Tokens sem uso algum

`--shadow-brutal-sm-inv`, `-md-inv`, `-lg-inv`, `-xl-inv` e `--radius-brutal`: zero
ocorrências fora da própria definição, inclusive no styleguide. Deleção sem consequência.

### 8.4 As 5 rotas são o mesmo arquivo cinco vezes

`jogos`, `lab-a`, `lab-b`, `portfolio` e `roadmap` são 8 linhas idênticas variando título,
description e `section`. Pior que a duplicação: os rótulos vivem **duas vezes** — em
`hotspots.ts` (que o `ROADMAP` §1.3 declara fonte única da verdade) e de novo em cada página,
já divergindo ("Laboratório A — ideia em construção" no mapa, "Laboratório A" na rota).

Uma rota `[section].astro` com `getStaticPaths` alimentado por `HOTSPOTS` mata a divergência.
Só vale enquanto as 5 forem iguais — na hora que uma ganhar conteúdo próprio, ela sai da
rota dinâmica e vira arquivo de novo.

### 8.5 `dotGrid.ts` e `cursorOrb.ts` se auto-inicializam no import

Os dois terminam com `document.querySelector(...)` no topo do módulo. Isso os torna
impossíveis de importar no Node — que é exatamente o motivo de não existir check runnable da
máquina de estado do cursor (débito já registrado no `ROADMAP` §7). `morphGallery.ts` usa o
padrão oposto (exporta `initMorphGallery`, quem chama é o componente) e por isso ganhou
check. Alinhar os dois custa ~3 linhas cada.

### 8.6 Fotos originais no git

`src/assets/gallery/` carrega 4.4MB de JPG dos quais o build usa no máximo o lado de 1600px.
Manter o original é defensável (é a fonte), mas são 4.4MB permanentes no histórico.
