// The camera for scanning barcodes (D-047), one after another (D-053). Loaded only when the user
// opens the scanner, so the reader (zxing-wasm, ~1 MB) is not parsed on start; its .wasm file is
// served by the app itself and precached, never fetched from a CDN, so scanning works offline. The
// camera is asked for only here. It keeps running while the scanner is open, and stops when it
// closes or the app goes to the background. While `paused` (a sheet is open), the picture freezes
// on the scanned pack and nothing is read; afterwards the same code is ignored for a moment.

import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { useEffect, useRef, useState } from 'react';
import { acceptCode } from './barcode';

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? new URL(wasmUrl, document.baseURI).href : prefix + path),
  },
});

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const;

export type CameraState = 'starting' | 'scanning' | 'denied' | 'unavailable';

export default function BarcodeScanner({ paused, onCode, onState }: { paused: boolean; onCode: (code: string) => void; onState: (state: CameraState) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>('starting');
  // The camera must not restart when the parent re-renders.
  const report = useRef(onCode);
  report.current = onCode;
  const tell = useRef(onState);
  tell.current = onState;
  const pausedNow = useRef(paused);
  const last = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    pausedNow.current = paused;
    const v = video.current;
    if (!v) return;
    if (paused) v.pause();
    else {
      // The pause on the last code counts from now, when the camera looks again.
      if (last.current) last.current = { code: last.current.code, at: Date.now() };
      void v.play().catch(() => undefined);
    }
  }, [paused]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let live = true;
    const detector = new BarcodeDetector({ formats: [...FORMATS] });
    const set = (next: CameraState) => {
      if (!live) return;
      setState(next);
      tell.current(next);
    };
    const stop = () => {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const scan = async () => {
      if (!live) return;
      const v = video.current;
      try {
        if (v && stream && !pausedNow.current && v.readyState >= 2) {
          const [code] = await detector.detect(v);
          const now = Date.now();
          if (live && !pausedNow.current && code?.rawValue && acceptCode(code.rawValue, last.current, now)) {
            last.current = { code: code.rawValue, at: now };
            v.pause(); // the picture stays on the pack until the sheet closes
            navigator.vibrate?.(30);
            report.current(code.rawValue);
          }
        }
      } catch {
        // a frame that could not be read; try the next one
      }
      timer = window.setTimeout(() => void scan(), 200);
    };

    let starting = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return set('unavailable');
      if (starting) return;
      starting = true;
      let got: MediaStream;
      try {
        got = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      } catch (error) {
        set((error as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
        return;
      } finally {
        starting = false;
      }
      if (!live || !video.current || document.visibilityState === 'hidden') {
        got.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = got;
      video.current.srcObject = stream;
      if (!pausedNow.current) await video.current.play().catch(() => undefined);
      set('scanning');
    };

    // The camera is off while the app is in the background, and comes back with it.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
      else if (!stream) void start();
    };

    document.addEventListener('visibilitychange', onVisibility);
    void start();
    void scan();
    return () => {
      live = false;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, []);

  return (
    <>
      <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" aria-hidden="true" />
      {state === 'scanning' ? (
        <div aria-hidden="true" className={`absolute inset-x-[12%] top-1/2 h-[28%] -translate-y-1/2 rounded-2xl border-2 border-accent ${paused ? 'bg-accent/20' : ''}`} />
      ) : null}
    </>
  );
}
