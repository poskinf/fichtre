"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/math";
import { finishText, getSettings, useSettings } from "@/lib/settings";
import { speak } from "@/lib/speech";
import { countStatuses, getProgress, patchEntries, patchEntry, useProgress, type Status } from "@/lib/progress";
import { Mascot } from "./Mascot";
import { ProgressTop } from "./ProgressTop";
import { Highlight, soundOf } from "./Highlight";
import type { Card, Deck } from "@/lib/types";

type Check = "right" | "wrong" | null;

/** A card of the pile; with several words per card it carries the other words, which are read and graded with it. */
type Item = Card & { mates?: Card[] };

const flat = (items: Item[]): Card[] => items.flatMap(({ mates, ...c }) => [c, ...(mates ?? [])]);

/** Shuffles the cards and groups them by the "words per card" setting (sentences and calculations stay alone). */
function buildPile(cards: Card[]): Item[] {
  const shuffled = shuffle(cards);
  const { wordsPerCard, readMode } = getSettings();
  if (wordsPerCard < 2 || readMode === "spell") return shuffled;
  const pile: Item[] = [];
  let group: Card[] = [];
  const flush = () => {
    if (group.length) pile.push({ ...group[0], mates: group.slice(1) });
    group = [];
  };
  for (const c of shuffled) {
    if (c.group === "sentences" || c.answer !== undefined) pile.push(c);
    else {
      group.push(c);
      if (group.length === wordsPerCard) flush();
    }
  }
  flush();
  return pile;
}

const spelled = (text: string) => [...text.toUpperCase()].join(" ");

