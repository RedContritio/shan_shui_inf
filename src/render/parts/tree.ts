import { Noise } from '../basic/perlinNoise';
import { distance, Point, Vector } from '../basic/point';
import { PRNG } from '../basic/PRNG';
import {
  loopNoise,
  normRand,
  poly,
  randChoice,
  randGaussian,
} from '../basic/utils';
import { midPt, triangulate } from '../basic/polytools';
import { SvgPolyline } from '../svg/types';
import { blob_points, blob, div, stroke } from './brushes';

class Tree01Args {
  hei: number = 50;
  strokeWidth: number = 3;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

export function tree01(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree01Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree01Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, col } = _args;

  const reso = 10;
  const nslist = [];
  for (let i = 0; i < reso; i++) {
    nslist.push([Noise.noise(prng, i * 0.5), Noise.noise(prng, i * 0.5, 0.5)]);
  }

  let leafcol;
  if (col.includes('rgba(')) {
    leafcol = col.replace('rgba(', '').replace(')', '').split(',');
  } else {
    leafcol = ['100', '100', '100', '0.5'];
  }

  const polylines: SvgPolyline[] = [];
  const line1 = [];
  const line2 = [];
  for (let i = 0; i < reso; i++) {
    const nx = x;
    const ny = y - (i * hei) / reso;
    if (i >= reso / 4) {
      for (let j = 0; j < (reso - i) / 5; j++) {
        polylines.push(
          blob(
            prng,
            nx + (prng.random() - 0.5) * strokeWidth * 1.2 * (reso - i),
            ny + (prng.random() - 0.5) * strokeWidth,
            {
              len: prng.random() * 20 * (reso - i) * 0.2 + 10,
              strokeWidth: prng.random() * 6 + 3,
              ang: ((prng.random() - 0.5) * Math.PI) / 6,
              col:
                'rgba(' +
                leafcol[0] +
                ',' +
                leafcol[1] +
                ',' +
                leafcol[2] +
                ',' +
                (prng.random() * 0.2 + parseFloat(leafcol[3])).toFixed(1) +
                ')',
            }
          )
        );
      }
    }
    line1.push(
      new Point(nx + (nslist[i][0] - 0.5) * strokeWidth - strokeWidth / 2, ny)
    );
    line2.push(
      new Point(nx + (nslist[i][1] - 0.5) * strokeWidth + strokeWidth / 2, ny)
    );
  }

  polylines.push(poly(line1, 0, 0, 'none', col, 1.5));
  polylines.push(poly(line2, 0, 0, 'none', col, 1.5));
  return polylines;
}

class Tree02Args {
  hei: number = 16;
  strokeWidth: number = 8;
  clu: number = 5;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

export function tree02(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree02Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree02Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, clu, col } = _args;

  const polylines: SvgPolyline[] = [];
  for (let i = 0; i < clu; i++) {
    polylines.push(
      blob(
        prng,
        x + randGaussian(prng) * clu * 4,
        y + randGaussian(prng) * clu * 4,
        {
          ang: Math.PI / 2,
          // col: "rgba(100,100,100,0.8)",
          fun: function (x) {
            return x <= 1
              ? Math.pow(Math.sin(x * Math.PI) * x, 0.5)
              : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5);
          },
          strokeWidth: prng.random() * strokeWidth * 0.75 + strokeWidth * 0.5,
          len: prng.random() * hei * 0.75 + hei * 0.5,
          col: col,
        }
      )
    );
  }
  return polylines;
}

class Tree03Args {
  hei: number = 16;
  strokeWidth: number = 5;
  ben: (x: number) => number = (_) => 0;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

export function tree03(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree03Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree03Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, ben, col } = _args;

  const reso = 10;
  const nslist = [];
  for (let i = 0; i < reso; i++) {
    nslist.push([Noise.noise(prng, i * 0.5), Noise.noise(prng, i * 0.5, 0.5)]);
  }

