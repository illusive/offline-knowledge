// The name field with suggestions while typing (D-052). The suggestions float over the fields
// below instead of pushing them down (D-053): a combobox with a listbox under the field. Arrow
// keys and Enter pick; Escape, a tap outside or moving to another field closes the list.

import { useEffect, useId, useRef, useState, type Ref } from 'react';
import { inputClass } from '../components/ui';
import type { Suggestion } from './recommendations';

type Props = {
  id: string;
  value: string;
  onChange: (text: string) => void;
  suggestions: Suggestion[];
  onPick: (sug: Suggestion) => void;
  hint: (sug: Suggestion) => string;
  listLabel: string;
  placeholder: string;
  inputRef?: Ref<HTMLInputElement>;
  invalid: boolean;
  describedBy?: string;
  autofocus?: boolean; // focused when the sheet it sits in opens (Sheet, data-autofocus)
};

export function NameField({ id, value, onChange, suggestions, onPick, hint, listLabel, placeholder, inputRef, invalid, describedBy, autofocus }: Props) {
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  // Open once the user types; a name filled in by a scan or a pick shows no list.
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const shown = open && suggestions.length > 0;

  useEffect(() => {
    if (!shown) return;
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [shown]);

  const choose = (sug: Suggestion) => {
    onPick(sug);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={box} className="relative">
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={shown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (!shown) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const n = suggestions.length;
            setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
          } else if (e.key === 'Enter' && active >= 0 && suggestions[active]) {
            e.preventDefault();
            choose(suggestions[active]);
          } else if (e.key === 'Escape') {
            e.preventDefault(); // close the list, not the sheet around it
            setOpen(false);
          }
        }}
        onBlur={(e) => {
          // Another field closes the list. A tap on a suggestion keeps focus in the field (the
          // list's pointerdown is cancelled); in a sheet a tap may still move focus to the dialog
          // itself, which is not leaving the field for another one.
          const to = e.relatedTarget;
          if (to && !box.current?.contains(to) && to.tagName !== 'DIALOG') setOpen(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="done"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-autofocus={autofocus ? '' : undefined}
        className={`${inputClass} min-h-12 w-full text-lg`}
      />
      {shown ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={listLabel}
          // Keep focus in the field while a suggestion is tapped (owner 2026-11-06: in the scan
          // sheet focus went to the dialog and the list closed before the tap landed).
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-20 mt-1 flex max-h-[min(50dvh,22rem)] flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-background shadow-xl"
        >
          {suggestions.map((sug, i) => (
            <li
              key={`${sug.kind}-${sug.name}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onClick={() => choose(sug)}
              className={`flex min-h-11 cursor-pointer flex-col justify-center px-[14px] py-2 ${i === active ? 'bg-surface' : ''}`}
            >
              <span>{sug.name}</span>
              <span className="text-xs text-muted">{hint(sug)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
