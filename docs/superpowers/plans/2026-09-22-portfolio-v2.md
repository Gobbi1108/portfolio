# Portfólio v2 — Plano de Implementação

> **Para executores agênticos:** SUB-SKILL OBRIGATÓRIA — use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar tarefa a tarefa. Os passos usam checkbox (`- [ ]`).

**Goal:** Substituir a home dot-grid por um portfólio funcional bilíngue em scroll neobrutalista com cenas animadas por CSS, movendo a tela atual para `/void` como easter egg armado só ao fim da rota.

**Architecture:** Astro 6 estático, uma página por locale (`/` e `/en/`) montada de 7 componentes de capítulo, cada um com sua cena em SVG/CSS inline. Animação por `animation-timeline` nativo sob dupla guarda `@supports` + `prefers-reduced-motion`; nenhum conteúdo depende dela. O único JavaScript da rota é o redutor do Konami (~20 linhas).

**Tech Stack:** Astro 6 (estático), Tailwind v4 CSS-first, TypeScript 6 strict, `astro:i18n`. Sem dependência nova. GSAP fica instalado como plano B da cena 5.

**Spec:** [`docs/superpowers/specs/2026-09-22-portfolio-v2-design.md`](../specs/2026-09-22-portfolio-v2-design.md)

## Global Constraints

Valores copiados da spec e do `CLAUDE.md`. Valem em **toda** tarefa.

- **Não existe framework de teste neste repo** (`CLAUDE.md` §2). "Escrever o teste que falha" significa: criar/estender um `src/**/*.check.ts` com `assert` rodado por `node --experimental-strip-types`. **Não instale vitest, jest ou similar.**
- **Nenhuma dependência nova.** Ordem obrigatória do `CLAUDE.md` §4 antes de sequer cogitar.
- **`any` é erro de lint.** Use `unknown` + narrowing.
- **Proibido criar `tailwind.config.*`.** Tokens em `@theme`, padrão recorrente em `@utility`, ambos em `src/styles/global.css`.
- **`!important` proibido.** Cor/medida nova vira token nomeado antes de virar valor arbitrário.
- **Contrato de cena (spec §5):** o CSS base de qualquer elemento é o **estado final legível**; a animação só existe dentro de `@supports (animation-timeline: view())` + `@media (prefers-reduced-motion: no-preference)`. Violar isso deixa o site quebrado em Firefox/reduced-motion.
- **SVG de cena:** `aria-hidden="true"` e `focusable="false"`, sempre. Nenhuma informação existe só dentro de uma cena.
- **Contato público:** e-mail, GitHub, LinkedIn. **Nunca** telefone ou endereço.
- **`--color-grid-active` (`#007A33`) é exclusivo do `/void`.** Única exceção no site: o tell do Konami armado (Task 10).
- **Orçamento:** ~0KB de JS na rota `/`. LCP < 2.5s · CLS < 0.1 · INP < 200ms · JS inicial < 100KB gzip.
- **Definição de pronto de toda tarefa:** `npm run typecheck`, `npm run lint`, `npm run build` passam, saída **colada**, não afirmada.
- **Git:** tudo na branch `feat/portfolio-v2`, um commit por tarefa, Conventional Commits com assunto ≤ 50 chars e imperativo. Nada direto na `main` (hook recusa). Cada commit termina com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Desvio deliberado da ordem da spec:** o inglês (M4 da spec) entra na **Task 2**, antes dos capítulos, não depois. Retrofitar i18n em 7 componentes prontos custa mais que nascer com ele.

## Review Focus

Classes de entrada que a spec implica e que nenhuma tarefa testaria por acidente. Cada linha tem seu teste fixado na tarefa dona do código.

1. **Tecla pressionada antes de armar não pode ficar em buffer.** Quem digita o Konami no hero e depois rola até o fim não deve entrar sem redigitar. → teste na Task 10.
2. **Prefixo repetido dentro da sequência** (`↑↑↑↓↓←→←→BA`) ainda deve abrir: o terceiro `↑` não invalida os dois anteriores. Contador ingênuo com `index` erra isso; por isso o redutor é janela deslizante. → teste na Task 10.
3. **Caixa e nome da tecla:** `B`/`b`, `A`/`a` e `ArrowUp`/`arrowup` são a mesma tecla. CapsLock não pode quebrar o segredo. → teste na Task 10.
4. **`/en/` precisa de `canonical` próprio e `hreflang` recíproco.** O erro clássico é `/en/` apontar canonical para `/` e sumir do índice em inglês. → teste na Task 2.
5. **Hotspot com `href` sem o prefixo `/void`** vira link 404 silencioso depois da mudança de rotas — o `hotspots.check.ts` de hoje não olha o prefixo. → teste na Task 1.

---

## Estrutura de arquivos

**Criados**

| Arquivo | Responsabilidade |
|---|---|
| `src/pages/void/index.astro` | Home dot-grid movida (conteúdo idêntico ao `index.astro` de hoje) |
| `src/pages/void/{jogos,roadmap,lab-a,lab-b,portfolio}.astro` | Destinos dos hotspots, movidos |
| `src/i18n/pt-br.ts` | Fonte da verdade: strings + dados do currículo |
| `src/i18n/en.ts` | `const en: typeof ptBr` — paridade provada pelo compilador |
| `src/i18n/index.ts` | `Locale`, `DICT`, `type Dict` |
| `src/components/chapters/*.astro` | 7 capítulos, um arquivo cada, recebem só a sua fatia do dicionário |
| `src/components/scenes/*.astro` | Cenas animadas, um arquivo cada, autocontidas (SVG + `@keyframes`) |
| `src/components/LangToggle.astro` | Dois links `hreflang`, zero JS |
| `src/lib/konami.ts` | Redutor puro da sequência secreta |
| `src/lib/konami.check.ts` | Check runnable do redutor |
| `src/pages/en/index.astro` | Portfólio EN |

**Modificados**

| Arquivo | Mudança |
|---|---|
| `astro.config.mjs` | bloco `i18n`; remoção da integração React (Task 11) |
| `src/layouts/BaseLayout.astro` | props `lang`, `mobileGate`, `noindex`, `alternate`; `<html lang>` dinâmico |
| `src/styles/global.css` | `@utility chapter-block` / `sticky-stage`; gate mobile escopado; token laranja |
| `src/lib/hotspots.ts` | `href` com prefixo `/void` |
| `src/lib/hotspots.check.ts` | passa a exigir o prefixo |
| `src/pages/index.astro` | deixa de ser a home dot-grid e vira o portfólio |
| `package.json` | script `check:konami` |
| `CLAUDE.md`, `ROADMAP.md`, `STATE.md`, `.gemini/styleguide.md`, `AGENTS.md` | Task 11 |

**Apagados:** `src/pages/{jogos,roadmap,lab-a,lab-b,portfolio}.astro` (movidos, não recriados).

---

### Task 0: Abrir a branch

- [ ] **Passo 1: Branch a partir da main atualizada**

```bash
git checkout main && git pull --ff-only
git checkout -b feat/portfolio-v2
```

Nenhum arquivo é editado antes desta branch existir (`CLAUDE.md` §9).

---

### Task 1: Mover a home para `/void` e escopar o gate mobile

