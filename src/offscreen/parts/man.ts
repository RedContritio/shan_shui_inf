import { Noise } from '../basic/perlinNoise';
import { distance, Point } from '../basic/point';
import PRNG from '../basic/PRNG';
import { bezmh, normRand, poly } from '../basic/utils';
import { div, stroke, texture } from './brushes';

const random = PRNG.random;

function expand(ptlist: Point[], wfun: (v: number) => number): Point[][] {
  const vtxlist0 = [];
  const vtxlist1 = [];
  const vtxlist = [];
  const n0 = random() * 10;
  for (let i = 1; i < ptlist.length - 1; i++) {
    const w = wfun(i / ptlist.length);
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
  const l = ptlist.length - 1;
  const a0 =
    Math.atan2(ptlist[1].y - ptlist[0].y, ptlist[1].x - ptlist[0].x) -
    Math.PI / 2;
  const a1 =
    Math.atan2(ptlist[l].y - ptlist[l - 1].y, ptlist[l].x - ptlist[l - 1].x) -
    Math.PI / 2;
  const w0 = wfun(0);
  const w1 = wfun(1);
  vtxlist0.unshift(
    new Point(ptlist[0].x + w0 * Math.cos(a0), ptlist[0].y + w0 * Math.sin(a0))
  );
  vtxlist1.unshift(
    new Point(ptlist[0].x - w0 * Math.cos(a0), ptlist[0].y - w0 * Math.sin(a0))
  );
  vtxlist0.push(
    new Point(ptlist[l].x + w1 * Math.cos(a1), ptlist[l].y + w1 * Math.sin(a1))
  );
  vtxlist1.push(
    new Point(ptlist[l].x - w1 * Math.cos(a1), ptlist[l].y - w1 * Math.sin(a1))
  );
  return [vtxlist0, vtxlist1];
}

function tranpoly(p0: Point, p1: Point, ptlist: Point[]): Point[] {
  const plist = ptlist.map(function (v) {
    return new Point(-v.x, v.y);
  });
  const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) - Math.PI / 2;
  const scl = distance(p0, p1);
  const qlist = plist.map(function (v) {
    const d = distance(v, new Point(0, 0));
    const a = Math.atan2(v.y, v.x);
    return new Point(
      p0.x + d * scl * Math.cos(ang + a),
      p0.y + d * scl * Math.sin(ang + a)
    );
  });
  return qlist;
}

const flipper = function (plist: Point[]): Point[] {
  return plist.map(function (v) {
    return new Point(-v.x, v.y);
  });
};

class GeneralFlipArgs {
  fli = false;
}

export function hat01<K extends keyof GeneralFlipArgs>(
  p0: Point,
  p1: Point,
  args: Pick<GeneralFlipArgs, K> | undefined = undefined
): string {
  const _args = new GeneralFlipArgs();
  Object.assign(_args, args);

  const { fli } = _args;

  let canv = '';
  const seed = random();
  const f: (pl: Point[]) => Point[] = fli ? flipper : (x) => x;
  //const plist = [[-0.5,0.5],[0.5,0.5],[0.5,1],[-0.5,2]]
  canv += poly(
    tranpoly(
      p0,
      p1,
      f([
        new Point(-0.3, 0.5),
        new Point(0.3, 0.8),
        new Point(0.2, 1),
        new Point(0, 1.1),
        new Point(-0.3, 1.15),
        new Point(-0.55, 1),
        new Point(-0.65, 0.5),
      ])
    ),
    { fil: 'rgba(100,100,100,0.8)' }
  );

  const qlist1: Point[] = [];
  for (let i = 0; i < 10; i++) {
    qlist1.push(
      new Point(-0.3 - Noise.noise(i * 0.2, seed) * i * 0.1, 0.5 - i * 0.3)
    );
  }
  canv += poly(tranpoly(p0, p1, f(qlist1)), {
    str: 'rgba(100,100,100,0.8)',
    wid: 1,
  });

  return canv;
}

export function hat02<K extends keyof GeneralFlipArgs>(
  p0: Point,
  p1: Point,
  args: Pick<GeneralFlipArgs, K> | undefined = undefined
) {
  const _args = new GeneralFlipArgs();
  Object.assign(_args, args);

  const { fli } = _args;

  let canv = '';
  const seed = random();

  const f: (pl: Point[]) => Point[] = fli ? flipper : (x) => x;
  // canv += poly(tranpoly(p0,p1,[
  //   [-0.3,0.6],[-0.15,1.0],[0,1.1],[0.15,1.0],[0.3,0.6]
  //   ]),{fil:"white",str:"rgba(130,130,130,0.8)",wid:1})
  canv += poly(
    tranpoly(
      p0,
      p1,
      f([
        new Point(-0.3, 0.5),
        new Point(-1.1, 0.5),
        new Point(-1.2, 0.6),
        new Point(-1.1, 0.7),
        new Point(-0.3, 0.8),
        new Point(0.3, 0.8),
        new Point(1.0, 0.7),
        new Point(1.3, 0.6),
        new Point(1.2, 0.5),
        new Point(0.3, 0.5),
      ])
    ),
    { fil: 'rgba(100,100,100,0.8)' }
  );
  return canv;
}

export function stick01<K extends keyof GeneralFlipArgs>(
  p0: Point,
  p1: Point,
  args: Pick<GeneralFlipArgs, K> | undefined = undefined
) {
  const _args = new GeneralFlipArgs();
  Object.assign(_args, args);

  const { fli } = _args;

  let canv = '';
  const seed = random();

  const f: (pl: Point[]) => Point[] = fli ? flipper : (x) => x;

  const qlist1 = [];
  const l = 12;
  for (let i = 0; i < l; i++) {
    qlist1.push(
      new Point(
        -Noise.noise(i * 0.1, seed) * 0.1 * Math.sin((i / l) * Math.PI) * 5,
        0 + i * 0.3
      )
    );
  }
  canv += poly(tranpoly(p0, p1, f(qlist1)), {
    str: 'rgba(100,100,100,0.5)',
    wid: 1,
  });

  return canv;
}

