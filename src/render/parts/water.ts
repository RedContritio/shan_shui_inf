import { Chunk } from '../basic/chunk';
import { Noise } from '../basic/perlinNoise';
import { Point } from '../basic/point';
import { PRNG } from '../basic/PRNG';
import { SvgPolyline } from '../svg/types';
import { stroke } from './brushes';

export function water(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number,
  hei = 2,
  len = 800,
  clu = 10
): Chunk {
  const polylines: SvgPolyline[] = [];

  const ptlist: Point[][] = [];
  let yk = 0;
  for (let i = 0; i < clu; i++) {
    ptlist.push([]);
    const xk = (prng.random(-0.5, 0.5) * len) / 8;
    yk += prng.random(0, 5);
    const lk = len * prng.random(0.25, 0.5);
    const reso = 5;
    for (let j = -lk; j < lk; j += reso) {
      ptlist[ptlist.length - 1].push(
        new Point(
          j + xk,
          Math.sin(j * 0.2) * hei * Noise.noise(prng, j * 0.1) - 20 + yk
        )
      );
    }
  }

  for (let j = 1; j < ptlist.length; j += 1) {
    const color = `rgba(100,100,100,${prng.random(0.3, 0.6).toFixed(3)})`;
    polylines.push(
      stroke(
        prng,
        ptlist[j].map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        color,
        color
      )
    );
  }

  const chunk: Chunk = new Chunk('water', xoff, yoff - 10000, polylines);
  return chunk;
}