**Files:**
- Create: `src/pages/void/index.astro`, `src/pages/void/{jogos,roadmap,lab-a,lab-b,portfolio}.astro`
- Modify: `src/lib/hotspots.ts`, `src/layouts/BaseLayout.astro`, `src/styles/global.css:331-353`, `src/pages/index.astro`
- Delete: `src/pages/{jogos,roadmap,lab-a,lab-b,portfolio}.astro`
- Test: `src/lib/hotspots.check.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `BaseLayout` com as props novas `lang?: "pt-BR" | "en"`, `mobileGate?: boolean`, `noindex?: boolean`, `alternate?: { hreflang: string; href: string }[]`. Todo capítulo das tarefas seguintes renderiza dentro dele.

- [ ] **Passo 1: Escrever a asserção que falha**

Acrescente ao fim de `src/lib/hotspots.check.ts`:

```ts
// Depois da mudança de rotas (spec §3) todo destino vive sob /void.
// Um href sem o prefixo vira 404 silencioso: o link existe, a página não.
for (const hotspot of HOTSPOTS) {
  assert(
    hotspot.href.startsWith("/void/"),
    `hotspot "${hotspot.id}" aponta para ${hotspot.href}, fora de /void/`,
  );
}
```

- [ ] **Passo 2: Rodar o check e ver falhar**

```bash
npm run check:hotspots
```

Esperado: `AssertionError: hotspot "jogos" aponta para /jogos, fora de /void/`.

- [ ] **Passo 3: Prefixar os `href` em `src/lib/hotspots.ts`**

Os cinco itens de `HOTSPOTS` passam a `/void/jogos`, `/void/lab-a`, `/void/portfolio`, `/void/roadmap`, `/void/lab-b`. Atualize o comentário do topo do arquivo trocando "da home" por "da home secreta (`/void`)".

- [ ] **Passo 4: Rodar o check e ver passar**

```bash
npm run check:hotspots
```

Esperado: saída de sucesso do check, sem `AssertionError`.

- [ ] **Passo 5: Mover as páginas preservando o histórico**

```bash
mkdir -p src/pages/void
git mv src/pages/index.astro src/pages/void/index.astro
for p in jogos roadmap lab-a lab-b portfolio; do git mv src/pages/$p.astro src/pages/void/$p.astro; done
```

Em cada arquivo movido, os imports relativos sobem um nível: `../layouts/` → `../../layouts/`, `../lib/` → `../../lib/`, `../components/` → `../../components/`.

- [ ] **Passo 6: Dar props novas ao `BaseLayout`**

Na interface `Props` de `src/layouts/BaseLayout.astro`:

```ts
interface Props {
  title?: string;
  description?: string;
  image?: string;
  /** Sem header, footer nem gutter: a página ocupa a viewport inteira. */
  bare?: boolean;
  /** Locale da página. Vira o atributo lang do <html> e o og:locale. */
  lang?: "pt-BR" | "en";
  /** Substitui a página inteira por "MOBILE" em tela pequena. Só as rotas
      de /void usam: o portfólio é responsivo de verdade (spec §9). */
  mobileGate?: boolean;
  /** Tira a rota do índice de busca. O easter egg não é conteúdo público. */
  noindex?: boolean;
  /** Versões em outro idioma desta mesma página. */
  alternate?: { hreflang: string; href: string }[];
}
```

Desestruture com `lang = "pt-BR"`, `mobileGate = false`, `noindex = false`, `alternate = []`. Então:

```astro
<html lang={lang}>
```

No `<head>`, logo depois do `<link rel="canonical">`:

```astro
{noindex && <meta name="robots" content="noindex, follow" />}
{alternate.map((alt) => (
  <link rel="alternate" hreflang={alt.hreflang} href={new URL(alt.href, Astro.site).toString()} />
))}
```

E o `og:locale` passa a `content={lang === "en" ? "en_US" : "pt_BR"}`.

- [ ] **Passo 7: Tornar o gate mobile opcional**

Troque a renderização incondicional do gate por:

```astro
{mobileGate && (
  /* Placeholder temporário das rotas do easter egg (spec §9): elas dependem
     de hover e não têm modelo mobile. O portfólio NÃO usa este gate.
     ponytail: enquanto durar, o crawler mobile não vê /void — que é
     justamente noindex, então o custo é zero. */
  <div class="mobile-gate">MOBILE</div>
)}
```

E em `src/styles/global.css:350`, escope a regra que apagava o body inteiro:

```css
  /* Só apaga o conteúdo quando a página de fato pediu o gate. Sem o :has,
     esta regra escondia o site inteiro em qualquer tela pequena. */
  body:has(> .mobile-gate) > *:not(.mobile-gate) {
    display: none;
  }
```

- [ ] **Passo 8: Ligar as props nas 6 páginas de `/void`**

Cada uma passa `mobileGate` e `noindex`. Em `src/pages/void/index.astro`:

```astro
<BaseLayout
  title="Gabriel Gobbi"
  description="Cinco seções escondidas em um campo de pontos. Explore."
  bare
  mobileGate
  noindex
>
```

As cinco filhas recebem `mobileGate noindex` da mesma forma.

- [ ] **Passo 9: `/` vira a casca do portfólio**

Crie `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Gabriel Gobbi — Desenvolvedor Frontend"
  description="Portfólio de Gabriel Gobbi, desenvolvedor frontend — Flutter, Dart e Web."
>
  <h1 class="font-display uppercase">Gabriel Gobbi</h1>
</BaseLayout>
```

Casca mínima de propósito: a Task 4 a substitui pelo hero de verdade. Ela existe só para o build não quebrar e para `/` nunca ficar 404 entre tarefas.

- [ ] **Passo 10: Verificar no navegador**

```bash
npm run build && npm run preview
```

Confira: `/void` mostra o dot grid e o cursor como antes; Tab sobre um hotspot leva a `/void/jogos`; `/` mostra o título; **em viewport de 390px `/` mostra o conteúdo** (e não `MOBILE`), enquanto `/void` mostra `MOBILE`.

- [ ] **Passo 11: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build && npm run check:hotspots
git add -A
git commit -m "refactor(rotas): mover a home dot-grid para /void"
```

---

### Task 2: i18n — dicionários, config e as duas rotas

**Files:**
- Create: `src/i18n/pt-br.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `src/components/LangToggle.astro`, `src/pages/en/index.astro`
- Modify: `astro.config.mjs`, `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` com `lang` e `alternate` (Task 1).
- Produces:
  - `type Locale = "pt-br" | "en"` e `type Dict = typeof ptBr` (`src/i18n/index.ts`)
  - `DICT: Record<Locale, Dict>`
  - Forma do dicionário: `Dict["hero"]`, `Dict["about"]`, `Dict["stack"]`, `Dict["responsive"]`, `Dict["experience"]`, `Dict["howIWork"]`, `Dict["contact"]`, `Dict["ui"]` — cada capítulo das tarefas 4-10 recebe **só a sua chave** como prop.

- [ ] **Passo 1: Escrever o dicionário PT-BR**

`src/i18n/pt-br.ts` — fonte da verdade. Dados do currículo ATS 08/2026, sem telefone e sem endereço:

```ts
// Fonte da verdade de todo texto do portfólio. `en.ts` é tipado contra este
// arquivo, então chave nova aqui = erro de typecheck lá até ser traduzida.
// Dados neutros de idioma (anos, URLs, nomes de empresa) se repetem idênticos
// nos dois: são ~30 linhas, não valem uma terceira camada de "dados comuns".

export const ptBr = {
  ui: {
    skipToContent: "Pular para conteúdo",
    langLabel: "Idioma",
    otherLangName: "English",
  },
  hero: {
    name: "Gabriel Gobbi",
    role: "Desenvolvedor Frontend",
    focus: "Flutter & Web",
    scrollHint: "role",
  },
  about: {
    heading: "Quem sou",
    body: "Formado em Ciências da Computação pela EEP em 2025 e pós-graduando em Cybersegurança. Comecei no suporte de TI, virei desenvolvedor em FlutterWeb e hoje construo interface — é para onde estou migrando de vez.",
  },
  stack: {
    heading: "Stack",
    items: [
      { name: "Flutter", note: "Mobile e Web" },
      { name: "Dart", note: "Linguagem do dia a dia" },
      { name: "HTML & CSS", note: "Base de tudo" },
      { name: "Python", note: "Automação e back" },
      { name: "Firebase", note: "Auth e dados" },
      { name: "APIs REST", note: "Integração" },
      { name: "Git", note: "Versionamento" },
    ],
  },
  responsive: {
    heading: "Responsividade",
    body: "Uma interface que só funciona em um tamanho de tela não funciona. O bloco ao lado é o mesmo em qualquer largura — quem muda é o layout.",
    screens: ["Desktop", "Tablet", "Celular"],
  },
  experience: {
    heading: "Experiência",
    jobs: [
      {
        company: "Prefeitura de Ipeuna",
        role: "Estagiário de TI",
        period: "jan 2025 — dez 2025",
        note: "Suporte, infraestrutura e controle de ativos. Onde aprendi a achar a causa antes de mexer.",
      },
      {
        company: "Vivida",
        role: "Software Developer",
        period: "jan 2026 — mai 2026",
        note: "Projeto FlutterWeb, remoto. Primeiro contato profissional com produto e prazo de cliente.",
      },
      {
        company: "Korin",
        role: "Assistente de TI",
        period: "jul 2026 — hoje",
        note: "Gestão de software e suporte, enquanto a carreira de desenvolvimento cresce ao lado.",
      },
    ],
  },
  howIWork: {
    heading: "Como trabalho",
    traits: [
      { title: "Em equipe", body: "Código bom sozinho é rascunho. A parte que vale é destravar o outro." },
      { title: "Troubleshooting", body: "Sintoma não é causa. Vou até a raiz antes de propor conserto." },
      { title: "Segurança", body: "Pós em Cybersegurança em curso — penso em quem vai tentar quebrar." },
    ],
  },
  contact: {
    heading: "Contato",
    invite: "Aberto a vaga de frontend. Chama.",
    email: "gabgobs@gmail.com",
    github: "https://github.com/Gobbi1108",
    /** Vazio = link não renderiza (spec §13). Sem placeholder, sem link morto. */
    linkedin: "",
    emailLabel: "E-mail",
    githubLabel: "GitHub",
    linkedinLabel: "LinkedIn",
  },
} as const;
```

- [ ] **Passo 2: Escrever o dicionário EN tipado contra o PT**

`src/i18n/en.ts`. O tipo é o que garante paridade — não existe script para isso:

```ts
import type { ptBr } from "./pt-br";

