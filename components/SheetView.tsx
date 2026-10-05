"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { setInstruction } from "@/lib/instruction-store";
import { finishText, useSettings } from "@/lib/settings";
import { countStatuses, patchEntry, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { DEFAULT_SECTION, SECTIONS, type Deck } from "@/lib/types";
import { Highlight, soundOf } from "./Highlight";
import { Icon } from "./Icon";
import { ProgressTop } from "./ProgressTop";

/** The worksheet as on paper: circle what you can read. */
export function SheetView({ deck }: { deck: Deck }) {
  const progress = useProgress(deck.id);
  const settings = useSettings();
  const sound = soundOf(deck);
  const [listen, setListen] = useState(false);

  const onWord = (id: string, text: string) => {
    if (listen) return speak(text);
    patchEntry(deck.id, id, { s: progress[id]?.s === "ok" ? undefined : "ok" });
  };

  const { ok, redo } = countStatuses(deck.cards, progress);

  const instruction = listen ? "Touche un mot pour l’entendre." : "Entoure ce que tu arrives à lire à voix haute.";
  useEffect(() => {
    setInstruction(instruction);
    return () => setInstruction(null);
  }, [instruction]);

  return (
    <main className="shell sheet-page">
      {ok === deck.cards.length && deck.cards.length > 0 && (
        <p className="done-banner" role="status">
          <Icon name="check" />
          {finishText(settings)}
        </p>
      )}
      <ProgressTop label={`${ok} / ${deck.cards.length}${redo ? ` · ${redo} à corriger` : ""}`} value={ok} max={deck.cards.length} />
      <article className="paper">
        <header className="paper-head">
          <h1 className="sr-only">{deck.title}</h1>
          <p className="first-name">
            Prénom : <span className={settings.name.trim() ? "name" : ""}>{settings.name.trim()}</span>
          </p>
        </header>
        {SECTIONS.map((sec) => {
        const cards = deck.cards.filter((c) => (c.group ?? DEFAULT_SECTION) === sec.key);
        if (cards.length === 0) return null;
        return (
          <section key={sec.key} className="sheet-section" aria-labelledby={`h-${sec.key}`}>
            <h2 id={`h-${sec.key}`}>{sec.title}</h2>
            <ul className={`sheet-grid ${sec.key === "sentences" ? "sentences" : ""}`}>
              {cards.map((c) => {
                const status = progress[c.id]?.s;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`word ${sound ? "has-sound" : ""} ${status === "redo" ? "redo" : ""}`}
                      aria-pressed={listen ? undefined : status === "ok"}
                      onClick={() => onWord(c.id, c.front)}
                    >
                      <Highlight text={c.front} sound={sound} />
                      {status === "redo" && <span className="sr-only"> (à corriger)</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      </article>

      <div className="sheet-footer actions">
        <div className="action-row" role="group" aria-label="Que fait un appui sur un mot ?">
          <button type="button" className={`btn big-action ${!listen ? "primary" : ""}`} aria-pressed={!listen} onClick={() => setListen(false)}>
            <Icon name="ring" />
            Entourer
          </button>
          <button type="button" className={`btn big-action ${listen ? "primary" : ""}`} aria-pressed={listen} onClick={() => setListen(true)}>
            <Icon name="speaker" />
            Écouter
          </button>
        </div>
      </div>
    </main>
  );
}
