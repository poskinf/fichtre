const base = (c: string) => c.normalize("NFD")[0].toLowerCase();

/** Son à mettre en gras : celui du champ « sound », sinon celui du titre (« Le son u : la lune »). */
export function soundOf(deck: { sound?: string; title: string }): string {
  return (deck.sound ?? deck.title.match(/\bson\s+(\S+?)\s*(?::|$)/i)?.[1] ?? "").trim();
}

/** Met en gras chaque occurrence du son, sans tenir compte des accents ni des majuscules. */
export function Highlight({ text, sound }: { text: string; sound: string }) {
  const chars = [...text];
  const target = [...sound].map(base);
  if (target.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let plain = "";
  for (let i = 0; i < chars.length; ) {
    const hit = i + target.length <= chars.length && target.every((t, k) => base(chars[i + k]) === t);
    if (hit) {
      if (plain) parts.push(plain);
      plain = "";
      parts.push(
        <b key={i} className="sound">
          {chars.slice(i, i + target.length).join("")}
        </b>,
      );
      i += target.length;
    } else {
      plain += chars[i++];
    }
  }
  if (plain) parts.push(plain);
  return <>{parts}</>;
}