// Tipado contra o PT de propósito: chave faltando, renomeada ou array de
// tamanho diferente quebra `npm run typecheck`. É a verificação de paridade
// inteira, feita pelo compilador, sem código de runtime.
export const en: typeof ptBr = {
  ui: { skipToContent: "Skip to content", langLabel: "Language", otherLangName: "Português" },
  hero: { name: "Gabriel Gobbi", role: "Frontend Developer", focus: "Flutter & Web", scrollHint: "scroll" },
  about: {
    heading: "Who I am",
    body: "Computer Science graduate (EEP, 2025), currently taking a Cybersecurity postgrad. I started in IT support, moved into FlutterWeb development, and now build interfaces — which is where I am heading for good.",
  },
  stack: {
    heading: "Stack",
    items: [
      { name: "Flutter", note: "Mobile and Web" },
      { name: "Dart", note: "Daily driver" },
      { name: "HTML & CSS", note: "The foundation" },
      { name: "Python", note: "Automation and back end" },
      { name: "Firebase", note: "Auth and data" },
      { name: "REST APIs", note: "Integration" },
      { name: "Git", note: "Version control" },
    ],
  },
  responsive: {
    heading: "Responsive",
    body: "An interface that only works at one screen size does not work. The block beside this text is the same at any width — the layout is what changes.",
    screens: ["Desktop", "Tablet", "Phone"],
  },
  experience: {
    heading: "Experience",
    jobs: [
      { company: "Ipeuna City Hall", role: "IT Intern", period: "Jan 2025 — Dec 2025", note: "Support, infrastructure and asset control. Where I learned to find the cause before touching anything." },
      { company: "Vivida", role: "Software Developer", period: "Jan 2026 — May 2026", note: "FlutterWeb project, remote. First professional contact with product and client deadlines." },
      { company: "Korin", role: "IT Assistant", period: "Jul 2026 — now", note: "Software management and support, while the development career grows alongside." },
    ],
  },
  howIWork: {
    heading: "How I work",
    traits: [
      { title: "As a team", body: "Good code written alone is a draft. The part that counts is unblocking someone else." },
      { title: "Troubleshooting", body: "A symptom is not a cause. I go to the root before proposing a fix." },
      { title: "Security", body: "Cybersecurity postgrad in progress — I think about whoever will try to break it." },
    ],
  },
  contact: {
    heading: "Contact",
    invite: "Open to frontend roles. Say hi.",
    email: "gabgobs@gmail.com",
    github: "https://github.com/Gobbi1108",
    linkedin: "",
    emailLabel: "Email",
    githubLabel: "GitHub",
    linkedinLabel: "LinkedIn",
  },
};
```

- [ ] **Passo 3: Escrever o mapa de locales**

`src/i18n/index.ts`:

```ts
import { ptBr } from "./pt-br";
import { en } from "./en";

export type Locale = "pt-br" | "en";
export type Dict = typeof ptBr;

export const DICT: Record<Locale, Dict> = { "pt-br": ptBr, en };

/** Atributo lang do <html> por locale. */
export const HTML_LANG: Record<Locale, "pt-BR" | "en"> = { "pt-br": "pt-BR", en: "en" };
```

- [ ] **Passo 4: Ver o compilador provar a paridade**

Apague temporariamente a linha `linkedin: "",` de `src/i18n/en.ts` e rode:

```bash
npm run typecheck
```

Esperado: erro apontando `Property 'linkedin' is missing`. Devolva a linha e rode de novo — deve passar. Este passo **é** o teste da camada de i18n; não escreva um `.check.ts` para isto.

- [ ] **Passo 5: Configurar i18n no Astro**

Em `astro.config.mjs`, dentro de `defineConfig`:

```js
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en'],
    // PT-BR sem prefixo (fica em /), inglês em /en/. Saída estática, então
    // redirectToDefaultLocale e detecção por header não se aplicam.
    routing: { prefixDefaultLocale: false },
  },
```

- [ ] **Passo 6: Escrever o toggle de idioma**

`src/components/LangToggle.astro` — dois links, zero JS:

```astro
---
import { getRelativeLocaleUrl } from "astro:i18n";
import type { Locale } from "../i18n";

interface Props {
  current: Locale;
  label: string;
  otherName: string;
}

const { current, label, otherName } = Astro.props;
const other: Locale = current === "pt-br" ? "en" : "pt-br";
const href = getRelativeLocaleUrl(other, "");
---

<a
  class="brutal-link px-3 py-2 font-display text-sm uppercase"
  href={href}
  hreflang={other === "en" ? "en" : "pt-BR"}
  lang={other === "en" ? "en" : "pt-BR"}
  aria-label={`${label}: ${otherName}`}
>
  {otherName}
</a>
```

- [ ] **Passo 7: Ligar as duas rotas**

`src/pages/index.astro` passa a declarar o locale e a irmã:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import LangToggle from "../components/LangToggle.astro";
import { DICT, HTML_LANG, type Locale } from "../i18n";

const locale: Locale = "pt-br";
const t = DICT[locale];
---

<BaseLayout
  title={`${t.hero.name} — ${t.hero.role}`}
  description={t.about.body}
  lang={HTML_LANG[locale]}
  alternate={[
    { hreflang: "pt-BR", href: "/" },
    { hreflang: "en", href: "/en/" },
  ]}
>
  <LangToggle current={locale} label={t.ui.langLabel} otherName={t.ui.otherLangName} />
  <h1 class="font-display uppercase">{t.hero.name}</h1>
</BaseLayout>
```

`src/pages/en/index.astro` é o mesmo arquivo com `const locale: Locale = "en";` e os imports subindo um nível (`../../layouts/`, `../../components/`, `../../i18n`). O `alternate` é idêntico nos dois: a lista descreve o conjunto, não a página.

- [ ] **Passo 8: Provar o canonical e o hreflang no build (Review Focus #4)**

```bash
npm run build
grep -o '<link rel="canonical"[^>]*>' dist/en/index.html
grep -c 'hreflang' dist/index.html dist/en/index.html
```

Esperado: o canonical de `/en/` contém `https://gabrielgobbi.dev/en/` (**não** a raiz), e cada arquivo tem 2 ocorrências de `hreflang` vindas dos `alternate` (o `hreflang` do `LangToggle` soma mais 1 — 3 no total é o esperado quando o toggle já está na página).

- [ ] **Passo 9: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(i18n): rotas pt-br e en com dicionario tipado"
```

---

### Task 3: Sistema visual — utilitárias de capítulo e palco de cena

**Files:**
- Modify: `src/styles/global.css`, `src/pages/styleguide.astro`

**Interfaces:**
- Consumes: tokens `--color-brutal-*` e `--shadow-brutal-*` existentes.
- Produces: `@utility chapter-block`, `@utility sticky-stage`, `@utility scene-svg`, e o token `--color-brutal-orange` (se passar contraste). As tarefas 4-10 só usam estas classes; nenhuma cena redefine palco ou bloco.

- [ ] **Passo 1: Medir o contraste do laranja candidato**

Candidato: `#e5541b`. Contra `--color-brutal-paper` (`#faf7f0`) e contra `--color-brutal-black` (`#0a0a0a`). Calcule pela fórmula WCAG (luminância relativa) ou use o painel de contraste do DevTools.

Esperado: contra `paper` fica abaixo de 4.5:1 — logo **não serve para texto**. Registre o número medido no comentário do token.

- [ ] **Passo 2: Escrever o token com a restrição documentada**

No bloco `@theme` de `src/styles/global.css`, junto dos outros brutais:

```css
  /* Accent quente do sistema. Medido contra paper (#faf7f0): <4.5:1, então
     NÃO é cor de texto — vale para fundo chapado, borda e SVG decorativo.
     Texto sobre ele usa --color-brutal-black. Mesmo tratamento dado ao pink. */
  --color-brutal-orange: #e5541b;
```

- [ ] **Passo 3: Escrever as utilitárias**

No fim da região de `@utility` em `src/styles/global.css`:

```css
/* Tijolo do capítulo: full-bleed, borda dura, sombra deslocada. É o que dá
   o ritmo neobrutalista — todo capítulo é uma laje empilhada, não um card
   flutuando em gutter. */
@utility chapter-block {
  border: var(--border-brutal-width) solid var(--color-brutal-black);
  box-shadow: var(--shadow-brutal-lg);
  background-color: var(--color-brutal-paper);
}

/* Palco de cena presa: o filho gruda por uma viewport enquanto o pai alto
   rola, e a própria rolagem do pai é a linha do tempo da animação.
   Aplicar sticky-stage no FILHO e view-timeline no PAI alto. */
@utility sticky-stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  display: grid;
  place-items: center;
  overflow: clip;
}

/* Toda cena escala pelo viewBox e nunca estoura a coluna. */
@utility scene-svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 44rem;
  margin-inline: auto;
}
```

- [ ] **Passo 4: Documentar o contrato de cena no CSS**

Acima das utilitárias acima, o comentário que o próximo agente vai ler antes de escrever qualquer cena:

```css
/* ===================================================================
   CONTRATO DE CENA (spec §5) — leia antes de animar qualquer coisa.

   O CSS base de um elemento de cena é o ESTADO FINAL legível. A animação
   mora SÓ dentro da dupla guarda abaixo:

     @supports (animation-timeline: view()) {
       @media (prefers-reduced-motion: no-preference) { ... }
     }

   Assim o navegador sem scroll-driven animations, o usuário com
   reduced-motion, o crawler e a impressão veem a cena montada.
   Escrever o estado INICIAL no CSS base quebra os quatro de uma vez.
   =================================================================== */
```

- [ ] **Passo 5: Mostrar o token novo no styleguide**

Em `src/pages/styleguide.astro`, adicione `brutal-orange` à grade de swatches, ao lado de `brutal-pink`, com a legenda "fundo e decoração — não é cor de texto".

- [ ] **Passo 6: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(estilo): palco de cena e bloco de capitulo"
```

---

### Task 4: Capítulo 1 — Hero

**Files:**
- Create: `src/components/chapters/Hero.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["hero"]` (Task 2), `chapter-block` (Task 3).
- Produces: `<Hero t={t.hero} />`. Todo capítulo seguinte usa esta mesma assinatura: uma prop `t` com a fatia do dicionário.

- [ ] **Passo 1: Escrever o capítulo**

`src/components/chapters/Hero.astro`:

```astro
---
import type { Dict } from "../../i18n";

interface Props {
  t: Dict["hero"];
}

const { t } = Astro.props;
// O nome vira um span por letra para escalonar a queda. Espaço vira separador
// real (não &nbsp;) para o leitor de tela ler "Gabriel Gobbi", não as letras.
const letters = [...t.name];
---

<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title" class="hero__name font-display uppercase">
    <span class="sr-only">{t.name}</span>
    <span aria-hidden="true">
      {letters.map((ch, i) => (
        <span class="hero__letter" style={`--i:${i}`}>{ch === " " ? " " : ch}</span>
      ))}
    </span>
  </h1>

  <p class="hero__role font-display uppercase">{t.role}</p>
  <p class="hero__focus">{t.focus}</p>

  <span class="hero__sweep" aria-hidden="true"></span>
  <p class="hero__hint" aria-hidden="true">{t.scrollHint} ↓</p>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    padding-inline: clamp(1rem, 4vw, 4rem);
    overflow: clip;
  }

  .hero__name {
    font-size: clamp(3rem, 18vw, 16rem);
    line-height: 0.85;
    letter-spacing: -0.03em;
  }

  /* Estado final: letra no lugar. O contrato de cena manda que seja assim. */
  .hero__letter {
    display: inline-block;
    transform: none;
    opacity: 1;
  }

  .hero__role {
    font-size: clamp(1.25rem, 4vw, 2.5rem);
  }

  .hero__focus {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--color-brutal-magenta);
  }

  .hero__sweep {
    position: absolute;
    inset-inline: 0;
    bottom: 18%;
    height: 1.25rem;
    background-color: var(--color-brutal-yellow);
    border-block: var(--border-brutal-width) solid var(--color-brutal-black);
    transform: none;
  }

  .hero__hint {
    position: absolute;
    bottom: 2rem;
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
  }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .hero__letter {
        animation: letter-drop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) both;
        /* Escalonamento por índice: a primeira letra cai primeiro. Não é
           scroll-driven — o hero está na tela desde o carregamento. */
        animation-delay: calc(var(--i) * 60ms);
      }

      .hero__sweep {
        animation: sweep-in linear both;
        animation-timeline: view();
        animation-range: entry 0% cover 40%;
      }

      @keyframes letter-drop {
        from { transform: translateY(-0.4em) rotate(-4deg); opacity: 0; }
      }

      @keyframes sweep-in {
        from { transform: scaleX(0); transform-origin: left; }
      }
    }
  }
