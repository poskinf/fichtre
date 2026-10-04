"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { Wordmark } from "@/components/Wordmark";
import { deleteDeck, useDecks } from "@/lib/decks";
import { countStatuses, resetProgress, useProgress } from "@/lib/progress";
import type { Deck } from "@/lib/types";
import { journalTitle, useSettings } from "@/lib/settings";
import { useParentMode } from "@/lib/use-parent-mode";

type Filter = "all" | "words" | "math";
const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: "words", label: "Lecture", icon: "book" },
  { key: "math", label: "Calcul", icon: "calc" },
  { key: "all", label: "Tout", icon: "grid" },
];

function DeckCount({ deck }: { deck: Deck }) {
  const { ok } = countStatuses(deck.cards, useProgress(deck.id));
  const finished = deck.cards.length > 0 && ok === deck.cards.length;
  return (
    <>
      <p>
        {finished ? "Tout est réussi : " : ok > 0 ? `${ok} réussis sur ` : ""}
        {deck.cards.length} {deck.kind === "words" ? "mots" : "calculs"}
      </p>
      {finished && (
        <span className="done-stamp">
          <Icon name="check" />
          Finie
        </span>
      )}
    </>
  );
}

/** « Refaire » : remet la fiche à zéro (n'apparaît que s'il y a déjà une progression). */
function RedoButton({ deck }: { deck: Deck }) {
  const { ok, redo } = countStatuses(deck.cards, useProgress(deck.id));
  if (ok + redo === 0) return null;
  return (
    <button
      type="button"
      className="btn big redo-btn"
      aria-label="Refaire cette fiche depuis le début"
      title="Refaire"
      onClick={() => confirm(`Refaire « ${deck.title} » depuis le début ?`) && resetProgress(deck.id)}
    >
      <Icon name="redo" />
    </button>
  );
}

export default function Home() {
  const decks = useDecks();
  const parent = useParentMode();
  const journal = journalTitle(useSettings());
  const [filter, setFilter] = useState<Filter>("all");

  const shown = (decks ?? []).filter((d) => filter === "all" || d.kind === filter);

  return (
    <>
      <main className="shell wide">
        <div className="hero">
          <Mascot size={150} />
          <div>
            <Wordmark />
            <p className="tagline">{journal}</p>
          </div>
        </div>

        <div className="home-layout">
          <nav className="rail" aria-label="Type de fiche">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" className={`rail-btn rail-${f.key}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                <span className="rail-icon">
                  <Icon name={f.icon} />
                </span>
                {f.label}
              </button>
            ))}
          </nav>

          <div>
            {decks === null ? null : shown.length === 0 ? (
              <div className="empty">
                <div style={{ display: "grid", justifyContent: "center" }}>
                  <Mascot size={150} />
                </div>
                <p>Aucune fiche ici pour le moment.</p>
                {parent && (
                  <Link href="/edit/new" className="btn primary">
                    <Icon name="plus" />
                    Créer une fiche
                  </Link>
                )}
              </div>
            ) : (
              <ul className="deck-list">
                {shown.map((deck, i) => (
                  <li key={deck.id} className={`slip tone-${(deck.kind === "words" ? 0 : 2) + (i % 2)}`}>
                    <div className="slip-head">
                      <h2>{deck.title}</h2>
                      <DeckCount deck={deck} />
                    </div>
                    <div className="slip-choices">
                      <Link href={`/play/${deck.id}`} className="btn big primary">
                        <Icon name="cards" />
                        Cartes
                      </Link>
                      <Link href={`/sheet/${deck.id}`} className="btn big">
                        <Icon name="sheet" />
                        Feuille
                      </Link>
                      <RedoButton deck={deck} />
                    </div>
                    <div className="slip-actions">
                      {parent && (
                        <>
                          <Link href={`/edit/${deck.id}`} className="btn small">
                            <Icon name="edit" />
                            Modifier
                          </Link>
                          <button
                            type="button"
                            className="btn small danger"
                            onClick={() => confirm(`Supprimer « ${deck.title} » ?`) && deleteDeck(deck.id)}
                          >
                            <Icon name="trash" />
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {parent && decks !== null && (
              <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/edit/new" className="btn">
                  <Icon name="plus" />
                  Nouvelle fiche
                </Link>
                <Link href="/settings" className="btn">
                  <Icon name="sliders" />
                  Réglages
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
