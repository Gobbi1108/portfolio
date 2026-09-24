# STATE.md — Foto do Momento

Memória de curto/médio prazo do agente. **Arquivo mutável:** atualizar ao fim de toda tarefa
grande. Se algo aqui contradiz o código, o código ganha — e esta linha vira correção.

- **Data da última atualização:** 2026-09-24
- **Branch:** `main` — `feat/portfolio-v2` e `feat/404-e-limpeza` mergeadas.
- **Fase:** **M3, M4 e M5 entregues.** M6/M7 abertos (`ROADMAP.md` §5) e os dois dependem de
  conteúdo do Gabriel, não de código.
- **Rotina de git enforçada por hook** (`.claude/hooks/block-main-commit.mjs` e o espelho em
  `.codex/hooks/`): `git commit` com a `main` em HEAD é recusado. Ciclo em `CLAUDE.md` §9.

---

## 0. Portfólio v2 — entregue em 2026-09-22

O site deixou de ser um campo de pontos e virou um **portfólio bilíngue de scroll longo com
7 capítulos animados**. O campo de pontos virou o easter egg em `/void`.

Spec: `docs/superpowers/specs/2026-09-22-portfolio-v2-design.md`.
Plano: `docs/superpowers/plans/2026-09-22-portfolio-v2.md` (11 tarefas, executadas inline).

**Arquivos novos**

```
src/i18n/{pt-br,en,index}.ts          dicionários; en.ts tipado como typeof ptBr
src/components/LangToggle.astro       dois <a> com hreflang, zero JS
src/components/chapters/*.astro       Hero, About, Stack, Responsive, Experience,
                                      HowIWork, Contact
src/components/scenes/*.astro         PortraitScene, FlutterPhoneScene, ResizeScene,
                                      TeamScene, GearScene, LockScene
src/lib/konami.ts                     redutor puro do segredo
src/lib/konami.check.ts               6 asserções — npm run check:konami
src/pages/en/index.astro              rota EN
src/pages/void/*.astro                as 6 páginas antigas, movidas
```

**Modificados:** `astro.config.mjs` (bloco `i18n`, integração React removida),
`src/layouts/BaseLayout.astro` (props `lang`/`mobileGate`/`noindex`/`alternate`, preload de
fonte), `src/styles/global.css` (token laranja, 4 utilitárias novas, contrato de cena, gate
mobile escopado), `src/lib/hotspots{,.check}.ts` (prefixo `/void`), `src/pages/index.astro`,
`src/pages/styleguide.astro`, `package.json`, `eslint.config.cjs`, `.gitignore`.

**Removido:** `react`, `react-dom`, `@astrojs/react`, `@types/react`, `@types/react-dom` e
`gsap`. Nenhum tinha consumidor — provado por `grep` antes de desinstalar. **`dist/_astro`
agora tem zero arquivo `.js`**: o único JS do site são 707 bytes inline do Konami.

---

## 0.1. Decisões tomadas durante a execução (registrar, não re-discutir)

1. **`view()` não funciona em cena dentro de `sticky-stage`.** Elemento preso não se move na
   viewport, então a view-timeline dele congela — medido, não suposto. Padrão correto, agora
   em `CLAUDE.md` §6.1: `view-timeline: --nome` na **seção alta**, `animation-timeline: --nome`
   na cena. `animation-range: contain` também não serve (degenerado para sujeito mais alto
   que a viewport); use `cover`.
2. **O inglês entrou antes dos capítulos**, invertendo a ordem da spec: retrofitar i18n em 7
   componentes prontos custaria mais que nascer com ele.
3. **`as const` saiu do `pt-br.ts`.** Com ele, `typeof ptBr` vira tipos literais e o `en.ts`
   jamais compilaria — matando a própria verificação de paridade que ele deveria dar.
4. **O gatilho do segredo é checagem de fim de scroll, não `IntersectionObserver`.** Duas
   razões: `scrollY + innerHeight >= scrollHeight` é literalmente "chegou a 100% da rota",
   enquanto sentinela é "um elemento perto do fim apareceu"; e o IO **não era verificável** —
   este Chrome headless não entrega callbacks de *update* de `IntersectionObserver` (provado
   com um observer de controle na mesma sentinela, que também não disparou).
5. **As páginas do portfólio usam `bare`.** Header, footer e gutter `max-w-6xl` do
   `BaseLayout` são da v1, linkam `/styleguide` e impedem capítulo full-bleed.
6. **Splash do Flutter é wipe, não fade.** Cross-fade de duas camadas cheias deixa as duas
   lavadas no meio do caminho. O `clip-path` fica num wrapper **não animado**: aplicado no
   próprio elemento, ele viaja junto com o transform e não recorta nada.
7. **Preload de fonte é obrigatório.** Sem ele o `<h1>` reflui quando a fonte chega e o CLS
   vai a **0.247** (teto 0.1). Com ele, **CLS 0**.
8. **Copy ajustada por medição, não por gosto:** "Responsividade" → "Responsivo" (14 chars
   estouravam a coluna e `hyphens: auto` não tem dicionário pt no Chrome) e "Troubleshooting"
   → "Causa raiz" (estourava o card e invadia o vizinho).
9. **`.codex/`, `.agents/` e `AGENTS.md` entraram no repo** (mesma categoria de `.claude/`,
   que já era rastreado). `AGENTS.md` virou espelho gerado do `CLAUDE.md`, com cabeçalho
   dizendo isso. `.codex/`, `.agents/` e `.superpowers/` entraram no ignore do ESLint —
   7 erros `no-undef` deles travavam o gate de lint de toda tarefa.

