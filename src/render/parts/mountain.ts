import { Point } from '../basic/point';
import { loopNoise, normRand, poly, randChoice } from '../basic/utils';
import { Noise } from '../basic/perlinNoise';
import { div, stroke, texture } from './brushes';
import {
  tree01,
  tree02,
  tree03,
  tree04,
  tree05,
  tree06,
  tree07,
  tree08,
} from './tree';
import { arch01, arch02, arch03, arch04, transmissionTower01 } from './arch';
import { midPt, triangulate } from '../PolyTools';
import { Bound } from '../basic/range';
import PRNG from '../basic/PRNG';

const random = PRNG.random;

class FootArgs {
  xof: number = 0;
  yof: number = 0;
}

export function foot<K extends keyof FootArgs>(
  ptlist: Point[][],
  args: Pick<FootArgs, K> | undefined = undefined
): string {
  const _args: FootArgs = new FootArgs();
  Object.assign(_args, args);

  const { xof, yof } = _args;

  const ftlist: Point[][] = [];
  const span = 10;
  let ni = 0;
  for (let i = 0; i < ptlist.length - 2; i += 1) {
    if (i == ni) {
      ni = Math.min(ni + randChoice([1, 2]), ptlist.length - 1);

      ftlist.push([]);
      ftlist.push([]);
      for (let j = 0; j < Math.min(ptlist[i].length / 8, 10); j++) {
        ftlist[ftlist.length - 2].push(
          new Point(
            ptlist[i][j].x + Noise.noise(j * 0.1, i) * 10,
            ptlist[i][j].y
          )
        );
        ftlist[ftlist.length - 1].push(
          new Point(
            ptlist[i][ptlist[i].length - 1 - j].x -
              Noise.noise(j * 0.1, i) * 10,
            ptlist[i][ptlist[i].length - 1 - j].y
          )
        );
      }

      ftlist[ftlist.length - 2] = ftlist[ftlist.length - 2].reverse();
      ftlist[ftlist.length - 1] = ftlist[ftlist.length - 1].reverse();
      for (let j = 0; j < span; j++) {
        const p = j / span;
        const x1 = ptlist[i][0].x * (1 - p) + ptlist[ni][0].x * p;
        let y1 = ptlist[i][0].y * (1 - p) + ptlist[ni][0].y * p;

        const x2 =
          ptlist[i][ptlist[i].length - 1].x * (1 - p) +
          ptlist[ni][ptlist[i].length - 1].x * p;
        let y2 =
          ptlist[i][ptlist[i].length - 1].y * (1 - p) +
          ptlist[ni][ptlist[i].length - 1].y * p;

        const vib = -1.7 * (p - 1) * Math.pow(p, 1 / 5);
        y1 += vib * 5 + Noise.noise(xof * 0.05, i) * 5;
        y2 += vib * 5 + Noise.noise(xof * 0.05, i) * 5;

        ftlist[ftlist.length - 2].push(new Point(x1, y1));
        ftlist[ftlist.length - 1].push(new Point(x2, y2));
      }
    }
  }
  let canv = '';
  for (let i = 0; i < ftlist.length; i++) {
    canv += poly(ftlist[i], {
      xof: xof,
      yof: yof,
      fill: 'white',
      stroke: 'none',
    }).render();
  }
  for (let j = 0; j < ftlist.length; j++) {
    canv += stroke(
      ftlist[j].map(function (p) {
        return new Point(p.x + xof, p.y + yof);
      }),
      {
        col: 'rgba(100,100,100,' + (0.1 + random() * 0.1).toFixed(3) + ')',
        strokeWidth: 1,
      }
    );
  }
  return canv;
}

function vegetate(
  ptlist: Point[][],
  treeFunc: (x: number, y: number) => string,
  growthRule: (i: number, j: number) => boolean,
  proofRule: (pl: Point[], i: number) => boolean
): string {
  let canv = '';
  const veglist: Point[] = [];
  for (let i = 0; i < ptlist.length; i += 1) {
    for (let j = 0; j < ptlist[i].length; j += 1) {
      if (growthRule(i, j)) {
        veglist.push(ptlist[i][j].copy());
      }
    }
  }
  for (let i = 0; i < veglist.length; i++) {
    if (proofRule(veglist, i)) {
      canv += treeFunc(veglist[i].x, veglist[i].y);
    }
  }
  return canv;
}

