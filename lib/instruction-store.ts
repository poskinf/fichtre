"use client";

import { useSyncExternalStore } from "react";

/** Consigne de la feuille affichée dans l'en-tête : la page la publie, l'en-tête la lit. */
let current: string | null = null;
const listeners = new Set<() => void>();

export function setInstruction(text: string | null) {
  if (text === current) return;
  current = text;
  listeners.forEach((l) => l());
}

export function useInstruction(): string | null {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => void listeners.delete(cb)),
    () => current,
    () => null,
  );
}
