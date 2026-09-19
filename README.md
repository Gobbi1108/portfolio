# Portfólio — Gabriel Gobbi

Site estático em Astro. A home é um campo de pontos com 5 regiões clicáveis invisíveis,
descobertas pelo cursor. Conceito e marcos em [ROADMAP.md](ROADMAP.md); estado atual em
[STATE.md](STATE.md); regras de código em [CLAUDE.md](CLAUDE.md).

## Rodar

Requer **Node >= 22.12**.

```bash
npm install          # só na primeira vez
npm run dev          # http://localhost:4321
```

A home só funciona como esperado em **tela de desktop com mouse**: abaixo de 768px (ou em
tela de toque) aparece o placeholder `MOBILE`, que é temporário. Para ver o cursor e os
hotspots, use uma janela larga. Se o cursor não virar bolinha branca, confira se o sistema
está com "reduzir movimento" ligado — nesse caso o cursor nativo é mantido de propósito.

Onde clicar: os quatro cantos e o centro exato da tela. O cursor esvazia quando entra em um.
Pelo teclado: `Tab` percorre os cinco (o primeiro `Tab` é o link "pular para conteúdo").

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento em `localhost:4321` |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o `dist/` já buildado |
| `npm run typecheck` | `astro check` — gate de CI |
| `npm run lint` | ESLint — gate de CI |
| `npm run check:hotspots` | valida o mapa das 5 regiões da home |
| `npm run check:gallery` | valida o enquadramento `cover` da galeria WebGL |

Antes de commitar: `npm run typecheck && npm run lint && npm run build`.

## Deploy

Build estático publicado por FTP na Locaweb. Não há runtime de servidor: o conteúdo de
`dist/` é o site inteiro.
