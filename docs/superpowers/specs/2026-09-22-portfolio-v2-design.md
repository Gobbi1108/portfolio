# Portfólio v2 — Spec de Design

**Data:** 2026-09-22 · **Status:** aprovado pelo Gabriel em 2026-09-22 · **Branch:** `docs/portfolio-v2-spec`

Spec de referência para a reconstrução do portfólio. Substitui a visão de produto do
`ROADMAP.md` §1 (que descrevia o site como "só o mapa de exploração"). O que está aqui é
decisão fechada; o que ficou aberto está na §13, com regra de fallback definida.

---

## 1. Objetivo

Transformar o repositório — hoje um campo de pontos com 5 hotspots invisíveis — em um
**portfólio funcional de desenvolvedor frontend**, em scroll longo com storytelling
animado, estilo neobrutalista, referência de layout e ritmo em `decathlonyestalgia.com`
(referência de *estilo*, não de código: nada é clonado).

A tela atual (dot grid + cursor + hotspots) **não é descartada**: vira o easter egg do
site novo, alcançável por um segredo.

**Sucesso é:** um recrutador abre o link no celular, entende em 3 segundos que o Gabriel é
desenvolvedor frontend, rola até o fim sem travar, e encontra e-mail, GitHub e LinkedIn.
O easter egg é prêmio de quem explora, nunca requisito.

## 2. Decisões aprovadas (2026-09-22 — não reabrir sem pedido)

1. **Ilustrações em SVG inline animado por scroll.** Nada de PNG gerado por IA nas cenas:
   animação por scroll exige partes separadas, e raster pesa 100-300KB contra um orçamento
   de <100KB. Nano Banana (`gemini-2.5-flash-image` / `gemini-3-pro-image`) fica registrado
   como opção futura para textura de fundo e `og.png` — **fora desta fase**.
2. **Bilíngue PT-BR (padrão, em `/`) + EN (em `/en/`)**, com toggle.
3. **Contato público:** e-mail, GitHub, LinkedIn. **Telefone e endereço não vão ao ar.**
4. **Mobile responsivo de verdade** desde o primeiro capítulo. O placeholder `MOBILE`
   deixa de valer para o site e passa a existir só nas rotas do easter egg.
5. **Motor híbrido:** CSS scroll-driven animations (`animation-timeline`) como padrão;
   GSAP apenas onde o CSS provar insuficiente, por import dinâmico.
6. **Easter egg por Konami code**, e **só armado depois que o visitante chega a 100% da
   rota** (§8).
7. **Higgsfield não é usado.** Vídeo custa 1-3MB e mata o LCP; nenhuma cena precisa.
8. **Nada de clonar o site de referência** com ferramenta automática. Estilo é replicado
   à mão; código não é copiado.

## 3. Rotas e i18n

```js
// astro.config.mjs
i18n: {
  defaultLocale: "pt-br",
  locales: ["pt-br", "en"],
  routing: { prefixDefaultLocale: false }
}
```

| Rota | Conteúdo |
|---|---|
| `/` | Portfólio PT-BR — scroll longo, 7 capítulos |
| `/en/` | O mesmo, em inglês |
| `/void` | Home dot-grid atual, movida de `/`. `noindex`. |
| `/void/{jogos,roadmap,lab-a,lab-b,portfolio}` | Destinos atuais dos hotspots, movidos. `noindex`. |
| `/404` | Marco posterior (§11), fora desta fase |
| `/styleguide` | Mantida; atualizada com os tokens novos |

**Nada dentro de `/void` muda de comportamento.** `src/lib/dotGrid.ts`, `src/lib/cursorOrb.ts`
e `src/lib/hotspots.ts` ficam como estão; só os `href` em `hotspots.ts` ganham o prefixo
`/void`, e `hotspots.check.ts` passa a validar esse prefixo.

Links entre idiomas usam `getRelativeLocaleUrl()` de `astro:i18n`. O toggle é dois `<a>`
com `hreflang` — **sem JavaScript**. `<html lang>` reflete o locale da página, e cada página
declara `<link rel="alternate" hreflang>` para a irmã.

## 4. Camada de conteúdo

```
src/i18n/pt-br.ts   fonte da verdade — todas as strings e os dados do currículo
src/i18n/en.ts      const en: typeof ptBr = { ... }
src/i18n/index.ts   mapa locale -> dicionário, tipo Locale exportado
```

