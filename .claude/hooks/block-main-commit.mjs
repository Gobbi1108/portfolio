// PreToolUse/Bash: recusa `git commit` quando o HEAD está na branch principal.
//
// Rotina obrigatória deste repo (CLAUDE.md §9): toda alteração nasce em branch,
// vai pro remoto e só entra na main por merge. O hook existe porque regra escrita
// em markdown é lembrete; isto é bloqueio.
//
// Só o commit é barrado. `git merge`, `git push` e `git branch` seguem livres —
// bloquear esses inviabilizaria a própria rotina (merge da branch na main e push).
// Commit de merge em andamento (MERGE_HEAD presente) também passa.

import { execFileSync } from "node:child_process";

const MAIN_BRANCH = /^(main|master)$/;

const readStdin = async () => {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
};

let input;
try {
  input = JSON.parse((await readStdin()) || "{}");
} catch {
  process.exit(0); // payload ilegível não é motivo para travar o agente
}

// Exige que um segmento do comando COMECE com git: `echo "git commit"` ou um
// grep por essa string não são commits, e barrar isso trava trabalho legítimo.
const IS_GIT_COMMIT = /(^|[|;&]|\bthen\b|\bdo\b)\s*git\s+(-C\s+\S+\s+)?(-c\s+\S+\s+)*commit\b/;

const command = input?.tool_input?.command ?? "";
if (!IS_GIT_COMMIT.test(command)) process.exit(0);

let branch = "";
try {
  branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8",
  }).trim();
} catch {
  process.exit(0); // fora de um repo git não há o que proteger
}
if (!MAIN_BRANCH.test(branch)) process.exit(0);

try {
  execFileSync("git", ["rev-parse", "--verify", "-q", "MERGE_HEAD"], { stdio: "ignore" });
  process.exit(0); // finalizando um merge: é integração, não commit direto
} catch {
  // sem merge em andamento: commit direto na main, bloqueia
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        `Commit direto na '${branch}' é proibido neste repo (CLAUDE.md §9). ` +
        `Faça: git checkout -b <tipo>/<assunto> && git commit ... && git push -u origin <branch>, ` +
        `depois git checkout ${branch} && git merge --no-ff <branch> && git push.`,
    },
  }),
);
