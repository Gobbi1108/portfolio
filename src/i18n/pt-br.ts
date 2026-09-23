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
      {
        title: "Em equipe",
        body: "Código bom sozinho é rascunho. A parte que vale é destravar o outro.",
      },
      {
        title: "Troubleshooting",
        body: "Sintoma não é causa. Vou até a raiz antes de propor conserto.",
      },
      {
        title: "Segurança",
        body: "Pós em Cybersegurança em curso — penso em quem vai tentar quebrar.",
      },
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
};
