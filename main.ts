// Tiny stack VM for make.fun's tiny-stack-vm-01 ISA, written from the kit's
// generator/subject/ISA.md. One run answers every instance in /input/<id>/
// by writing /output/<id>/stdout.bin and /output/<id>/exit.txt. Node 22.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p, q, o) {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  let s = 0, c = 0, l = 0, i = 0, x = 0, t = 0;
  for (;;) {
    if (t === 1e6) return [10, l];
    if (x < 0 || x >= n) return [9, l];
    const a = p[x];
    if (!(a < 8 || (a >= 16 && a <= 34 && a !== 31) || (a >= 48 && a <= 52) || a === 64 || a === 65 || (a >= 80 && a <= 83))) return [5, l];
    const m = a === 1 ? 1 : a === 2 ? 4 : a >= 48 && a <= 51 ? 2 : 0;
    if (x + m >= n) return [9, l];
    t++;
    const y = x + 1 + m;
    const u = a === 7 ? 3 : a === 5 || a === 6 || a === 65 || (a >= 16 && a <= 34 && a !== 23 && a !== 27) ? 2 : a === 3 || a === 4 || a === 23 || a === 27 || a === 49 || a === 50 || a === 64 || a === 80 || a === 81 || a === 83 ? 1 : 0;
    const v = a === 6 || a === 7 ? 3 : a === 4 || a === 5 ? 2 : a === 1 || a === 2 || (a >= 16 && a <= 34) || a === 64 || a === 82 ? 1 : 0;
    if (s < u) return [2, l];
    if (s - u + v > 256) return [3, l];
    x = y;
    switch (a) {
      case 0: return [0, l];
      case 1: D[s++] = (p[y - 1] << 24) >> 24; break;
      case 2: D[s++] = p[y - 4] | p[y - 3] << 8 | p[y - 2] << 16 | p[y - 1] << 24; break;
      case 3: s--; break;
      case 4: D[s] = D[s - 1]; s++; break;
      case 5: { const w = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = w; break; }
      case 6: D[s] = D[s - 2]; s++; break;
      case 7: { const w = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = w; break; }
      case 23: D[s - 1] = -D[s - 1] | 0; break;
      case 27: D[s - 1] = ~D[s - 1]; break;
      case 48: case 49: case 50: {
        const r = ((p[y - 2] | p[y - 1] << 8) << 16) >> 16;
        let k = true;
        if (a !== 48) { const w = D[--s]; k = a === 49 ? w === 0 : w !== 0; }
        if (k) x = y + r;
        break;
      }
      case 51:
        if (c === 64) return [7, l];
        C[c++] = y; x = p[y - 2] | p[y - 1] << 8; break;
      case 52:
        if (c === 0) return [8, l];
        x = C[--c]; break;
      case 64: { const d = D[s - 1]; if (d < 0 || d > 255) return [6, l]; D[s - 1] = M[d]; break; }
      case 65: { const d = D[s - 1], w = D[s - 2]; if (d < 0 || d > 255) return [6, l]; s -= 2; M[d] = w; break; }
      case 80: {
        const g = String(D[s - 1]);
        if (l + g.length > 65536) return [11, l];
        s--;
        for (let j = 0; j < g.length; j++) o[l++] = g.charCodeAt(j);
        break;
      }
      case 81:
        if (l + 1 > 65536) return [11, l];
        o[l++] = D[--s] & 255; break;
      case 82: D[s++] = i < q.length ? q[i++] : -1; break;
      case 83: return [D[--s] & 255, l];
      default: {
        const b = D[s - 1], e = D[s - 2];
        let r;
        if (a === 16) r = (e + b) | 0;
        else if (a === 17) r = (e - b) | 0;
        else if (a === 18) r = Math.imul(e, b);
        else if (a === 19) { if (!b) return [4, l]; r = e === -2147483648 && b === -1 ? e : (e / b) | 0; }
        else if (a === 20) { if (!b) return [4, l]; r = b === -1 ? 0 : (e % b) | 0; }
        else if (a === 21) { if (!b) return [4, l]; r = Math.floor((e >>> 0) / (b >>> 0)) | 0; }
        else if (a === 22) { if (!b) return [4, l]; r = ((e >>> 0) % (b >>> 0)) | 0; }
        else if (a === 24) r = e & b;
        else if (a === 25) r = e | b;
        else if (a === 26) r = e ^ b;
        else if (a === 28) r = e << (b & 31);
        else if (a === 29) r = e >> (b & 31);
        else if (a === 30) r = (e >>> (b & 31)) | 0;
        else if (a === 32) r = e === b ? 1 : 0;
        else if (a === 33) r = e < b ? 1 : 0;
        else r = (e >>> 0) < (b >>> 0) ? 1 : 0;
        s -= 2; D[s++] = r;
      }
    }
  }
}
for (const d of readdirSync(I)) {
  const o = new Uint8Array(65536);
  const [code, len] = run(readFileSync(join(I, d, 'program.bin')), readFileSync(join(I, d, 'input.bin')), o);
  mkdirSync(join(O, d), { recursive: true });
  writeFileSync(join(O, d, 'stdout.bin'), o.subarray(0, len));
  writeFileSync(join(O, d, 'exit.txt'), code + '\n');
}
