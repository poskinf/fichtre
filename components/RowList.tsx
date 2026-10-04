"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { newId } from "@/lib/decks";
import { isUnknown, useWords } from "@/lib/dictionary";
import { evaluate } from "@/lib/math";

export type Row = { id: string; text: string };
export type SetRows = (update: (rows: Row[]) => Row[]) => void;

export const toRows = (lines: string[]): Row[] => lines.map((text) => ({ id: newId(), text }));

/** Answer shown next to a calculation: set explicitly with "=" or computed. */
function answerOf(text: string): string | null {
  const [expr, explicit] = text.split("=").map((s) => s.trim());
  if (!expr) return null;
  const v = explicit || evaluate(expr);
  return v === null || v === "" ? null : String(v);
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: boolean };

/** Row field: a single-line input, or a textarea that grows with its text (sentences). */
function Field({ multiline, ...props }: FieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value, multiline]);
  if (!multiline) return <input type="text" {...props} />;
  return <textarea ref={ref} rows={1} {...props} />;
}

function SortableLine({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      className={`line ${isDragging ? "dragging" : ""}`}
      style={{ transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined, transition }}
    >
      <button type="button" ref={setActivatorNodeRef} className="handle" aria-label={`Déplacer ${label}`} {...attributes} {...listeners}>
        <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true" fill="currentColor">
          {[4, 11, 18].flatMap((y) => [3, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}
        </svg>
      </button>
      {children}
    </li>
  );
}

type Props = {
  rows: Row[];
  setRows: SetRows;
  math: boolean;
  /** Name of a row for screen readers (UI text): "mot", "syllabe"... */
  noun: string;
  placeholder: string;
  /** Help text shown under the list (UI text). */
  hint: string;
  /** Flags words that are missing from the French dictionary. */
  spellcheck?: boolean;
  /** Sentences: the field grows to show all of its text. */
  multiline?: boolean;
};

export function RowList({ rows, setRows, math, noun, placeholder, hint, spellcheck = false, multiline = false }: Props) {
  const words = useWords(spellcheck);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (focusId) document.getElementById(`row-${focusId}`)?.focus();
  }, [focusId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setRows((rs) => arrayMove(rs, rs.findIndex((r) => r.id === active.id), rs.findIndex((r) => r.id === over.id)));
  }

  /** Inserts rows after `afterId` (or at the end) and focuses the last one. */
  function insertRows(afterId: string | null, lines: string[]) {
    const created = toRows(lines);
    setRows((rs) => {
      const at = afterId ? rs.findIndex((r) => r.id === afterId) + 1 : rs.length;
      return [...rs.slice(0, at), ...created, ...rs.slice(at)];
    });
    setFocusId(created[created.length - 1].id);
  }

  function removeRow(id: string) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : [{ id, text: "" }]));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, r: Row, i: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      insertRows(r.id, [""]);
    } else if (e.key === "Backspace" && r.text === "" && rows.length > 1) {
      e.preventDefault();
      removeRow(r.id);
      setFocusId(rows[Math.max(0, i - 1)].id);
    }
  }

  /** Pasting several lines at once creates one row per line. */
  function onPaste(e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, r: Row) {
    const lines = e.clipboardData.getData("text").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return;
    e.preventDefault();
    setRows((rs) => rs.flatMap((x) => (x.id === r.id ? toRows(r.text.trim() ? [r.text, ...lines] : lines) : [x])));
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows} strategy={verticalListSortingStrategy}>
          <ul className="rows">
            {rows.map((r, i) => {
              const unknown = words !== null && isUnknown(r.text, words);
              const ans = math && r.text.trim() ? answerOf(r.text) : null;
              return (
                <SortableLine key={r.id} id={r.id} label={`${noun} ${i + 1}`}>
                  <Field
                    multiline={multiline}
                    id={`row-${r.id}`}
                    aria-label={`${noun} ${i + 1}`}
                    aria-describedby={unknown ? `unk-${r.id}` : undefined}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    value={r.text}
                    placeholder={placeholder}
                    onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)))}
                    onKeyDown={(e) => onKeyDown(e, r, i)}
                    onPaste={(e) => onPaste(e, r)}
                  />
                  {unknown && (
                    <span className="unknown" id={`unk-${r.id}`}>
                      à vérifier
                    </span>
                  )}
                  {math && (
                    <span className={`answer ${r.text.trim() && !ans ? "invalid" : ""}`} aria-live="polite">
                      {r.text.trim() ? (ans ? `= ${ans}` : "?") : ""}
                    </span>
                  )}
                  <button type="button" className="btn small icon" aria-label={`Supprimer ${noun} ${i + 1}`} onClick={() => removeRow(r.id)}>
                    <Icon name="close" />
                  </button>
                </SortableLine>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <button type="button" className="btn" onClick={() => insertRows(null, [""])}>
        <Icon name="plus" />
        Ajouter une ligne
      </button>
      <p className="hint">{hint}</p>
    </>
  );
}