</style>
```

- [ ] **Passo 2: Montar nas duas páginas**

Em `src/pages/index.astro` e `src/pages/en/index.astro`, troque o `<h1>` provisório por `<Hero t={t.hero} />` e importe o componente (`../components/chapters/Hero.astro` na PT, `../../components/chapters/Hero.astro` na EN).

- [ ] **Passo 3: Verificar as três leituras da cena**

```bash
npm run build && npm run preview
```

No navegador, com DevTools:
1. Normal: as letras caem escalonadas, a barra amarela varre da esquerda.
2. Rendering → "Emulate prefers-reduced-motion: reduce": nome inteiro e barra **já montados**, sem movimento.
3. `document.querySelector('.hero__letter').getBoundingClientRect()` com reduced-motion: `height > 0` e `top` dentro da viewport — prova que o estado base é o final, não o inicial.

- [ ] **Passo 4: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(hero): capitulo 1 com letras em queda"
```

---

### Task 5: Capítulo 2 — Quem sou

**Files:**
- Create: `src/components/chapters/About.astro`, `src/components/scenes/PortraitScene.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["about"]`, `chapter-block`, `scene-svg`.
- Produces: `<About t={t.about} />`; `<PortraitScene />` (sem props — cena pura).

- [ ] **Passo 1: Escrever a cena**

`src/components/scenes/PortraitScene.astro` — retrato de 6 formas chapadas que se montam:

```astro
---
// Retrato geométrico: 6 formas entram de direções diferentes e travam no
// lugar. Estilo chapado, sem gradiente e sem traço fino — o mesmo
// vocabulário do resto do site.
---

<svg
  class="scene-svg portrait"
  viewBox="0 0 320 320"
  role="presentation"
  aria-hidden="true"
  focusable="false"
>
  <rect class="portrait__p" style="--i:0" x="60" y="200" width="200" height="100" fill="var(--color-brutal-blue)" stroke="var(--color-brutal-black)" stroke-width="4" />
  <circle class="portrait__p" style="--i:1" cx="160" cy="140" r="70" fill="var(--color-brutal-bone)" stroke="var(--color-brutal-black)" stroke-width="4" />
  <path class="portrait__p" style="--i:2" d="M90 120 Q160 40 230 120 L230 92 Q160 30 90 92 Z" fill="var(--color-brutal-black)" />
  <rect class="portrait__p" style="--i:3" x="108" y="130" width="44" height="32" fill="none" stroke="var(--color-brutal-black)" stroke-width="5" />
  <rect class="portrait__p" style="--i:4" x="168" y="130" width="44" height="32" fill="none" stroke="var(--color-brutal-black)" stroke-width="5" />
  <rect class="portrait__p" style="--i:5" x="140" y="188" width="40" height="10" fill="var(--color-brutal-orange)" stroke="var(--color-brutal-black)" stroke-width="3" />
</svg>

<style>
  /* Estado final (contrato de cena): tudo no lugar, tudo visível. */
  .portrait__p {
    transform: none;
    opacity: 1;
  }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .portrait__p {
        transform-box: fill-box;
        transform-origin: center;
        animation: portrait-assemble linear both;
        animation-timeline: view();
        /* Cada forma cobre uma fatia diferente do range: o retrato se monta
           conforme a seção sobe, não tudo de uma vez. */
        animation-range: entry calc(10% + var(--i) * 8%) cover calc(40% + var(--i) * 6%);
      }

      @keyframes portrait-assemble {
        from { transform: translateY(2rem) scale(0.8); opacity: 0; }
      }
    }
  }
</style>
```

- [ ] **Passo 2: Escrever o capítulo**

`src/components/chapters/About.astro`:

```astro
---
import type { Dict } from "../../i18n";
import PortraitScene from "../scenes/PortraitScene.astro";

interface Props {
  t: Dict["about"];
}

const { t } = Astro.props;
---

<section class="chapter-block chapter" aria-labelledby="about-title">
  <div class="chapter__text">
    <h2 id="about-title" class="font-display uppercase">{t.heading}</h2>
    <p>{t.body}</p>
  </div>
  <div class="chapter__scene"><PortraitScene /></div>
</section>

<style>
  .chapter {
    display: grid;
    gap: 2rem;
    padding: clamp(1.5rem, 5vw, 4rem);
    margin: clamp(1rem, 4vw, 3rem);
  }

  .chapter h2 {
    font-size: clamp(2rem, 6vw, 4rem);
  }

  .chapter p {
    max-width: 52ch;
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    line-height: 1.6;
  }

  /* Coluna única no celular; duas colunas a partir de 768px (spec §9). */
  @media (min-width: 48rem) {
    .chapter {
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }
  }
</style>
```

- [ ] **Passo 3: Montar nas duas páginas**

`<About t={t.about} />` logo depois do `<Hero>`, nos dois arquivos de página.

- [ ] **Passo 4: Verificar**

```bash
npm run build && npm run preview
```

Normal: as 6 formas entram escalonadas ao rolar. Com reduced-motion: retrato completo e parado. Em 390px: texto acima, retrato abaixo, sem scroll horizontal.

- [ ] **Passo 5: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(about): capitulo 2 com retrato geometrico"
```

---

### Task 6: Capítulo 3 — Stack, com o celular do Flutter

**Files:**
- Create: `src/components/chapters/Stack.astro`, `src/components/scenes/FlutterPhoneScene.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["stack"]`, `sticky-stage`, `scene-svg`.
- Produces: `<Stack t={t.stack} />`; `<FlutterPhoneScene />`.

- [ ] **Passo 1: Escrever a cena do celular**

`src/components/scenes/FlutterPhoneScene.astro` — as 3 lâminas do logo se montam, o spinner gira, a tela troca no "hot reload":

```astro
---
// Celular com splash do Flutter. As lâminas do logo são formas próprias
// (releitura geométrica), não o asset oficial — não hospedamos marca de
// terceiro nem dependemos de CDN alheia (CLAUDE.md §4).
---

