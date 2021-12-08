import { Noise } from '../basic/perlinNoise';
import { Point } from '../basic/point';
import PRNG from '../basic/PRNG';
import { stroke } from './brushes';

const random = PRNG.random;

class WaterArgs {
  hei = 2;
  len = 800;
  clu = 10;
}

export function water<K extends keyof WaterArgs>(
  xoff: number,
  yoff: number,
  seed: number,
  args: Pick<WaterArgs, K> | undefined = undefined
): string {
  const _args = new WaterArgs();
  Object.assign(_args, args);

  const { hei, len, clu } = _args;

  let canv = '';

  const ptlist: Point[][] = [];
  let yk = 0;
  for (let i = 0; i < clu; i++) {
    ptlist.push([]);
    const xk = (random() - 0.5) * (len / 8);
    yk += random() * 5;
    const lk = len / 4 + random() * (len / 4);
    const reso = 5;
    for (let j = -lk; j < lk; j += reso) {
      ptlist[ptlist.length - 1].push(
        new Point(
          j + xk,
          Math.sin(j * 0.2) * hei * Noise.noise(j * 0.1) - 20 + yk
        )
      );
    }
  }

  for (let j = 1; j < ptlist.length; j += 1) {
    const color = 'rgba(100,100,100,' + (0.3 + random() * 0.3).toFixed(3) + ')';
    canv += stroke(
      ptlist[j].map(function (p) {
        return new Point(p.x + xoff, p.y + yoff);
      }),
      {
        fill: color,
        stroke: color,
        out: 1,
      }
    ).render();
  }

  return canv;
}
