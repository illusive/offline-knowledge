// Shared UI primitives. Colours come from the tokens in index.css; sizes are rem-based so they
// follow the system text size on iOS.

import type { ReactNode } from 'react';

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`rounded-card border border-border bg-surface p-4 ${className}`} {...rest}>
      {children}
    </section>
  );
}

// A note quoted from the source, in the source's language (D-003).
export function SourceNote({ text, lang, label }: { text: string; lang: string; label: string | null }) {
  return (
    <div className="rounded-card bg-note-bg px-3 py-2 text-note-text">
      {label ? <p className="text-xs font-semibold uppercase tracking-wide">{label}</p> : null}
      <p lang={lang}>{text}</p>
    </div>
  );
}

export function SearchField(props: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  return (
    <div className="flex items-center rounded-card border border-border bg-surface px-3 focus-within:border-accent">
      <label className="sr-only" htmlFor="search">
        {props.label}
      </label>
      <input
        id="search"
        type="search"
        className="min-h-12 flex-1 bg-transparent py-3 text-text placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="search"
      />
      {props.value !== '' ? (
        <button
          type="button"
          onClick={() => props.onChange('')}
          aria-label={props.clearLabel}
          className="-mr-2 min-h-11 min-w-11 text-xl text-accent"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export function MessageState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-6 py-12 text-center" role="status">
      <p className="text-lg font-semibold">{title}</p>
      {body ? <p className="mt-2 text-muted">{body}</p> : null}
    </div>
  );
}