<svg
  class="scene-svg phone"
  viewBox="0 0 260 420"
  role="presentation"
  aria-hidden="true"
  focusable="false"
>
  <rect x="30" y="10" width="200" height="400" rx="20" fill="var(--color-brutal-black)" />
  <rect x="42" y="34" width="176" height="352" fill="var(--color-brutal-paper)" />

  <g class="phone__splash">
    <rect x="42" y="34" width="176" height="352" fill="var(--color-brutal-blue)" />
    <g class="phone__logo">
      <path class="phone__blade" style="--i:0" d="M150 100 L92 158 L112 178 L190 100 Z" fill="var(--color-brutal-paper)" />
      <path class="phone__blade" style="--i:1" d="M150 186 L112 224 L150 262 L190 224 Z" fill="var(--color-brutal-paper)" />
      <path class="phone__blade" style="--i:2" d="M150 186 L190 186 L150 226 Z" fill="var(--color-brutal-bone)" />
    </g>
    <circle
      class="phone__spinner"
      cx="130" cy="320" r="18"
      fill="none"
      stroke="var(--color-brutal-paper)"
      stroke-width="5"
      stroke-dasharray="28 85"
      stroke-linecap="butt"
    />
  </g>

  <g class="phone__app">
    <rect x="42" y="34" width="176" height="60" fill="var(--color-brutal-yellow)" stroke="var(--color-brutal-black)" stroke-width="3" />
    <rect x="58" y="116" width="144" height="18" fill="var(--color-brutal-ink)" />
    <rect x="58" y="146" width="104" height="18" fill="var(--color-brutal-ink)" />
    <rect x="58" y="186" width="144" height="84" fill="var(--color-brutal-orange)" stroke="var(--color-brutal-black)" stroke-width="3" />
    <rect x="58" y="292" width="144" height="18" fill="var(--color-brutal-ink)" />
  </g>
</svg>

<style>
  /* Estado final: o app montado, o splash já saiu de cena. */
  .phone__splash { opacity: 0; }
  .phone__app { opacity: 1; }
  .phone__blade { transform: none; opacity: 1; }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .phone__blade {
        transform-box: fill-box;
        transform-origin: center;
        animation: blade-assemble linear both;
        animation-timeline: view();
        animation-range: entry 15% cover 35%;
        animation-delay: calc(var(--i) * -0.08s);
      }

      .phone__splash {
        animation: splash-out linear both;
        animation-timeline: view();
        animation-range: cover 45% cover 60%;
      }

      .phone__app {
        animation: app-in linear both;
        animation-timeline: view();
        animation-range: cover 45% cover 62%;
      }

      /* O spinner é tempo, não scroll: ele gira enquanto o splash existe. */
      .phone__spinner {
        transform-box: fill-box;
        transform-origin: center;
        animation: spin 1.1s linear infinite;
      }

      @keyframes blade-assemble {
        from { transform: translate(-1.5rem, -1.5rem) scale(0.6); opacity: 0; }
      }

      @keyframes splash-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes app-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    }
  }
</style>
```

- [ ] **Passo 2: Escrever o capítulo com palco preso**

`src/components/chapters/Stack.astro`:

```astro
---
import type { Dict } from "../../i18n";
import FlutterPhoneScene from "../scenes/FlutterPhoneScene.astro";

interface Props {
  t: Dict["stack"];
}

const { t } = Astro.props;
---

<section class="stack" aria-labelledby="stack-title">
  <div class="stack__stage sticky-stage">
    <div class="stack__grid">
      <div>
        <h2 id="stack-title" class="font-display uppercase">{t.heading}</h2>
        <ul class="stack__list">
          {t.items.map((item) => (
            <li class="stack__item">
              <span class="font-display uppercase">{item.name}</span>
              <span class="stack__note">{item.note}</span>
            </li>
          ))}
        </ul>
      </div>
      <FlutterPhoneScene />
    </div>
  </div>
</section>

<style>
  /* Pai alto = a linha do tempo. O filho sticky fica preso uma viewport
     enquanto esses 200vh extras rolam. */
  .stack {
    min-height: 220vh;
  }

  .stack__grid {
    display: grid;
    gap: 2rem;
    align-items: center;
    width: min(72rem, 92vw);
  }

  .stack__list {
    display: grid;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .stack__item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem;
    border-bottom: var(--border-brutal-width) solid var(--color-brutal-black);
    padding-block: 0.4rem;
  }

  .stack__note {
    font-size: 0.875rem;
    opacity: 0.75;
  }

  .stack h2 {
    font-size: clamp(2rem, 6vw, 4rem);
  }

  .stack :global(.phone) {
    max-width: 16rem;
  }

  @media (min-width: 48rem) {
    .stack__grid {
      grid-template-columns: 1.2fr 0.8fr;
    }
  }

  /* No celular o palco preso rouba a rolagem sem entregar nada: a cena fica
     pequena demais ao lado do texto. Vira seção normal. */
  @media (max-width: 47.99rem) {
    .stack { min-height: auto; }
    .stack__stage { position: static; height: auto; padding-block: 3rem; }
  }
</style>
```

- [ ] **Passo 3: Montar nas duas páginas**

`<Stack t={t.stack} />` depois de `<About>`.

- [ ] **Passo 4: Verificar**

```bash
npm run build && npm run preview
```

Normal: o celular fica preso no centro, as lâminas montam, o spinner gira, e a tela troca para o app perto do fim. Reduced-motion: o celular aparece **já com o app** (splash invisível), parado. 390px: sem sticky, a cena aparece uma vez, nenhum scroll horizontal.

- [ ] **Passo 5: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(stack): capitulo 3 com celular do flutter"
```

---

### Task 7: Capítulo 4 — Responsividade que se prova sozinha

**Files:**
- Create: `src/components/chapters/Responsive.astro`, `src/components/scenes/ResizeScene.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["responsive"]`, `sticky-stage`.
- Produces: `<Responsive t={t.responsive} />`; `<ResizeScene labels={string[]} />`.

- [ ] **Passo 1: Escrever a cena — HTML, não SVG**

`src/components/scenes/ResizeScene.astro`. A cena é HTML de propósito: SVG não reflui, e o ponto aqui é o **conteúdo interno refluindo de verdade** quando a moldura encolhe. `auto-fit` + `minmax` faz 3→2→1 coluna sozinho, sem media query e sem JS:

```astro
---
interface Props {
  /** Rótulos dos 3 tamanhos, vindos do dicionário. */
  labels: readonly string[];
}

const { labels } = Astro.props;
---

<div class="resize" aria-hidden="true">
  <div class="resize__frame">
    <div class="resize__bar">
      <span></span><span></span><span></span>
    </div>
    <div class="resize__content">
      {Array.from({ length: 6 }, (_, i) => <div class="resize__card" style={`--i:${i}`}></div>)}
    </div>
  </div>
  <p class="resize__labels">{labels.join(" · ")}</p>
</div>

<style>
  .resize {
    width: 100%;
    display: grid;
    justify-items: center;
    gap: 1rem;
  }

  /* Estado final: a moldura no tamanho de celular, com o conteúdo em
     1 coluna. Sem animação, é isso que se vê — e continua fazendo sentido
     ao lado do texto. */
  .resize__frame {
    width: 18rem;
    max-width: 100%;
    border: var(--border-brutal-width) solid var(--color-brutal-black);
    box-shadow: var(--shadow-brutal-md);
    background-color: var(--color-brutal-paper);
  }

  .resize__bar {
    display: flex;
    gap: 0.4rem;
    padding: 0.5rem;
    border-bottom: var(--border-brutal-width) solid var(--color-brutal-black);
    background-color: var(--color-brutal-yellow);
  }

  .resize__bar span {
    width: 0.6rem;
    height: 0.6rem;
    border: 2px solid var(--color-brutal-black);
    border-radius: 999px;
  }

  /* O reflow de verdade: as colunas caem de 3 para 1 conforme a largura
     da moldura muda. Nenhuma media query, nenhum JS — é o mesmo mecanismo
     que sustenta o site inteiro. */
  .resize__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .resize__card {
    height: 3rem;
    border: 2px solid var(--color-brutal-black);
    background-color: var(--color-brutal-bone);
  }

  .resize__card:nth-child(3n) {
    background-color: var(--color-brutal-orange);
  }

  .resize__labels {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 0.75rem;
  }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .resize__frame {
        animation: frame-shrink linear both;
        animation-timeline: view();
        animation-range: entry 30% cover 85%;
      }

      /* Largura animada, não transform: scale achataria os cards junto.
         Aqui o layout recalcula de verdade a cada frame — é o ponto da cena. */
      @keyframes frame-shrink {
        0%   { width: 38rem; }
        55%  { width: 26rem; }
        100% { width: 18rem; }
      }
    }
  }
</style>
```

- [ ] **Passo 2: Escrever o capítulo**

`src/components/chapters/Responsive.astro`:

