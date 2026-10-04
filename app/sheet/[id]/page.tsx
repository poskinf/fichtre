"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDecks } from "@/lib/decks";
import { MathSheet } from "@/components/MathSheet";
import { SheetView } from "@/components/SheetView";

export default function SheetPage() {
  const { id } = useParams<{ id: string }>();
  const decks = useDecks();
  if (decks === null) return null;
  const deck = decks.find((d) => d.id === id);

  if (!deck) {
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
  return deck.kind === "math" ? <MathSheet deck={deck} /> : <SheetView deck={deck} />;
}
