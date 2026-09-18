# ROADMAP.md — Visão de Futuro

Planejamento de longo prazo: marcos, escopo e decisões que o código de **hoje** já tem que
respeitar. Estado do agora fica em `STATE.md`. Regras de codificação em `CLAUDE.md`.

Última revisão: **2026-09-17**.

---

## 1. Visão do produto

O portfólio deixa de ser uma página de scroll com seções e passa a ser um **espaço vazio que
o visitante explora**. A tela inicial é um campo de pontos reativo, sem menu, sem texto de
navegação visível. Existem 5 regiões clicáveis invisíveis; o único sinal delas é a reação do
cursor. Encontrar é parte do produto.

Três consequências arquiteturais que valem pra todo código novo:

1. **A home é um "mapa", não uma página.** Ela só hospeda grid + cursor + hotspots. Conteúdo
   nenhum mora nela. Qualquer seção nova é rota própria.
2. **Os 5 destinos são independentes.** Um pode virar SPA-ish com WebGL pesado e o outro ser
   HTML puro. Não crie layout compartilhado que force os cinco no mesmo molde — só o
   `BaseLayout` (head/meta/fontes).
3. **O modelo de interação é hover-dependente e por isso tem irmão gêmeo mobile.** Nenhuma
   lógica de descoberta pode viver acoplada a `pointermove`; a decisão "quais são as 5
   regiões e pra onde vão" mora em **um** módulo de dados (`src/lib/hotspots.ts`) consumido
   por desktop e mobile.

---

## 2. Mapa dos 5 hotspots

| Posição | Destino | Rota | Status do conteúdo |
|---|---|---|---|
| Canto superior esquerdo | Jogos | `/jogos` | definido como seção, conteúdo a definir |
| Canto inferior esquerdo | Roadmap pessoal | `/roadmap` | **conteúdo a definir pelo Gabriel** |
| Canto superior direito | ❓ ideia em construção | `/lab-a` (provisório) | **a definir** |
| Canto inferior direito | ❓ ideia em construção | `/lab-b` (provisório) | **a definir** |
| Centro da tela | Portfólio real | `/portfolio` | é o núcleo: cases de trabalho |

Enquanto o conteúdo não existir, **todos os 5 apontam para a tela "in construction"** (§5).
Nome de rota provisório muda sem dor porque ninguém linka de fora; quando o destino for
decidido, renomeia e adiciona redirect estático se já tiver sido divulgado.

---

## 3. Desktop — spec de referência

### 3.1 Fundo: dot grid

Base: `reactbits.dev/backgrounds/dot-grid` (React + GSAP + InertiaPlugin — já temos os dois),
reescrito conforme `CLAUDE.md` §4.

- `activeColor`: **`#007A33`** (token `--color-grid-active`).
- Canvas único, `dpr` clampado em 2, RAF pausado com `document.hidden`.
- Os pontos reagem ao ponteiro; **não** reagem ao hotspot (o grid não sabe que hotspot existe).
- `prefers-reduced-motion: reduce` → grid estático, sem reação.

### 3.2 Cursor

Máquina de estado com 2 estados e transição simétrica:

| Estado | Preenchimento | Borda | Duração |
|---|---|---|---|
| `idle` (fora de hotspot) | branco, 100% | 2px, 100% | — |
| `over-hotspot` | branco → **0% de opacidade** | 2px, **sempre 100%** | **1.5s** |
| voltando pra `idle` | 0% → 100% | 2px | reverte na mesma curva |

- Tamanho: bola de ~12px (tamanho de cursor pequeno). Borda 2px — espessura é parâmetro,
  pode mudar por pedido.
- Clique não é obrigatório: sair do hotspot sem clicar volta ao branco e **nada acontece**.
- Todo hotspot usa essa mesma interação. Não crie variação por hotspot sem pedido.
- Cursor nativo escondido (`cursor: none`) só enquanto a ilha do cursor está ativa; se ela
  falhar em montar, o cursor nativo tem que continuar lá.
