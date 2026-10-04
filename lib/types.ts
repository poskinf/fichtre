export type DeckKind = "words" | "math";

export type Card = {
  id: string;
  /** Mot à lire, ou calcul (ex: "3 + 1") */
  front: string;
  /** Réponse attendue (calculs uniquement) */
  answer?: string;
  /** Partie de la fiche : "Syllabes", "Mots" ou "Phrases" (lecture uniquement) */
  group?: string;
};

export type Deck = {
  id: string;
  title: string;
  /** Son à mettre en gras dans les mots (lecture), ex. "u" */
  sound?: string;
  kind: DeckKind;
  cards: Card[];
};

/** Parties d'une fiche de lecture, dans l'ordre de la feuille. */
export const SECTIONS = [
  { key: "Syllabes", title: "Je lis des syllabes.", placeholder: "lu" },
  { key: "Mots", title: "Je lis des mots.", placeholder: "tube" },
  { key: "Phrases", title: "Je lis des phrases.", placeholder: "Tu as lu un livre sur le mur." },
] as const;