---

## 0.2. Verificado no navegador, não só no build

| O quê | Resultado |
|---|---|
| `typecheck` / `lint` / `build` / `check:hotspots` / `check:konami` | os cinco passam |
| Konami **antes** de chegar ao fim | tecla não conta, não navega, ponto segue magenta ✓ |
| Konami **depois** de 100% da rota | ponto vira `#007A33`, sequência leva a `/void` ✓ |
| Cena 4: colunas ao longo do scroll | **3 → 2 → 1**, medido em 3 posições ✓ |
| Cena 3: splash → app | wipe contido no clip, app limpo no fim ✓ |
| Cena 5: timeline horizontal | cards deslizam, o último para dentro da tela ✓ |
| `prefers-reduced-motion: reduce` | todas as cenas no estado final, nada some ✓ |
| 390px real (via iframe) | `docW=390`, zero overflow; experiência vira lista vertical ✓ |
| `/` a 390px | mostra o conteúdo (não o `MOBILE`); `/void` mostra `MOBILE` ✓ |
| `/en/` canonical | `https://gabrielgobbi.dev/en/`, com `hreflang` recíproco ✓ |
| JS da rota `/` | **707 bytes inline**, zero referência a bundle externo |

**Lighthouse** (preview local, `/`):

| Perfil | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Desktop | **100** | **100** | **100** | **100** | 0.3s | 0 | 0ms |
| Mobile | **100** | **100** | **100** | **100** | 1.4s | 0 | 0ms |

A home finalmente pontua performance: antes o Lighthouse reportava `performance 0` e
`LCP: null` porque a página só tinha canvas.

---

## 1. Herança que segue em uso

- `src/layouts/BaseLayout.astro` — head/meta/OG/favicons, skip-link, preload de fonte, e o
  header/footer da v1 (que hoje só aparecem em `/styleguide`).
- `src/styles/global.css` — tokens `--color-brutal-*` (+ `orange`), `--shadow-brutal-*`,
  Archivo Black + Inter, utilitárias `btn-brutal`/`card-brutal`/`brutal-link` e as novas
  `chapter-block`/`chapter-title`/`sticky-stage`/`scene-svg`.
- `src/lib/{dotGrid,cursorOrb,hotspots}.ts` — o `/void`, intocado além do prefixo de rota.
- `src/pages/styleguide.astro` — atualizado com o laranja.

---

## 2. Bugs e pendências abertas

- **Inglês não revisado por humano.** Traduzido pelo agente a partir do PT.
- **Sem check runnable para a máquina de estado do cursor** do `/void`.
- **Site ainda não subiu.** O build de 2026-09-24 está em `dist/`; o deploy é FTP manual
  (Locaweb) e ninguém fez. `public/.htaccess` precisa chegar à raiz do site junto.

---

## 3. Atacar em seguida (ordem)

1. **Deploy** — subir `dist/` por FTP, `.htaccess` incluído, e conferir uma rota inválida
   no domínio real (é o único lugar onde o `ErrorDocument` pode ser testado).
2. **M6** — capítulo de cases, quando existir projeto documentado para mostrar.
3. **M7** — conteúdo real das 5 rotas do `/void`.
4. Revisar o inglês (não bloqueia nada).

---

## 4. Histórico de sessões (mais recente primeiro)

- **2026-09-24** — `feat/portfolio-v2` mergeada na `main` (13 commits, `--no-ff`). Depois,
  `feat/404-e-limpeza`: **M5** (`src/pages/404.astro` + `public/.htaccess` com
  `ErrorDocument /404.html`; o build emite `dist/404.html` na raiz e o Astro copia o
  dotfile) e o toggle de idioma, que virou `@utility lang-nav` — `absolute` até 640px,
  `fixed` acima. Verificado a 390px pelo truque do iframe: `docW=390`, zero overflow no
  404, `navPos=absolute`, e o chip **sai da tela** ao rolar. O 404 é bilíngue numa página
  só porque o Apache serve um `ErrorDocument` para `/` e `/en/`. `.lh/` (6.3MB de
  relatórios da v1) apagado — era `.gitignore`, nunca esteve no repo.

- **2026-09-22** — `feat/portfolio-v2`: portfólio bilíngue de 7 capítulos com cenas em CSS
  scroll-driven, `/void` como easter egg atrás do Konami armado no fim da rota, React e GSAP
  desinstalados, Lighthouse 100/100/100/100 nos dois perfis (§0). Antes disso, a
  `fix/dot-grid-hover` pendente foi mergeada na `main`. Spec e plano em `docs/superpowers/`.

- **2026-09-19** — `fix/dot-grid-hover`: o empurrão do ponteiro no dot grid, que o porte do
  M2 tinha deixado de fora. Um `push()` só para mover e clicar; deslocamento de pico 5.86px
  no hover contra 10-12px no clique.

- **2026-09-18** — M2 e M1 na `feat/home-hotspots`: dot grid, cursor de bola, 5 hotspots,
  placeholder mobile, 5 rotas provisórias (3KB de JS na home); depois a v1 foi apagada com
  suas 8 dependências. Último commit com a v1 viva: `f0cabe6`.

- **2026-09-17** — Pivô definido (dot grid + cursor + 5 hotspots invisíveis). Criados
  `CLAUDE.md`, `STATE.md`, `ROADMAP.md`. Zero código de produção alterado.

- **Antes (PRs #1–#12, `main`)** — v1 neubrutalista completa: layout base, hero estático,
  elemento 3D, personagem Lottie, scroll-driven frames, card de contato, auditoria final.
