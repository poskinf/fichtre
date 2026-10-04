"use client";

import { useSyncExternalStore } from "react";
import type { Card } from "./types";

/** ok = done, redo = to redo; no entry = not done yet. */
export type Status = "ok" | "redo";
export type Entry = { s?: Status; /** answer typed on the math sheet */ a?: string };
export type DeckProgress = Record<string, Entry>;

const KEY = "fichtre.progress.v1";
const EMPTY: DeckProgress = {};
const EMPTY_ALL: Record<string, DeckProgress> = {};
const listeners = new Set<() => void>();
let cache: Record<string, DeckProgress> | null = null;

function read(): Record<string, DeckProgress> {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    cache = {};
  }
  return cache!;
}

function write(next: Record<string, DeckProgress>) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep it in memory */
  }
  listeners.forEach((l) => l());
}

export function useProgress(deckId: string): DeckProgress {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => void listeners.delete(cb)),
    () => read()[deckId] ?? EMPTY,
    () => EMPTY,
  );
}

/** All the progress (to count finished decks on the home page). */
export function useAllProgress(): Record<string, DeckProgress> {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => void listeners.delete(cb)),
    read,
    () => EMPTY_ALL,
  );
}

export const getProgress = (deckId: string): DeckProgress => read()[deckId] ?? EMPTY;

/** Updates several cards at once; an `undefined` value clears the field. */
export function patchEntries(deckId: string, updates: Record<string, Partial<Entry>>) {
  const deck = { ...getProgress(deckId) };
  for (const [cardId, patch] of Object.entries(updates)) {
    const entry: Entry = { ...deck[cardId], ...patch };
    if (entry.s === undefined) delete entry.s;
    if (entry.a === undefined || entry.a === "") delete entry.a;
    if (Object.keys(entry).length) deck[cardId] = entry;
    else delete deck[cardId];
  }
  write({ ...read(), [deckId]: deck });
}

export const patchEntry = (deckId: string, cardId: string, patch: Partial<Entry>) =>
  patchEntries(deckId, { [cardId]: patch });

export function resetProgress(deckId: string) {
  const { [deckId]: _removed, ...rest } = read();
  write(rest);
}

export function countStatuses(cards: Card[], progress: DeckProgress) {
  const ok = cards.filter((c) => progress[c.id]?.s === "ok").length;
  const redo = cards.filter((c) => progress[c.id]?.s === "redo").length;
  return { ok, redo, todo: cards.length - ok - redo };
}
