"use client";

import { useSyncExternalStore } from "react";

export type Settings = {
  /** The child's first name, written on the sheets */
  name: string;
  /** Message shown when a deck is finished. `{nom}` is the (French) placeholder replaced by the first name. */
  finishMessage: string;
  /** How reading cards are shown: normally, as a flash (word hidden after `seconds`), or spelled letter by letter */
  readMode: ReadMode;
  /** Seconds before the word or the letters disappear (flash and spelling modes) */
  seconds: number;
  /** How calculation cards are shown: normally, or as a flash (calculation fades out after `calcSeconds`) */
  calcMode: "normal" | "flash";
  /** Seconds before the calculation disappears (flash mode) */
  calcSeconds: number;
  /** Number of words shown on each reading card (1 to 5) */
  wordsPerCard: number;
};

export type ReadMode = "normal" | "flash" | "spell";

export const DEFAULT_FINISH_MESSAGE = "Bravo {nom} ! Fiche terminée.";

const KEY = "fichtre.settings.v1";
export const DEFAULTS: Settings = { name: "", finishMessage: DEFAULT_FINISH_MESSAGE, readMode: "normal", seconds: 10, calcMode: "normal", calcSeconds: 10, wordsPerCard: 1 };
const listeners = new Set<() => void>();
let cache: Settings | null = null;

function read(): Settings {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    cache = DEFAULTS;
  }
  return cache!;
}

export const getSettings = read;

export function saveSettings(patch: Partial<Settings>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable: keep it in memory */
  }
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => void listeners.delete(cb)),
    read,
    () => DEFAULTS,
  );
}

/** Finish message with the first name filled in (or without it when no name is set). */
export function finishText(s: Settings): string {
  const template = s.finishMessage.trim() || DEFAULT_FINISH_MESSAGE;
  const name = s.name.trim();
  return (name ? template.replaceAll("{nom}", name) : template.replace(/\s*\{nom\}/g, "")).replace(/\s+([!?.,])/g, " $1").replace(/\s{2,}/g, " ").trim();
}

/**
 * Title of the journal with the first name: "Journal de classe d'Emma" (home, settings).
 * `short` gives "Journal d'Emma" for the header, where space is tight.
 * Without a first name: "Journal de classe".
 */
export function journalTitle(s: Settings, short = false): string {
  const name = s.name.trim();
  if (!name) return "Journal de classe";
  const of = /^[aeiouyàâäéèêëîïôöùûüœæh]/i.test(name) ? `d’${name}` : `de ${name}`;
  return short ? `Journal ${of}` : `Journal de classe ${of}`;
}
