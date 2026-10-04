"use client";

import { useSyncExternalStore } from "react";

export type Settings = {
  /** Prénom de l'enfant, écrit sur les feuilles */
  name: string;
  /** Message quand une fiche est finie ; {nom} est remplacé par le prénom */
  finishMessage: string;
};

export const DEFAULT_FINISH_MESSAGE = "Bravo {nom} ! Fiche terminée.";

const KEY = "fichtre.settings.v1";
const DEFAULTS: Settings = { name: "", finishMessage: DEFAULT_FINISH_MESSAGE };
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

export function saveSettings(patch: Partial<Settings>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* stockage indisponible : on garde en mémoire */
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

/** Message de fin de fiche, avec le prénom (ou sans, s'il n'est pas renseigné). */
export function finishText(s: Settings): string {
  const template = s.finishMessage.trim() || DEFAULT_FINISH_MESSAGE;
  const name = s.name.trim();
  return (name ? template.replaceAll("{nom}", name) : template.replace(/\s*\{nom\}/g, "")).replace(/\s+([!?.,])/g, " $1").replace(/\s{2,}/g, " ").trim();
}

/**
 * Nom du journal avec le prénom : « Journal de classe d'Emma » (accueil, réglages).
 * `short` donne « Journal d'Emma », pour l'en-tête où la place manque.
 * Sans prénom : « Journal de classe ».
 */
export function journalTitle(s: Settings, short = false): string {
  const name = s.name.trim();
  if (!name) return "Journal de classe";
  const of = /^[aeiouyàâäéèêëîïôöùûüœæh]/i.test(name) ? `d’${name}` : `de ${name}`;
  return short ? `Journal ${of}` : `Journal de classe ${of}`;
}
