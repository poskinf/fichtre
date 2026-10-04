"use client";

import { useSyncExternalStore } from "react";

const KEY = "fichtre.parent";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function setParentMode(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
}

export function useParentMode() {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => void listeners.delete(cb)),
    read,
    () => false,
  );
}
