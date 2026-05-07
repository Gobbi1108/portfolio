# Style Guide — Portfólio Pessoal

Este documento orienta o `gemini-code-assist[bot]` (e qualquer revisor humano) sobre as convenções deste repositório. Ele é lido em toda revisão de PR.

---

## 1. Sobre o projeto

Portfólio pessoal de um desenvolvedor Frontend UI/UX. O site tem:

- Hero com foto e bio
- Seção timeline com personagem 2D animado controlado por scroll/setas
- Cenários que mudam conforme a timeline (0–1 nasci, 1–6 infância, 6–18 escotismo, 19+ tecnologia)
- Estética **Neubrutalismo** com elementos 3D pontuais e personagem em estilo flat 2D (Kurzgesagt-like)

Site estático, deploy manual via FTP na Locaweb.

---

## 2. Stack e versões

- **Astro** (framework principal, gera estático)
- **TypeScript** em modo strict
- **Tailwind CSS** para estilização
- **React** apenas para componentes interativos (3D, animação)
- **React Three Fiber + Drei** para cenas 3D
- **GSAP + ScrollTrigger** para animação por scroll
- **lottie-web** ou **@lottiefiles/react-lottie-player** para o personagem animado

---

## 3. Princípios de design — Neubrutalismo

A estética é **chapada, intencional, sem sutilezas**. Toda a UI deve refletir isso:

- **Cores chapadas e saturadas.** Sem gradientes suaves. Paleta restrita (4–6 cores no máximo).
- **Sombras hard, nunca blur.** Use `shadow-[Npx_Npx_0_0_#000]` em vez de `shadow-lg`.
- **Bordas grossas e visíveis.** `border-2` ou `border-4`, sempre `border-black` ou cor de alto contraste.
- **Tipografia forte.** Sans-serif geométricas ou monospaced. Pesos altos (700+).
- **Layout assimétrico permitido**, mas elementos devem ter hierarquia clara.
- **Hover states agressivos.** Translate de 4–8px é padrão, sombra some no hover (ex: `hover:translate-x-1 hover:translate-y-1 hover:shadow-none`).

**Anti-padrões:**

- Glassmorphism, gradientes pastel, sombras suaves, bordas arredondadas excessivas (`rounded-full` apenas em casos pontuais).
- Animações suaves de 600ms+. Brutalismo é seco — animações de 100–200ms ou nada.

---

## 4. Convenções TypeScript

- `strict: true` no `tsconfig.json`. Sem exceções.
- **Proibido `any`.** Use `unknown` e narrowing, ou tipos específicos.
- Tipos exportados ficam em `src/types/`. Tipos de uso único ficam inline.
- `interface` para objetos públicos/exportados, `type` para uniões e composições.
- Nomes de tipos em `PascalCase`. Sem prefixo `I` (ex: `User`, não `IUser`).

---

## 5. Convenções Astro

- Páginas em `src/pages/`. Cada arquivo `.astro` é uma rota.
- Componentes estáticos em `src/components/`, sufixo `.astro`.
- Componentes interativos (com hooks, state, animação) em `src/components/interactive/`, sufixo `.tsx`.
- Componentes interativos **sempre** usam `client:visible` ou `client:idle`, **nunca** `client:load` (impacta LCP).
- Imagens devem usar `<Image />` do `astro:assets` para otimização automática.
- Não use `<script>` inline em arquivos `.astro` para lógica complexa — extraia para um componente React.

---

## 6. Convenções Tailwind

Projeto usa **Tailwind v4 CSS-first**. Sem `tailwind.config.{js,mjs,ts}` — toda configuração vive em `src/styles/global.css` via `@theme`, `@layer` e `@utility`. Plugin Vite (`@tailwindcss/vite`) faz o build.

- Use o sistema de classes utilitárias. **Não** crie CSS customizado em `<style>` exceto para keyframes específicos.
- Tokens (cores, fontes, sombras, radius) ficam em `@theme { ... }` em `src/styles/global.css` como CSS variables com prefixo namespaced (`--color-*`, `--font-*`, `--shadow-*`, `--radius-*`). Tailwind gera as utilitárias correspondentes (ex.: `--color-brutal-yellow` → `bg-brutal-yellow`, `text-brutal-yellow`, `border-brutal-yellow`).
- Sombras brutalistas devem ser tokens do tema (já existem `--shadow-brutal-sm|md|lg|xl`). Use `shadow-brutal-md` etc., não `shadow-[Npx_Npx_0_0_#000]` arbitrário, salvo exceção justificada.
- Componentes recorrentes (botões, cards, bordas brutalistas) ficam em `@utility` no `global.css` (ex.: `btn-brutal`, `card-brutal`, `border-brutal`). Não duplique esse CSS inline.
- Use `cn()` (clsx + tailwind-merge) para composição condicional de classes.
- **Proibido** `!important` (`!`) exceto em overrides justificados com comentário.
- **Não** reintroduza `tailwind.config.*`. Se precisar de algo que `@theme` não cobre, abra discussão antes.

