# Style Guide — revisão de PR

Lido pelo `gemini-code-assist[bot]` em toda revisão. **A fonte da verdade é o `CLAUDE.md`
na raiz** — este arquivo não repete as regras, ele diz o que priorizar na revisão.

Contexto do produto (detalhe em `ROADMAP.md`): a home é um campo de pontos em canvas sobre
fundo preto, com 5 regiões clicáveis invisíveis reveladas pelo cursor. Não é mais o portfólio
neubrutalista com timeline e personagem — **a v1 foi removida em 2026-09-18**. Comentário
pedindo "sombra hard", "cor chapada" ou qualquer coisa da estética antiga está desatualizado.

## Prioridades da revisão, em ordem

1. **Acessibilidade.** A navegação é invisível ao mouse, então o resto tem que ser exemplar:
   link é `<a href>` real com nome acessível único, `:focus-visible` revela o alvo, ordem de
   Tab segue a leitura, contraste AA em texto e 3:1 em indicador de foco,
   `prefers-reduced-motion` desliga animação sem quebrar navegação.
2. **Bugs de UX.** Estado de cursor que não reverte, hotspot fora do canto, RAF que não dorme,
   listener sem cleanup, canvas que não redesenha no resize.
3. **Performance.** JS inicial < 100KB gzip. Import estático que arrasta lib pesada para
   páginas que não usam; `devicePixelRatio` sem clamp; RAF rodando com aba oculta.
4. **Dependência nova.** Precisa de justificativa explícita — ver `CLAUDE.md` §4. PR que
   adiciona `framer-motion`, `lucide-react`, `shadcn/ui` ou similar deve ser questionado.
5. **TypeScript.** `any` é erro. Tipo frouxo em dado compartilhado (ex.: `hotspots.ts`) também.
6. **Tailwind v4 CSS-first.** Token em `@theme`, padrão em `@utility`, tudo em
   `src/styles/global.css`. Sem `tailwind.config.*`, sem `!important` não comentado.
7. **Contrato de cena** (`CLAUDE.md` §6.1). O CSS base de um elemento animado é o **estado
   final legível**; a animação só existe dentro de `@supports (animation-timeline: view())`
   + `@media (prefers-reduced-motion: no-preference)`. Estado inicial no CSS base é bug:
   quebra Firefox sem suporte, `reduced-motion`, crawler e impressão de uma vez. Duas
   armadilhas específicas: cena dentro de `sticky-stage` **não** pode usar
   `animation-timeline: view()` (elemento preso não se move, a timeline congela — use
   `view-timeline` nomeada na seção alta), e `animation-range: contain` é degenerado para
   sujeito mais alto que a viewport (use `cover`).
8. **`--color-grid-active` (`#007A33`) é exclusivo do `/void`.** A única aparição permitida
   fora dele é o tell do Konami no capítulo de contato. Uso novo dessa cor no portfólio é
   erro. Simétrico: o portfólio **nunca** usa a prop `mobileGate` do `BaseLayout` — ele é
   responsivo de verdade; o placeholder `MOBILE` é só do easter egg.
9. **i18n.** Texto novo nasce em `src/i18n/pt-br.ts` e é traduzido em `en.ts`. String literal
   dentro de componente de capítulo é erro — quebra o idioma que não a recebeu.

## O que ignorar

- Formatação pura (espaço, vírgula, aspas).
- Sugestão de "extrair para componente/abstração" sem segundo consumidor real.
- Preferência estética sem impacto em a11y, performance ou correção.

## Git

Toda alteração nasce em branch e entra na `main` por merge — nunca commit direto
(`CLAUDE.md` §9, enforçado por hook). Conventional Commits. 1 PR = 1 assunto, com
**o quê / por quê / como testar** na descrição.