```astro
---
import type { Dict } from "../../i18n";
import ResizeScene from "../scenes/ResizeScene.astro";

interface Props {
  t: Dict["responsive"];
}

const { t } = Astro.props;
---

<section class="responsive" aria-labelledby="responsive-title">
  <div class="sticky-stage">
    <div class="responsive__grid">
      <div>
        <h2 id="responsive-title" class="font-display uppercase">{t.heading}</h2>
        <p>{t.body}</p>
      </div>
      <ResizeScene labels={t.screens} />
    </div>
  </div>
</section>

<style>
  .responsive { min-height: 200vh; }

  .responsive__grid {
    display: grid;
    gap: 2rem;
    align-items: center;
    width: min(72rem, 92vw);
  }

  .responsive h2 { font-size: clamp(2rem, 6vw, 4rem); }

  .responsive p {
    max-width: 48ch;
    line-height: 1.6;
    margin-top: 1rem;
  }

  @media (min-width: 48rem) {
    .responsive__grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 47.99rem) {
    .responsive { min-height: auto; }
    .responsive :global(.sticky-stage) { position: static; height: auto; padding-block: 3rem; }
  }
</style>
```

- [ ] **Passo 3: Montar nas duas páginas**

`<Responsive t={t.responsive} />` depois de `<Stack>`.

- [ ] **Passo 4: Verificar o reflow, não só o movimento**

```bash
npm run build && npm run preview
```

Role até a cena e pare no meio: os cards devem estar em **2 colunas** no meio do caminho e em **1** no fim. Se ficarem sempre em 3 (ou sempre em 1), a largura não está animando — verifique se `width` está nos `@keyframes` e não um `transform: scale`. Reduced-motion: moldura estreita, 1 coluna, parada.

- [ ] **Passo 5: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(responsivo): capitulo 4 com moldura que reflui"
```

---

### Task 8: Capítulo 5 — Experiência em timeline horizontal

**Files:**
- Create: `src/components/chapters/Experience.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["experience"]`, `sticky-stage`, `chapter-block`.
- Produces: `<Experience t={t.experience} />`.

- [ ] **Passo 1: Escrever o capítulo**

`src/components/chapters/Experience.astro`. É o único ponto onde a spec admitia GSAP; a `view-timeline` nomeada resolve sem JS:

```astro
---
import type { Dict } from "../../i18n";

interface Props {
  t: Dict["experience"];
}

const { t } = Astro.props;
---

<section class="exp" aria-labelledby="exp-title">
  <div class="exp__stage sticky-stage">
    <h2 id="exp-title" class="exp__title font-display uppercase">{t.heading}</h2>
    <ol class="exp__track">
      {t.jobs.map((job) => (
        <li class="exp__card chapter-block">
          <p class="exp__period font-display uppercase">{job.period}</p>
          <h3 class="exp__company font-display uppercase">{job.company}</h3>
          <p class="exp__role">{job.role}</p>
          <p class="exp__note">{job.note}</p>
        </li>
      ))}
    </ol>
  </div>
</section>

<style>
  /* Altura do pai = quanto de rolagem vertical vira deslocamento horizontal. */
  .exp {
    min-height: 320vh;
    view-timeline: --exp block;
  }

  .exp__stage {
    grid-template-rows: auto 1fr;
    align-content: center;
    gap: 2rem;
    padding-inline: clamp(1rem, 4vw, 4rem);
  }

  .exp__title { font-size: clamp(2rem, 6vw, 4rem); }

  /* Estado final: a trilha parada no começo, com os 3 cards em fila.
     Sem animação o visitante rola a lista com o próprio dedo/roda
     (overflow-x: auto), então nada fica inacessível. */
  .exp__track {
    display: flex;
    gap: clamp(1rem, 3vw, 2.5rem);
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-x: auto;
    transform: none;
  }

  .exp__card {
    flex: 0 0 min(26rem, 80vw);
    padding: clamp(1.25rem, 3vw, 2rem);
  }

  .exp__period { font-size: 0.8rem; color: var(--color-brutal-magenta); letter-spacing: 0.1em; }
  .exp__company { font-size: clamp(1.5rem, 3vw, 2.25rem); margin-top: 0.5rem; }
  .exp__role { font-weight: 700; margin-top: 0.25rem; }
  .exp__note { margin-top: 0.75rem; line-height: 1.6; }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      @media (min-width: 48rem) {
        .exp__track {
          /* A trilha passa a ser dirigida pela rolagem: nada de barra
             horizontal própria enquanto a animação manda nela. */
          overflow-x: visible;
          animation: exp-slide linear both;
          animation-timeline: --exp;
          animation-range: contain 0% contain 100%;
        }

        /* -100% + 100vw deixa o último card parando na borda direita,
           em vez de sair da tela. */
        @keyframes exp-slide {
          to { transform: translateX(calc(-100% + 92vw)); }
        }
      }
    }
  }

  /* No celular a timeline é vertical: palco preso em tela pequena prende
     o polegar sem entregar história (spec §9). */
  @media (max-width: 47.99rem) {
    .exp { min-height: auto; }
    .exp__stage { position: static; height: auto; padding-block: 3rem; }
    .exp__track { flex-direction: column; overflow-x: visible; }
    .exp__card { flex: 1 1 auto; }
  }
</style>
```

- [ ] **Passo 2: Montar nas duas páginas**

`<Experience t={t.experience} />` depois de `<Responsive>`.

- [ ] **Passo 3: Verificar, inclusive o plano B**

```bash
npm run build && npm run preview
```

Desktop: os 3 cards deslizam da direita para a esquerda enquanto a página rola; o terceiro para dentro da viewport (não some). Reduced-motion: os cards ficam em fila com barra de rolagem horizontal própria — **todos alcançáveis**. Celular: lista vertical.

**Se o deslize não acontecer** (navegador sem `view-timeline` nomeada), o fallback acima já é aceitável e a tarefa está cumprida. Só então considere o plano B da spec §5: `await import("../lib/gsap")` com `ScrollTrigger` e `kill()` no cleanup — e registre no `STATE.md` que o orçamento de JS subiu.

- [ ] **Passo 4: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(experiencia): capitulo 5 em timeline horizontal"
```

---

### Task 9: Capítulo 6 — Como trabalho

**Files:**
- Create: `src/components/chapters/HowIWork.astro`, `src/components/scenes/TeamScene.astro`, `src/components/scenes/GearScene.astro`, `src/components/scenes/LockScene.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Dict["howIWork"]`, `chapter-block`, `scene-svg`.
- Produces: `<HowIWork t={t.howIWork} />`; três cenas sem props. A ordem de `t.traits` casa com a ordem das cenas: `[TeamScene, GearScene, LockScene]`.

- [ ] **Passo 1: Escrever a cena dos dois bonecos**

`src/components/scenes/TeamScene.astro` — um estende o braço, o outro sobe o bloco:

```astro
---
// Dois bonecos: o da esquerda gira o braço até a mão do outro; o bloco
// sobe junto. É o "trabalho em equipe" do currículo, mostrado.
---

<svg class="scene-svg team" viewBox="0 0 320 200" role="presentation" aria-hidden="true" focusable="false">
  <rect x="0" y="176" width="320" height="6" fill="var(--color-brutal-black)" />

  <g>
    <circle cx="70" cy="66" r="20" fill="var(--color-brutal-yellow)" stroke="var(--color-brutal-black)" stroke-width="4" />
    <rect x="52" y="92" width="36" height="66" fill="var(--color-brutal-blue)" stroke="var(--color-brutal-black)" stroke-width="4" />
    <line class="team__arm" x1="88" y1="104" x2="132" y2="104" stroke="var(--color-brutal-black)" stroke-width="7" stroke-linecap="round" />
  </g>

  <g>
    <circle cx="250" cy="66" r="20" fill="var(--color-brutal-orange)" stroke="var(--color-brutal-black)" stroke-width="4" />
    <rect x="232" y="92" width="36" height="66" fill="var(--color-brutal-bone)" stroke="var(--color-brutal-black)" stroke-width="4" />
    <line x1="232" y1="104" x2="188" y2="104" stroke="var(--color-brutal-black)" stroke-width="7" stroke-linecap="round" />
  </g>

  <rect class="team__block" x="140" y="84" width="40" height="40" fill="var(--color-brutal-pink)" stroke="var(--color-brutal-black)" stroke-width="4" />
</svg>

<style>
  /* Estado final: braço erguido, bloco no alto, entregue. */
  .team__arm { transform: none; }
  .team__block { transform: none; opacity: 1; }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .team__arm {
        transform-box: fill-box;
        transform-origin: left center;
        animation: arm-reach linear both;
        animation-timeline: view();
        animation-range: entry 20% cover 55%;
      }

      .team__block {
        transform-box: fill-box;
        transform-origin: center;
        animation: block-lift linear both;
        animation-timeline: view();
        animation-range: entry 25% cover 60%;
      }

      @keyframes arm-reach { from { transform: rotate(34deg); } }
      @keyframes block-lift { from { transform: translateY(2.6rem); opacity: 0; } }
    }
  }
</style>
```

- [ ] **Passo 2: Escrever a engrenagem**

`src/components/scenes/GearScene.astro`:

