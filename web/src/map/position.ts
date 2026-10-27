// "Vis min position" (D-036): the browser's location, only while the switch is on and the map is
// open (no background location). Permission is asked when the user switches it on. Works offline:
// the phone's GPS needs no network, only a first fix can take longer.

import { useEffect, useState } from 'react';
import type { Position } from './overlays.ts';

const KEY = 'stead.map.showPosition';

export type PositionState =
  | { status: 'off' }
  | { status: 'searching' }
  | { status: 'found'; position: Position }
  | { status: 'denied' }       // permission refused: the switch turns itself off
  | { status: 'unavailable' }; // no fix right now (indoors, no sky): keeps trying

export const positionSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

function storedOn(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function usePosition() {
  const [on, setOnState] = useState(() => positionSupported && storedOn());
  const [state, setState] = useState<PositionState>({ status: 'off' });

  const setOn = (value: boolean) => {
    setOnState(value);
    try {
      localStorage.setItem(KEY, value ? '1' : '0');
    } catch {
      // Private mode: the switch just isn't remembered.
    }
  };

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
          setOnState(false);
          try {
            localStorage.setItem(KEY, '0');
          } catch {
            // ignore
          }
        } else setState((s) => (s.status === 'found' ? s : { status: 'unavailable' }));
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 60_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [on]);

  return { on, setOn, state };
}