- Implementação: `transform` na ref por frame (sem re-render), opacidade animada por
  GSAP ou transição CSS de 1.5s. Reaproveitar o padrão que já existe em
  `src/components/HeroCursor.tsx`.

### 3.3 Hotspots

- Geometria: quadrado de lado `min(10vw, 10vh)` — mantém quadrado em qualquer proporção de
  tela. **Aprovado em 2026-09-17.** (Se um dia virar 10% da largura, troca em um lugar só.)
- Posição: colados nos 4 cantos e centrado no centro geométrico do viewport.
- Invisíveis: sem borda, sem fundo, sem hover visual próprio. Quem muda é o cursor.
- São `<a>` reais dentro de `<nav aria-label>`, com `aria-label` do destino, e **visíveis no
  `:focus-visible`** (`CLAUDE.md` §7).
- Fonte única da verdade: `src/lib/hotspots.ts` exportando `{ id, label, href, anchor }`.

---

## 4. Mobile — placeholder aprovado (2026-09-17)

Hover não existe em touch, então o modelo desktop não porta. Decisão: **não resolver mobile
agora**. Mobile recebe uma **tela em branco com a palavra `MOBILE`** centralizada, explicitamente
temporária.

Spec do placeholder — o mínimo, e nada além:

- Fundo branco, texto `MOBILE` centralizado, preto. Sem menu, sem link, sem animação.
- **CSS puro**, sem JS: media query no `BaseLayout`. Nada de detecção por user agent.
- Gatilho: `(max-width: 767px), (pointer: coarse) and (max-width: 1023px)` — pega celular e
  poupa tablet/desktop touch. *(Suposição registrada: placeholder cobre o **site todo**
  enquanto é temporário, porque nenhuma rota tem tratamento mobile ainda. Se for só a home,
  muda em um lugar.)*
- `<title>` e `<meta name="description">` continuam corretos (SEO não some por causa do placeholder).
- Marcar no código com comentário `ponytail:` apontando pra este parágrafo e pra M5.

Custo: ~10 linhas. Vale porque destrava M2 sem inventar interação mobile errada.

Direções candidatas pro mobile real (M5) — **não** implementar sem escolha explícita:

- **(a) Revelar por proximidade de toque:** arrastar o dedo aplica o mesmo fade nos pontos
  ao redor; soltar sobre a região navega. Mantém o espírito "explorar", custa descoberta.
- **(b) Grid de 5 células em tela cheia:** as 5 regiões existem como blocos tocáveis com
  rótulo mínimo. Mais honesto, menos misterioso.
- **(c) Home diferente no mobile:** o mistério é experiência de desktop; mobile vai direto
  pro conteúdo (`/portfolio`) com menu comum.

Critério de decisão: ~70% do tráfego de portfólio chega por link em celular. Se o mobile
não entender o que é o site em 3 segundos, a graça do desktop não compensa.

---

## 5. Telas de destino (provisórias)

### 5.1 "In construction" — destino dos 5 hotspots hoje

Base: `morph-gallery.tsx` (21st.dev). Ponto a favor: WebGL cru, **zero dependência nova**, já
tem fallback DOM e cleanup. Entra em `src/components/ui/morph-gallery.tsx`.

- Texto **estático** "in construction" centralizado, sobreposto à galeria.
- A cor do texto tem que se destacar da paisagem que está passando. Solução padrão:
  `mix-blend-mode: difference` ou pastilha de fundo chapada, decidida **por medição de
  contraste AA**, não por gosto (`CLAUDE.md` §7).
- Imagens: **auto-hospedadas** em `src/assets/` (as URLs do demo são CDN de terceiro; o
  shader exige CORS e nós não dependemos de CDN alheio).
- `autoplay` respeita `prefers-reduced-motion` e `document.hidden` (o componente já faz).

### 5.2 Erro / 404 — qualquer falha cai aqui

