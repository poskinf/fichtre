const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

/** "Fichtre !" in colored letters. */
export function Wordmark({ as: Tag = "h1", small = false }: { as?: "h1" | "p" | "span"; small?: boolean }) {
  return (
    <Tag className={`wordmark ${small ? "small" : ""}`} aria-label="Fichtre !">
      {[..."Fichtre"].map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ color: COLORS[i % COLORS.length] }}>
          {ch}
        </span>
      ))}
      <span aria-hidden="true" className="wm-bang">
        !
      </span>
    </Tag>
  );
}