  let leafcol;
  if (col.includes('rgba(')) {
    leafcol = col.replace('rgba(', '').replace(')', '').split(',');
  } else {
    leafcol = ['100', '100', '100', '0.5'];
  }
  const polylines: SvgPolyline[] = [];
  const blobs: SvgPolyline[] = [];
  const line1: Point[] = [];
  const line2: Point[] = [];
  for (let i = 0; i < reso; i++) {
    const nx = x + ben(i / reso) * 100;
    const ny = y - (i * hei) / reso;
    if (i >= reso / 5) {
      for (let j = 0; j < (reso - i) * 2; j++) {
        const shape = (x: number) => Math.log(50 * x + 1) / 3.95;
        const ox = prng.random() * strokeWidth * 2 * shape((reso - i) / reso);
        blobs.push(
          blob(
            prng,
            nx + ox * randChoice(prng, [-1, 1]),
            ny + (prng.random() - 0.5) * strokeWidth * 2,
            {
              len: ox * 2,
              strokeWidth: prng.random() * 6 + 3,
              ang: ((prng.random() - 0.5) * Math.PI) / 6,
              col:
                'rgba(' +
                leafcol[0] +
                ',' +
                leafcol[1] +
                ',' +
                leafcol[2] +
                ',' +
                (prng.random() * 0.2 + parseFloat(leafcol[3])).toFixed(3) +
                ')',
            }
          )
        );
      }
    }
    line1.push(
      new Point(
        nx +
          (((nslist[i][0] - 0.5) * strokeWidth - strokeWidth / 2) *
            (reso - i)) /
            reso,
        ny
      )
    );
    line2.push(
      new Point(
        nx +
          (((nslist[i][1] - 0.5) * strokeWidth + strokeWidth / 2) *
            (reso - i)) /
            reso,
        ny
      )
    );
  }
  const lc = line1.concat(line2.reverse());
  polylines.push(poly(lc, 0, 0, 'white', col, 1.5));

  return polylines.concat(blobs);
}

class BranchArgs {
  hei: number = 360;
  strokeWidth: number = 6;
  ang: number = 0;
  det: number = 10;
  ben: number = 0.2 * Math.PI;
}

export function branch(
  prng: PRNG,
  args: Partial<BranchArgs> | undefined = undefined
): Point[][] {
  const _args = new BranchArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, ang, det, ben } = _args;

  let nx = 0;
  let ny = 0;
  const tlist = [[nx, ny]];
  let a0 = 0;
  const g = 3;
  for (let i = 0; i < g; i++) {
    a0 += (ben / 2 + (prng.random() * ben) / 2) * randChoice(prng, [-1, 1]);
    nx += (Math.cos(a0) * hei) / g;
    ny -= (Math.sin(a0) * hei) / g;
    tlist.push([nx, ny]);
  }
  const ta = Math.atan2(tlist[tlist.length - 1][1], tlist[tlist.length - 1][0]);

  for (let i = 0; i < tlist.length; i++) {
    const a = Math.atan2(tlist[i][1], tlist[i][0]);
    const d = Math.sqrt(tlist[i][0] * tlist[i][0] + tlist[i][1] * tlist[i][1]);
    tlist[i][0] = d * Math.cos(a - ta + ang);
    tlist[i][1] = d * Math.sin(a - ta + ang);
  }

  const trlist1: Point[] = [];
  const trlist2: Point[] = [];
  const span = det;
  const tl = (tlist.length - 1) * span;
  let lx = 0;
  let ly = 0;

  for (let i = 0; i < tl; i += 1) {
    const lastp = tlist[Math.floor(i / span)];
    const nextp = tlist[Math.ceil(i / span)];
    const p = (i % span) / span;
    const nx = lastp[0] * (1 - p) + nextp[0] * p;
    const ny = lastp[1] * (1 - p) + nextp[1] * p;

    const angle = Math.atan2(ny - ly, nx - lx);
    const woff = ((Noise.noise(prng, i * 0.3) - 0.5) * strokeWidth * hei) / 80;

    let b = 0;
    if (p === 0) {
      b = prng.random() * strokeWidth;
    }

    const nw = strokeWidth * (((tl - i) / tl) * 0.5 + 0.5);
    trlist1.push(
      new Point(
        nx + Math.cos(angle + Math.PI / 2) * (nw + woff + b),
        ny + Math.sin(angle + Math.PI / 2) * (nw + woff + b)
      )
    );
    trlist2.push(
      new Point(
        nx + Math.cos(angle - Math.PI / 2) * (nw - woff + b),
        ny + Math.sin(angle - Math.PI / 2) * (nw - woff + b)
      )
    );
    lx = nx;
    ly = ny;
  }

  return [trlist1, trlist2];
}

class TwigArgs {
  dir: number = 1;
  sca: number = 1;
  strokeWidth: number = 1;
  ang: number = 0;
  lea: [boolean, number] = [true, 12];
}