```astro
---
// Engrenagem de troubleshooting: 8 dentes gerados como retângulos girados
// em volta do eixo. Forma chapada, mesmo vocabulário das outras cenas.
const TEETH = Array.from({ length: 8 }, (_, i) => i * 45);
---

<svg class="scene-svg gear" viewBox="0 0 200 200" role="presentation" aria-hidden="true" focusable="false">
  <g class="gear__body">
    {TEETH.map((deg) => (
      <rect
        x="90" y="16" width="20" height="26"
        fill="var(--color-brutal-black)"
        transform={`rotate(${deg} 100 100)`}
      />
    ))}
    <circle cx="100" cy="100" r="62" fill="var(--color-brutal-lime)" stroke="var(--color-brutal-black)" stroke-width="5" />
    <circle cx="100" cy="100" r="22" fill="var(--color-brutal-paper)" stroke="var(--color-brutal-black)" stroke-width="5" />
  </g>
</svg>

<style>
  .gear__body { transform: none; }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .gear__body {
        transform-box: fill-box;
        transform-origin: center;
        animation: gear-turn linear both;
        animation-timeline: view();
        animation-range: entry 0% exit 100%;
      }

      @keyframes gear-turn {
        from { transform: rotate(-90deg); }
        to { transform: rotate(90deg); }
      }
    }
  }
</style>
```

- [ ] **Passo 3: Escrever o cadeado**

`src/components/scenes/LockScene.astro`:

```astro
---
// Cadeado da pós em Cybersegurança: a haste desce e fecha.
---

<svg class="scene-svg lock" viewBox="0 0 200 200" role="presentation" aria-hidden="true" focusable="false">
  <path
    class="lock__shackle"
    d="M70 96 L70 64 A30 30 0 0 1 130 64 L130 96"
    fill="none"
    stroke="var(--color-brutal-black)"
    stroke-width="12"
  />
  <rect x="52" y="96" width="96" height="76" fill="var(--color-brutal-magenta)" stroke="var(--color-brutal-black)" stroke-width="5" />
  <circle cx="100" cy="128" r="10" fill="var(--color-brutal-paper)" />
  <rect x="95" y="132" width="10" height="22" fill="var(--color-brutal-paper)" />
</svg>

<style>
  /* Estado final: cadeado fechado. */
  .lock__shackle { transform: none; }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .lock__shackle {
        transform-box: fill-box;
        transform-origin: center bottom;
        animation: shackle-close linear both;
        animation-timeline: view();
        animation-range: entry 25% cover 55%;
      }

      @keyframes shackle-close { from { transform: translateY(-1.5rem) rotate(-12deg); } }
    }
  }
</style>
```

- [ ] **Passo 4: Escrever o capítulo**

`src/components/chapters/HowIWork.astro`:

```astro
---
import type { Dict } from "../../i18n";
import TeamScene from "../scenes/TeamScene.astro";
import GearScene from "../scenes/GearScene.astro";
import LockScene from "../scenes/LockScene.astro";

interface Props {
  t: Dict["howIWork"];
}

const { t } = Astro.props;
// A ordem aqui casa com a ordem de t.traits no dicionário. Se um trait for
// adicionado, a cena correspondente entra nesta lista na mesma posição.
const scenes = [TeamScene, GearScene, LockScene];
---

<section class="how" aria-labelledby="how-title">
  <h2 id="how-title" class="font-display uppercase">{t.heading}</h2>
  <ul class="how__grid">
    {t.traits.map((trait, i) => {
      const Scene = scenes[i];
      return (
        <li class="how__card chapter-block">
          {Scene && <Scene />}
          <h3 class="font-display uppercase">{trait.title}</h3>
          <p>{trait.body}</p>
        </li>
      );
    })}
  </ul>
</section>

<style>
  .how {
    padding: clamp(1.5rem, 5vw, 4rem);
    margin: clamp(1rem, 4vw, 3rem);
  }

  .how h2 { font-size: clamp(2rem, 6vw, 4rem); margin-bottom: 2rem; }

  .how__grid {
    display: grid;
    gap: 2rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .how__card { padding: clamp(1.25rem, 3vw, 2rem); }
  .how__card h3 { font-size: 1.5rem; margin-top: 1rem; }
  .how__card p { margin-top: 0.5rem; line-height: 1.6; }
  .how__card :global(.scene-svg) { max-width: 12rem; }

  @media (min-width: 48rem) {
    .how__grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>
```

- [ ] **Passo 5: Montar nas duas páginas**

`<HowIWork t={t.howIWork} />` depois de `<Experience>`.

- [ ] **Passo 6: Verificar**

Normal: braço sobe e bloco é entregue; engrenagem gira conforme a seção atravessa a tela; haste do cadeado desce e fecha. Reduced-motion: os três parados no estado final (braço no alto, cadeado fechado). 390px: 3 cards empilhados.

- [ ] **Passo 7: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat(trabalho): capitulo 6 com equipe, engrenagem e cadeado"
```

---

### Task 10: Capítulo 7 — Contato e o easter egg armado a 100%

**Files:**
- Create: `src/lib/konami.ts`, `src/lib/konami.check.ts`, `src/components/chapters/Contact.astro`
- Modify: `package.json`, `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `src/lib/konami.check.ts`

**Interfaces:**
- Consumes: `Dict["contact"]`.
- Produces:
  - `KONAMI: readonly string[]` (10 teclas, minúsculas)
  - `interface KonamiState { readonly armed: boolean; readonly buffer: readonly string[] }`
  - `IDLE: KonamiState`
  - `arm(state: KonamiState): KonamiState`
  - `press(state: KonamiState, key: string): KonamiState`
  - `isUnlocked(state: KonamiState): boolean`
  - `<Contact t={t.contact} />`

- [ ] **Passo 1: Escrever o check que falha**

`src/lib/konami.check.ts` — cobre os itens 1, 2 e 3 do Review Focus:

```ts
// Check runnable do segredo (CLAUDE.md §2). Roda no Node, fora do astro
// check: `npm run check:konami`.
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
  assert.equal(isUnlocked(arm(afterTyping)), false, "armar não pode reaproveitar tecla antiga");
}

// 2. Sequência correta depois de armar abre.
{
  assert.equal(isUnlocked(type(arm(IDLE), KONAMI)), true, "sequência correta não abriu");
}

// 3. Prefixo repetido ainda abre: o terceiro ArrowUp não invalida os dois
//    anteriores. É por isso que o redutor é janela deslizante e não índice.
{
  const noisy = ["arrowup", ...KONAMI];
  assert.equal(isUnlocked(type(arm(IDLE), noisy)), true, "prefixo repetido invalidou a sequência");
}

// 4. Tecla errada no meio derruba a tentativa.
{
  const wrong = [...KONAMI.slice(0, 5), "x", ...KONAMI.slice(5)];
  assert.equal(isUnlocked(type(arm(IDLE), wrong)), false, "tecla errada não derrubou a sequência");
}

// 5. Caixa e nome da tecla não importam: CapsLock não pode quebrar o segredo.
{
  const shouted = KONAMI.map((k) => (k.startsWith("arrow") ? "Arrow" + k.slice(5, 6).toUpperCase() + k.slice(6) : k.toUpperCase()));
  assert.equal(isUnlocked(type(arm(IDLE), shouted)), true, "maiúsculas quebraram a sequência");
}

// 6. Lixo depois de completar não pode manter a porta aberta.
{
  const overrun = type(arm(IDLE), [...KONAMI, "z"]);
  assert.equal(isUnlocked(overrun), false, "buffer continuou válido depois de tecla extra");
}

console.log("konami.check.ts OK");
```

Adicione o script em `package.json`:

```json
    "check:konami": "node --experimental-strip-types src/lib/konami.check.ts",
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
npm run check:konami
```

Esperado: `ERR_MODULE_NOT_FOUND` apontando `./konami.ts`.

- [ ] **Passo 3: Escrever o redutor**

`src/lib/konami.ts`:

```ts
// Máquina de estado do segredo (spec §8). Pura e sem DOM: o componente só
// liga teclado e sentinela nela, e o check roda no Node.
//
// Janela deslizante em vez de contador de índice: com índice, ↑↑↑↓↓←→←→BA
// falharia — o terceiro ↑ zeraria a contagem em vez de cair para o prefixo
// válido de tamanho 2. Comparar os últimos 10 é menos código e correto em
// todos os casos.

export const KONAMI = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
] as const;

export interface KonamiState {
  /** Só vira true quando o visitante chega a 100% da rota. */
  readonly armed: boolean;
  readonly buffer: readonly string[];
}

export const IDLE: KonamiState = { armed: false, buffer: [] };

/** Chamado pela sentinela do fim da página. Zera o buffer: tecla digitada
 *  antes de ler o site não vale (Review Focus #1). */
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
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
npm run check:konami
```

Esperado: `konami.check.ts OK`, sem `AssertionError`.

- [ ] **Passo 5: Escrever o capítulo de contato**

`src/components/chapters/Contact.astro`. LinkedIn vazio não renderiza (spec §13):

