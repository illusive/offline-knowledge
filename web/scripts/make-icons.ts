// Generates the placeholder app icons (an open book on the accent colour) as PNG files
// in public/, using only Node's zlib. Replace with a designed icon later (OPEN_QUESTIONS).

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ACCENT = [30, 92, 72];
const PAGE = [248, 248, 245];

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

// Open book: two pages slightly tilted toward a spine in the middle.
function pixel(x: number, y: number): number[] {
  const u = x - 0.5;
  const v = y - 0.5;
  const halfWidth = 0.3;
  const inward = halfWidth - Math.abs(u); // 0 at the outer edge, halfWidth at the spine
  const top = -0.22 + inward * 0.15; // outer corners sit higher than the spine
  const bottom = 0.2 + inward * 0.1;
  const onPage = Math.abs(u) <= halfWidth && v >= top && v <= bottom;
  const spine = Math.abs(u) < 0.012;
  return onPage && !spine ? PAGE : ACCENT;
}

function png(size: number): Buffer {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      // 2x2 supersampling for smoother edges
      const samples = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([dx, dy]) => pixel((x + dx!) / size, (y + dy!) / size));
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
console.log('Wrote placeholder icons to public/');