export function twig(
  prng: PRNG,
  tx: number,
  ty: number,
  dep: number,
  args: Partial<TwigArgs> | undefined = undefined
): SvgPolyline[] {
  const _args = new TwigArgs();
  Object.assign(_args, args);

  const { dir, sca, strokeWidth, ang, lea } = _args;

  const polylinelists: SvgPolyline[][] = [];
  const twlist: Point[] = [];
  const tl = 10;
  const hs = prng.random() * 0.5 + 0.5;
  // const fun1 = (x: number) => Math.sqrt(x);
  const fun2 = (x: number) => -1 / Math.pow(x / tl + 1, 5) + 1;

  const tfun = randChoice(prng, [fun2]);
  const a0 = ((prng.random() * Math.PI) / 6) * dir + ang;

  for (let i = 0; i < tl; i++) {
    const mx = dir * tfun(i / tl) * 50 * sca * hs;
    const my = -i * 5 * sca;

    const a = Math.atan2(my, mx);
    const d = Math.pow(mx * mx + my * my, 0.5);

    const nx = Math.cos(a + a0) * d;
    const ny = Math.sin(a + a0) * d;

    twlist.push(new Point(nx + tx, ny + ty));
    if ((i === ((tl / 3) | 0) || i === (((tl * 2) / 3) | 0)) && dep > 0) {
      polylinelists.push(
        twig(prng, nx + tx, ny + ty, dep - 1, {
          ang: ang,
          sca: sca * 0.8,
          strokeWidth: strokeWidth,
          dir: dir * randChoice(prng, [-1, 1]),
          lea: lea,
        })
      );
    }
    if (i === tl - 1 && lea[0]) {
      for (let j = 0; j < 5; j++) {
        const dj = (j - 2.5) * 5;
        polylinelists.push([
          blob(
            prng,
            nx + tx + Math.cos(ang) * dj * strokeWidth,
            ny + ty + (Math.sin(ang) * dj - lea[1] / (dep + 1)) * strokeWidth,
            {
              strokeWidth: (6 + 3 * prng.random()) * strokeWidth,
              len: (15 + 12 * prng.random()) * strokeWidth,
              ang:
                ang / 2 + Math.PI / 2 + Math.PI * 0.2 * (prng.random() - 0.5),
              col: 'rgba(100,100,100,' + (0.5 + dep * 0.2).toFixed(3) + ')',
              fun: function (x) {
                return x <= 1
                  ? Math.pow(Math.sin(x * Math.PI) * x, 0.5)
                  : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5);
              },
            }
          ),
        ]);
      }
    }
  }
  polylinelists.push([
    stroke(
      prng,
      twlist,
      'rgba(100,100,100,0.5)',
      'rgba(100,100,100,0.5)',
      1,
      0.5,
      1,
      (x) => Math.cos((x * Math.PI) / 2)
    ),
  ]);

  return polylinelists.flat();
}

function bark(
  prng: PRNG,
  x: number,
  y: number,
  strokeWidth: number,
  ang: number
): SvgPolyline[] {
  const len = 10 + 10 * prng.random();
  const noi = 0.5;
  const fun = function (x: number) {
    return x <= 1
      ? Math.pow(Math.sin(x * Math.PI), 0.5)
      : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5);
  };
  const reso = 20.0;
  const polylines: SvgPolyline[] = [];

  const lalist: number[][] = [];
  for (let i = 0; i < reso + 1; i++) {
    const p = (i / reso) * 2;
    const xo = len / 2 - Math.abs(p - 1) * len;
    const yo = (fun(p) * strokeWidth) / 2;
    const a = Math.atan2(yo, xo);
    const l = Math.sqrt(xo * xo + yo * yo);
    lalist.push([l, a]);
  }
  let nslist: number[] = [];
  const n0 = prng.random() * 10;
  for (let i = 0; i < reso + 1; i++) {
    nslist.push(Noise.noise(prng, i * 0.05, n0));
  }

  nslist = loopNoise(nslist);
  const brklist: Point[] = [];
  for (let i = 0; i < lalist.length; i++) {
    const ns = nslist[i] * noi + (1 - noi);
    const nx = x + Math.cos(lalist[i][1] + ang) * lalist[i][0] * ns;
    const ny = y + Math.sin(lalist[i][1] + ang) * lalist[i][0] * ns;
    brklist.push(new Point(nx, ny));
  }

  const fr = prng.random();
  polylines.push(
    stroke(
      prng,
      brklist,
      'rgba(100,100,100,0.4)',
      'rgba(100,100,100,0.4)',
      0.8,
      0,
      0,
      (x) => Math.sin((x + fr) * Math.PI * 3)
    )
  );

  return polylines;
}

