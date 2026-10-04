export type DeckKind = "words" | "math";

export type Card = {
  id: string;
  /** Word to read, or calculation (e.g. "3 + 1") */
  front: string;
  /** Expected answer (calculations only) */
  answer?: string;
  /** Section of the deck: "syllables", "words" or "sentences" (reading decks only) */
  group?: SectionKey;
};

export type Deck = {
  id: string;
  title: string;
  /** Sound to put in bold in the words (reading), e.g. "u" */
  sound?: string;
  kind: DeckKind;
  cards: Card[];
};

/** Sections of a reading deck, in the order they appear on the sheet. `title`, `noun` and `placeholder` are UI text (French). */
export const SECTIONS = [
  { key: "syllables", title: "Je lis des syllabes.", noun: "syllabe", placeholder: "lu" },
  { key: "words", title: "Je lis des mots.", noun: "mot", placeholder: "tube" },
  { key: "sentences", title: "Je lis des phrases.", noun: "phrase", placeholder: "Tu as lu un livre sur le mur." },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

/** Section a card without a `group` belongs to. */
export const DEFAULT_SECTION: SectionKey = "words";