class MountainArgs {
  hei: number = 100 + random() * 400;
  strokeWidth: number = 400 + random() * 200;
  tex: number = 200;
  veg: boolean = true;
  col: string | undefined = undefined;
}

export function mountain<K extends keyof MountainArgs>(
  xoff: number,
  yoff: number,
  seed: number,
  args: Pick<MountainArgs, K> | undefined = undefined
): string {
  const _args = new MountainArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, tex, veg, col } = _args;

  const _seed: number = seed != undefined ? seed : 0;

  let canv = '';

  const ptlist: Point[][] = [];
  const h = hei;
  const w = strokeWidth;
  const reso = [10, 50];

  let hoff = 0;
  for (let j = 0; j < reso[0]; j++) {
    hoff += (random() * yoff) / 100;
    ptlist.push([]);
    for (let i = 0; i < reso[1]; i++) {
      const x = (i / reso[1] - 0.5) * Math.PI;
      const y = Math.cos(x) * Noise.noise(x + 10, j * 0.15, seed);
      const p = 1 - j / reso[0];
      ptlist[ptlist.length - 1].push(
        new Point((x / Math.PI) * w * p, -y * h * p + hoff)
      );
    }
  }

  //RIM
  canv += vegetate(
    ptlist,
    function (x, y) {
      return tree02(x + xoff, y + yoff - 5, {
        col:
          'rgba(100,100,100,' +
          (Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.5).toFixed(3) +
          ')',
        clu: 2,
      });
    },
    function (i, j) {
      const ns = Noise.noise(j * 0.1, seed);
      return i == 0 && ns * ns * ns < 0.1 && Math.abs(ptlist[i][j].y) / h > 0.2;
    },
    function (veglist, i) {
      return true;
    }
  );

  //WHITE BG
  canv += poly(ptlist[0].concat([new Point(0, reso[0] * 4)]), {
    xof: xoff,
    yof: yoff,
    fill: 'white',
    stroke: 'none',
  }).render();
  //OUTLINE
  canv += stroke(
    ptlist[0].map(function (p) {
      return new Point(p.x + xoff, p.y + yoff);
    }),
    { col: 'rgba(100,100,100,0.3)', noi: 1, strokeWidth: 3 }
  );

  canv += foot(ptlist, { xof: xoff, yof: yoff });

  canv += texture(ptlist, {
    xof: xoff,
    yof: yoff,
    tex: tex,
    sha: randChoice([0, 0, 0, 0, 5]),
  });
  //   canv += col === undefined ? texture(ptlist, {
  //     xof: xoff,
  //     yof: yoff,
  //     tex: tex,
  //     sha: randChoice([0, 0, 0, 0, 5]),
  //   }) : texture(ptlist, {
  //     xof: xoff,
  //     yof: yoff,
  //     tex: tex,
  //     sha: randChoice([0, 0, 0, 0, 5]),
  //     col: col,
  //   });

  //TOP
  canv += vegetate(
    ptlist,
    function (x, y) {
      return tree02(x + xoff, y + yoff, {
        col:
          'rgba(100,100,100,' +
          (Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.5).toFixed(3) +
          ')',
      });
    },
    function (i, j) {
      const ns = Noise.noise(i * 0.1, j * 0.1, seed + 2);
      return ns * ns * ns < 0.1 && Math.abs(ptlist[i][j].y) / h > 0.5;
    },
    function (veglist, i) {
      return true;
    }
  );

  if (veg) {
    //MIDDLE
    canv += vegetate(
      ptlist,
      function (x, y) {
        let ht = ((h + y) / h) * 70;
        ht = ht * 0.3 + random() * ht * 0.7;
        return tree01(x + xoff, y + yoff, {
          hei: ht,
          strokeWidth: random() * 3 + 1,
          col:
            'rgba(100,100,100,' +
            (Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.3).toFixed(3) +
            ')',
        });
      },
      function (i, j): boolean {
        const ns = Noise.noise(i * 0.2, j * 0.05, seed);
        return (
          j % 2 !== 0 &&
          ns * ns * ns * ns < 0.012 &&
          Math.abs(ptlist[i][j].y) / h < 0.3
        );
      },
      function (veglist, i) {
        let counter = 0;
        for (let j = 0; j < veglist.length; j++) {
          if (
            i != j &&
            Math.pow(veglist[i].x - veglist[j].x, 2) +
              Math.pow(veglist[i].y - veglist[j].y, 2) <
              30 * 30
          ) {
            counter++;
          }
          if (counter > 2) {
            return true;
          }
        }
        return false;
      }
    );

    //BOTTOM
    canv += vegetate(
      ptlist,
      function (x, y) {
        let ht = ((h + y) / h) * 120;
        ht = ht * 0.5 + random() * ht * 0.5;
        const bc = random() * 0.1;
        const bp = 1;
        return tree03(x + xoff, y + yoff, {
          hei: ht,
          ben: function (x) {
            return Math.pow(x * bc, bp);
          },
          col:
            'rgba(100,100,100,' +
            (Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.3).toFixed(3) +
            ')',
        });
      },
      function (i, j) {
        const ns = Noise.noise(i * 0.2, j * 0.05, seed);
        return (
          (j == 0 || j == ptlist[i].length - 1) && ns * ns * ns * ns < 0.012
        );
      },
      function (veglist, i) {
        return true;
      }
    );
  }

  //BOTT ARCH
  canv += vegetate(
    ptlist,
    function (x, y) {
      const tt = randChoice([0, 0, 1, 1, 1, 2]);
      if (tt == 1) {
        return arch02(x + xoff, y + yoff, seed, {
          strokeWidth: normRand(40, 70),
          sto: randChoice([1, 2, 2, 3]),
          rot: random(),
          sty: randChoice([1, 2, 3]),
        });
      } else if (tt == 2) {
        return arch04(x + xoff, y + yoff, seed, {
          sto: randChoice([1, 1, 1, 2, 2]),
        });
      } else {
        return '';
      }
    },
    function (i, j) {
      const ns = Noise.noise(i * 0.2, j * 0.05, seed + 10);
      return (
        i != 0 &&
        (j == 1 || j == ptlist[i].length - 2) &&
        ns * ns * ns * ns < 0.008
      );
    },
    function (veglist, i) {
      return true;
    }
  );
  //TOP ARCH
  canv += vegetate(
    ptlist,
    function (x, y) {
      return arch03(x + xoff, y + yoff, seed, {
        sto: randChoice([5, 7]),
        strokeWidth: 40 + random() * 20,
      });
    },
    function (i, j) {
      return (
        i == 1 && Math.abs(j - ptlist[i].length / 2) < 1 && random() < 0.02
      );
    },
    function (veglist, i) {
      return true;
    }
  );

  //TRANSM
  canv += vegetate(
    ptlist,
    function (x, y) {
      return transmissionTower01(x + xoff, y + yoff, seed);
    },
    function (i, j) {
      const ns = Noise.noise(i * 0.2, j * 0.05, seed + 20 * Math.PI);
      return (
        i % 2 == 0 &&
        (j == 1 || j == ptlist[i].length - 2) &&
        ns * ns * ns * ns < 0.002
      );
    },
    function (veglist, i) {
      return true;
    }
  );

  //BOTT ROCK
  canv += vegetate(
    ptlist,
    function (x, y) {
      return rock(x + xoff, y + yoff, seed, {
        strokeWidth: 20 + random() * 20,
        hei: 20 + random() * 20,
        sha: 2,
      });
    },
    function (i, j) {
      return (j == 0 || j == ptlist[i].length - 1) && random() < 0.1;
    },
    function (veglist, i) {
      return true;
    }
  );

  return canv;
}

