import { distance, Point } from './basic/point';

export function midPt(ps: Point[]): Point {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < ps.length; ++i) {
    sx += ps[i].x;
    sy += ps[i].y;
  }

  return new Point(sx / ps.length, sy / ps.length);
}

function lineExpr(pt0: Point, pt1: Point): number[] {
  const den: number = pt1.x - pt1.x;
  const m: number = den === 0 ? Infinity : (pt1.y - pt0.y) / den;
  const k = pt0.y - m * pt0.x;
  return [m, k];
}

function onSeg(p: Point, ln: Point[]) {
  //non-inclusive
  return (
    Math.min(ln[0].x, ln[1].x) <= p.x &&
    p.x <= Math.max(ln[0].x, ln[1].x) &&
    Math.min(ln[0].y, ln[1].y) <= p.x &&
    p.x <= Math.max(ln[0].y, ln[1].y)
  );
}

function intersect(ln0: Point[], ln1: Point[]): boolean {
  const le0 = lineExpr(ln0[0], ln0[1]);
  const le1 = lineExpr(ln1[0], ln1[1]);
  const den = le0[0] - le1[0];
  if (den === 0) {
    return false;
  }
  const x = (le1[1] - le0[1]) / den;
  const y = le0[0] * x + le0[1];
  const p = new Point(x, y);
  if (onSeg(p, ln0) && onSeg(p, ln1)) {
    // return [x, y];
    return true;
  }
  return false;
}

function ptInPoly(pt: Point, plist: Point[]): boolean {
  let scount = 0;
  for (let i = 0; i < plist.length; i++) {
    const np = plist[i !== plist.length - 1 ? i + 1 : 0];
    const sect = intersect(
      [plist[i], np],
      [pt, new Point(pt.x + 999, pt.y + 999)]
    );
    if (sect !== false) {
      scount++;
    }
  }
  return scount % 2 === 1;
}

function lnInPoly(ln: Point[], plist: Point[]): boolean {
  const lnc = [new Point(), new Point()];
  const ep = 0.01;

  lnc[0].x = ln[0].x * (1 - ep) + ln[1].x * ep;
  lnc[0].y = ln[0].y * (1 - ep) + ln[1].y * ep;
  lnc[1].x = ln[0].x * ep + ln[1].x * (1 - ep);
  lnc[1].y = ln[0].y * ep + ln[1].y * (1 - ep);

  for (let i = 0; i < plist.length; i++) {
    const pt = plist[i];
    const np = plist[i !== plist.length - 1 ? i + 1 : 0];
    if (intersect(lnc, [pt, np]) !== false) {
      return false;
    }
  }
  const mid = midPt([ln[0], ln[1]]);
  if (ptInPoly(mid, plist) === false) {
    return false;
  }
  return true;
}

function sidesOf(plist: Point[]) {
  const slist = [];
  for (let i = 0; i < plist.length; i++) {
    const pt = plist[i];
    const np = plist[i !== plist.length - 1 ? i + 1 : 0];
    const s = distance(pt, np);
    slist.push(s);
  }
  return slist;
}

function areaOf(plist: Point[]) {
  const slist = sidesOf(plist);
  const a = slist[0],
    b = slist[1],
    c = slist[2];
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

function sliverRatio(plist: Point[]) {
  const A = areaOf(plist);
  const P = sidesOf(plist).reduce(function (m, n) {
    return m + n;
  }, 0);
  return A / P;
}

function bestEar(plist: Point[], convex: boolean, optimize: boolean) {
  const cuts = [];
  for (let i = 0; i < plist.length; i++) {
    const pt = plist[i];
    const lp = plist[i !== 0 ? i - 1 : plist.length - 1];
    const np = plist[i !== plist.length - 1 ? i + 1 : 0];
    const qlist = plist.slice();
    qlist.splice(i, 1);
    if (convex || lnInPoly([lp, np], plist)) {
      const c = [[lp, pt, np], qlist];
      if (!optimize) return c;
      cuts.push(c);
    }
  }
  let best = [plist, []];
  let bestRatio = 0;
  for (let i = 0; i < cuts.length; i++) {
    const r = sliverRatio(cuts[i][0]);
    if (r >= bestRatio) {
      best = cuts[i];
      bestRatio = r;
    }
  }
  return best;
}

/**
 * 将三角形拆分成一系列面积不大于 a 的三角形
 * @param plist 待拆分三角形
 * @param a 面积上限
 * @returns 一系列三角形
 */
function shatter(plist: Point[], a: number): Point[][] {
  if (plist.length === 0 || a === 0) {
    return [];
  }

  if (areaOf(plist) < a) {
    return [plist];
  } else {
    try {
      const slist = sidesOf(plist);
      const ind = slist.reduce(
        (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
        0
      );
      const nind = (ind + 1) % plist.length;
      const lind = (ind + 2) % plist.length;
      const mid = midPt([plist[ind], plist[nind]]);
      return shatter([plist[ind], mid, plist[lind]], a).concat(
        shatter([plist[lind], plist[nind], mid], a)
      );
    } catch (err) {
      console.log(plist);
      console.log(err);
      return [];
    }
  }
}

class TriangulateOptions {
  /**
   * 三角形面积上限
   */
  area: number = 100;
  convex: boolean = false;
  optimize: boolean = false;
}

/**
 * 将多边形拆分成三角形列表
 * @param plist 多边形顶点列表
 * @param args 附加参数
 * @returns 拆分得到的一系列三角形
 */
export function triangulate(
  plist: Point[],
  args:
    | Partial<TriangulateOptions>
    | undefined = undefined
): Point[][] {
  //return []
  const _args = new TriangulateOptions();
  Object.assign(_args, args);
  const { area, convex, optimize } = _args;

  if (plist.length <= 3) {
    return shatter(plist, area);
  } else {
    const cut = bestEar(plist, convex, optimize);
    return shatter(cut[0], area).concat(triangulate(cut[1], args));
  }
}
