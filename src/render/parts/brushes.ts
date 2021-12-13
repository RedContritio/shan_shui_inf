import { Noise } from '../basic/perlinNoise';
import { Point, Vector } from '../basic/point';
import { PRNG } from '../basic/PRNG';
import { loopNoise, poly } from '../basic/utils';
import { SvgPolyline } from '../svg';

export function stroke(
  prng: PRNG,
  ptlist: Point[],
  fill: string = 'rgba(200,200,200,0.9)',
  stroke: string = 'rgba(200,200,200,0.9)',
  strokeWidth: number = 2,
  noi: number = 0.5,
  out: number = 1,
  fun: (x: number) => number = (x: number) => Math.sin(x * Math.PI)
): SvgPolyline {
  console.assert(ptlist.length > 0);

  const vtxlist0 = [];
  const vtxlist1 = [];
  let vtxlist = [];
  const n0 = prng.random() * 10;
  for (let i = 1; i < ptlist.length - 1; i++) {
    let w = strokeWidth * fun(i / ptlist.length);
    w = w * (1 - noi) + w * noi * Noise.noise(prng, i * 0.5, n0);
    const a1 = Math.atan2(
      ptlist[i].y - ptlist[i - 1].y,
      ptlist[i].x - ptlist[i - 1].x
    );
    const a2 = Math.atan2(
      ptlist[i].y - ptlist[i + 1].y,
      ptlist[i].x - ptlist[i + 1].x
    );
    let a = (a1 + a2) / 2;
    if (a < a2) {
      a += Math.PI;
    }
    vtxlist0.push(
      new Point(ptlist[i].x + w * Math.cos(a), ptlist[i].y + w * Math.sin(a))
    );
    vtxlist1.push(
      new Point(ptlist[i].x - w * Math.cos(a), ptlist[i].y - w * Math.sin(a))
    );
  }

  vtxlist = [ptlist[0]]
    .concat(
      vtxlist0.concat(vtxlist1.concat([ptlist[ptlist.length - 1]]).reverse())
    )
    .concat([ptlist[0]]);

  return poly(vtxlist, 0, 0, fill, stroke, out);
}

export function blob(
  prng: PRNG,
  x: number,
  y: number,
  ang: number = 0,
  col: string = 'rgba(200,200,200,0.9)',
  len: number = 20,
  strokeWidth: number = 5,
  noi: number = 0.5,
  fun: (x: number) => number = (x: number) =>
    x <= 1
      ? Math.pow(Math.sin(x * Math.PI), 0.5)
      : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5)
): SvgPolyline {
  const plist = blob_points(prng, x, y, ang, col, len, strokeWidth, noi, fun);
  return poly(plist, 0, 0, col, col);
}

export function blob_points(
  prng: PRNG,
  x: number,
  y: number,
  ang: number = 0,
  col: string = 'rgba(200,200,200,0.9)',
  len: number = 20,
  strokeWidth: number = 5,
  noi: number = 0.5,
  fun: (x: number) => number = (x: number) =>
    x <= 1
      ? Math.pow(Math.sin(x * Math.PI), 0.5)
      : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5)
): Point[] {
  const reso = 20.0;
  const lalist = [];
  for (let i = 0; i < reso + 1; i++) {
    const p = (i / reso) * 2;
    const xo = len / 2 - Math.abs(p - 1) * len;
    const yo = (fun(p) * strokeWidth) / 2;
    const a = Math.atan2(yo, xo);
    const l = Math.sqrt(xo * xo + yo * yo);
    lalist.push([l, a]);
  }
  let nslist = [];
  const n0 = prng.random() * 10;
  for (let i = 0; i < reso + 1; i++) {
    nslist.push(Noise.noise(prng, i * 0.05, n0));
  }

  nslist = loopNoise(nslist);
  const plist = [];
  for (let i = 0; i < lalist.length; i++) {
    const ns = nslist[i] * noi + (1 - noi);
    const nx = x + Math.cos(lalist[i][1] + ang) * lalist[i][0] * ns;
    const ny = y + Math.sin(lalist[i][1] + ang) * lalist[i][0] * ns;
    plist.push(new Point(nx, ny));
  }

  return plist;
}

export function div(plist: Point[], reso: number): Point[] {
  const tl = (plist.length - 1) * reso;
  const rlist = [];

  for (let i = 0; i < tl; i += 1) {
    const lastp = plist[Math.floor(i / reso)];
    const nextp = plist[Math.ceil(i / reso)];
    const p = (i % reso) / reso;
    const nx = lastp.x * (1 - p) + nextp.x * p;
    const ny = lastp.y * (1 - p) + nextp.y * p;

    // const ang = Math.atan2(ny - ly, nx - lx);

    rlist.push(new Point(nx, ny));
  }

  if (plist.length > 0) {
    rlist.push(plist[plist.length - 1]);
  }
  return rlist;
}

export function texture(
  prng: PRNG,
  ptlist: Point[][],
  xof: number = 0,
  yof: number = 0,
  tex: number = 400,
  strokeWidth: number = 1.5,
  sha: number = 0,
  col: (x: number) => string = (_) =>
    `rgba(100,100,100,${(prng.random() * 0.3).toFixed(3)})`,
  dis: () => number = () =>
    (1 / 3) * (prng.random() > 0.5 ? 0 : 2 + prng.random()),
  noi: (x: number) => number = (x) => 30 / x,
  len: number = 0.2
): SvgPolyline[] {
  const offset = new Vector(xof, yof);
  const reso = [ptlist.length, ptlist[0].length];
  const texlist: Point[][] = [];

  for (let i = 0; i < tex; i++) {
    const mid = (dis() * reso[1]) | 0;
    //mid = (reso[1]/3+reso[1]/3*prng.random())|0

    const hlen = Math.floor(prng.random() * (reso[1] * len));

    let start = mid - hlen;
    let end = mid + hlen;
    start = Math.min(Math.max(start, 0), reso[1]);
    end = Math.min(Math.max(end, 0), reso[1]);

    const layer = (i / tex) * (reso[0] - 1);

    texlist.push([]);
    for (let j = start; j < end; j++) {
      const p = layer - Math.floor(layer);

      const x =
        ptlist[Math.floor(layer)][j].x * p +
        ptlist[Math.ceil(layer)][j].x * (1 - p);

      const y =
        ptlist[Math.floor(layer)][j].y * p +
        ptlist[Math.ceil(layer)][j].y * (1 - p);

      const nx = noi(layer + 1) * (Noise.noise(prng, x, j * 0.5) - 0.5);
      const ny = noi(layer + 1) * (Noise.noise(prng, y, j * 0.5) - 0.5);

      texlist[texlist.length - 1].push(new Point(x + nx, y + ny));
    }
  }

  const polylines: SvgPolyline[] = [];

  //SHADE
  if (sha) {
    const step = 1 + (sha !== 0 ? 1 : 0);
    for (let j = 0; j < texlist.length; j += step) {
      if (texlist[j].length > 0) {
        polylines.push(
          stroke(
            prng,
            texlist[j].map((p) => p.move(offset)),
            'rgba(100,100,100,0.1)',
            'rgba(100,100,100,0.1)',
            sha
          )
        );
      }
    }
  }
  //TEXTURE
  for (let j = 0 + sha; j < texlist.length; j += 1 + sha) {
    if (texlist[j].length > 0) {
      polylines.push(
        stroke(
          prng,
          texlist[j].map((p) => p.move(offset)),
          col(j / texlist.length),
          col(j / texlist.length),
          strokeWidth
        )
      );
    }
  }

  return polylines;
}
