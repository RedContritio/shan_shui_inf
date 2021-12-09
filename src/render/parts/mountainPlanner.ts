import { DesignChunk, IChunk } from '../basic/chunk';
import { MEM } from '../basic/memory';
import { Noise } from '../basic/perlinNoise';
import PRNG from '../basic/PRNG';

const random = PRNG.random;

function locmax(
  x: number,
  y: number,
  f: (x: number, y: number) => number,
  r: number
) {
  const z0 = f(x, y);
  if (z0 <= 0.3) {
    return false;
  }
  for (let i = x - r; i < x + r; i++) {
    for (let j = y - r; j < y + r; j++) {
      if (f(i, j) > z0) {
        return false;
      }
    }
  }
  return true;
}

function chadd(reg: IChunk[], r: IChunk, mind: number = 10): boolean {
  for (let k = 0; k < reg.length; k++) {
    if (Math.abs(reg[k].x - r.x) < mind) {
      return false;
    }
  }
  console.log('+');
  reg.push(r);
  return true;
}

export function mountplanner(xmin: number, xmax: number): IChunk[] {
  const reg: IChunk[] = [];
  const samp = 0.03;
  const ns = (x: number, y: number) =>
    Math.max(Noise.noise(x * samp) - 0.55, 0) * 2;
  // const nns = (x: number) => 1 - Noise.noise(x * samp);
  // const nnns = (x: number, y: number) =>
  //   Math.max(Noise.noise(x * samp * 2, 2) - 0.55, 0) * 2;
  const yr = (x: number) => Noise.noise(x * 0.01, Math.PI);

  const xstep = 5;
  const mwid = 200;
  for (let i = xmin; i < xmax; i += xstep) {
    const i1 = Math.floor(i / xstep);
    MEM.planmtx[i1] = MEM.planmtx[i1] || 0;
  }

  for (let i = xmin; i < xmax; i += xstep) {
    for (let j = 0; j < yr(i) * 480; j += 30) {
      if (locmax(i, j, ns, 2)) {
        const xof = i + 2 * (random() - 0.5) * 500;
        const yof = j + 300;
        const r = new DesignChunk('mount', xof, yof, ns(i, j));
        const res = chadd(reg, r);
        if (res) {
          for (
            let k = Math.floor((xof - mwid) / xstep);
            k < (xof + mwid) / xstep;
            k++
          ) {
            MEM.planmtx[k] += 1;
          }
        }
      }
    }
    if (Math.abs(i) % 1000 < Math.max(1, xstep - 1)) {
      const r = new DesignChunk(
        'distmount',
        i,
        280 - random() * 50,
        ns(i, yr(i) * 480)
      );
      chadd(reg, r);
    }
  }
  console.log([xmin, xmax]);
  for (let i = xmin; i < xmax; i += xstep) {
    if (MEM.planmtx[Math.floor(i / xstep)] === 0) {
      //const r = {tag:"redcirc",x:i,y:700}
      //console.log(i)
      if (random() < 0.01) {
        for (let j = 0; j < 4 * random(); j++) {
          const r = new DesignChunk(
            'flatmount',
            i + 2 * (random() - 0.5) * 700,
            700 - j * 50,
            ns(i, j)
          );
          chadd(reg, r);
        }
      }
    } else {
      // const r = {tag:"greencirc",x:i,y:700}
      // chadd(r)
    }
  }

  for (let i = xmin; i < xmax; i += xstep) {
    if (random() < 0.2) {
      const r = new DesignChunk('boat', i, 300 + random() * 390);
      chadd(reg, r, 400);
    }
  }

  return reg;
}
