"use client";

import { useSyncExternalStore } from "react";
import type { Deck } from "./types";
import { evaluate, generateCalcs, prettify } from "./math";

const KEY = "fichtre.decks.v1";

const words = (s: string) => s.split(/\s+/).map((w, i) => ({ id: `w${i}`, front: w }));

const SEED: Deck[] = [
  {
    id: "seed-lecture",
    title: "Lecture : petits mots",
    kind: "words",
    cards: words("un une ta ton tes la le les l' ce ces ma mon mes sa son ses des"),
  },
  {
    id: "seed-math",
    title: "Additions avec 0 et 1",
    kind: "math",
    cards: generateCalcs("+", 0, 9, [0, 1], true).map((c, i) => ({
      id: `m${i}`,
      front: c,
      answer: String(evaluate(c)),
    })),
  },
];

const SON_U: Deck = {
  id: "seed-son-u",
  title: "Le son u : la lune",
  sound: "u",
  kind: "words",
  cards: [
    ...("lu mu ru tu su ju bu fu vu pu nu cru gru zu dru flu dur jul sur bus tut".split(" ").map((front, i) => ({ id: `s${i}`, front, group: "Syllabes" }))),
    ...("tube jupe pull tissu purée murmure cuisine plume sucre bulle tortue nuage flûte cactus fruit parachute".split(" ").map((front, i) => ({ id: `o${i}`, front, group: "Mots" }))),
    { id: "p0", front: "Tu as lu un livre sur le mur dans la rue.", group: "Phrases" },
  ],
};

/** Fiches ajoutées après coup : ajoutées une seule fois aux fiches déjà enregistrées. */
const ADDONS: { flag: string; deck: Deck }[] = [{ flag: "fichtre.addon.son-u", deck: SON_U }];

let cache: Deck[] | null = null;
const listeners = new Set<() => void>();

function read(): Deck[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Deck[]) : SEED;
  } catch {
    cache = SEED;
  }
  for (const { flag, deck } of ADDONS) {
    try {
      if (localStorage.getItem(flag)) continue;
      localStorage.setItem(flag, "1");
      if (!cache.some((d) => d.id === deck.id)) cache = [...cache, deck];
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {}
  }
  return cache;
}

function write(next: Deck[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : on garde en mémoire */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** `null` pendant le rendu serveur / avant hydratation. */
export function useDecks(): Deck[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function saveDeck(deck: Deck) {
  const all = read();
  write(all.some((d) => d.id === deck.id) ? all.map((d) => (d.id === deck.id ? deck : d)) : [...all, deck]);
}

export function deleteDeck(id: string) {
  write(read().filter((d) => d.id !== id));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Texte (1 entrée par ligne) -> cartes. */
export function parseCards(kind: Deck["kind"], text: string, splitCommas = true) {
  const lines = text
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (kind === "words") {
    return lines.flatMap((l) => (splitCommas ? l.split(",").map((w) => w.trim()).filter(Boolean) : [l])).map((front) => ({ id: newId(), front }));
  }
  return lines.flatMap((l) => {
    const [expr, explicit] = l.split("=").map((s) => s.trim());
    const value = explicit || (evaluate(expr) !== null ? String(evaluate(expr)) : "");
    return value ? [{ id: newId(), front: prettify(expr), answer: value }] : [];
  });
}

export function cardsToText(deck: Deck) {
  return deck.cards.map((c) => c.front).join("\n");
}
