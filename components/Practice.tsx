"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/math";
import { finishText, useSettings } from "@/lib/settings";
import { speak } from "@/lib/speech";
import { countStatuses, getProgress, patchEntry, useProgress, type Status } from "@/lib/progress";
import { Mascot } from "./Mascot";
import { ProgressTop } from "./ProgressTop";
import { Highlight, soundOf } from "./Highlight";
import type { Card, Deck } from "@/lib/types";

type Check = "right" | "wrong" | null;

export function Practice({ deck }: { deck: Deck }) {
  // On reprend là où on en est : seules les cartes pas encore réussies (à corriger ou pas encore faites).
  const progress = useProgress(deck.id);
  const settings = useSettings();
  const [initial] = useState<Card[]>(() => {
    const progress = getProgress(deck.id);
    const left = deck.cards.filter((c) => progress[c.id]?.s !== "ok");
    return shuffle(left.length ? left : deck.cards);
  });
  const [queue, setQueue] = useState<Card[]>(initial);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);
  const [base, setBase] = useState(initial.length);
  const [value, setValue] = useState("");
  const [check, setCheck] = useState<Check>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const beforeCheck = useRef<{ id: string; s: Status | undefined } | null>(null);
  const history = useRef<{ insertedAt: number | null; missedAdded: boolean; prev: Status | undefined }[]>([]);

  const isMath = deck.kind === "math";
  const sound = isMath ? "" : soundOf(deck);
  const done = index >= queue.length;
  const card = queue[index];
  const total = queue.length;
  const { ok, redo } = countStatuses(deck.cards, progress);

  function next(wasMissed: boolean) {
    let insertedAt: number | null = null;
    let missedAdded = false;
    if (wasMissed) {
      // La carte ratée revient plus tard, à une place au hasard (pas juste après).
      const from = Math.min(queue.length, index + 2);
      insertedAt = from + Math.floor(Math.random() * (queue.length - from + 1));
      setQueue((q) => [...q.slice(0, insertedAt!), card, ...q.slice(insertedAt!)]);
      missedAdded = !missed.some((c) => c.id === card.id);
      if (missedAdded) setMissed((m) => [...m, card]);
    }
    const prev = beforeCheck.current?.id === card.id ? beforeCheck.current.s : getProgress(deck.id)[card.id]?.s;
    beforeCheck.current = null;
    history.current.push({ insertedAt, missedAdded, prev });
    patchEntry(deck.id, card.id, { s: wasMissed ? "redo" : "ok" });
    setValue("");
    setCheck(null);
    setIndex((i) => i + 1);
  }

  /** Revient à la carte précédente en annulant ce qu'elle avait provoqué. */
  function back() {
    const last = history.current.pop();
    if (!last) return;
    // Si la carte en cours vient d'être validée sans passer à la suivante, on annule aussi son résultat.
    if (beforeCheck.current?.id === card.id) {
      patchEntry(deck.id, card.id, { s: beforeCheck.current.s });
      beforeCheck.current = null;
    }
    patchEntry(deck.id, queue[index - 1].id, { s: last.prev });
    if (last.insertedAt !== null) setQueue((q) => q.filter((_, i) => i !== last.insertedAt));
    if (last.missedAdded) setMissed((m) => m.slice(0, -1));
    setValue("");
    setCheck(null);
    setIndex((i) => i - 1);
  }

  /** « Suivant » : on passe à la carte d'après sans la noter ; elle revient plus tard dans la pile. */
  function skip() {
    if (queue.length - index < 2) return;
    const from = Math.min(queue.length, index + 2);
    const insertedAt = from + Math.floor(Math.random() * (queue.length - from + 1));
    setQueue((q) => [...q.slice(0, insertedAt), card, ...q.slice(insertedAt)]);
    history.current.push({ insertedAt, missedAdded: false, prev: getProgress(deck.id)[card.id]?.s });
    setValue("");
    setCheck(null);
    setIndex((i) => i + 1);
  }

  function restart(cards: Card[]) {
    setQueue(shuffle(cards));
    setBase(cards.length);
    history.current = [];
    setIndex(0);
    setMissed([]);
    setValue("");
    setCheck(null);
  }

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (check) return next(check === "wrong");
    if (!value.trim()) return;
    const ok = value.trim().replace(",", ".") === String(card.answer).replace(",", ".");
    beforeCheck.current = { id: card.id, s: getProgress(deck.id)[card.id]?.s };
    patchEntry(deck.id, card.id, { a: value.trim(), s: ok ? "ok" : "redo" });
    setCheck(ok ? "right" : "wrong");
  }

  // Barre d'espace = OK : « Je sais » (lecture) ou Valider / Suivant (calcul).
  const onSpace = useRef<() => void>(() => {});
  onSpace.current = () => {
    if (done) return;
    if (!isMath) return next(false);
    if (check) return next(check === "wrong");
    if (value.trim()) onSubmit();
  };
  // Retour arrière = carte précédente (en calcul : seulement si le champ est vide).
  const onBackspace = useRef<() => void>(() => {});
  onBackspace.current = () => {
    back();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.code !== "Space" && e.code !== "Backspace")) return;
      const t = e.target as HTMLElement;
      if (e.code === "Space") {
        if (t.closest("button, a")) return; // le bouton gère déjà l'espace
        e.preventDefault();
        onSpace.current();
      } else if (!(t instanceof HTMLInputElement && t.value && !t.readOnly)) {
        e.preventDefault();
        onBackspace.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (done) {
    const good = base - missed.length;
    const progress = getProgress(deck.id);
    const finished = deck.cards.every((c) => progress[c.id]?.s === "ok");
    return (
      <main className="shell">
        <div className="result">
          <div style={{ justifySelf: "center" }}>
            <Mascot size={150} />
          </div>
          <h1>{finished ? finishText(settings) : `${missed.length === 0 ? "Bravo" : "Bien joué"}${settings.name.trim() ? ` ${settings.name.trim()}` : ""} !`}</h1>
          <p className="score" aria-live="polite">
            {good} / {base}
          </p>
          <div className="controls">
            {missed.length > 0 && (
              <button type="button" className="btn primary full" onClick={() => restart(missed)}>
                <Icon name="redo" />
                Refaire les {missed.length} à revoir
              </button>
            )}
            <button type="button" className="btn" onClick={() => restart(deck.cards)}>
              <Icon name="redo" />
              Recommencer
            </button>
            <Link href={`/sheet/${deck.id}`} className="btn">
              <Icon name="sheet" />
              Voir la feuille
            </Link>
            <Link href="/" className="btn">
              <Icon name="home" />
              Mes fiches
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tone = (isMath ? 2 : 0) + (index % 2);
  const shown = isMath && check === "wrong" ? `${card.front} = ${card.answer}` : card.front;
  const size = shown.length > 16 ? "xlong" : shown.length > 8 ? "long" : "";

  return (
    <main className="shell play">
      <div>
        <h1 className="sheet-title">{deck.title}</h1>
        <ProgressTop label={`${ok} / ${deck.cards.length}${redo ? ` · ${redo} ${isMath ? "faux" : "à corriger"}` : ""}`} value={ok} max={deck.cards.length} />
      </div>

      <div className="stage">
        <div key={`${index}-${card.id}`} className={`card tone-${tone} ${size} ${sound ? "has-sound" : ""} ${check ?? ""}`}>
          <span>
            {isMath ? shown : <Highlight text={card.front} sound={sound} />}
          </span>
        </div>
      </div>

      {isMath ? (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div className="answer-row">
            <label className="sr-only" htmlFor="answer">
              Ta réponse
            </label>
            <input
              id="answer"
              ref={inputRef}
              name="answer"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              readOnly={check !== null}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="?"
            />
          </div>
          <p className={`feedback ${check ?? ""}`} aria-live="polite">
            {check === "right" ? "Juste !" : check === "wrong" ? `C’est ${card.answer}.` : ""}
          </p>
          <div className="nav-row">
            <button type="button" className="btn" onClick={back} disabled={index === 0}>
              <Icon name="left" />
              Précédent
            </button>
            <button type="submit" className={`btn ${check ? "primary" : "good"}`}>
              <Icon name={check ? "right" : "check"} />
              {check ? "Suivant" : "Valider"}
            </button>
          </div>
        </form>
      ) : (
        <div className="controls">
          <div className="tool-row full">
            <button type="button" className="tool prev" onClick={back} disabled={index === 0}>
              <Icon name="left" />
              Précédent
            </button>
            <button type="button" className="tool listen" onClick={() => speak(card.front)}>
              <Icon name="speaker" />
              Écouter
            </button>
            <button type="button" className="tool next" onClick={skip} disabled={queue.length - index < 2}>
              <Icon name="right" />
              Suivant
            </button>
          </div>
          <button type="button" className="btn again" onClick={() => next(true)}>
            <Icon name="redo" />
            À revoir
          </button>
          <button type="button" className="btn good" onClick={() => next(false)}>
            <Icon name="check" />
            Je sais
          </button>
        </div>
      )}
    </main>
  );
}