function bound(plist: Point[]): Bound {
  let xmin = plist[0].x;
  let xmax = plist[0].x;
  let ymin = plist[0].y;
  let ymax = plist[0].y;
  for (let i = 0; i < plist.length; i++) {
    if (xmin == undefined || plist[i].x < xmin) {
      xmin = plist[i].x;
    }
    if (xmax == undefined || plist[i].x > xmax) {
      xmax = plist[i].x;
    }
    if (ymin == undefined || plist[i].y < ymin) {
      ymin = plist[i].y;
    }
    if (ymax == undefined || plist[i].y > ymax) {
      ymax = plist[i].y;
    }
  }
  return new Bound(xmin, xmax, ymin, ymax);
}

class FlatMountArgs {
  hei = 40 + random() * 400;
  strokeWidth = 400 + random() * 200;
  tex = 80;
  cho = 0.5;
  ret = 0;
}

export function flatMount<K extends keyof FlatMountArgs>(
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Pick<FlatMountArgs, K> | undefined = undefined
): string {
  const _args = new FlatMountArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, tex, cho, ret } = _args;

  let canv = '';
  const ptlist: Point[][] = [];
  const reso = [5, 50];
  let hoff = 0;
  const flat: Point[][] = [];
  for (let j = 0; j < reso[0]; j++) {
    hoff += (random() * yoff) / 100;
    ptlist.push([]);
    flat.push([]);
    for (let i = 0; i < reso[1]; i++) {
      const x = (i / reso[1] - 0.5) * Math.PI;
      const y = (Math.cos(x * 2) + 1) * Noise.noise(x + 10, j * 0.1, seed);
      const p = 1 - (j / reso[0]) * 0.6;
      const nx = (x / Math.PI) * strokeWidth * p;
      let ny = -y * hei * p + hoff;
      const h = 100;
      if (ny < -h * cho + hoff) {
        ny = -h * cho + hoff;
        if (flat[flat.length - 1].length % 2 == 0) {
          flat[flat.length - 1].push(new Point(nx, ny));
        }
      } else {
        if (flat[flat.length - 1].length % 2 == 1) {
          flat[flat.length - 1].push(
            ptlist[ptlist.length - 1][ptlist[ptlist.length - 1].length - 1]
          );
        }
      }

      ptlist[ptlist.length - 1].push(new Point(nx, ny));
    }
  }

  //WHITE BG
  canv += poly(ptlist[0].concat([new Point(0, reso[0] * 4)]), {
    xof: xoff,
    yof: yoff,
    fill: 'white',
    stroke: 'none',
  }).render();
  //OUTLINE
  canv += stroke(
    ptlist[0].map(function (p: Point) {
      return new Point(p.x + xoff, p.y + yoff);
    }),
    { col: 'rgba(100,100,100,0.3)', noi: 1, strokeWidth: 3 }
  );

  //canv += foot(ptlist,{xof:xoff,yof:yoff})
  canv += texture(ptlist, {
    xof: xoff,
    yof: yoff,
    tex: tex,
    strokeWidth: 2,
    dis: function () {
      if (random() > 0.5) {
        return 0.1 + 0.4 * random();
      } else {
        return 0.9 - 0.4 * random();
      }
    },
  });
  const _grlist1: Point[] = [];
  const _grlist2: Point[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    if (flat[i].length >= 2) {
      _grlist1.push(flat[i][0]);
      _grlist2.push(flat[i][flat[i].length - 1]);
    }
  }

  if (_grlist1.length == 0) {
    return canv;
  }
  const _wb = [_grlist1[0].x, _grlist2[0].x];
  for (let i = 0; i < 3; i++) {
    const p = 0.8 - i * 0.2;

    _grlist1.unshift(new Point(_wb[0] * p, _grlist1[0].y - 5));
    _grlist2.unshift(new Point(_wb[1] * p, _grlist2[0].y - 5));
  }

  const wb = [_grlist1[_grlist1.length - 1].x, _grlist2[_grlist2.length - 1].x];

  for (let i = 0; i < 3; i++) {
    const p = 0.6 - i * i * 0.1;
    _grlist1.push(new Point(wb[0] * p, _grlist1[_grlist1.length - 1].y + 1));
    _grlist2.push(new Point(wb[1] * p, _grlist2[_grlist2.length - 1].y + 1));
  }

  const d = 5;
  const grlist1 = div(_grlist1, d);
  const grlist2 = div(_grlist2, d);

  const grlist = grlist1.reverse().concat(grlist2.concat([grlist1[0]]));
  for (let i = 0; i < grlist.length; i++) {
    const v = (1 - Math.abs((i % d) - d / 2) / (d / 2)) * 0.12;
    grlist[i].x *= 1 - v + Noise.noise(grlist[i].y * 0.5) * v;
  }
  /*       for (const i = 0; i < ptlist.length; i++){
              canv += poly(ptlist[i],{xof:xoff,yof:yoff,stroke:"red",fill:"none",strokeWidth:2})
            }
       */
  canv += poly(grlist, {
    xof: xoff,
    yof: yoff,
    stroke: 'none',
    fill: 'white',
    strokeWidth: 2,
  }).render();
  canv += stroke(
    grlist.map((p: Point) => new Point(p.x + xoff, p.y + yoff)),
    {
      strokeWidth: 3,
      col: 'rgba(100,100,100,0.2)',
    }
  );

  canv += flatDec(xoff, yoff, bound(grlist));

  return canv;
}

