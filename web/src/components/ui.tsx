// Shared UI primitives (design brief, D-025). Colours come from the tokens in index.css. Text and
// vertical spacing are rem-based so they follow the system text size on iOS; horizontal padding is
// in px so large text does not squeeze the content column.

import { ArrowLeft, Search, Settings, X } from 'lucide-react';
import { hrefs } from '../router';
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`rounded-card bg-surface px-[20px] py-5 ${className}`} {...rest}>
      {children}
    </section>
  );
}

// A note quoted from the source, in the source's language (D-003).
export function SourceNote({ text, lang, label }: { text: string; lang: string; label: string | null }) {
  return (
    <div className="rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">
      {label ? <p className="text-xs font-semibold tracking-wide uppercase">{label}</p> : null}
      <p lang={lang}>{text}</p>
    </div>
  );
}

export function SearchField(props: {
  id: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  return (
    <div className="flex items-center gap-[12px] rounded-full bg-surface px-[20px] focus-within:outline-2 focus-within:outline-text">
      <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
      <label className="sr-only" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        type="search"
        className="min-h-14 flex-1 bg-transparent text-text placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
          className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}
    </div>
  );
}

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-11 place-items-center rounded-full bg-surface">
      <ArrowLeft aria-hidden="true" className="size-5" />
    </button>
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

// Page frame: safe-area padding at the top and room at the bottom for the floating tab bar.
export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-2xl px-[16px] pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]">{children}</main>;
}

// Sub-page navigation within one page (D-034): links, so each sub-page has its own address,
// with the current one marked. Switching replaces the history entry (onSelect).
export function SubNav<T extends string>(props: {
  label: string;
  items: { key: T; label: string; href: string }[];
  current: T;
  onSelect: (href: string) => void;
}) {
  const { label, items, current, onSelect } = props;
  return (
    <nav aria-label={label}>
      {/* Items share the width; at large text sizes they wrap to a second row instead of scrolling. */}
      <ul className="flex flex-wrap gap-[2px] rounded-[24px] bg-surface p-[4px]">
        {items.map((item) => {
          const active = item.key === current;
          return (
            <li key={item.key} className="flex-auto">
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (!active) onSelect(item.href);
                }}
                className={`flex min-h-11 w-full items-center justify-center rounded-full px-[10px] text-sm font-medium whitespace-nowrap ${
                  active ? 'bg-accent text-on-accent' : 'text-muted'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// A choice between a few options, shown as a segmented pill row (radio buttons underneath).
export function Choice<T extends string>(props: { name: string; legend: string; value: T; onChange: (value: T) => void; options: { value: T; label: string; lang?: string }[] }) {
  const { name, legend, value, onChange, options } = props;
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-[2px] rounded-[24px] bg-background p-[4px]">
        {options.map((o) => (
          <label
            key={o.value}
            lang={o.lang}
            className={`relative flex min-h-11 flex-auto cursor-pointer items-center justify-center rounded-full px-[12px] text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-text ${
              o.value === value ? 'bg-accent text-on-accent' : 'text-muted'
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// The gear at the top right of the tab pages (D-046): Settings is no longer a tab.
export function SettingsButton({ label }: { label: string }) {
  return (
    <a href={hrefs.settings} aria-label={label} className="grid size-11 shrink-0 place-items-center rounded-full bg-surface">
      <Settings aria-hidden="true" className="size-5" />
    </a>
  );
}

// The title row of a tab page: the title on the left, the settings gear on the right.
export function TabHeader({ title, settingsLabel, children }: { title: string; settingsLabel: string; children?: ReactNode }) {
  return (
    <header className="mt-2 mb-4 flex items-center justify-between gap-[12px] px-1">
      <h1 className="text-3xl font-normal tracking-tight">{title}</h1>
      <div className="flex items-center gap-[8px]">
        {children}
        <SettingsButton label={settingsLabel} />
      </div>
    </header>
  );
}

// A whole number with − and + buttons (44 pt each), e.g. how many people or how many of a thing.
export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-[12px]">
      <span className="font-semibold" id={`stepper-${label}`}>
        {label}
      </span>
      <span className="flex items-center gap-[4px]" role="group" aria-labelledby={`stepper-${label}`}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          −
        </button>
        <output className="min-w-10 text-center text-lg tabular-nums" aria-live="polite">
          {value}
        </output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}
