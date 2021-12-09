import { DesignChunk, IChunk } from './chunk';
import { Noise } from './perlinNoise';
import { Point } from './point';
import PRNG from './PRNG';

const random = PRNG.random;

/**
 * whether f(x, y) is max value in rect(x - r, y - r, x + r, y + r)
 * @param p center point
 * @param f
 * @param r radius
 * @returns
 */
function locmax(p: Point, f: (p: Point) => number, r: number): boolean {
  const z0 = f(p);

  const np = new Point();
  for (np.x = p.x - r; np.x < p.x + r; np.x++) {
    for (np.y = p.y - r; np.y < p.y + r; np.y++) {
      if (z0 < f(np)) {
        return false;
      }
    }
  }

  return true;
}

function needAdd(reg: IChunk[], c: IChunk, r: number = 10): boolean {
  for (let k = 0; k < reg.length; k++) {
    if (Math.abs(reg[k].x - c.x) < r) {
      return false;
    }
  }
  return true;
}

export function design(
  planmtx: number[],
  xmin: number,
  xmax: number
): IChunk[] {
  const reg: IChunk[] = [];
  const samp = 0.03;
  const ns = (p: Point) => Math.max(Noise.noise(p.x * samp) - 0.55, 0) * 2;
  // const nns = (x: number) => 1 - Noise.noise(x * samp);
  // const nnns = (x: number, y: number) =>
  //   Math.max(Noise.noise(x * samp * 2, 2) - 0.55, 0) * 2;
  const yr = (x: number) => Noise.noise(x * 0.01, Math.PI);

  const xstep = 5;
  const mwid = 200;
  for (let i = xmin; i < xmax; i += xstep) {
    const i1 = Math.floor(i / xstep);
    planmtx[i1] = planmtx[i1] || 0;
  }

  for (let i = xmin; i < xmax; i += xstep) {
    for (let j = 0; j < yr(i) * 480; j += 30) {
      if (ns(new Point(i, j)) > 0.3 && locmax(new Point(i, j), ns, 2)) {
        const xof = i + 2 * (random() - 0.5) * 500;
        const yof = j + 300;
        const r = new DesignChunk('mount', xof, yof, ns(new Point(i, j)));
        if (needAdd(reg, r)) {
          reg.push(r);
          for (
            let k = Math.floor((xof - mwid) / xstep);
            k < (xof + mwid) / xstep;
            k++
          ) {
            planmtx[k] += 1;
          }
        }
      }
    }
    if (Math.abs(i) % 1000 < Math.max(1, xstep - 1)) {
      const r = new DesignChunk(
        'distmount',
        i,
        280 - random() * 50,
        ns(new Point(i, yr(i) * 480))
      );
      if (needAdd(reg, r)) reg.push(r);
    }
  }
  console.log([xmin, xmax]);
  for (let i = xmin; i < xmax; i += xstep) {
    if (planmtx[Math.floor(i / xstep)] === 0) {
      //const r = {tag:"redcirc",x:i,y:700}
      //console.log(i)
      if (random() < 0.01) {
        for (let j = 0; j < 4 * random(); j++) {
          const r = new DesignChunk(
            'flatmount',
            i + 2 * (random() - 0.5) * 700,
            700 - j * 50,
            ns(new Point(i, j))
          );
          if (needAdd(reg, r)) reg.push(r);
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
      if (needAdd(reg, r, 400)) reg.push(r);
    }
  }

  return reg;
}