export function flatDec(xoff: number, yoff: number, grbd: Bound) {
  let canv = '';

  const tt = randChoice([0, 0, 1, 2, 3, 4]);

  for (let j = 0; j < random() * 5; j++) {
    canv += rock(
      xoff + normRand(grbd.xmin, grbd.xmax),
      yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-10, 10) + 10,
      random() * 100,
      {
        strokeWidth: 10 + random() * 20,
        hei: 10 + random() * 20,
        sha: 2,
      }
    );
  }
  for (let j = 0; j < randChoice([0, 0, 1, 2]); j++) {
    const xr = xoff + normRand(grbd.xmin, grbd.xmax);
    const yr = yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20;
    for (let k = 0; k < 2 + random() * 3; k++) {
      canv += tree08(
        xr + Math.min(Math.max(normRand(-30, 30), grbd.xmin), grbd.xmax),
        yr,
        { hei: 60 + random() * 40 }
      );
    }
  }

  if (tt == 0) {
    for (let j = 0; j < random() * 3; j++) {
      canv += rock(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20,
        random() * 100,
        {
          strokeWidth: 50 + random() * 20,
          hei: 40 + random() * 20,
          sha: 5,
        }
      );
    }
  }
  if (tt == 1) {
    const pmin = random() * 0.5;
    const pmax = random() * 0.5 + 0.5;
    const xmin = grbd.xmin * (1 - pmin) + grbd.xmax * pmin;
    const xmax = grbd.xmin * (1 - pmax) + grbd.xmax * pmax;
    for (let i = xmin; i < xmax; i += 30) {
      canv += tree05(
        xoff + i + 20 * normRand(-1, 1),
        yoff + (grbd.ymin + grbd.ymax) / 2 + 20,
        { hei: 100 + random() * 200 }
      );
    }
    for (let j = 0; j < random() * 4; j++) {
      canv += rock(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20,
        random() * 100,
        {
          strokeWidth: 50 + random() * 20,
          hei: 40 + random() * 20,
          sha: 5,
        }
      );
    }
  } else if (tt == 2) {
    for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) {
      const xr = normRand(grbd.xmin, grbd.xmax);
      const yr = (grbd.ymin + grbd.ymax) / 2;
      canv += tree04(xoff + xr, yoff + yr + 20, {});
      for (let j = 0; j < random() * 2; j++) {
        canv += rock(
          xoff +
            Math.max(grbd.xmin, Math.min(grbd.xmax, xr + normRand(-50, 50))),
          yoff + yr + normRand(-5, 5) + 20,
          j * i * random() * 100,
          {
            strokeWidth: 50 + random() * 20,
            hei: 40 + random() * 20,
            sha: 5,
          }
        );
      }
    }
  } else if (tt == 3) {
    for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) {
      canv += tree06(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + (grbd.ymin + grbd.ymax) / 2,
        { hei: 60 + random() * 60 }
      );
    }
  } else if (tt == 4) {
    const pmin = random() * 0.5;
    const pmax = random() * 0.5 + 0.5;
    const xmin = grbd.xmin * (1 - pmin) + grbd.xmax * pmin;
    const xmax = grbd.xmin * (1 - pmax) + grbd.xmax * pmax;
    for (let i = xmin; i < xmax; i += 20) {
      canv += tree07(
        xoff + i + 20 * normRand(-1, 1),
        yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-1, 1) + 0,
        { hei: normRand(40, 80) }
      );
    }
  }

  for (let i = 0; i < 50 * random(); i++) {
    canv += tree02(
      xoff + normRand(grbd.xmin, grbd.xmax),
      yoff + normRand(grbd.ymin, grbd.ymax)
    );
  }

  const ts = randChoice([0, 0, 0, 0, 1]);
  if (ts == 1 && tt != 4) {
    canv += arch01(
      xoff + normRand(grbd.xmin, grbd.xmax),
      yoff + (grbd.ymin + grbd.ymax) / 2 + 20,
      random(),
      {
        strokeWidth: normRand(160, 200),
        hei: normRand(80, 100),
        per: random(),
      }
    );
  }

  return canv;
}