export function barkify(
  prng: PRNG,
  x: number,
  y: number,
  trlist: Point[][]
): SvgPolyline[] {
  const polylinelists: SvgPolyline[][] = [];

  for (let i = 2; i < trlist[0].length - 1; i++) {
    const a0 = Math.atan2(
      trlist[0][i].y - trlist[0][i - 1].y,
      trlist[0][i].x - trlist[0][i - 1].x
    );
    const a1 = Math.atan2(
      trlist[1][i].y - trlist[1][i - 1].y,
      trlist[1][i].x - trlist[1][i - 1].x
    );
    const p = prng.random();
    const nx = trlist[0][i].x * (1 - p) + trlist[1][i].x * p;
    const ny = trlist[0][i].y * (1 - p) + trlist[1][i].y * p;
    if (prng.random() < 0.2) {
      polylinelists.push([
        blob(prng, nx + x, ny + y, {
          noi: 1,
          len: 15,
          strokeWidth: 6 - Math.abs(p - 0.5) * 10,
          ang: (a0 + a1) / 2,
          col: 'rgba(100,100,100,0.6)',
        }),
      ]);
    } else {
      polylinelists.push(
        bark(prng, nx + x, ny + y, 5 - Math.abs(p - 0.5) * 10, (a0 + a1) / 2)
      );
    }

    if (prng.random() < 0.05) {
      const jl = prng.random() * 2 + 2;
      const xya = randChoice(prng, [
        [trlist[0][i].x, trlist[0][i].y, a0],
        [trlist[1][i].x, trlist[1][i].y, a1],
      ]);
      for (let j = 0; j < jl; j++) {
        polylinelists.push([
          blob(
            prng,
            xya[0] + x + Math.cos(xya[2]) * (j - jl / 2) * 4,
            xya[1] + y + Math.sin(xya[2]) * (j - jl / 2) * 4,
            {
              strokeWidth: 4,
              len: 4 + 6 * prng.random(),
              ang: a0 + Math.PI / 2,
              col: 'rgba(100,100,100,0.6)',
            }
          ),
        ]);
      }
    }
  }
  const trflist = trlist[0].concat(trlist[1].slice().reverse());
  const rglist: Point[][] = [[]];
  for (let i = 0; i < trflist.length; i++) {
    if (prng.random() < 0.5) {
      rglist.push([]);
    } else {
      rglist[rglist.length - 1].push(trflist[i]);
    }
  }

  for (let i = 0; i < rglist.length; i++) {
    rglist[i] = div(rglist[i], 4);
    for (let j = 0; j < rglist[i].length; j++) {
      rglist[i][j].x +=
        (Noise.noise(prng, i, j * 0.1, 1) - 0.5) *
        (15 + 5 * randGaussian(prng));
      rglist[i][j].y +=
        (Noise.noise(prng, i, j * 0.1, 2) - 0.5) *
        (15 + 5 * randGaussian(prng));
    }
    if (rglist[i].length > 0) {
      polylinelists.push([
        stroke(
          prng,
          rglist[i].map(function (p: Point) {
            return new Point(p.x + x, p.y + y);
          }),
          'rgba(100,100,100,0.7)',
          'rgba(100,100,100,0.7)',
          1.5,
          0.5,
          0
        ),
      ]);
    }
  }
  return polylinelists.flat();
}

class Tree04Args {
  hei: number = 300;
  strokeWidth: number = 6;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

export function tree04(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree04Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree04Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, col } = _args;

  const polylinelists: SvgPolyline[][] = [];
  const txpolylinelists: SvgPolyline[][] = [];
  const twpolylinelists: SvgPolyline[][] = [];

  const _trlist = branch(prng, { hei, strokeWidth, ang: -Math.PI / 2 });
  txpolylinelists.push(barkify(prng, x, y, _trlist));
  const trlist: Point[] = _trlist[0].concat(_trlist[1].reverse());

  let trmlist: Point[] = [];

