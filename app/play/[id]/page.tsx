"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDecks } from "@/lib/decks";
import { Practice } from "@/components/Practice";

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const decks = useDecks();
  if (decks === null) return null;
  const deck = decks.find((d) => d.id === id);

  if (!deck || deck.cards.length === 0) {
    return (
      <main className="shell">
        <div className="empty">
          <p>{deck ? "Cette fiche est vide." : "Fiche introuvable."}</p>
          <Link href="/" className="btn primary">
            Retour aux fiches
          </Link>
        </div>
      </main>
    );
  }
  return <Practice deck={deck} />;
}
