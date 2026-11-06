// The current time, updated every `ms` milliseconds while the page is open (clocks and timers).
// Times are always worked out from a stored start, so a page that was asleep is right again at once.

import { useEffect, useState } from 'react';

export function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms]);
  return now;
}
