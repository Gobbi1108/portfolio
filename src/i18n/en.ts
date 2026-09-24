import type { ptBr } from "./pt-br";

// Tipado contra o PT de propósito: chave faltando, renomeada ou com tipo
// diferente quebra `npm run typecheck`. É a verificação de paridade inteira,
// feita pelo compilador, sem código de runtime.
export const en: typeof ptBr = {
  ui: {
    skipToContent: "Skip to content",
    langLabel: "Language",
    otherLangName: "Português",
  },
  hero: {
    name: "Gabriel Gobbi",
    role: "Frontend Developer",
    focus: "Flutter & Web",
    scrollHint: "scroll",
  },
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
      {
        company: "Ipeuna City Hall",
        role: "IT Intern",
        period: "Jan 2025 — Dec 2025",
        note: "Support, infrastructure and asset control. Where I learned to find the cause before touching anything.",
      },
      {
        company: "Vivida",
        role: "Software Developer",
        period: "Jan 2026 — May 2026",
        note: "FlutterWeb project, remote. First professional contact with product and client deadlines.",
      },
      {
        company: "Korin",
        role: "IT Assistant",
        period: "Jul 2026 — now",
        note: "Software management and support, while the development career grows alongside.",
      },
    ],
  },
  howIWork: {
    heading: "How I work",
    traits: [
      {
        title: "As a team",
        body: "Good code written alone is a draft. The part that counts is unblocking someone else.",
      },
      {
        title: "Root cause",
        body: "A symptom is not a cause. I go to the root before proposing a fix.",
      },
      {
        title: "Security",
        body: "Cybersecurity postgrad in progress — I think about whoever will try to break it.",
      },
    ],
  },
  contact: {
    heading: "Contact",
    invite: "Open to frontend roles. Say hi.",
    email: "gabgobs@gmail.com",
    github: "https://github.com/Gobbi1108",
    linkedin: "https://www.linkedin.com/in/gabriel-gobbi-2459b423b/",
    emailLabel: "Email",
    githubLabel: "GitHub",
    linkedinLabel: "LinkedIn",
  },
};
