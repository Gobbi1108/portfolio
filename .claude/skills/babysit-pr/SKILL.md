---
name: babysit-pr
description: Monitora um Pull Request aberto, lê comentários do gemini-code-assist[bot] e logs do CI, aplica correções no código, marca threads como resolvidas, e itera até o PR ficar verde. Use quando o usuário pedir "faz babysit do PR", "corrige os comentários da revisão", "resolve o que o Gemini apontou", ou imediatamente após abrir um PR novo.
---

# Babysit de Pull Request

Esta skill faz o ciclo completo de auto-correção de um PR: lê o que o reviewer (Gemini Code Assist) e o CI apontaram, corrige, e itera até o PR estar verde para merge.

## Pré-condições

Antes de invocar:

- O usuário está em um repositório Git com remote no GitHub.
- O `gh` CLI está autenticado (`gh auth status` retorna OK).
- Existe um PR aberto associado à branch atual, OU o usuário forneceu o número do PR.
- O app `gemini-code-assist` está instalado no repo.

Se alguma condição falhar, **pare e avise o usuário** em vez de tentar resolver.

## O ciclo

Execute as etapas abaixo em ordem. Cada iteração é um ciclo completo. Repita até critério de parada ou limite de iterações.

### 1. Identificar o PR

```bash
gh pr view --json number,url,headRefName,state,statusCheckRollup
```

Se não houver PR para a branch atual, peça o número ao usuário.

### 2. Coletar comentários do reviewer (Gemini)

```bash
gh pr view <num> --json reviews,comments
```

Filtre por:
- `author.login == "gemini-code-assist"` ou `author.login == "gemini-code-assist[bot]"`
- Estado da thread = `RESOLVED == false` (apenas comentários não resolvidos)

Para cada comentário não resolvido, registre internamente:
- Arquivo e linha apontados
- Severidade (CRITICAL, HIGH, MEDIUM, LOW)
- Sugestão proposta
- ID da thread (para resolver depois)

Priorize CRITICAL > HIGH > MEDIUM. **Ignore LOW** nesta skill — são geralmente estilo, e o styleguide diz para ignorar.

### 3. Coletar status do CI

```bash
gh pr checks <num>
```

Para cada check com status `fail`:
```bash
gh run view <run-id> --log-failed
```

Identifique a causa do erro:
- Erro de TypeScript? Pegue arquivo + linha + mensagem.
- Erro de ESLint? Pegue arquivo + regra.
- Build quebrado? Pegue o stack trace.
- Teste falhou? Pegue o nome do teste e o assertion.

### 4. Planejar as correções

Antes de tocar código, monte um plano mental:

- Agrupe correções por arquivo (evita commits espalhados).
- Identifique conflitos potenciais (Gemini sugere uma coisa, lint pede outra).
- Decida o que **não** corrigir agora:
  - Sugestões fora do escopo do PR (peça ao usuário se devem virar issue).
  - Sugestões que mudam decisão arquitetural (peça confirmação humana).
  - Sugestões em código que você não escreveu nesta sessão (avise antes de tocar).

### 5. Aplicar correções

Para cada arquivo afetado:

- Faça a correção mínima necessária. Não refatore além do escopo.
- Mantenha estilo consistente com o resto do arquivo.
- Se for lógica de animação ou 3D, leia o styleguide em `.gemini/styleguide.md` antes de mudar.
- **Nunca** mexa em arquivos fora dos apontados, exceto:
  - Imports necessários para a correção.
  - Tipos correlatos que precisam atualização.

### 6. Validar localmente antes de commitar

Antes do push, rode:

```bash
npm run typecheck
npm run lint
npm run build
```

Se algo falhar, corrija antes de commitar. Se não conseguir corrigir em uma tentativa, **pare e peça ajuda** em vez de fazer commits quebrados.

### 7. Commit e push

Mensagem no padrão Conventional Commits:

```bash
git add <arquivos-modificados>
git commit -m "fix(review): <resumo curto do que foi corrigido>"
git push
```

Se houver múltiplas categorias de correção (ex: typescript + acessibilidade), faça commits separados.

### 8. Resolver threads no GitHub

Para cada comentário do Gemini que foi endereçado:

```bash
gh api graphql -F threadId=<thread-id> -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread { isResolved }
  }
}'
```

Adicione um comentário breve na thread explicando a correção:

```bash
gh pr comment <num> --body "Corrigido em <commit-sha>: <breve explicação>"
```

### 9. Aguardar próximo ciclo

O Gemini leva até ~5 minutos para revisar mudanças novas. O CI pode levar 1–3 min. Aguarde antes de re-checar.

```bash
sleep 300  # 5 minutos
```

Volte para a etapa 1.

## Critérios de parada

Pare o loop quando **qualquer um** for verdadeiro:

- ✅ Todos os checks do CI estão verdes E nenhum comentário CRITICAL/HIGH/MEDIUM não resolvido.
- ⛔ 5 iterações completas sem convergir → pare e peça ajuda humana.
- ⛔ O CI quebrou em algo que você não consegue diagnosticar em 1 tentativa.
- ⛔ Há comentário do reviewer que requer decisão arquitetural ou de produto.
- ⛔ O usuário pediu para parar.

## Limites e regras de segurança

- **Nunca** force push (`git push -f`) em branch protegida (incluindo `main`).
- **Nunca** mexa em segredos, tokens, variáveis de ambiente.
- **Nunca** altere `package-lock.json` à mão. Se o lock precisar mudar, rode `npm install` e commite o resultado.
- **Nunca** "consert e" o PR alterando o `baseline.json` (se existir) para fazer a catraca passar. A catraca só anda pra frente.
- **Nunca** delete testes para fazer o CI passar. Se um teste falha legitimamente, o código está errado, não o teste.
- Se em dúvida sobre a intenção do reviewer, **deixe um comentário pedindo clarificação** em vez de adivinhar.

## Saída esperada

Ao final, reporte ao usuário em texto curto:

- Iterações executadas
- Comentários endereçados (CRITICAL/HIGH/MEDIUM)
- Comentários ignorados e por quê
- Estado final do PR (verde / ainda tem pendências / parado por X)
- Próximo passo sugerido (merge, nova revisão, ajuste manual)

Não inflar com logs ou stack traces — o usuário vê tudo no GitHub.
