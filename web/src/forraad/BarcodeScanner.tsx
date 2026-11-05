// The camera view for scanning a barcode (D-047). Loaded only when the user taps "Scan", so the
// reader (zxing-wasm, ~1 MB) is not parsed on start; its .wasm file is served by the app itself and
// precached, never fetched from a CDN, so scanning works offline. The camera is asked for only here,
// and stops as soon as a code is read or the view closes.

import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Strings } from '../i18n/strings';

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? new URL(wasmUrl, document.baseURI).href : prefix + path),
  },
});

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const;

type State = 'starting' | 'scanning' | 'denied' | 'unavailable';

export default function BarcodeScanner({ s, onCode, onClose }: { s: Strings; onCode: (code: string) => void; onClose: () => void }) {
  const t = s.forraad;
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>('starting');
  const report = useRef(onCode); // the camera must not restart when the parent re-renders
  report.current = onCode;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let live = true;
    const detector = new BarcodeDetector({ formats: [...FORMATS] });

    const scan = async () => {
      if (!live || !video.current) return;
      try {
        if (video.current.readyState >= 2) {
          const [code] = await detector.detect(video.current);
          if (live && code?.rawValue) {
            live = false;
            stream?.getTracks().forEach((track) => track.stop());
            navigator.vibrate?.(30);
            report.current(code.rawValue);
            return;
          }
        }
      } catch {
        // a frame that could not be read; try the next one
      }
      timer = window.setTimeout(() => void scan(), 200);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState('unavailable');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      } catch (error) {
        if (live) setState((error as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
        return;
      }
      if (!live || !video.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.current.srcObject = stream;
      await video.current.play().catch(() => undefined);
      setState('scanning');
      void scan();
    })();

    return () => {
      live = false;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label={t.scanTitle} className="fixed inset-0 z-30 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-[16px] pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <h2 className="text-lg font-semibold">{t.scanTitle}</h2>
        <button type="button" onClick={onClose} aria-label={t.cancel} className="grid size-11 place-items-center rounded-full bg-white/15">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" aria-hidden="true" />
        {state === 'scanning' ? <div aria-hidden="true" className="absolute inset-x-[12%] top-1/2 h-[28%] -translate-y-1/2 rounded-2xl border-2 border-accent" /> : null}
      </div>
      <p className="px-[20px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center" role="status">
        {state === 'denied' ? t.scanDenied : state === 'unavailable' ? t.scanUnavailable : state === 'starting' ? t.scanStarting : t.scanHelp}
      </p>
    </div>
  );
}