A paridade de chaves entre os dois idiomas é garantida **pelo compilador**: `en.ts` é
tipado como `typeof ptBr`, então chave faltando ou renomeada quebra `npm run typecheck`.
Não existe script de verificação para isso e não deve existir — seria repetir em runtime o
que o TypeScript já prova.

Dados neutros de idioma (anos, URLs, nomes de empresa e de tecnologia) aparecem no
dicionário PT e são repetidos idênticos no EN. Sem camada extra de "dados compartilhados"
enquanto forem ~30 linhas.

Nenhum componente de capítulo lê o dicionário inteiro: cada um recebe **só a sua fatia**,
como prop tipada.

## 5. Contrato de cena — a regra que rege toda animação

Regra única, obrigatória em toda cena animada:

> **O CSS base de qualquer elemento é o estado final legível. A animação só existe dentro
> da dupla guarda `@supports` + `@media (prefers-reduced-motion: no-preference)`.**

```css
/* estado final: é isto que o crawler, o navegador sem suporte,
   o usuário com reduced-motion e o print veem */
.scene-phone__blade { opacity: 1; transform: none; }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .scene-phone__blade {
      animation: blade-assemble linear both;
      animation-timeline: view();
      animation-range: entry 25% cover 55%;
    }
  }
}
```

Consequências, todas intencionais:

- **Nenhum conteúdo depende de animação para ser lido.** Se o motor não existir, o site
  continua um portfólio estático completo.
- `prefers-reduced-motion: reduce` não precisa de tratamento caso a caso — cai no mesmo
  caminho.
- Zero JavaScript para animar.

**GSAP** só entra se uma cena específica provar que CSS não resolve. Nesse caso:
`src/lib/gsap.ts` volta a existir como único ponto de `registerPlugin`, a cena importa por
`await import()` com a media query checada em JS, e o cleanup (`ScrollTrigger.kill()`) é
obrigatório. **Suposição registrada:** as 7 cenas desta spec são realizáveis só com CSS; a
cena 5 (timeline horizontal) é a mais provável de precisar de GSAP e é o único ponto onde o
orçamento de JS pode subir.

## 6. Sistema visual

Base herdada, já auditada em contraste AA na v1 — **reusar, não recriar**:
`--color-brutal-{black,ink,paper,bone,yellow,pink,magenta,blue,lime}`,
`--shadow-brutal-{sm,md,lg,xl}` e as invertidas, Archivo Black (display) + Inter (texto),
`@utility btn-brutal / card-brutal / brutal-link / border-brutal`.

Adições, todas em `src/styles/global.css`:

| Item | O que é |
|---|---|
| `@utility chapter-block` | Bloco full-bleed, borda 2px preta, sombra dura — o tijolo do capítulo |
| `@utility sticky-stage` | `position: sticky` + `height: 100dvh` + `view-timeline`: palco de cena presa |
| `--color-brutal-orange` | Accent quente que falta ao sistema. **Só entra depois de medir contraste** contra `paper` e `black`; se não passar AA como texto, fica restrito a fundo chapado e SVG decorativo, documentado com comentário no token (mesmo tratamento já dado ao `--color-brutal-pink`) |

`--color-grid-active` (`#007A33`) **continua exclusivo do `/void`**. É a cor do segredo,
não do sistema. Única exceção: o "tell" do easter egg armado (§8).

Tipografia do hero: `clamp()` até ~18vw em Archivo Black. Nenhuma fonte nova.

`@keyframes` ficam em `<style>` no componente da cena a que pertencem — é a exceção que o
`CLAUDE.md` §5 já permite, e mantém cada cena autocontida. Tudo que for padrão recorrente
(o palco, o bloco) sobe para `@utility` no `global.css`.

## 7. Os 7 capítulos

Conteúdo tirado do currículo (ATS de 08/2026). Enquadramento honesto: a experiência é
Flutter/FlutterWeb e suporte de TI; o site se apresenta como **"Desenvolvedor Frontend ·
Flutter & Web"** e não inventa senioridade.

