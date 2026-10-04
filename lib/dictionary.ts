"use client";

import { useEffect, useState } from "react";

let loading: Promise<Set<string>> | null = null;

/** French word list (public/fr-words.txt), loaded once and only when needed. */
function loadWords(): Promise<Set<string>> {
  loading ??= fetch("/fr-words.txt")
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    .then((t) => new Set(t.split("\n")))
    .catch(() => {
      loading = null;
      return new Set<string>();
    });
  return loading;
}

/** `null` until the dictionary is loaded (or if it is unavailable): nothing is flagged then. */
export function useWords(enabled: boolean): Set<string> | null {
  const [words, setWords] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadWords().then((w) => alive && w.size > 0 && setWords(w));
    return () => {
      alive = false;
    };
  }, [enabled]);
  return words;
}

/** True if the word is unknown to the dictionary ("l'ami", "grand-mère": each part is checked). */
export function isUnknown(text: string, words: Set<string>): boolean {
  const t = text.trim().toLowerCase();
  if (!t || words.has(t)) return false;
  return t.split(/[\s'’-]+/).some((part) => part.length > 1 && !words.has(part));
}