  for (let i = 0; i < trlist.length; i++) {
    if (
      (i >= trlist.length * 0.3 &&
        i <= trlist.length * 0.7 &&
        prng.random() < 0.1) ||
      i === trlist.length / 2 - 1
    ) {
      const ba =
        Math.PI * 0.2 - Math.PI * 1.4 * (i > trlist.length / 2 ? 1 : 0);
      const _brlist: Point[][] = branch(prng, {
        hei: hei * (prng.random() + 1) * 0.3,
        strokeWidth: strokeWidth * 0.5,
        ang: ba,
      });

      _brlist[0].splice(0, 1);
      _brlist[1].splice(0, 1);
      const foff = function (p: Point) {
        return new Point(p.x + trlist[i].x, p.y + trlist[i].y);
      };

      txpolylinelists.push(
        barkify(prng, x, y, [_brlist[0].map(foff), _brlist[1].map(foff)])
      );

      for (let j = 0; j < _brlist[0].length; j++) {
        if (prng.random() < 0.2 || j === _brlist[0].length - 1) {
          twpolylinelists.push(
            twig(
              prng,
              _brlist[0][j].x + trlist[i].x + x,
              _brlist[0][j].y + trlist[i].y + y,
              1,
              {
                strokeWidth: hei / 300,
                ang: ba > -Math.PI / 2 ? ba : ba + Math.PI,
                sca: (0.5 * hei) / 300,
                dir: ba > -Math.PI / 2 ? 1 : -1,
              }
            )
          );
        }
      }
      const brlist = _brlist[0].concat(_brlist[1].reverse());
      trmlist = trmlist.concat(
        brlist.map(function (p: Point) {
          return new Point(p.x + trlist[i].x, p.y + trlist[i].y);
        })
      );
    } else {
      trmlist.push(trlist[i]);
    }
  }
  polylinelists.push([poly(trmlist, x, y, 'white', col)]);

  trmlist.splice(0, 1);
  trmlist.splice(trmlist.length - 1, 1);
  const color =
    'rgba(100,100,100,' + (0.4 + prng.random() * 0.1).toFixed(3) + ')';

  polylinelists.push([
    stroke(
      prng,
      trmlist.map(function (p: Point) {
        return new Point(p.x + x, p.y + y);
      }),
      color,
      color,
      2.5,
      0.9,
      0,
      (x) => Math.sin(1)
    ),
  ]);

  polylinelists.push(txpolylinelists.flat());
  polylinelists.push(twpolylinelists.flat());
  return polylinelists.flat();
}

class Tree05Args {
  hei: number = 300;
  strokeWidth: number = 5;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

/**
 * 近处的大树
 * @param x
 * @param y
 * @param args
 * @returns
 */
export function tree05(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree05Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree05Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, col } = _args;

  const polylinelists: SvgPolyline[][] = [];
  const txpolylinelists: SvgPolyline[][] = [];
  const twpolylinelists: SvgPolyline[][] = [];

  const _trlist = branch(prng, {
    hei: hei,
    strokeWidth: strokeWidth,
    ang: -Math.PI / 2,
    ben: 0,
  });
  txpolylinelists.push(barkify(prng, x, y, _trlist));
  const trlist = _trlist[0].concat(_trlist[1].reverse());

  let trmlist: Point[] = [];

  for (let i = 0; i < trlist.length; i++) {
    const p = Math.abs(i - trlist.length * 0.5) / (trlist.length * 0.5);
    if (
      (i >= trlist.length * 0.2 &&
        i <= trlist.length * 0.8 &&
        i % 3 === 0 &&
        prng.random() > p) ||
      i === trlist.length / 2 - 1
    ) {
      const bar = prng.random() * 0.2;
      const ba =
        -bar * Math.PI -
        (1 - bar * 2) * Math.PI * (i > trlist.length / 2 ? 1 : 0);
      const _brlist = branch(prng, {
        hei: hei * (0.3 * p - prng.random() * 0.05),
        strokeWidth: strokeWidth * 0.5,
        ang: ba,
        ben: 0.5,
      });

      _brlist[0].splice(0, 1);
      _brlist[1].splice(0, 1);
      // const foff = function (p: Point) {
      //   return new Point(p.x + trlist[i].x, p.y + trlist[i].y);
      // };
      //txcanv += barkify(x,y,[brlist[0].map(foff),brlist[1].map(foff)])

      for (let j = 0; j < _brlist[0].length; j++) {
        if (j % 20 === 0 || j === _brlist[0].length - 1) {
          twpolylinelists.push(
            twig(
              prng,
              _brlist[0][j].x + trlist[i].x + x,
              _brlist[0][j].y + trlist[i].y + y,
              0,
              {
                strokeWidth: hei / 300,
                ang: ba > -Math.PI / 2 ? ba : ba + Math.PI,
                sca: (0.2 * hei) / 300,
                dir: ba > -Math.PI / 2 ? 1 : -1,
                lea: [true, 5],
              }
            )
          );
        }
      }
      const brlist = _brlist[0].concat(_brlist[1].reverse());
      trmlist = trmlist.concat(
        brlist.map(function (p) {
          return new Point(p.x + trlist[i].x, p.y + trlist[i].y);
        })
      );
    } else {
      trmlist.push(trlist[i]);
    }
  }