function gpar(sct: any, ind: any): number[] | false {
  const keys = Object.keys(sct);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == ind) {
      return [ind];
    } else {
      const r = gpar(sct[keys[i]], ind);
      if (r != false) {
        return [parseFloat(keys[i])].concat(r);
      }
    }
  }
  return false;
}

function grot(ang: number[], sct: any, ind: any): number {
  const par = gpar(sct, ind);
  let rot = 0;

  if (Array.isArray(par)) {
    for (let i = 0; i < par.length; i++) {
      rot += ang[par[i]];
    }
  }
  return rot;
}

function gpos(ang: number[], len: number[], sct: any, ind: any): Point {
  const par = gpar(sct, ind);
  const pos = new Point(0, 0);
  if (Array.isArray(par)) {
    for (let i = 0; i < par.length; i++) {
      const a = grot(ang, sct, par[i]);
      pos.x += len[par[i]] * Math.cos(a);
      pos.y += len[par[i]] * Math.sin(a);
    }
  }
  return pos;
}

function cloth(
  toGlobal: (p: Point) => Point,
  plist: Point[],
  fun: (v: number) => number
): string {
  let canv = '';
  const tlist = bezmh(plist, 2);
  const [tlist1, tlist2] = expand(tlist, fun);
  canv += poly(tlist1.concat(tlist2.reverse()).map(toGlobal), {
    fil: 'white',
  });
  canv += stroke(tlist1.map(toGlobal), {
    wid: 1,
    col: 'rgba(100,100,100,0.5)',
  });
  canv += stroke(tlist2.map(toGlobal), {
    wid: 1,
    col: 'rgba(100,100,100,0.6)',
  });

  return canv;
}

function fsleeve(sca: number, x: number) {
  return (
    sca *
    8 *
    (Math.sin(0.5 * x * Math.PI) * Math.pow(Math.sin(x * Math.PI), 0.1) +
      (1 - x) * 0.4)
  );
}
function fbody(sca: number, x: number) {
  return (
    sca *
    11 *
    (Math.sin(0.5 * x * Math.PI) * Math.pow(Math.sin(x * Math.PI), 0.1) +
      (1 - x) * 0.5)
  );
}
function fhead(sca: number, x: number) {
  return sca * 7 * Math.pow(0.25 - Math.pow(x - 0.5, 2), 0.3);
}

class ManArgs {
  sca = 0.5;
  hat = hat01;
  ite = (p1: Point, p2: Point, a: GeneralFlipArgs | undefined) => '';
  fli = true;
  ang = [
    0,
    -Math.PI / 2,
    normRand(0, 0),
    (Math.PI / 4) * random(),
    ((Math.PI * 3) / 4) * random(),
    (Math.PI * 3) / 4,
    -Math.PI / 4,
    (-Math.PI * 3) / 4 - (Math.PI / 4) * random(),
    -Math.PI / 4,
  ];
  len = [0, 30, 20, 30, 30, 30, 30, 30, 30];
}

//      2
//    1/
// 7/  | \_ 6
// 8| 0 \ 5
//      /3
//     4

export function man<K extends keyof ManArgs>(
  xoff: number,
  yoff: number,
  args: Pick<ManArgs, K> | undefined = undefined
): string {
  const _args = new ManArgs();
  Object.assign(_args, args);

  const { sca, hat, ite, fli, ang, len: _len } = _args;

  const len = _len.map(function (v) {
    return v * sca;
  });

  let canv = '';
  const sct = {
    0: { 1: { 2: {}, 5: { 6: {} }, 7: { 8: {} } }, 3: { 4: {} } },
  };
  const toGlobal = function (v: Point) {
    return new Point((fli ? -1 : 1) * v.x + xoff, v.y + yoff);
  };

  const pts: Point[] = [];
  for (let i = 0; i < ang.length; i++) {
    pts.push(gpos(ang, len, sct, i));
  }
  yoff -= pts[4].y;

  for (let i = 1; i < pts.length; i++) {
    const par = gpar(sct, i);
    if (Array.isArray(par)) {
      const p0 = gpos(ang, len, sct, par[par.length - 2]);
      const s = div([p0, pts[i]], 10);
      //canv += stroke(s.map(toGlobal))
    }
  }

  const _fsleeve = (v: number) => fsleeve(sca, v);
  const _fbody = (v: number) => fbody(sca, v);
  const _fhead = (v: number) => fhead(sca, v);

  canv += ite(toGlobal(pts[8]), toGlobal(pts[6]), { fli: fli });

  canv += cloth(toGlobal, [pts[1], pts[7], pts[8]], _fsleeve);
  canv += cloth(toGlobal, [pts[1], pts[0], pts[3], pts[4]], _fbody);
  canv += cloth(toGlobal, [pts[1], pts[5], pts[6]], _fsleeve);
  canv += cloth(toGlobal, [pts[1], pts[2]], _fhead);

  const hlist = bezmh([pts[1], pts[2]], 2);
  const [hlist1, hlist2] = expand(hlist, _fhead);
  hlist1.splice(0, Math.floor(hlist1.length * 0.1));
  hlist2.splice(0, Math.floor(hlist2.length * 0.95));
  canv += poly(hlist1.concat(hlist2.reverse()).map(toGlobal), {
    fil: 'rgba(100,100,100,0.6)',
  });

  canv += hat(toGlobal(pts[1]), toGlobal(pts[2]), { fli: fli });

  return canv;
}
