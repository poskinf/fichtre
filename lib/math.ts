/** Évalue un calcul simple : + − × ÷ (x, *, / acceptés). Retourne null si invalide. */
export function evaluate(input: string): number | null {
  const s = input
    .toLowerCase()
    .replace(/[×x*]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");
  if (!/^\d+(\.\d+)?([+\-*/]\d+(\.\d+)?)*$/.test(s)) return null;
  const tokens = s.match(/\d+(\.\d+)?|[+\-*/]/g);
  if (!tokens) return null;
  // 1re passe : * et /
  const stack: (number | string)[] = [Number(tokens[0])];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n = Number(tokens[i + 1]);
    if (op === "*" || op === "/") {
      const a = stack.pop() as number;
      if (op === "/" && n === 0) return null;
      stack.push(op === "*" ? a * n : a / n);
    } else {
      stack.push(op, n);
    }
  }
  // 2e passe : + et -
  let result = stack[0] as number;
  for (let i = 1; i < stack.length; i += 2) {
    result = stack[i] === "+" ? result + (stack[i + 1] as number) : result - (stack[i + 1] as number);
  }
  return Number.isInteger(result) ? result : Math.round(result * 100) / 100;
}

/** Affichage joli : "3+1" -> "3 + 1" */
export function prettify(expr: string): string {
  return expr
    .replace(/\s+/g, "")
    .replace(/[x*]/gi, "×")
    .replace(/\//g, "÷")
    .replace(/(?<=\d)-(?=\d)/g, "−")
    .replace(/([+−×÷])/g, " $1 ");
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Op = "+" | "-" | "×";

/** Génère toutes les combinaisons A (min..max) op B (liste). */
export function generateCalcs(op: Op, min: number, max: number, bs: number[], both: boolean): string[] {
  const out = new Set<string>();
  for (let a = min; a <= max; a++) {
    for (const b of bs) {
      if (op === "-") {
        if (a >= b) out.add(`${a} − ${b}`);
        continue;
      }
      const sym = op;
      out.add(`${a} ${sym} ${b}`);
      if (both) out.add(`${b} ${sym} ${a}`);
    }
  }
  return [...out];
}