  polylinelists.push([poly(trmlist, x, y, 'white', col)]);

  trmlist.splice(0, 1);
  trmlist.splice(trmlist.length - 1, 1);
  const color =
    'rgba(100,100,100,' + (0.4 + prng.random() * 0.1).toFixed(3) + ')';

  // 树干
  polylinelists.push([
    stroke(
      prng,
      trmlist.map(function (p: Point) {
        return new Point(p.x + x, p.y + y);
      }),
      color,
      color,
      2.5,
      0.9,
      0,
      (x) => Math.sin(1)
    ),
  ]);

  polylinelists.push(txpolylinelists.flat());
  polylinelists.push(twpolylinelists.flat());
  return polylinelists.flat();
}

class Tree06Args {
  hei: number = 100;
  strokeWidth: number = 6;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

class FracTree06Args {
  hei: number = 300;
  strokeWidth: number = 5;
  ang: number = 0;
  ben: number = 0.2 * Math.PI;
}

function fracTree06(
  prng: PRNG,
  txpolylinelists: SvgPolyline[][],
  twpolylinelists: SvgPolyline[][],
  xoff: number,
  yoff: number,
  dep: number,
  args: Partial<FracTree06Args> | undefined = undefined
): Point[] {
  const _args = new FracTree06Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, ang, ben } = _args;

  const _trlist = branch(prng, {
    hei: hei,
    strokeWidth: strokeWidth,
    ang: ang,
    ben: ben,
    det: hei / 20,
  });

  txpolylinelists.push(barkify(prng, xoff, yoff, _trlist));
  const trlist = _trlist[0].concat(_trlist[1].reverse());

  let trmlist: Point[] = [];

  for (let i = 0; i < trlist.length; i++) {
    // const p = Math.abs(i - trlist.length * 0.5) / (trlist.length * 0.5);
    if (
      ((prng.random() < 0.025 &&
        i >= trlist.length * 0.2 &&
        i <= trlist.length * 0.8) ||
        i === ((trlist.length / 2) | 0) - 1 ||
        i === ((trlist.length / 2) | 0) + 1) &&
      dep > 0
    ) {
      const bar = 0.02 + prng.random() * 0.08;
      const ba =
        bar * Math.PI - bar * 2 * Math.PI * (i > trlist.length / 2 ? 1 : 0);

      const brlist = fracTree06(
        prng,
        txpolylinelists,
        twpolylinelists,
        trlist[i].x + xoff,
        trlist[i].y + yoff,
        dep - 1,
        {
          hei: hei * (0.7 + prng.random() * 0.2),
          strokeWidth: strokeWidth * 0.6,
          ang: ang + ba,
          ben: 0.55,
        }
      );

      for (let j = 0; j < brlist.length; j++) {
        if (prng.random() < 0.03) {
          twpolylinelists.push(
            twig(
              prng,
              brlist[j].x + trlist[i].x + xoff,
              brlist[j].y + trlist[i].y + yoff,
              2,
              {
                ang: ba * (prng.random() * 0.5 + 0.75),
                sca: 0.3,
                dir: ba > 0 ? 1 : -1,
                lea: [false, 0],
              }
            )
          );
        }
      }

      trmlist = trmlist.concat(
        brlist.map(function (v) {
          return new Point(v.x + trlist[i].x, v.y + trlist[i].y);
        })
      );
    } else {
      trmlist.push(trlist[i]);
    }
  }

  return trmlist;
}

export function tree06(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree06Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Tree06Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, col } = _args;
  const polylinelists: SvgPolyline[][] = [];
  const txpolylinelists: SvgPolyline[][] = [];
  const twpolylinelists: SvgPolyline[][] = [];

  const trmlist = fracTree06(prng, txpolylinelists, twpolylinelists, x, y, 3, {
    hei: hei,
    strokeWidth: strokeWidth,
    ang: -Math.PI / 2,
    ben: 0,
  });

  polylinelists.push([poly(trmlist, x, y, 'white', col, 0)]);

  trmlist.splice(0, 1);
  trmlist.splice(trmlist.length - 1, 1);
  const color =
    'rgba(100,100,100,' + (0.4 + prng.random() * 0.1).toFixed(3) + ')';
  polylinelists.push([
    stroke(
      prng,
      trmlist.map(function (v) {
        return new Point(v.x + x, v.y + y);
      }),
      color,
      color,
      2.5,
      0.9,
      0,
      (x) => Math.sin(1)
    ),
  ]);

  polylinelists.push(txpolylinelists.flat());
  polylinelists.push(twpolylinelists.flat());
  return polylinelists.flat();
}

