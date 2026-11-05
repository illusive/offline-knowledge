// The compass sensor (D-045). iOS asks permission once, after a tap ("Start kompas"); once granted,
// later visits start by themselves. The sensor is only listened to while the compass is open.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createLocalStore } from '../lib/localStore';
import { readingFrom, smooth, type OrientationLike } from './heading';

export type CompassState =
  | { kind: 'idle' } // waiting for the tap that may ask permission
  | { kind: 'starting' }
  | { kind: 'active'; heading: number; accuracy: number | null }
  | { kind: 'denied' }
  | { kind: 'unsupported' }; // no compass reading on this device

// No reading within this time after starting: the device has no compass.
const NO_SENSOR_AFTER_MS = 3000;
const GRANTED_KEY = 'stead.compass.granted.v1';

type PermissionFn = () => Promise<'granted' | 'denied'>;

function permissionFn(): PermissionFn | null {
  const ctor = (window as { DeviceOrientationEvent?: { requestPermission?: PermissionFn } }).DeviceOrientationEvent;
  return typeof ctor?.requestPermission === 'function' ? ctor.requestPermission.bind(ctor) : null;
}

// How far the screen is turned. iOS's own window.orientation first: WebKit can report a
// screen.orientation.angle that contradicts its type (seen: 90 with 'portrait-primary').
function screenAngle(): number {
  const legacy = (window as { orientation?: unknown }).orientation;
  return typeof legacy === 'number' ? legacy : (screen.orientation?.angle ?? 0);
}

// Permission given once: later visits start by themselves.
const granted = createLocalStore<boolean>({ key: GRANTED_KEY, parse: (stored) => stored === true, serialize: (v) => (v ? '1' : '0'), deserialize: (raw) => raw === '1' });

export function useCompass(): { state: CompassState; start: () => void } {
  const [state, setState] = useState<CompassState>({ kind: 'idle' });
  const stop = useRef<(() => void) | null>(null);

  const listen = useCallback(() => {
    stop.current?.();
    let heading: number | null = null;
    const onEvent = (absolute: boolean) => (event: Event) => {
      const reading = readingFrom(event as Event & OrientationLike, screenAngle(), absolute);
      if (!reading) return;
      heading = smooth(heading, reading.heading);
      setState({ kind: 'active', heading, accuracy: reading.accuracy });
    };
    const onAbsolute = onEvent(true);
    const onRelative = onEvent(false);
    window.addEventListener('deviceorientationabsolute', onAbsolute);
    window.addEventListener('deviceorientation', onRelative);
    const timer = window.setTimeout(() => {
      if (heading === null) setState({ kind: 'unsupported' });
    }, NO_SENSOR_AFTER_MS);
    stop.current = () => {
      window.removeEventListener('deviceorientationabsolute', onAbsolute);
      window.removeEventListener('deviceorientation', onRelative);
      window.clearTimeout(timer);
    };
  }, []);

  const start = useCallback(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setState({ kind: 'unsupported' });
      return;
    }
    setState({ kind: 'starting' });
    const ask = permissionFn();
    if (!ask) {
      listen();
      return;
    }
    ask().then(
      (answer) => {
        if (answer === 'granted') {
          granted.set(true);
          listen();
        } else setState({ kind: 'denied' });
      },
      () => setState({ kind: 'denied' }),
    );
  }, [listen]);

  useEffect(() => {
    // Without a permission step (Android, desktop), or with permission given before, start at once.
    // iOS refuses a request that does not follow a tap; then the button is shown.
    const ask = permissionFn();
    if (!ask) start();
    else if (granted.get()) {
      setState({ kind: 'starting' });
      ask().then(
        (answer) => (answer === 'granted' ? listen() : setState({ kind: 'idle' })),
        () => setState({ kind: 'idle' }),
      );
    }
    return () => stop.current?.();
  }, [start, listen]);

  return { state, start };
}
