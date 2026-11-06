// "Til toppen" (D-069): a round button above the tab bar on long pages (guides and foods). It shows
// once the page has been scrolled down more than one and a half screens, and takes the reader back
// to the top, smoothly unless the phone asks for reduced motion. Focus moves to the page title, so
// screen readers start from the top as well.

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const SHOW_AFTER_SCREENS = 1.5;

export function ScrollToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * SHOW_AFTER_SCREENS);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('h1[tabindex]')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={label}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={`fixed right-[16px] bottom-[calc(5.5rem+max(12px,env(safe-area-inset-bottom)))] z-20 grid size-12 place-items-center rounded-full bg-surface text-text shadow-lg ring-1 ring-border transition-opacity duration-200 motion-reduce:transition-none ${shown ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <ArrowUp aria-hidden="true" className="size-6" />
    </button>
  );
}
