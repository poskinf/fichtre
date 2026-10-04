"use client";

import { useSyncExternalStore } from "react";

/** The sheet's instruction shown in the header: the page publishes it, the header reads it. */
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
