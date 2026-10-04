"use client";

import { useEffect, useState } from "react";

let loading: Promise<Set<string>> | null = null;

/** Liste de mots français (public/fr-words.txt), chargée une seule fois et seulement si besoin. */
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

/** `null` tant que le dictionnaire n'est pas chargé (ou indisponible) : on ne signale alors rien. */
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

/** Vrai si le mot est inconnu du dictionnaire (« l'ami », « grand-mère » : on vérifie chaque partie). */
export function isUnknown(text: string, words: Set<string>): boolean {
  const t = text.trim().toLowerCase();
  if (!t || words.has(t)) return false;
  return t.split(/[\s'’-]+/).some((part) => part.length > 1 && !words.has(part));
}
