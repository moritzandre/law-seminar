/**
 * modules/sortable/Sorter.tsx
 * -----------------------------------------------------------------------------
 * Wiederverwendbares Sortier-/Zuordnungs-Muster fuer mehrere Module.
 *
 * Bedienung bewusst robust auf Handy UND Beamer:
 *  - Tippen/Klicken: Karte auswaehlen -> in der Ablege-Leiste ein Feld waehlen.
 *    Vollstaendig tastaturbedienbar (alles Buttons), ideal fuer Touch.
 *  - Drag & Drop: Karten lassen sich zusaetzlich mit der Maus in Felder ziehen.
 *
 * Die Zuordnung (itemId -> slotId | null) wird kontrolliert von aussen gehalten.
 * Im Aufloesungsmodus (showSolution) zeigt jede Karte Treffer/Fehler samt
 * korrektem Feld und kurzer Begruendung.
 */

import { useState } from 'react';
import type { SortItem, SortSlot } from '@shared/types';
import './sorter.css';

export type Assignment = Record<string, string | null>;

interface SorterProps {
  items: SortItem[];
  slots: SortSlot[];
  assignment: Assignment;
  onChange?: (next: Assignment) => void;
  /** Zuordnung gesperrt (z. B. nach dem Senden oder im Beamer-Vorschaumodus). */
  disabled?: boolean;
  /** Aufloesungsmodus: korrekte Zuordnung itemId -> slotId. */
  solution?: Record<string, string>;
  justifications?: Record<string, string>;
  showSolution?: boolean;
}

export function Sorter({
  items,
  slots,
  assignment,
  onChange,
  disabled,
  solution,
  justifications,
  showSolution,
}: SorterProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const editable = !disabled && !showSolution && Boolean(onChange);

  function place(itemId: string, slotId: string | null) {
    if (!editable) return;
    onChange?.({ ...assignment, [itemId]: slotId });
    setSelected(null);
  }

  function toggleSelect(itemId: string) {
    if (!editable) return;
    setSelected((cur) => (cur === itemId ? null : itemId));
  }

  const byId = (id: string) => items.find((i) => i.id === id);
  const poolItems = items.filter((i) => !assignment[i.id]);
  const slotItems = (slotId: string) =>
    items.filter((i) => assignment[i.id] === slotId);

  function renderItem(item: SortItem) {
    const correct =
      showSolution && solution
        ? assignment[item.id] === solution[item.id]
        : undefined;
    const cls = [
      'sortcard',
      selected === item.id ? 'sortcard-selected' : '',
      correct === true ? 'sortcard-correct' : '',
      correct === false ? 'sortcard-wrong' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const correctSlot =
      correct === false && solution
        ? slots.find((s) => s.id === solution[item.id])?.label
        : null;

    return (
      <div
        key={item.id}
        className={cls}
        draggable={editable}
        onDragStart={() => editable && setDragId(item.id)}
        onDragEnd={() => setDragId(null)}
      >
        <button
          type="button"
          className="sortcard-btn"
          disabled={!editable}
          aria-pressed={selected === item.id}
          onClick={() => toggleSelect(item.id)}
        >
          {showSolution && (
            <span className="sortcard-mark" aria-hidden>
              {correct ? '✓' : '✗'}
            </span>
          )}
          {item.label}
        </button>
        {showSolution && correctSlot && (
          <div className="sortcard-correct-slot">richtig: {correctSlot}</div>
        )}
        {showSolution && justifications?.[item.id] && (
          <div className="sortcard-just muted small">
            {justifications[item.id]}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sorter">
      {/* Ablege-Leiste: erscheint, sobald eine Karte ausgewaehlt ist (Tastatur/Touch) */}
      {editable && selected && (
        <div className="sorter-toolbar" role="group" aria-label="Karte ablegen">
          <span className="small muted">
            „{byId(selected)?.label}“ ablegen in:
          </span>
          {slots.map((s) => (
            <button
              key={s.id}
              type="button"
              className="btn btn-secondary"
              onClick={() => place(selected, s.id)}
            >
              {s.label}
            </button>
          ))}
          {assignment[selected] && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => place(selected, null)}
            >
              In den Pool
            </button>
          )}
        </div>
      )}

      {/* Pool der noch nicht zugeordneten Karten (auch Drop-Ziel) */}
      <div
        className={`sorter-pool${dragId ? ' sorter-droppable' : ''}`}
        onDragOver={(e) => editable && e.preventDefault()}
        onDrop={() => dragId && place(dragId, null)}
      >
        <div className="field-label" style={{ marginBottom: 0 }}>
          Karten{poolItems.length === 0 ? ' (alle zugeordnet)' : ''}
        </div>
        <div className="sorter-cards">
          {poolItems.map(renderItem)}
          {poolItems.length === 0 && (
            <span className="muted small">—</span>
          )}
        </div>
      </div>

      {/* Zielfelder */}
      <div className="sorter-slots">
        {slots.map((s) => (
          <div
            key={s.id}
            className={`sorter-slot${dragId ? ' sorter-droppable' : ''}`}
            onClick={() => selected && place(selected, s.id)}
            onDragOver={(e) => editable && e.preventDefault()}
            onDrop={() => dragId && place(dragId, s.id)}
          >
            <div className="sorter-slot-head">
              <span className="sorter-slot-title">{s.label}</span>
              {s.hint && <span className="muted small">{s.hint}</span>}
            </div>
            <div className="sorter-cards">
              {slotItems(s.id).map(renderItem)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
