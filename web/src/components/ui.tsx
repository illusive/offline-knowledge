// Shared UI primitives (design brief, D-025). Colours come from the tokens in index.css. Text and
// vertical spacing are rem-based so they follow the system text size on iOS; horizontal padding is
// in px so large text does not squeeze the content column.

import { ArrowLeft, Check, ChevronRight, Search, Settings, X, type LucideIcon } from 'lucide-react';
import { goBack, hrefs } from '../router';
import { useEffect, useRef, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';

// A rounded surface. A <section> unless `as` says otherwise (a form, a div).
export function Card({ children, className = '', as: Tag = 'section', ...rest }: { children: ReactNode; className?: string; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-card bg-surface px-[20px] py-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Buttons: one shape, a few looks. `primary` is the page's main action (lime), `ink` a strong
// second action, `secondary` everything else on a card, `onPage` the same on the page background.
// ButtonLink is a link that looks the same.
type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'onPage';
const BUTTON: Record<ButtonVariant, string> = {
  primary: 'min-h-12 bg-accent px-[24px] font-semibold text-on-accent',
  ink: 'min-h-12 bg-ink px-[24px] font-medium text-on-ink',
  secondary: 'min-h-11 bg-background px-[18px] font-medium',
  onPage: 'min-h-11 bg-surface px-[18px] text-sm font-medium',
};
export const buttonClass = (variant: ButtonVariant = 'secondary', className = '') =>
  `flex items-center justify-center gap-[8px] rounded-full text-center disabled:opacity-40 ${BUTTON[variant]} ${className}`;

export function Button({ variant = 'secondary', className, type = 'button', ...rest }: { variant?: ButtonVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

export function ButtonLink({ variant = 'secondary', className, href, children }: { variant?: ButtonVariant; className?: string; href: string; children: ReactNode }) {
  return (
    <a href={href} className={buttonClass(variant, className)}>
      {children}
    </a>
  );
}

// A round 44 pt button with only an icon; the label is for screen readers.
export function IconButton({ label, Icon, onClick, className = 'bg-surface', ...rest }: { label: string; Icon: LucideIcon; onClick: () => void; className?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`grid size-11 shrink-0 place-items-center rounded-full ${className}`} {...rest}>
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

// Text fields and selects.
export const inputClass = 'min-h-11 rounded-xl border border-border bg-background px-[12px]';

// A list of links on one surface, and its rows: title, optional line under it, a chevron.
export function RowList({ children, ordered = false, lang }: { children: ReactNode; ordered?: boolean; lang?: string }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="flex flex-col divide-y divide-border rounded-card bg-surface" lang={lang}>
      {children}
    </Tag>
  );
}

export function LinkRow({ href, title, subtitle, leading, label }: { href: string; title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; label?: string }) {
  return (
    <li>
      <a href={href} aria-label={label} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
        {leading}
        <span className="flex-1">
          <span className="block font-medium">{title}</span>
          {subtitle}
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </a>
    </li>
  );
}

// A titled part of a page (one heading size everywhere).
export function Section({ id, title, aside, children, className = '' }: { id: string; title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-[12px] px-1">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// The top of a page below a tab: back, an optional action on the right, the title and a line
// under it. `headingRef` lets a page move focus to its title once it has loaded.
export function SubPageHeader(props: { backLabel: string; backTo: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; headingRef?: Ref<HTMLHeadingElement>; children?: ReactNode }) {
  const { backLabel, backTo, title, subtitle, action, headingRef, children } = props;
  return (
    <>
      <div className="flex items-center justify-between gap-[12px]">
        <BackButton label={backLabel} onClick={() => goBack(backTo)} />
        {action}
      </div>
      <header className="mt-4 mb-4 px-1">
        <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="text-3xl font-normal tracking-tight outline-none">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        {children}
      </header>
    </>
  );
}

// "Vis original" (D-031, D-042): switches between our plain words and the source's own.
export function OriginalToggle({ showOriginal, onToggle, status, showLabel, hideLabel }: { showOriginal: boolean; onToggle: () => void; status: string; showLabel: string; hideLabel: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-1 px-1">
      <p className="text-sm text-muted">{status}</p>
      <button type="button" aria-pressed={showOriginal} onClick={onToggle} className="min-h-11 rounded-full bg-surface px-[16px] text-sm font-medium">
        {showOriginal ? hideLabel : showLabel}
      </button>
    </div>
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

// A sheet from the bottom of the screen (D-049): a native modal <dialog>, so focus stays inside,
// the page behind is inert, Escape closes it and focus goes back to what opened it. A tap on the
// dimmed page above it closes it too, unless `dismissOnBackdrop` is false (a sheet with fields, where
// a stray tap would lose what was entered). It sits above the tab bar (the top layer). On opening,
// focus goes to the element marked `data-autofocus`, if any, rather than to the first field, whose
// keyboard would cover a sheet that is already filled in (D-053).
export function Sheet({ open, onClose, labelledBy, dismissOnBackdrop = true, children }: { open: boolean; onClose: () => void; labelledBy: string; dismissOnBackdrop?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (dismissOnBackdrop && e.target === e.currentTarget) onClose(); // the backdrop, not the content
      }}
      className="inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border-t border-border bg-background p-0 text-text shadow-2xl backdrop:bg-black/50"
    >
      <div className="px-[16px] pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{open ? children : null}</div>
    </dialog>
  );
}

// A short message that floats near the top of the screen and goes away by itself (D-053), e.g.
// "Makrel i tomat er tilføjet". A new `id` shows the message again, even with the same text. The
// live region is always there, so screen readers read each message; taps go through it.
export type ToastMessage = { id: number; text: string };
export function Toast({ message, onHide }: { message: ToastMessage | null; onHide: () => void }) {
  const hide = useRef(onHide);
  hide.current = onHide;
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => hide.current(), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-[calc(max(1rem,env(safe-area-inset-top))+3.75rem)] z-40 flex justify-center px-[16px]">
      {message ? (
        <p key={message.id} className="flex max-w-full items-center gap-[8px] rounded-full bg-ink px-[18px] py-3 font-medium text-on-ink shadow-xl">
          <Check aria-hidden="true" className="size-5 shrink-0" />
          {message.text}
        </p>
      ) : null}
    </div>
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
