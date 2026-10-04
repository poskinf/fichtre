"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDecks } from "@/lib/decks";
import { useInstruction } from "@/lib/instruction-store";
import { useAllProgress } from "@/lib/progress";
import { journalTitle, useSettings } from "@/lib/settings";
import { speak } from "@/lib/speech";
import { setParentMode, useParentMode } from "@/lib/use-parent-mode";
import { Icon } from "./Icon";
import { MascotFace } from "./MascotFace";
import { Wordmark } from "./Wordmark";

/** Barre de navigation : logo ; sur une fiche, × Quitter et le bouton Cartes / Feuille ; mode parent et fiches finies. */
export function SiteHeader() {
  const pathname = usePathname();
  const deckPage = pathname.match(/^\/(sheet|play)\/([^/]+)/);
  const decks = useDecks();
  const all = useAllProgress();
  const parent = useParentMode();
  const instruction = useInstruction();
  const journal = journalTitle(useSettings(), true);

  const finished = (decks ?? []).filter((d) => d.cards.length > 0 && d.cards.every((c) => all[d.id]?.[c.id]?.s === "ok")).length;

  return (
    <header className={`appbar ${deckPage ? "deck" : ""}`}>
      <div className="appbar-left">
        <Link href="/" className="brand" aria-label={`Fichtre, retour au ${journal.toLowerCase()}`}>
          <MascotFace size={40} />
          <Wordmark as="span" small />
        </Link>
      </div>
      {deckPage && (
        <Link href="/" className="btn small journal-btn">
          <Icon name="book" />
          <span className="journal-label">{journal}</span>
        </Link>
      )}
      <div className="appbar-right">
        {deckPage ? (
          deckPage[1] === "sheet" ? (
            <Link href={`/play/${deckPage[2]}`} replace className="btn small">
              <Icon name="cards" />
              Cartes
            </Link>
          ) : (
            <Link href={`/sheet/${deckPage[2]}`} replace className="btn small">
              <Icon name="sheet" />
              Feuille
            </Link>
          )
        ) : (
          <>
            {parent && <span className="parent-badge">Mode parent</span>}
            <button type="button" className="btn small icon-only" aria-pressed={parent} aria-label="Mode parent" title="Mode parent" onClick={() => setParentMode(!parent)}>
              <Icon name="parent" />
            </button>
            <span className="stars" aria-label={`${finished} fiche${finished > 1 ? "s" : ""} finie${finished > 1 ? "s" : ""}`}>
              <Icon name="star" />
              {finished}
            </span>
          </>
        )}
      </div>
      {deckPage && instruction && (
        <div className="appbar-instruction">
          <button type="button" className="btn small icon-only" aria-label="Écouter la consigne" onClick={() => speak(instruction)}>
            <Icon name="speaker" />
          </button>
          <p>{instruction}</p>
        </div>
      )}
    </header>
  );
}