```astro
---
import type { Dict } from "../../i18n";

interface Props {
  t: Dict["contact"];
}

const { t } = Astro.props;

const links = [
  { label: t.emailLabel, href: `mailto:${t.email}`, text: t.email },
  { label: t.githubLabel, href: t.github, text: "Gobbi1108" },
  // String vazia = link não existe. Melhor ausência que link morto.
  ...(t.linkedin ? [{ label: t.linkedinLabel, href: t.linkedin, text: "LinkedIn" }] : []),
];
---

<section class="contact chapter-block" aria-labelledby="contact-title">
  <h2 id="contact-title" class="font-display uppercase">
    {t.heading}<span class="contact__dot" data-secret-dot>.</span>
  </h2>
  <p class="contact__invite">{t.invite}</p>

  <ul class="contact__links">
    {links.map((link) => (
      <li>
        <span class="contact__label font-display uppercase">{link.label}</span>
        <a class="brutal-link" href={link.href}>{link.text}</a>
      </li>
    ))}
  </ul>

  {/* Sentinela do easter egg: entrar na viewport = o visitante chegou a 100%
      da rota. Só então o Konami passa a contar (spec §8). */}
  <div data-end-sentinel aria-hidden="true" style="height:1px"></div>
</section>

<script>
  import { IDLE, arm, press, isUnlocked } from "../../lib/konami";

  const sentinel = document.querySelector("[data-end-sentinel]");
  const dot = document.querySelector("[data-secret-dot]");
  let state = IDLE;

  if (sentinel) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      state = arm(state);
      dot?.setAttribute("data-armed", "true");
      observer.disconnect();
    });
    observer.observe(sentinel);
  }

  addEventListener("keydown", (event) => {
    state = press(state, event.key);
    if (isUnlocked(state)) location.href = "/void";
  });
</script>

<style>
  .contact {
    padding: clamp(1.5rem, 5vw, 4rem);
    margin: clamp(1rem, 4vw, 3rem);
  }

  .contact h2 { font-size: clamp(2rem, 6vw, 4rem); }

  /* O tell: o ponto muda para a cor do /void quando o segredo arma.
     Única aparição de --color-grid-active fora do easter egg (spec §6). */
  .contact__dot { color: var(--color-brutal-magenta); transition: color 400ms; }
  .contact__dot[data-armed="true"] { color: var(--color-grid-active); }

  @media (prefers-reduced-motion: reduce) {
    .contact__dot { transition: none; }
  }

  .contact__invite { margin-top: 1rem; font-size: clamp(1rem, 2vw, 1.5rem); }

  .contact__links {
    display: grid;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin-top: 2rem;
  }

  .contact__label {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    opacity: 0.7;
  }

  @media (min-width: 48rem) {
    .contact__links { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
  }
</style>
```

- [ ] **Passo 6: Montar nas duas páginas**

`<Contact t={t.contact} />` como último capítulo, nos dois arquivos.

- [ ] **Passo 7: Verificar o segredo no navegador**

```bash
npm run build && npm run preview
```

1. Sem rolar, digite `↑↑↓↓←→←→BA` → **nada acontece**, e o ponto continua magenta.
2. Role até o fim → o ponto vira verde `#007A33`.
3. Digite a sequência → vai para `/void`.
4. Repita em `/en/` → mesmo comportamento.
5. Meça o JS da rota: no painel Network, o total de script de `/` deve ficar **abaixo de 3KB** (só o módulo do Konami).

- [ ] **Passo 8: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build && npm run check:konami && npm run check:hotspots
git add -A
git commit -m "feat(contato): capitulo 7 e konami armado no fim"
```

---

### Task 11: Limpeza, harness e auditoria final

**Files:**
- Modify: `astro.config.mjs`, `package.json`, `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, `STATE.md`, `.gemini/styleguide.md`, `.gitignore`

- [ ] **Passo 1: Provar que React não é usado e remover**

```bash
grep -rn "from \"react\"\|from 'react'\|@astrojs/react\|client:" src/ || echo "nenhum consumidor de React"
```

Se a saída for `nenhum consumidor de React` (exceto a linha do `astro.config.mjs`), remova a integração do `astro.config.mjs` e desinstale:

```bash
npm uninstall react react-dom @astrojs/react @types/react @types/react-dom
```

Se a Task 8 tiver caído no plano B com GSAP, **mantenha o `gsap`**; caso contrário, `npm uninstall gsap` também. Registre a decisão no `STATE.md`.

- [ ] **Passo 2: Resolver os arquivos do Codex**

`AGENTS.md`, `.agents/` e `.codex/` estão fora do controle de versão. `AGENTS.md` é cópia do `CLAUDE.md` e vai divergir: dê a ele um cabeçalho de espelho na primeira linha —

```markdown
> **Espelho gerado.** A fonte é `CLAUDE.md`. Edite lá e copie para cá; nunca o contrário.
```

— e rastreie os três (`git add AGENTS.md .agents .codex`) ou coloque `.agents/` e `.codex/` no `.gitignore`. Escolha uma e escreva qual no `STATE.md`.

- [ ] **Passo 3: Atualizar o `CLAUDE.md`**

- §6: o título vira "Invariantes de interação do `/void`" e a primeira linha diz que esses números valem **só** para o easter egg.
- §6, item mobile: o placeholder `MOBILE` passa a valer só para `/void`; o portfólio é responsivo.
- Nova seção **§6.1 Contrato de cena**, com a regra da spec §5 (estado final no CSS base, animação sob dupla guarda) e o motivo em uma linha.
- §2: acrescente `npm run check:konami` à lista de comandos.

- [ ] **Passo 4: Reescrever o `ROADMAP.md`**

§1 passa a descrever o portfólio como produto e o `/void` como easter egg. Tabela de marcos:

| # | Marco | Estado |
|---|---|---|
| M1 | Fim da v1 | ✅ 2026-09-18 |
| M2 | Home dot-grid | ✅ 2026-09-18, movida para `/void` em 2026-09-22 |
| M3 | Portfólio v2 bilíngue, 7 capítulos | esta fase |
| M4 | Easter egg armado a 100% | esta fase |
| M5 | 404 + `error-hero` + `.htaccess` | próximo |
| M6 | Conteúdo real dos 5 destinos do `/void` | depois |

"Mobile real" **deixa de ser marco**. A `morph-gallery` sai da fila de prioridade (os destinos vivem atrás do segredo). §4 (placeholder mobile global) é reescrita para valer só em `/void`.

- [ ] **Passo 5: Atualizar `.gemini/styleguide.md`**

Acrescente as duas regras que o bot precisa checar em PR: o contrato de cena (§6.1 do `CLAUDE.md`) e a proibição de `--color-grid-active` fora de `/void` e do tell do Konami.

- [ ] **Passo 6: Auditoria no navegador**

Rode Lighthouse em `/` nos perfis **desktop e mobile**:

```bash
npm run build && npm run preview
```

Esperado: a11y 100, best-practices 100, SEO 100, **LCP medido** (não `null` — é o texto do hero). Anote os números no `STATE.md`. Confira o contraste do texto sobre `--color-brutal-orange` e sobre `--color-brutal-yellow` no painel de contraste; se algum falhar AA, troque o texto para `--color-brutal-black`.

- [ ] **Passo 7: Atualizar o `STATE.md`**

Data, branch, fase, o que foi entregue, arquivos novos, decisões tomadas durante a execução (React removido ou não, GSAP removido ou não, destino de `.agents/`/`.codex/`), a tabela de verificações no navegador e os números do Lighthouse. Acrescente a sessão ao histórico da §7.

- [ ] **Passo 8: Gates e commit**

```bash
npm run typecheck && npm run lint && npm run build && npm run check:konami && npm run check:hotspots
git add -A
git commit -m "chore(harness): atualizar roadmap, state e regras"
```

- [ ] **Passo 9: PR com revisão do bot**

Feature grande vai de PR, não de merge local (`CLAUDE.md` §9):

```bash
git push -u origin feat/portfolio-v2
gh pr create --title "Portfólio v2: scroll neobrutalista bilíngue + easter egg" --body "..."
```

Depois use a skill `babysit-pr` até o PR ficar verde.

---

## Autorrevisão do plano

**Cobertura da spec:** §3 rotas → Tasks 1-2 · §4 dicionários → Task 2 · §5 contrato de cena → Task 3 (documentado) e Tasks 4-9 (aplicado) · §6 sistema visual → Task 3 · §7 os 7 capítulos → Tasks 4-10 · §8 easter egg → Task 10 · §9 responsividade/a11y/performance → media queries nas Tasks 5-9 e auditoria na Task 11 · §10 fora de escopo → Task 11 passo 1 · §11 harness → Task 11 passos 2-5 · §12 definição de pronto → Global Constraints e último passo de cada tarefa · §13 LinkedIn vazio → Task 10 passo 5.

**Consistência de tipos:** `Dict` é definido na Task 2 e consumido com a mesma forma (`t: Dict["<chave>"]`) nas Tasks 4-10. As assinaturas do Konami declaradas nas Interfaces da Task 10 são as mesmas usadas no check (passo 1) e no componente (passo 5). `BaseLayout` ganha `lang`/`mobileGate`/`noindex`/`alternate` na Task 1 e é usado com esses nomes nas Tasks 1 e 2.

**Review Focus:** os 5 itens têm teste — #1, #2 e #3 no `konami.check.ts` (Task 10, passo 1), #4 no grep do build (Task 2, passo 8), #5 no `hotspots.check.ts` (Task 1, passo 1).