---

## 7. React Three Fiber (cenas 3D)

- Cenas 3D só carregam via `client:visible` para não bloquear o paint inicial.
- Geometrias devem ser **memoizadas** (`useMemo`) — recriar geometria a cada render derruba o FPS.
- Materiais brutalistas: `MeshToonMaterial` ou `MeshBasicMaterial` com cores chapadas. **Não** use materiais PBR (Standard, Physical) — quebram o estilo.
- Sempre forneça fallback (`<Suspense fallback={...}>`).
- Limite o `<Canvas>` a `dpr={[1, 2]}` para não estourar GPU em retina.
- Use `frameloop="demand"` quando possível — só renderiza quando necessário.

---

## 8. GSAP + ScrollTrigger

- Importe apenas o que usa: `import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';`.
- Registre o plugin uma única vez em um arquivo central (`src/lib/gsap.ts`).
- **Sempre** limpe ScrollTriggers no `useEffect` cleanup:
  ```ts
  return () => ScrollTrigger.getAll().forEach(t => t.kill());
  ```
- Animações devem respeitar `prefers-reduced-motion`. Use `gsap.matchMedia()` ou checagem manual.
- Para a timeline do personagem: a posição do scroll mapeia para o frame do Lottie via `scrollTrigger.progress`.

---

## 9. Lottie (personagem animado)

- Use **lazy load**. O arquivo `.json` da animação não deve estar no bundle inicial.
- Anime via `setSpeed(0)` + controle manual de frame com `goToAndStop(frame, true)` quando ligado ao scroll.
- O arquivo Lottie deve ter no máximo **300KB**. Se passar, otimize no LottieFiles ou no After Effects.
- Forneça fallback estático (PNG/SVG) caso o Lottie falhe ao carregar.

---

## 10. Acessibilidade (não-negociável)

- **Todo elemento interativo é acessível por teclado.** Inclui o controle da timeline por setas.
- Contraste mínimo: WCAG AA (4.5:1 para texto). Neubrutalismo combina bem com isso — fundos chapados ajudam.
- `prefers-reduced-motion: reduce` desativa todas as animações não-essenciais. A timeline ainda funciona, mas sem transições.
- Imagens decorativas: `alt=""`. Imagens informativas: `alt` descritivo.
- Use HTML semântico: `<main>`, `<section>`, `<nav>`, `<article>`. Headings em ordem (`h1` → `h2` → `h3`, sem pular).

---

## 11. Performance

Como portfólio, performance É produto.

- **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms**.
- Bundle JS inicial < 100KB (gzipped). Cenas 3D e Lottie são lazy.
- Imagens em WebP ou AVIF, com fallback. Use `<Image />` do Astro.
- Fontes via `font-display: swap` e preload da fonte principal.
- **Não** importe bibliotecas inteiras. `import { gsap } from 'gsap'` é ok, `import * as THREE from 'three'` deve ser fragmentado.

---

## 12. Estrutura de pastas

```
src/
  pages/           # Rotas Astro (.astro)
  layouts/         # Layouts compartilhados
  components/      # Componentes Astro estáticos
    interactive/   # Componentes React (.tsx) — interativos
  lib/             # Utilitários, helpers, configs (gsap, three setup)
  styles/          # CSS global, fontes, keyframes
  assets/          # Imagens, lottie .json, modelos 3D
  types/           # Tipos TS exportados
public/            # Arquivos servidos como estão (favicon, robots.txt)
```

---

## 13. Commits e PRs

- Conventional Commits: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `docs:`, `perf:`, `test:`.
- PRs pequenos e focados. Um PR = uma feature ou correção.
- Descrição do PR deve responder: **o quê**, **por quê**, e **como testar**.
- Sem `console.log` em código mergeado. Sem código comentado.

---

## 14. O que o reviewer (Gemini) deve priorizar

Em ordem de importância:

1. **Bugs lógicos** que afetam UX (ex: scroll não para na última cena, timeline não respeita limite).
2. **Acessibilidade** quebrada (sem foco visível, contraste ruim, `prefers-reduced-motion` ignorado).
3. **Performance** — bundle grande, imports completos, animações sem cleanup.
4. **TypeScript** — `any` ou tipos frouxos.
5. **Aderência ao Neubrutalismo** — sombras blur, gradientes, cores fora da paleta.
6. **Convenções de código** — nomes, estrutura, padrões.

Comentários sobre formatação puro (espaços, vírgulas) podem ser ignorados — Prettier resolve isso.