export function Practice({ deck }: { deck: Deck }) {
  // Pick up where we left off: only cards not yet done (to redo, or not started).
  const progress = useProgress(deck.id);
  const settings = useSettings();
  const [initial] = useState<Item[]>(() => {
    const progress = getProgress(deck.id);
    const left = deck.cards.filter((c) => progress[c.id]?.s !== "ok");
    return buildPile(left.length ? left : deck.cards);
  });
  const [queue, setQueue] = useState<Item[]>(initial);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<Item[]>([]);
  const [hidden, setHidden] = useState(false);
  const [reveals, setReveals] = useState(0);
  const [base, setBase] = useState(initial.length);
  const [value, setValue] = useState("");
  const [check, setCheck] = useState<Check>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const beforeCheck = useRef<{ id: string; s: Status | undefined } | null>(null);
  const history = useRef<{ insertedAt: number | null; missedAdded: boolean; prev: Status | undefined; matesPrev: (Status | undefined)[] }[]>([]);

  const isMath = deck.kind === "math";
  const sound = isMath ? "" : soundOf(deck);
  const done = index >= queue.length;
  const card = queue[index];
  const total = queue.length;
  const { ok, redo } = countStatuses(deck.cards, progress);
  const mode = isMath ? settings.calcMode : settings.readMode;
  const fading = mode !== "normal" && !check;
  const seconds = Math.max(1, isMath ? settings.calcSeconds : settings.seconds);
  const statusOf = (c?: Card) => (c ? getProgress(deck.id)[c.id]?.s : undefined);

  // Flash and spelling modes: the word disappears after a few seconds.
  const cardId = card?.id;
  useEffect(() => {
    setHidden(false);
    if (mode === "normal" || cardId === undefined) return;
    const t = setTimeout(() => setHidden(true), seconds * 1000);
    return () => clearTimeout(t);
  }, [index, cardId, mode, seconds]);

  /** Shows the word again for a few seconds. */
  function reveal() {
    setHidden(false);
    setReveals((n) => n + 1);
    revealTimer.current = setTimeout(() => setHidden(true), seconds * 1000);
  }
  const revealTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(revealTimer.current), [index]);

  function next(wasMissed: boolean) {
    let insertedAt: number | null = null;
    let missedAdded = false;
    if (wasMissed) {
      // A missed card comes back later at a random position (never right after).
      const from = Math.min(queue.length, index + 2);
      insertedAt = from + Math.floor(Math.random() * (queue.length - from + 1));
      setQueue((q) => [...q.slice(0, insertedAt!), card, ...q.slice(insertedAt!)]);
      missedAdded = !missed.some((c) => c.id === card.id);
      if (missedAdded) setMissed((m) => [...m, card]);
    }
    const prev = beforeCheck.current?.id === card.id ? beforeCheck.current.s : getProgress(deck.id)[card.id]?.s;
    beforeCheck.current = null;
    history.current.push({ insertedAt, missedAdded, prev, matesPrev: (card.mates ?? []).map(statusOf) });
    patchEntries(deck.id, {
      [card.id]: { s: wasMissed ? "redo" : "ok" },
      ...Object.fromEntries((card.mates ?? []).map((m) => [m.id, { s: wasMissed ? "redo" : "ok" } as const])),
    });
    setValue("");
    setCheck(null);
    setIndex((i) => i + 1);
  }

  /** Goes back to the previous card, undoing what it caused. */
  function back() {
    const last = history.current.pop();
    if (!last) return;
    // If the current card was just validated without moving on, undo its result too.
    if (beforeCheck.current?.id === card.id) {
      patchEntry(deck.id, card.id, { s: beforeCheck.current.s });
      beforeCheck.current = null;
    }
    const before = queue[index - 1];
    patchEntries(deck.id, {
      [before.id]: { s: last.prev },
      ...Object.fromEntries((before.mates ?? []).map((m, i) => [m.id, { s: last.matesPrev[i] }])),
    });
    if (last.insertedAt !== null) setQueue((q) => q.filter((_, i) => i !== last.insertedAt));
    if (last.missedAdded) setMissed((m) => m.slice(0, -1));
    setValue("");
    setCheck(null);
    setIndex((i) => i - 1);
  }

  /** "Suivant" (next): skip to the next card without grading it; it comes back later in the pile. */
  function skip() {
    if (queue.length - index < 2) return;
    const from = Math.min(queue.length, index + 2);
    const insertedAt = from + Math.floor(Math.random() * (queue.length - from + 1));
    setQueue((q) => [...q.slice(0, insertedAt), card, ...q.slice(insertedAt)]);
    history.current.push({ insertedAt, missedAdded: false, prev: statusOf(card), matesPrev: (card.mates ?? []).map(statusOf) });
    setValue("");
    setCheck(null);
    setIndex((i) => i + 1);
  }

  function restart(cards: Card[]) {
    setQueue(buildPile(cards));
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

  // Space bar = OK: "Je sais" (reading) or Valider / Suivant (math).
  const onSpace = useRef<() => void>(() => {});
  onSpace.current = () => {
    if (done) return;
    if (!isMath) return next(false);
    if (check) return next(check === "wrong");
    if (value.trim()) onSubmit();
  };
  // Backspace = previous card (in math: only when the input is empty).
  const onBackspace = useRef<() => void>(() => {});
  onBackspace.current = () => {
    back();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.code !== "Space" && e.code !== "Backspace")) return;
      const t = e.target as HTMLElement;
      if (e.code === "Space") {
        if (t.closest("button, a")) return; // a focused button already handles the space key
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
              <button type="button" className="btn primary full" onClick={() => restart(flat(missed))}>
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
  const text = [card.front, ...(card.mates ?? []).map((m) => m.front)].join(" ");
  const shown = isMath && check === "wrong" ? `${card.front} = ${card.answer}` : mode === "spell" ? spelled(text) : text;
  const size = shown.length > 16 ? "xlong" : shown.length > 8 ? "long" : "";

  return (
    <main className="shell play">
      <div>
        <h1 className="sheet-title">{deck.title}</h1>
        <ProgressTop label={`${ok} / ${deck.cards.length}${redo ? ` · ${redo} ${isMath ? "faux" : "à corriger"}` : ""}`} value={ok} max={deck.cards.length} />
      </div>

      <div className="stage">
        <div key={`${index}-${card.id}`} className={`card tone-${tone} ${size} ${sound ? "has-sound" : ""} ${check ?? ""}`}>
          {hidden && !check ? (
            <span aria-label="Mot caché">• • •</span>
          ) : (
            <span key={`${reveals}-${check}`} className={fading ? "fade-out" : undefined} style={fading ? { animationDuration: `${seconds}s` } : undefined}>
              {isMath || mode === "spell" ? (
                shown
              ) : (
                <>
                  <Highlight text={card.front} sound={sound} />
                  {card.mates?.map((m) => (
                    <span key={m.id}>
                      {" "}
                      <Highlight text={m.front} sound={sound} />
                    </span>
                  ))}
                </>
              )}
            </span>
          )}
        </div>
      </div>
      {mode === "spell" && (
        <p className="hint" style={{ textAlign: "center" }}>
          Épelle le mot lettre par lettre, puis dis le mot.
        </p>
      )}

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
          {fading && hidden && (
            <button type="button" className="btn" onClick={reveal}>
              <Icon name="eye" />
              Montrer le calcul
            </button>
          )}
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
          {mode !== "normal" && hidden && (
            <button type="button" className="btn full" onClick={reveal}>
              <Icon name="eye" />
              Montrer le mot
            </button>
          )}
          <div className="tool-row full">
            <button type="button" className="tool prev" onClick={back} disabled={index === 0}>
              <Icon name="left" />
              Précédent
            </button>
            <button type="button" className="tool listen" onClick={() => speak(text)}>
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
