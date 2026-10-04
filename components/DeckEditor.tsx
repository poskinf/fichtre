"use client";

import Link from "next/link";
import { Icon } from "./Icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { newId, parseCards, saveDeck } from "@/lib/decks";
import { generateCalcs, type Op } from "@/lib/math";
import { DEFAULT_SECTION, SECTIONS, type Card, type Deck, type DeckKind } from "@/lib/types";
import { RowList, toRows, type Row } from "./RowList";

const MATH = "calc";
const KEYS = [MATH, ...SECTIONS.map((s) => s.key)];

const parseList = (s: string) =>
  s
    .split(/[,\s;]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0);

/** One list of rows per section: a single one for math, three for reading. */
function initialLists(deck?: Deck): Record<string, Row[]> {
  const lists: Record<string, Row[]> = {};
  for (const k of KEYS) {
    const key = deck?.kind === "math" ? (k === MATH ? k : null) : k === MATH ? null : k;
    const fronts = key && deck ? deck.cards.filter((c) => (deck.kind === "math" ? true : (c.group ?? DEFAULT_SECTION) === k)).map((c) => c.front) : [];
    lists[k] = toRows(fronts.length ? fronts : [""]);
  }
  return lists;
}

export function DeckEditor({ deck }: { deck?: Deck }) {
  const router = useRouter();
  const [title, setTitle] = useState(deck?.title ?? "");
  const [sound, setSound] = useState(deck?.sound ?? "");
  const [kind, setKind] = useState<DeckKind>(deck?.kind ?? "words");
  const [lists, setLists] = useState(() => initialLists(deck));

  const setList = (key: string) => (update: (rows: Row[]) => Row[]) =>
    setLists((all) => ({ ...all, [key]: update(all[key]) }));

  // Calculation generator
  const [op, setOp] = useState<Op>("+");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(9);
  const [bs, setBs] = useState("0, 1");
  const [both, setBoth] = useState(true);

  const cards: Card[] =
    kind === "math"
      ? parseCards("math", lists[MATH].map((r) => r.text).join("\n"))
      : SECTIONS.flatMap((sec) =>
          parseCards("words", lists[sec.key].map((r) => r.text).join("\n"), sec.key !== "sentences").map((c) => ({ ...c, group: sec.key })),
        );

  function generate() {
    const lines = generateCalcs(op, min, max, parseList(bs), both);
    if (lines.length === 0) return;
    setList(MATH)((rs) => [...rs.filter((r) => r.text.trim()), ...toRows(lines)]);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    // An unchanged card keeps its id, and therefore its progress.
    const known = new Map((deck?.cards ?? []).map((c) => [`${c.group ?? (deck?.kind === "words" ? DEFAULT_SECTION : "")}|${c.front}`, c.id]));
    const kept = cards.map((c) => ({ ...c, id: known.get(`${c.group ?? ""}|${c.front}`) ?? c.id }));
    saveDeck({ id: deck?.id ?? newId(), title: title.trim() || "Ma fiche", kind, cards: kept, ...(kind === "words" && sound.trim() ? { sound: sound.trim() } : {}) });
    router.push("/");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <h1>{deck ? "Modifier la fiche" : "Nouvelle fiche"}</h1>
        <Link href="/" className="btn small">
          <Icon name="close" />
          Annuler
        </Link>
      </header>

      <form onSubmit={save}>
        <div className="panel">
          <div className="field">
            <label htmlFor="title">Titre</label>
            <input id="title" name="title" type="text" autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Petits mots de la semaine…" />
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend>Type de fiche</legend>
            <div className="seg">
              <button type="button" className="btn toggle" aria-pressed={kind === "words"} onClick={() => setKind("words")}>
                Lecture
              </button>
              <button type="button" className="btn toggle" aria-pressed={kind === "math"} onClick={() => setKind("math")}>
                Calcul
              </button>
            </div>
          </fieldset>
          {kind === "words" && (
            <div className="field">
              <label htmlFor="sound">Son à mettre en gras</label>
              <input id="sound" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} value={sound} onChange={(e) => setSound(e.target.value)} placeholder="u" style={{ maxWidth: "8rem" }} />
              <p className="hint">Ex. : « u » met en gras le u dans tube, jupe, purée…</p>
            </div>
          )}
        </div>

        {kind === "math" && (
          <div className="panel">
            <strong>Générer des calculs</strong>
            <div className="row">
              <div className="field">
                <label htmlFor="op">Opération</label>
                <select id="op" value={op} onChange={(e) => setOp(e.target.value as Op)}>
                  <option value="+">Addition +</option>
                  <option value="-">Soustraction −</option>
                  <option value="×">Multiplication ×</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="min">Premier nombre, de</label>
                <input id="min" type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(Number(e.target.value))} />
              </div>
              <div className="field">
                <label htmlFor="max">à</label>
                <input id="max" type="number" inputMode="numeric" min={0} value={max} onChange={(e) => setMax(Number(e.target.value))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="bs">Deuxième nombre (liste)</label>
              <input id="bs" type="text" autoComplete="off" value={bs} onChange={(e) => setBs(e.target.value)} />
              <p className="hint">Ex. : « 0, 1 » donne 3 + 0, 3 + 1…</p>
            </div>
            {op !== "-" && (
              <label style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44 }}>
                <input type="checkbox" checked={both} onChange={(e) => setBoth(e.target.checked)} style={{ width: 22, height: 22 }} />
                Ajouter aussi l’ordre inverse (0 + 3)
              </label>
            )}
            <button type="button" className="btn" onClick={generate}>
              <Icon name="plus" />
              Ajouter à la liste
            </button>
          </div>
        )}

        {kind === "math" ? (
          <div className="panel">
            <strong>Calculs</strong>
            <RowList
              rows={lists[MATH]}
              setRows={setList(MATH)}
              math
              noun="calcul"
              placeholder="3 + 1"
              hint="Entrée ajoute une ligne. La réponse est calculée toute seule ; pour la fixer : « 3 + 1 = 4 »."
            />
          </div>
        ) : (
          SECTIONS.map((sec) => (
            <div className="panel" key={sec.key}>
              <strong>{sec.title}</strong>
              <RowList
                rows={lists[sec.key]}
                setRows={setList(sec.key)}
                math={false}
                spellcheck={sec.key === "words"}
                multiline={sec.key === "sentences"}
                noun={sec.noun}
                placeholder={sec.placeholder}
                hint={sec.key === "sentences" ? "Une phrase par ligne." : sec.key === "words" ? "Entrée ajoute une ligne. Un mot inconnu du dictionnaire est marqué « à vérifier » : vous pouvez le garder." : "Entrée ajoute une ligne. Collez une liste : une ligne par entrée."}
              />
            </div>
          ))
        )}
        <p aria-live="polite" style={{ margin: "0 0 16px", fontWeight: 700 }}>
          {cards.length} {kind === "words" ? "éléments" : "calculs"} prêts
        </p>

        <button type="submit" className="btn primary" style={{ width: "100%", minHeight: 56 }} disabled={cards.length === 0}>
          <Icon name="check" />
          Enregistrer la fiche
        </button>
      </form>
    </main>
  );
}