class Tree07Args {
  hei: number = 60;
  strokeWidth: number = 4;
  ben: (x: number) => number = (x: number) => 0.2 * Math.sqrt(x);
  col: string = 'rgba(100,100,100,1)';
  noi: number = 0.5;
}

export function tree07(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree07Args> | undefined = undefined
): SvgPolyline[] {
  const _args: Tree07Args = new Tree07Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, ben, col } = _args;

  const reso = 10;
  const nslist = [];
  for (let i = 0; i < reso; i++) {
    nslist.push([Noise.noise(prng, i * 0.5), Noise.noise(prng, i * 0.5, 0.5)]);
  }

  // assert(col.includes('rgba('))
  if (!col.includes('rgba(')) {
    console.log('unexpected exception!!');
  }
  const leafcol = col.replace('rgba(', '').replace(')', '').split(',');

  const polylines: SvgPolyline[] = [];
  const line1: Point[] = [];
  const line2: Point[] = [];
  let T: Point[][] = [];
  for (let i = 0; i < reso; i++) {
    const nx = x + ben(i / reso) * 100;
    const ny = y - (i * hei) / reso;
    if (i >= reso / 4) {
      for (let j = 0; j < 1; j++) {
        const bpl = blob_points(
          prng,
          nx + (prng.random() - 0.5) * strokeWidth * 1.2 * (reso - i) * 0.5,
          ny + (prng.random() - 0.5) * strokeWidth * 0.5,
          {
            len: prng.random() * 50 + 20,
            strokeWidth: prng.random() * 12 + 12,
            ang: (-prng.random() * Math.PI) / 6,
            col:
              'rgba(' +
              leafcol[0] +
              ',' +
              leafcol[1] +
              ',' +
              leafcol[2] +
              ',' +
              parseFloat(leafcol[3]).toFixed(3) +
              ')',
            fun: function (x) {
              return x <= 1
                ? 2.75 * x * Math.pow(1 - x, 1 / 1.8)
                : 2.75 * (x - 2) * Math.pow(x - 1, 1 / 1.8);
            },
          }
        );

        //canv+=poly(bpl,{fill:col,strokeWidth:0})
        T = T.concat(triangulate(bpl as Point[], 50, true, false));
      }
    }
    line1.push(
      new Point(nx + (nslist[i][0] - 0.5) * strokeWidth - strokeWidth / 2, ny)
    );
    line2.push(
      new Point(nx + (nslist[i][1] - 0.5) * strokeWidth + strokeWidth / 2, ny)
    );
  }

  //canv += poly(line1.concat(line2.reverse()),{fill:col,strokeWidth:0})
  T = triangulate(line1.concat(line2.reverse()), 50, true, true).concat(T);

  for (let k = 0; k < T.length; k++) {
    const m = midPt(T[k]);
    const c = (Noise.noise(prng, m.x * 0.02, m.y * 0.02) * 200 + 50) | 0;
    const co = 'rgba(' + c + ',' + c + ',' + c + ',0.8)';
    polylines.push(poly(T[k], 0, 0, co, co));
  }
  return polylines;
}

class FracTree08Args {
  ang: number = -Math.PI / 2;
  len: number = 15;
  ben: number = 0;
}