Base: `prisma-hero.tsx` (21st.dev), **sem a navbar** (nada de "Our story / Collective /
Workshops / Programs / Inquiries"). Entra em `src/components/ui/error-hero.tsx` e é usada por
`src/pages/404.astro`.

- Porte obrigatório: `framer-motion` → GSAP, `lucide-react` → SVG inline (`CLAUDE.md` §4).
  O efeito de palavras subindo (`WordsPullUp`) vira um `gsap.from` com stagger.
- Vídeo de fundo: baixar e hospedar, `muted playsInline loop`, `poster` sempre presente, e
  **substituído por imagem estática** em `prefers-reduced-motion` ou conexão lenta.
- Texto e CTA reescritos pro contexto de erro (o copy "Prisma / Join the lab" é do demo).
  CTA leva de volta pra home.
- Só existe 404 estático — não há servidor pra 500. Erro de runtime no cliente (WebGL que
  morre, rota inválida via View Transitions) deve **redirecionar** pra essa tela.

---

## 6. Marcos

| # | Marco | Escopo | Feito quando |
|---|---|---|---|
| **M0** | Harness | `CLAUDE.md`, `STATE.md`, `ROADMAP.md` | os três existem e são lidos no início de cada tarefa grande |
| **M1** ✅ | Fim da v1 | Hero/Timeline/Contact + deps de 3D e Lottie | **apagada em 2026-09-18**; recuperável no histórico (`f0cabe6`) |
| **M2** ✅ | Home nova | dot grid + cursor + 5 hotspots + `hotspots.ts` + nav acessível + **placeholder `MOBILE`** (§4) | **feito em 2026-09-18** — medições em `STATE.md` §0 |
| **M3** | Tela in construction | `morph-gallery` portada, assets locais, texto AA | as 5 rotas caem nela — hoje elas existem como tela estática (`UnderConstruction.astro`) |
| **M4** | Tela de erro | `error-hero` portada + `404.astro` | 404 e erro de cliente caem nela |
| **M5** | Mobile real | placeholder sai, modelo (a)/(b)/(c) do §4 escolhido e implementado | `pointer: coarse` tem experiência própria completa |
| **M6** | Conteúdo real | `/portfolio` primeiro, depois `/jogos` e `/roadmap` | cada rota substitui a tela provisória |

Ordem é dependência real: M2 antes de M3/M4 (sem home não há navegação), M5 depois de M2
(reaproveita `hotspots.ts`), M6 por último (conteúdo é o mais caro e o mais mutável).

---

## 7. Pendências de refactor / débito planejado

- **Paleta sem dono.** Os tokens `--color-brutal-*` sobreviveram à v1 porque a home e as telas
  provisórias usam preto, paper e as fontes. Quando a identidade visual nova fechar, decidir:
  renomear os tokens ou trocá-los — e aí `styleguide.astro` acompanha.
- **`hotspots.check.ts` é o único teste.** A máquina de estado do cursor ainda não tem check
  runnable; é a segunda coisa que quebra em silêncio (`CLAUDE.md` §2).
- **`react`, `@astrojs/react` e `gsap` instalados sem consumidor**, reservados para M3 e M4.
  Se esses marcos mudarem de rumo, desinstalar em vez de arrastar.
- **Sem deploy automatizado** (FTP manual). Só automatizar se a frequência de publicação doer.
- **View Transitions do Astro** não estão em uso. Se entrarem, revisar cleanup de toda ilha
  (cursor e WebGL vazam entre navegações client-side).

---

## 8. Perguntas abertas (bloqueiam escopo, não código)

1. Canto superior direito e inferior direito: **o que são?**
2. `/roadmap` pessoal: que conteúdo e que formato (timeline? lista? mapa?)
3. ~~Mobile agora~~ → **resolvido:** placeholder `MOBILE` (§4). Qual dos modelos (a)/(b)/(c)
   entra no M5 segue aberto — mas não bloqueia nada.
4. A v1 (hero/timeline/personagem Lottie/contato) morre, vira `/portfolio`, ou vira `/roadmap`?
5. Paleta: `#007A33` é a cor do sistema todo ou só do grid?
