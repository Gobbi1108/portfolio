import { ptBr } from "./pt-br";
import { en } from "./en";

export type Locale = "pt-br" | "en";
export type Dict = typeof ptBr;

export const DICT: Record<Locale, Dict> = { "pt-br": ptBr, en };

/** Atributo lang do <html> por locale. */
export const HTML_LANG: Record<Locale, "pt-BR" | "en"> = { "pt-br": "pt-BR", en: "en" };