function fracTree08(
  prng: PRNG,
  xoff: number,
  yoff: number,
  dep: number,
  args: Partial<FracTree08Args> | undefined = undefined
): SvgPolyline[] {
  const _args: FracTree08Args = new FracTree08Args();
  Object.assign(_args, args);

  const { ang, len, ben } = _args;

  const fun = (x: number) => (dep ? 1 : Math.cos(0.5 * Math.PI * x));
  const spt = new Vector(xoff, yoff);
  const ept = new Point(xoff + Math.cos(ang) * len, yoff + Math.sin(ang) * len);

  const _trmlist = [new Point(xoff, yoff), new Point(xoff + len, yoff)];

  const bfun = randChoice(prng, [
    (x: number) => Math.sin(x * Math.PI),
    (x: number) => -Math.sin(x * Math.PI),
  ]);

  const trmlist = div(_trmlist, 10);

  for (let i = 0; i < trmlist.length; i++) {
    trmlist[i].y += bfun(i / trmlist.length) * 2;
  }

  for (let i = 0; i < trmlist.length; i++) {
    const d = distance(trmlist[i], spt.movefrom(Point.O));
    const a = Math.atan2(trmlist[i].y - spt.y, trmlist[i].x - spt.x);
    trmlist[i].x = spt.x + d * Math.cos(a + ang);
    trmlist[i].y = spt.y + d * Math.sin(a + ang);
  }

  const polylinelists: SvgPolyline[][] = [];
  polylinelists.push([
    stroke(
      prng,
      trmlist,
      'rgba(100,100,100,0.5)',
      'rgba(100,100,100,0.5)',
      0.8,
      0.5,
      1,
      fun
    ),
  ]);

  if (dep !== 0) {
    const nben = ben + randChoice(prng, [-1, 1]) * Math.PI * 0.001 * dep * dep;
    if (prng.random() < 0.5) {
      polylinelists.push(
        fracTree08(prng, ept.x, ept.y, dep - 1, {
          ang:
            ang +
            ben +
            Math.PI *
              randChoice(prng, [
                normRand(prng, -1, 0.5),
                normRand(prng, 0.5, 1),
              ]) *
              0.2,
          len: len * normRand(prng, 0.8, 0.9),
          ben: nben,
        })
      );
      polylinelists.push(
        fracTree08(prng, ept.x, ept.y, dep - 1, {
          ang:
            ang +
            ben +
            Math.PI *
              randChoice(prng, [
                normRand(prng, -1, -0.5),
                normRand(prng, 0.5, 1),
              ]) *
              0.2,
          len: len * normRand(prng, 0.8, 0.9),
          ben: nben,
        })
      );
    } else {
      polylinelists.push(
        fracTree08(prng, ept.x, ept.y, dep - 1, {
          ang: ang + ben,
          len: len * normRand(prng, 0.8, 0.9),
          ben: nben,
        })
      );
    }
  }
  return polylinelists.flat();
}

class Tree08Args {
  hei: number = 80;
  strokeWidth: number = 1;
  col: string = 'rgba(100,100,100,0.5)';
  noi: number = 0.5;
}

export function tree08(
  prng: PRNG,
  x: number,
  y: number,
  args: Partial<Tree08Args> | undefined = undefined
): SvgPolyline[] {
  const _args: Tree08Args = new Tree08Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, col } = _args;

  const polylinelists: SvgPolyline[][] = [];
  const twpolylinelists: SvgPolyline[][] = [];

  const ang = normRand(prng, -1, 1) * Math.PI * 0.2;

  const _trlist = branch(prng, {
    hei: hei,
    strokeWidth: strokeWidth,
    ang: -Math.PI / 2 + ang,
    ben: Math.PI * 0.2,
    det: hei / 20,
  });
  //txcanv += barkify(x,y,trlist)

  const trlist = _trlist[0].concat(_trlist[1].reverse());

  for (let i = 0; i < trlist.length; i++) {
    if (prng.random() < 0.2) {
      twpolylinelists.push(
        fracTree08(
          prng,
          x + trlist[i].x,
          y + trlist[i].y,
          Math.floor(4 * prng.random()),
          { ang: -Math.PI / 2 - ang * prng.random() }
          // { hei: 20, ang: -Math.PI / 2 - ang * prng.random() }
        )
      );
    } else if (i === Math.floor(trlist.length / 2)) {
      twpolylinelists.push(
        fracTree08(prng, x + trlist[i].x, y + trlist[i].y, 3, {
          // hei: 25,
          ang: -Math.PI / 2 + ang,
        })
      );
    }
  }

  polylinelists.push([poly(trlist, x, y, 'white', col)]);

  const color =
    'rgba(100,100,100,' + (0.6 + prng.random() * 0.1).toFixed(3) + ')';
  polylinelists.push([
    stroke(
      prng,
      trlist.map(function (v) {
        return new Point(v.x + x, v.y + y);
      }),
      color,
      color,
      2.5,
      0.9,
      0,
      (x) => Math.sin(1)
    ),
  ]);

  polylinelists.push(twpolylinelists.flat());
  //console.log(canv)
  return polylinelists.flat();
}