| # | Capítulo | Conteúdo | Cena animada | Técnica |
|---|---|---|---|---|
| 1 | Hero | `GABRIEL GOBBI` + "Desenvolvedor Frontend · Flutter & Web" | Blocos de letra caem e travam; barra de cor varre a tela | `view()` + `animation-delay` escalonado |
| 2 | Quem sou | Formado em Ciências da Computação (EEP, 2025), pós em Cybersegurança em curso, migrando de TI para desenvolvimento | Retrato geométrico chapado se montando de 6 formas | 6 `@keyframes`, um por forma |
| 3 | Stack | Flutter · Dart · FlutterWeb · HTML/CSS · Python · Firebase · APIs REST · Git | **Celular com splash do Flutter**: as 3 lâminas do logo se montam, spinner gira, tela troca no "hot reload" | SVG único em `sticky-stage`, `animation-timeline: scroll()` |
| 4 | Responsividade | UI/UX responsiva mostrada em vez de afirmada | **Moldura redimensionando** desktop → tablet → celular, com o conteúdo interno refluindo 3 col → 2 → 1 | largura animada no wrapper; filhos em `%` refluem sozinhos |
| 5 | Experiência | Prefeitura de Ipeuna (estágio de TI, 2025) → Vivida (Software Developer, FlutterWeb, jan–mai 2026) → Korin (Assistente de TI, jul 2026 → hoje) | Timeline **horizontal**: 3 cards deslizam em X enquanto a página rola em Y | `sticky` + `translateX` por `animation-timeline: scroll()`. Abaixo de 768px vira lista vertical, sem palco preso |
| 6 | Como trabalho | Trabalho em equipe, liderança, troubleshooting, iniciativa, autonomia + pós em Cybersegurança | **Dois bonecos**: um estende o braço, o outro sobe o bloco. Engrenagem de troubleshooting girando. Cadeado da pós fechando | 3 cenas curtas em sequência, cada uma no seu palco |
| 7 | Contato | E-mail, GitHub, LinkedIn. CTA `mailto:`. Sentinela do easter egg (§8) | Bloco brutalista estático | — |

Toda cena é SVG **inline**, `aria-hidden="true"`, `focusable="false"`, cores por token ou
`currentColor`, alvo de ~3-6KB cada e **zero requisição de rede**. Um componente `.astro`
por cena, em `src/components/scenes/`; um por capítulo, em `src/components/chapters/`.

**Não existe capítulo de "cases/projetos"** nesta fase: não há projeto documentado para
mostrar. Criar cards vazios seria mentira de layout. É o marco seguinte (§11, M7).

## 8. Easter egg

**Gatilho:** Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`), **armado apenas depois que o visitante
alcança 100% da rota** — isto é, o fim do capítulo 7 entra na viewport. Antes disso a
sequência é ignorada por completo.

```
sentinela <div> de 1px no fim do capítulo 7
  -> IntersectionObserver marca armed = true (e se desconecta)
  -> só então o listener de teclado passa a contar a sequência
  -> sequência completa -> location.href = '/void'
```

- Enquanto `armed === false`, **nenhuma tecla é contada** — o contador nem começa. Quem
  souber o código e não tiver lido o site não entra.
- **Tell visual ao armar:** o ponto final do bloco de contato muda para `#007A33`
  (`--color-grid-active`). É o único vazamento da cor do `/void` para o site, e é
  deliberado: assina que algo mudou sem dizer o quê.
- Custo: ~20 linhas de JS inline no capítulo 7. É o **único** JavaScript da rota `/`.
- Vale nos dois idiomas.
- Cleanup: o `IntersectionObserver` se desconecta ao disparar; o listener de teclado é
  registrado uma vez e vive enquanto a página viver (sem SPA, sem vazamento).
- **Sem equivalente mobile, de propósito:** o destino (`/void`) é hover-dependente e
  desktop-only; inventar um gesto de toque levaria o visitante de celular a uma tela que
  só diz `MOBILE`. O segredo tem o mesmo alcance que o prêmio.
- `/void` e filhas recebem `<meta name="robots" content="noindex">`.

**Check runnable obrigatório:** a máquina de estado da sequência (armar → contar → resetar
em tecla errada → disparar) é lógica não-trivial e ganha `src/lib/konami.check.ts`, no
padrão de `hotspots.check.ts`, rodado por `npm run check:konami` fora do `astro check`.
A lógica vira `src/lib/konami.ts` exportando um redutor puro (`step(state, key) => state`),
testável sem DOM; o componente só liga teclado e sentinela nesse redutor.

## 9. Responsividade, acessibilidade, performance

**Responsividade**

- O gate `MOBILE` **sai do `BaseLayout`** e passa a envolver só as páginas de `/void`.
  Com isso o `ROADMAP.md` §4 (mobile placeholder global) deixa de valer.