class DistMountArgs {
  hei = 300;
  len = 2000;
  seg = 5;
}

export function distMount<K extends keyof DistMountArgs>(
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Pick<DistMountArgs, K> | undefined = undefined
) {
  const _args = new DistMountArgs();
  Object.assign(_args, args);

  const { hei, len, seg } = _args;
  let canv = '';
  const span = 10;

  const ptlist: Point[][] = [];

  for (let i = 0; i < len / span / seg; i++) {
    ptlist.push([]);
    for (let j = 0; j < seg + 1; j++) {
      const tran = (k: number) =>
        new Point(
          xoff + k * span,
          yoff -
            hei *
              Noise.noise(k * 0.05, seed) *
              Math.pow(Math.sin((Math.PI * k) / (len / span)), 0.5)
        );
      ptlist[ptlist.length - 1].push(tran(i * seg + j));
    }
    for (let j = 0; j < seg / 2 + 1; j++) {
      const tran = (k: number) =>
        new Point(
          xoff + k * span,
          yoff +
            24 *
              Noise.noise(k * 0.05, 2, seed) *
              Math.pow(Math.sin((Math.PI * k) / (len / span)), 1)
        );
      ptlist[ptlist.length - 1].unshift(tran(i * seg + j * 2));
    }
  }
  for (let i = 0; i < ptlist.length; i++) {
    const getCol = function (x: number, y: number) {
      const c = (Noise.noise(x * 0.02, y * 0.02, yoff) * 55 + 200) | 0;
      return 'rgb(' + c + ',' + c + ',' + c + ')';
    };
    const pe = ptlist[i][ptlist[i].length - 1];
    canv += poly(ptlist[i], {
      fill: getCol(pe.x, pe.y),
      stroke: 'none',
      strokeWidth: 1,
    }).render();

    const T = triangulate(ptlist[i], {
      area: 100,
      convex: true,
      optimize: false,
    });
    for (let k = 0; k < T.length; k++) {
      const m = midPt(T[k]);
      const co = getCol(m.x, m.y);
      canv += poly(T[k], { fill: co, stroke: co, strokeWidth: 1 }).render();
    }
  }
  return canv;
}

