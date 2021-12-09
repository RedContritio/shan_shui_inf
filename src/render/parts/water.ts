import { Chunk } from '../basic/chunk';
import { Noise } from '../basic/perlinNoise';
import { Point } from '../basic/point';
import { PRNG } from '../basic/PRNG';
import { SvgPolyline } from '../svg/types';
import { stroke } from './brushes';

class WaterArgs {
  hei = 2;
  len = 800;
  clu = 10;
}

export function water(
  xoff: number,
  yoff: number,
  seed: number,
  args: Partial<WaterArgs> | undefined = undefined
): Chunk {
  const _args = new WaterArgs();
  Object.assign(_args, args);

  const { hei, len, clu } = _args;
  const polylines: SvgPolyline[] = [];

  const ptlist: Point[][] = [];
  let yk = 0;
  for (let i = 0; i < clu; i++) {
    ptlist.push([]);
    const xk = (PRNG.random() - 0.5) * (len / 8);
    yk += PRNG.random() * 5;
    const lk = len / 4 + PRNG.random() * (len / 4);
    const reso = 5;
    for (let j = -lk; j < lk; j += reso) {
      ptlist[ptlist.length - 1].push(
        new Point(
          j + xk,
          Math.sin(j * 0.2) * hei * Noise.noise(PRNG, j * 0.1) - 20 + yk
        )
      );
    }
  }

  for (let j = 1; j < ptlist.length; j += 1) {
    const color =
      'rgba(100,100,100,' + (0.3 + PRNG.random() * 0.3).toFixed(3) + ')';
    polylines.push(
      stroke(
        ptlist[j].map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        {
          fill: color,
          stroke: color,
          out: 1,
        }
      )
    );
  }

  const chunk: Chunk = new Chunk('water', xoff, yoff - 10000, polylines);
  return chunk;
}
