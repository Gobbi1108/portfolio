# ROADMAP.md — Visão de Futuro

Planejamento de longo prazo: marcos, escopo e decisões que o código de **hoje** já tem que
respeitar. Estado do agora fica em `STATE.md`. Regras de codificação em `CLAUDE.md`.

Última revisão: **2026-09-22**.

---

## 1. Visão do produto

O site é um **portfólio de desenvolvedor frontend**: scroll longo, estilo neobrutalista, sete
capítulos com cenas animadas que mostram a skill em vez de afirmá-la. Bilíngue, responsivo,
e rápido — em portfólio, performance é produto.

O campo de pontos com 5 regiões invisíveis — que era a home até 2026-09-22 — **não morreu**:
virou o easter egg, em `/void`, alcançável só por quem chega ao fim da rota e digita o
Konami. Ele continua com a spec original (§4).

Três consequências arquiteturais que valem pra todo código novo:

1. **Capítulo é componente, não página.** Uma rota por idioma (`/` e `/en/`), montada de
   componentes em `src/components/chapters/`. Capítulo novo entra na lista das duas páginas.
2. **Texto mora no dicionário, nunca no componente.** `src/i18n/pt-br.ts` é a fonte da
   verdade; `en.ts` é tipado contra ele, então o compilador é quem garante a paridade.
   Um componente recebe **só a sua fatia** do dicionário.
3. **O `/void` é um vizinho, não um andar de baixo.** Ele tem hover, cursor custom e gate
   mobile; o portfólio não tem nada disso. Nenhum código é compartilhado além do
   `BaseLayout`.

---

## 2. Os 7 capítulos

| # | Capítulo | Componente | Cena |
|---|---|---|---|
| 1 | Hero | `Hero.astro` | letras caem escalonadas, barra de cor varre |
| 2 | Quem sou | `About.astro` | retrato geométrico se montando de 6 formas |
| 3 | Stack | `Stack.astro` | celular: logo monta, spinner gira, splash sai por wipe |
| 4 | Responsivo | `Responsive.astro` | moldura encolhe e as colunas caem 3 → 2 → 1 |
| 5 | Experiência | `Experience.astro` | 3 cargos deslizam no eixo X enquanto a página rola no Y |
| 6 | Como trabalho | `HowIWork.astro` | dois bonecos, engrenagem, cadeado |
| 7 | Contato | `Contact.astro` | bloco estático + gatilho do easter egg |

Cenas ficam em `src/components/scenes/`, uma por arquivo, SVG inline (ou HTML, quando o
ponto é reflow real), `aria-hidden`, cores por token, zero requisição de rede.

---

## 3. Conteúdo ainda ausente (decisão do Gabriel)

- **URL do LinkedIn.** A chave existe no dicionário; string vazia = o link não é renderizado.
  Preencher em `src/i18n/pt-br.ts` **e** `en.ts`.
- **Capítulo de cases/projetos.** Não existe porque não há projeto documentado. É o M6 —
  criar cards vazios seria mentira de layout.
- **Revisão do inglês.** Traduzido pelo agente a partir do PT; o Gabriel revisa quando quiser.

---

## 4. Easter egg — `/void`

**Gatilho:** Konami (`↑ ↑ ↓ ↓ ← → ← → B A`), e **só depois de chegar a 100% da rota**
(`scrollY + innerHeight >= scrollHeight`). Antes disso nenhuma tecla é contada — quem sabe o
código e não leu o site não entra. Ao armar, o ponto do título "Contato**.**" troca para
`#007A33`: assina que algo mudou sem dizer o quê.

Não existe equivalente mobile, de propósito: o destino é hover-dependente e desktop-only.

Dentro do `/void`, a spec original continua valendo (números em `CLAUDE.md` §6):

- **Fundo:** dot grid, `activeColor` `#007A33`, dpr clampado em 2, RAF pausado com
  `document.hidden`, estático em `prefers-reduced-motion`.
- **Cursor:** bola branca ~12px, borda 2px sempre visível, fade a 0% em 1.5s sobre hotspot,
  reversível ao sair.
- **Hotspots:** quadrados de `min(10vw, 10vh)`, 4 cantos + centro, `<a>` reais com
  `aria-label`, visíveis no `:focus-visible`. Fonte única: `src/lib/hotspots.ts`.
- **Mobile:** placeholder `MOBILE`, via prop `mobileGate` do `BaseLayout`. O portfólio
  **nunca** usa esse gate.
- **`noindex`** em `/void` e filhas.

| Posição | Destino | Rota |
|---|---|---|
| Superior esquerdo | Jogos | `/void/jogos` |
| Superior direito | Laboratório A | `/void/lab-a` |
| Centro | Portfólio (arquivo) | `/void/portfolio` |
| Inferior esquerdo | Roadmap pessoal | `/void/roadmap` |
| Inferior direito | Laboratório B | `/void/lab-b` |

As cinco caem na tela "in construction" estática. Conteúdo real é o M7.

---

## 5. Marcos

| # | Marco | Escopo | Estado |
|---|---|---|---|
| **M1** | Fim da v1 | Hero/Timeline/Contact + deps de 3D e Lottie | ✅ 2026-09-18 |
| **M2** | Home dot-grid | grid + cursor + 5 hotspots + nav acessível | ✅ 2026-09-18 |
| **M3** | Portfólio v2 bilíngue | 7 capítulos, i18n, responsivo, cenas em CSS | ✅ 2026-09-22 |
| **M4** | Easter egg | `/void` + Konami armado no fim da rota | ✅ 2026-09-22 |
| **M5** | Tela de erro | `error-hero` portada, `404.astro`, `.htaccess` com `ErrorDocument` | aberto |
| **M6** | Cases reais | capítulo de projetos, com projeto de verdade documentado | aberto |
| **M7** | Conteúdo do `/void` | as 5 rotas deixam de ser "in construction" | aberto |

**"Mobile real" deixou de ser marco:** o portfólio nasceu responsivo. Só o `/void` tem
placeholder, e ele é desktop-only por natureza.

A `morph-gallery` (que era o M3 antigo) saiu da fila: as rotas que ela decoraria vivem atrás
do segredo, então o custo não se paga agora.

---

## 6. Pendências de refactor / débito planejado

- **Paleta com dono novo.** `--color-brutal-*` sobreviveram à v1 e agora sustentam o
  portfólio; `--color-brutal-orange` entrou medido em 2026-09-22. `styleguide.astro` está
  atualizado. `--color-grid-active` é exclusivo do `/void` e do tell do Konami.
- **Sem deploy automatizado** (FTP manual). Só automatizar se a frequência doer.
- **View Transitions do Astro** não estão em uso. Se entrarem, revisar o cleanup do `/void`
  (cursor e canvas vazam entre navegações client-side) e o listener do Konami.
- **`hotspots.check.ts` e `konami.check.ts`** são os dois únicos checks. A máquina de estado
  do cursor segue sem check runnable.