class RockArgs {
  hei = 80;
  strokeWidth = 100;
  tex = 40;
  ret = 0;
  sha = 10;
}

export function rock<K extends keyof RockArgs>(
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Pick<RockArgs, K> | undefined = undefined
) {
  const _args = new RockArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, tex, ret, sha } = _args;

  let canv = '';

  const reso = [10, 50];
  const ptlist: Point[][] = [];

  for (let i = 0; i < reso[0]; i++) {
    ptlist.push([]);

    const nslist = [];
    for (let j = 0; j < reso[1]; j++) {
      nslist.push(Noise.noise(i, j * 0.2, seed));
    }
    loopNoise(nslist);

    for (let j = 0; j < reso[1]; j++) {
      const a = (j / reso[1]) * Math.PI * 2 - Math.PI / 2;
      let l =
        (strokeWidth * hei) /
        Math.sqrt(
          Math.pow(hei * Math.cos(a), 2) + Math.pow(strokeWidth * Math.sin(a), 2)
        );

      /*           const l = Math.sin(a)>0? Math.pow(Math.sin(a),0.1)*strokeWidth
                                       : - Math.pow(Math.sin(a+Math.PI),0.1)*strokeWidth */
      l *= 0.7 + 0.3 * nslist[j];

      const p = 1 - i / reso[0];

      const nx = Math.cos(a) * l * p;
      let ny = -Math.sin(a) * l * p;

      if (Math.PI < a || a < 0) {
        ny *= 0.2;
      }

      ny += hei * (i / reso[0]) * 0.2;

      ptlist[ptlist.length - 1].push(new Point(nx, ny));
    }
  }

  //WHITE BG
  canv += poly(ptlist[0].concat([new Point(0, 0)]), {
    xof: xoff,
    yof: yoff,
    fill: 'white',
    stroke: 'none',
  }).render();
  //OUTLINE
  canv += stroke(
    ptlist[0].map(function (p) {
      return new Point(p.x + xoff, p.y + yoff);
    }),
    { col: 'rgba(100,100,100,0.3)', noi: 1, strokeWidth: 3 }
  );
  canv += texture(ptlist, {
    xof: xoff,
    yof: yoff,
    tex: tex,
    strokeWidth: 3,
    sha: sha,
    col: function (x) {
      return 'rgba(180,180,180,' + (0.3 + random() * 0.3).toFixed(3) + ')';
    },
    dis: function () {
      if (random() > 0.5) {
        return 0.15 + 0.15 * random();
      } else {
        return 0.85 - 0.15 * random();
      }
    },
  });

  for (let i = 0; i < reso[0]; i++) {
    //canv += poly(ptlist[i],{xof:xoff,yof:yoff,fill:"none",stroke:"red",strokeWidth:2})
  }
  return canv;
}
