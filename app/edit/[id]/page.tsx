"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDecks } from "@/lib/decks";
import { DeckEditor } from "@/components/DeckEditor";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const decks = useDecks();
  if (decks === null) return null;

  const deck = id === "new" ? undefined : decks.find((d) => d.id === id);
  if (id !== "new" && !deck) {
    return (
      <main className="shell">
        <div className="empty">
          <p>Fiche introuvable.</p>
          <Link href="/" className="btn primary">
            Retour aux fiches
          </Link>
        </div>
      </main>
    );
  }
  return <DeckEditor deck={deck} />;
}