- Capítulos viram coluna única abaixo de 768px; cenas escalam por `viewBox` (SVG é
  resolução-independente, não há asset por breakpoint).
- Capítulo 5 abandona o palco preso no mobile e vira lista vertical.

**Acessibilidade** (`CLAUDE.md` §7 continua valendo integralmente)

- Um `<h1>` (hero), `<h2>` por capítulo, ordem de leitura igual à ordem visual.
- Skip-link mantido. Toggle de idioma é link real, com `hreflang` e `lang`.
- SVG decorativo: `aria-hidden="true"` + `focusable="false"`. Nada que seja informação
  existe só dentro de uma cena.
- Contraste AA (4.5:1) medido em todo texto novo, incluindo texto sobre bloco de cor.
- Nada de scroll-jacking que impeça o teclado de sair de um capítulo: `sticky` prende a
  cena, nunca a navegação.

**Performance** (`CLAUDE.md` §8)

- **Orçamento: ~0KB de JS na rota `/`** — só as ~20 linhas do Konami. Animação é CSS.
- Sem imagem raster no corpo: o LCP passa a ser o texto do hero, então o Lighthouse volta
  a medir performance da home (hoje reporta `performance 0` por não haver candidato a LCP).
- Fontes já auto-hospedadas via `@fontsource`; preload da principal (Archivo Black).
- Alvos mantidos: LCP < 2.5s · CLS < 0.1 · INP < 200ms.

## 10. Fora de escopo (deliberado)

CMS, blog, formulário de contato com backend (não há servidor — é `mailto:`), dark mode,
analytics, View Transitions, Higgsfield, geração de imagem por Nano Banana, capítulo de
cases. `react`, `react-dom` e `@astrojs/react` saem do `package.json` ao fim da fase se
nenhuma cena precisar de ilha — o que esta spec prevê que não vai precisar.

## 11. Impacto no harness

- **`ROADMAP.md` — reescrito.** §1 (visão) passa a descrever o portfólio como produto e o
  `/void` como easter egg. Marcos renumerados: M3 portfólio v2 PT · M4 i18n EN · M5 easter
  egg + mudança de rotas · M6 404/error-hero (era M4) · M7 conteúdo real dos destinos do
  void (era M6). **"Mobile real" deixa de ser marco** — o site nasce responsivo. A
  `morph-gallery` (antigo M3) cai de prioridade: os destinos ficam atrás do segredo.
- **`CLAUDE.md`** — §6 (invariantes de cursor/hotspot/grid) passa a valer **só para
  `/void`**, com essa restrição escrita no texto. Entra uma seção nova com o contrato de
  cena da §5. `.gemini/styleguide.md` acompanha na mesma branch (regra do §9).
- **`AGENTS.md`** (hoje não rastreado, cópia do `CLAUDE.md` para o Codex) vira espelho
  declarado: o `CLAUDE.md` é a fonte, o `AGENTS.md` diz na primeira linha que é cópia e de
  onde vem. `.agents/` e `.codex/` entram no repo ou no `.gitignore` — decisão registrada
  no `STATE.md` quando a fase começar.
- **`STATE.md`** — atualizado ao fim de cada marco, como sempre.

## 12. Definição de pronto

Por marco, sem exceção (`CLAUDE.md` §2):

1. `npm run typecheck`, `npm run lint`, `npm run build` passam — saída colada, não afirmada.
2. `npm run check:hotspots` e `npm run check:konami` passam.
3. Verificação no navegador, não só no build: cena anima no scroll; com
   `prefers-reduced-motion: reduce` a cena aparece montada e estática; sem suporte a
   `animation-timeline`, idem; teclado percorre a página inteira; `/` e `/en/` servem o
   mesmo conteúdo em idiomas diferentes.
4. Lighthouse desktop e **mobile** em `/`: a11y 100, contraste AA confirmado, LCP medido
   (não `null`).
5. Konami ignorado antes de chegar ao fim da rota; funcional depois.

## 13. Entradas que faltam (com fallback definido)

| Item | Regra |
|---|---|
| **URL do LinkedIn** | O dicionário tem a chave `linkedin`. Enquanto o valor for string vazia, o link **não é renderizado** — não entra link quebrado nem placeholder. Gabriel preenche quando quiser. |
| Texto em inglês | Traduzido do PT pelo agente e revisado pelo Gabriel antes do merge do M4. |
| `--color-brutal-orange` | Só entra se passar contraste; senão fica restrito a fundo e decoração (§6). |
