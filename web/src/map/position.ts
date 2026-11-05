// "Vis min position" (D-036): the browser's location, only while the switch is on and the map is
// open (no background location). Permission is asked when the user switches it on. Works offline:
// the phone's GPS needs no network, only a first fix can take longer.

import { useEffect, useState } from 'react';
import { createLocalStore } from '../lib/localStore';
import type { Position } from './overlays.ts';

// Remembered as "1" or "0" (as before the shared store).
const showPosition = createLocalStore<boolean>({
  key: 'stead.map.showPosition',
  parse: (stored) => stored === true,
  serialize: (on) => (on ? '1' : '0'),
  deserialize: (raw) => raw === '1',
});

export type PositionState =
  | { status: 'off' }
  | { status: 'searching' }
  | { status: 'found'; position: Position }
  | { status: 'denied' }       // permission refused: the switch turns itself off
  | { status: 'unavailable' }; // no fix right now (indoors, no sky): keeps trying

export const positionSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

export function usePosition() {
  const on = showPosition.use() && positionSupported;
  const [state, setState] = useState<PositionState>({ status: 'off' });
  const setOn = showPosition.set;

  useEffect(() => {
    if (!on || !positionSupported) {
      setState((s) => (s.status === 'denied' ? s : { status: 'off' }));
      return;
    }
    setState({ status: 'searching' });
    const id = navigator.geolocation.watchPosition(
      (p) => setState({ status: 'found', position: { lon: p.coords.longitude, lat: p.coords.latitude, accuracyM: p.coords.accuracy } }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: 'denied' });
          showPosition.set(false);
        } else setState((s) => (s.status === 'found' ? s : { status: 'unavailable' }));
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 60_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [on]);

  return { on, setOn, state };
}
