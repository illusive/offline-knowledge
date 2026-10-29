// Generates the app icons as PNG files in public/, using only Node's zlib: the asterisk from Home
// (the offline-ready mark) in dark on the accent colour. favicon.svg is the same drawing by hand.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ACCENT = [212, 240, 74]; // --c-accent
const MARK = [20, 20, 20]; // --c-on-accent

function crc32(buf: Buffer): number {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Lucide's asterisk (three strokes through the centre, round caps), scaled into the middle so the
// icon also survives the circular crop of maskable icons.
const ARM = 0.25; // half the length of each stroke, as a share of the icon
const HALF_STROKE = 0.055;
const STROKES = [90, 30, -30].map((deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)] as const);

function pixel(x: number, y: number): number[] {
  const u = x - 0.5;
  const v = y - 0.5;
  const onMark = STROKES.some(([dx, dy]) => {
    const t = Math.max(-ARM, Math.min(ARM, u * dx + v * dy));
    return Math.hypot(u - t * dx, v - t * dy) <= HALF_STROKE;
  });
  return onMark ? MARK : ACCENT;
}

function png(size: number): Buffer {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      // 4x4 supersampling for smoother edges
      const samples = [0.125, 0.375, 0.625, 0.875].flatMap((dx) => [0.125, 0.375, 0.625, 0.875].map((dy) => [dx, dy])).map(([dx, dy]) => pixel((x + dx!) / size, (y + dy!) / size));
      const rgb = [0, 1, 2].map((i) => Math.round(samples.reduce((s, p) => s + p[i]!, 0) / samples.length));
      raw.set(rgb, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = new URL('../public/', import.meta.url);
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]] as const) {
  writeFileSync(new URL(name, out), png(size));
}
console.log('Wrote icons to public/');
