"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { setInstruction } from "@/lib/instruction-store";
import { finishText, useSettings } from "@/lib/settings";
import { countStatuses, patchEntries, patchEntry, useProgress, type Status } from "@/lib/progress";
import type { Card, Deck } from "@/lib/types";
import { Icon } from "./Icon";
import { ProgressTop } from "./ProgressTop";

const norm = (v: string | undefined) => (v ?? "").trim().replace(",", ".");

/** Status of a line: right, wrong, or not done yet when it is empty. */
const statusOf = (c: Card, answer: string | undefined): Status | undefined =>
  !norm(answer) ? undefined : norm(answer) === String(c.answer) ? "ok" : "redo";

/** The math worksheet as on paper: write the answers, then check them. */
export function MathSheet({ deck }: { deck: Deck }) {
  const progress = useProgress(deck.id);
  const settings = useSettings();
  // The sheet opens already checked if it was checked before or if cards were played.
  const [checked, setChecked] = useState(() => deck.cards.some((c) => progress[c.id]?.s));

  const { ok, redo } = countStatuses(deck.cards, progress);

  useEffect(() => {
    setInstruction("Écris la réponse de chaque calcul.");
    return () => setInstruction(null);
  }, []);

  function correct() {
    setChecked(true);
    patchEntries(deck.id, Object.fromEntries(deck.cards.map((c) => [c.id, { s: statusOf(c, progress[c.id]?.a) }])));
  }

  function onChange(c: Card, answer: string) {
    // Once checked, the sheet updates line by line.
    patchEntry(deck.id, c.id, { a: answer, ...(checked ? { s: statusOf(c, answer) } : {}) });
  }

  function onEnter(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    document.getElementById(`ans-${i + 1}`)?.focus();
  }

  return (
    <main className="shell sheet-page">
      {ok === deck.cards.length && deck.cards.length > 0 && (
        <p className="done-banner" role="status">
          <Icon name="check" />
          {finishText(settings)}
        </p>
      )}
      <ProgressTop label={`${ok} / ${deck.cards.length}${redo ? ` · ${redo} faux` : ""}`} value={ok} max={deck.cards.length} />
      <article className="paper">
        <header className="paper-head">
          <h1>{deck.title}</h1>
          <p className="first-name">
            Prénom : <span className={settings.name.trim() ? "name" : ""}>{settings.name.trim()}</span>
          </p>
        </header>

        <section className="sheet-section">
        <ul className="calc-grid">
          {deck.cards.map((c, i) => {
            const status = progress[c.id]?.s;
            const cls = status === "ok" ? "right" : status === "redo" ? "wrong" : checked ? "empty" : "";
            return (
              <li key={c.id} className={`calc ${cls}`}>
                <label htmlFor={`ans-${i}`}>{c.front} =</label>
                <input
                  id={`ans-${i}`}
                  inputMode="numeric"
                  autoComplete="off"
                  enterKeyHint={i === deck.cards.length - 1 ? "done" : "next"}
                  value={progress[c.id]?.a ?? ""}
                  onChange={(e) => onChange(c, e.target.value)}
                  onKeyDown={(e) => onEnter(e, i)}
                />
                {checked && (
                  <span className="verdict">
                    <Icon name={status === "ok" ? "check" : status === "redo" ? "close" : "redo"} />
                    <span className="sr-only">{status === "ok" ? "Juste" : status === "redo" ? "Faux" : "Pas de réponse"}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        </section>
      </article>

      {!checked && (
        <div className="sheet-footer actions">
          <button type="button" className="btn primary big-action wide" onClick={correct}>
            <Icon name="check" />
            Corriger
          </button>
        </div>
      )}
    </main>
  );
}
