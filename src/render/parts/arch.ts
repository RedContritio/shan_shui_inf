import { Chunk } from '../basic/chunk';
import { Noise } from '../basic/perlinNoise';
import { Point } from '../basic/point';
import { PRNG } from '../basic/PRNG';
import { normRand, poly, randChoice, wtrand } from '../basic/utils';
import { midPt } from '../basic/polytools';
import { ISvgElement } from '../svg';
import { SvgPolyline, SvgText } from '../svg/types';
import { div, stroke, texture } from './brushes';
import { hat02, man, stick01 } from './man';

function flip(ptlist: Point[], axis: number = 0): Point[] {
  ptlist.forEach((i) => {
    i.x = axis - i.x - axis;
  });
  return ptlist;
}

function hut(
  prng: PRNG,
  xoff: number,
  yoff: number,
  hei: number = 40,
  strokeWidth: number = 180,
  tex: number = 300
): SvgPolyline[] {
  const reso = [10, 10];
  const ptlist: Point[][] = [];

  for (let i = 0; i < reso[0]; i++) {
    ptlist.push([]);
    const heir = hei + hei * 0.2 * prng.random();
    for (let j = 0; j < reso[1]; j++) {
      const nx =
        strokeWidth *
        (i / (reso[0] - 1) - 0.5) *
        Math.pow(j / (reso[1] - 1), 0.7);
      const ny = heir * (j / (reso[1] - 1));
      ptlist[ptlist.length - 1].push(new Point(nx, ny));
    }
  }

  const polylines: SvgPolyline[] = [];

  polylines.push(
    poly(
      ptlist[0]
        .slice(0, -1)
        .concat(ptlist[ptlist.length - 1].slice(0, -1).reverse()),
      xoff,
      yoff,
      'white',
      'none'
    )
  );
  polylines.push(
    poly(ptlist[0], xoff, yoff, 'none', 'rgba(100,100,100,0.3)', 2)
  );
  polylines.push(
    poly(
      ptlist[ptlist.length - 1],
      xoff,
      yoff,
      'none',
      'rgba(100,100,100,0.3)',
      2
    )
  );

  const texures = texture(
    prng,
    ptlist,
    xoff,
    yoff,
    tex,
    1,
    0,
    (x) => 'rgba(120,120,120,' + (0.3 + prng.random() * 0.3).toFixed(3) + ')',
    () => wtrand(prng, (a) => a * a),
    (_) => 5,
    0.25
  );

  // for (let i = 0; i < reso[0]; i++) {
  //   //canv += poly(ptlist[i],{xof:xoff,yof:yoff,fill:"none",stroke:"red",strokeWidth:2})
  // }

  return polylines.concat(texures);
}

function box(
  prng: PRNG,
  xoff: number,
  yoff: number,
  hei: number = 20,
  strokeWidth: number = 120,
  rot: number = 0.7,
  per: number = 4,
  tra: boolean = true,
  bot: boolean = true,
  wei: number = 3,
  dec: (pul: Point, pur: Point, pdl: Point, pdr: Point) => Point[][] = (
    _1,
    _2,
    _3,
    _4
  ) => []
): SvgPolyline[] {
  const mid = -strokeWidth * 0.5 + strokeWidth * rot;
  const bmid = -strokeWidth * 0.5 + strokeWidth * (1 - rot);
  const _ptlist: Point[][] = [];
  _ptlist.push(
    div(
      [new Point(-strokeWidth * 0.5, -hei), new Point(-strokeWidth * 0.5, 0)],
      5
    )
  );
  _ptlist.push(
    div(
      [new Point(strokeWidth * 0.5, -hei), new Point(strokeWidth * 0.5, 0)],
      5
    )
  );
  if (bot) {
    _ptlist.push(
      div([new Point(-strokeWidth * 0.5, 0), new Point(mid, per)], 5)
    );
    _ptlist.push(
      div([new Point(strokeWidth * 0.5, 0), new Point(mid, per)], 5)
    );
  }
  _ptlist.push(div([new Point(mid, -hei), new Point(mid, per)], 5));
  if (tra) {
    if (bot) {
      _ptlist.push(
        div([new Point(-strokeWidth * 0.5, 0), new Point(bmid, -per)], 5)
      );
      _ptlist.push(
        div([new Point(strokeWidth * 0.5, 0), new Point(bmid, -per)], 5)
      );
    }
    _ptlist.push(div([new Point(bmid, -hei), new Point(bmid, -per)], 5));
  }

  const surf = (rot < 0.5 ? 1 : 0) * 2 - 1;
  const ptlist = _ptlist.concat(
    dec(
      new Point(surf * strokeWidth * 0.5, -hei),
      new Point(mid, -hei + per),
      new Point(surf * strokeWidth * 0.5, 0),
      new Point(mid, per)
    )
  );

  const polist = [
    new Point(strokeWidth * 0.5, -hei),
    new Point(strokeWidth * 0.5, -hei),
    new Point(strokeWidth * 0.5, 0),
    new Point(mid, per),
    new Point(-strokeWidth * 0.5, 0),
  ];

  const polylines: SvgPolyline[] = [];
  if (!tra) {
    polylines.push(poly(polist, xoff, yoff, 'white', 'none'));
  }

  for (let i = 0; i < ptlist.length; i++) {
    polylines.push(
      stroke(
        prng,
        ptlist[i].map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        'rgba(100,100,100,0.4)',
        'rgba(100,100,100,0.4)',
        wei,
        1,
        1,
        (x) => 1
      )
    );
  }
  return polylines;
}

function deco(
  style: number,
  pul: Point = Point.O,
  pur: Point = new Point(0, 100),
  pdl: Point = new Point(100, 0),
  pdr: Point = new Point(100, 100),
  hsp: number[] = [1, 3],
  vsp: number[] = [1, 2]
): Point[][] {
  const plist = [];
  const dl = div([pul, pdl], vsp[1]);
  const dr = div([pur, pdr], vsp[1]);
  const du = div([pul, pur], hsp[1]);
  const dd = div([pdl, pdr], hsp[1]);

  if (style === 1) {
    //-| |-
    const mlu = du[hsp[0]];
    const mru = du[du.length - 1 - hsp[0]];
    const mld = dd[hsp[0]];
    const mrd = dd[du.length - 1 - hsp[0]];

    for (let i = vsp[0]; i < dl.length - vsp[0]; i += vsp[0]) {
      const mml = div([mlu, mld], vsp[1])[i];
      const mmr = div([mru, mrd], vsp[1])[i];
      const ml = dl[i];
      const mr = dr[i];
      plist.push(div([mml, ml], 5));
      plist.push(div([mmr, mr], 5));
    }
    plist.push(div([mlu, mld], 5));
    plist.push(div([mru, mrd], 5));
  } else if (style === 2) {
    //||||

    for (let i = hsp[0]; i < du.length - hsp[0]; i += hsp[0]) {
      const mu = du[i];
      const md = dd[i];
      plist.push(div([mu, md], 5));
    }
  } else if (style === 3) {
    //|##|
    const mlu = du[hsp[0]];
    const mru = du[du.length - 1 - hsp[0]];
    const mld = dd[hsp[0]];
    const mrd = dd[du.length - 1 - hsp[0]];

    for (let i = vsp[0]; i < dl.length - vsp[0]; i += vsp[0]) {
      const mml = div([mlu, mld], vsp[1])[i];
      const mmr = div([mru, mrd], vsp[1])[i];
      const mmu = div([mlu, mru], vsp[1])[i];
      const mmd = div([mld, mrd], vsp[1])[i];

      // const ml = dl[i];
      // const mr = dr[i];
      plist.push(div([mml, mmr], 5));
      plist.push(div([mmu, mmd], 5));
    }
    plist.push(div([mlu, mld], 5));
    plist.push(div([mru, mrd], 5));
  }
  return plist;
}

function rail(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  tra: boolean = true,
  hei: number = 20,
  strokeWidth: number = 180,
  per: number = 4,
  seg: number = 4,
  fro: boolean = true,
  rot: number = 0.7,
  wei: number = 1
): SvgPolyline[] {
  const mid = -strokeWidth * 0.5 + strokeWidth * rot;
  const bmid = -strokeWidth * 0.5 + strokeWidth * (1 - rot);
  const ptlist = [];

  if (fro) {
    ptlist.push(
      div([new Point(-strokeWidth * 0.5, 0), new Point(mid, per)], seg)
    );
    ptlist.push(
      div([new Point(mid, per), new Point(strokeWidth * 0.5, 0)], seg)
    );
  }
  if (tra) {
    ptlist.push(
      div([new Point(-strokeWidth * 0.5, 0), new Point(bmid, -per)], seg)
    );
    ptlist.push(
      div([new Point(bmid, -per), new Point(strokeWidth * 0.5, 0)], seg)
    );
  }
  if (fro) {
    ptlist.push(
      div(
        [new Point(-strokeWidth * 0.5, -hei), new Point(mid, -hei + per)],
        seg
      )
    );
    ptlist.push(
      div([new Point(mid, -hei + per), new Point(strokeWidth * 0.5, -hei)], seg)
    );
  }
  if (tra) {
    ptlist.push(
      div(
        [new Point(-strokeWidth * 0.5, -hei), new Point(bmid, -hei - per)],
        seg
      )
    );
    ptlist.push(
      div(
        [new Point(bmid, -hei - per), new Point(strokeWidth * 0.5, -hei)],
        seg
      )
    );
  }
  if (tra) {
    const open = Math.floor(prng.random() * ptlist.length);
    ptlist[open] = ptlist[open].slice(0, -1);
    ptlist[(open + ptlist.length) % ptlist.length] = ptlist[
      (open + ptlist.length) % ptlist.length
    ].slice(0, -1);
  }

  const polylines: SvgPolyline[] = [];

  for (let i = 0; i < ptlist.length / 2; i++) {
    for (let j = 0; j < ptlist[i].length; j++) {
      //ptlist.push(div([ptlist[i][j],ptlist[4+i][j]],2))
      ptlist[i][j].y += (Noise.noise(prng, i, j * 0.5, seed) - 0.5) * hei;
      ptlist[(ptlist.length / 2 + i) % ptlist.length][
        j % ptlist[(ptlist.length / 2 + i) % ptlist.length].length
      ].y += (Noise.noise(prng, i + 0.5, j * 0.5, seed) - 0.5) * hei;
      const ln = div(
        [
          ptlist[i][j],
          ptlist[(ptlist.length / 2 + i) % ptlist.length][
            j % ptlist[(ptlist.length / 2 + i) % ptlist.length].length
          ],
        ],
        2
      );
      ln[0].x += (prng.random() - 0.5) * hei * 0.5;
      polylines.push(poly(ln, xoff, yoff, 'none', 'rgba(100,100,100,0.5)', 2));
    }
  }

  for (let i = 0; i < ptlist.length; i++) {
    polylines.push(
      stroke(
        prng,
        ptlist[i].map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        'rgba(100,100,100,0.5)',
        'rgba(100,100,100,0.5)',
        wei,
        0.5,
        1,
        (_) => 1
      )
    );
  }
  return polylines;
}

function roof(
  prng: PRNG,
  xoff: number,
  yoff: number,
  hei = 20,
  strokeWidth = 120,
  rot = 0.7,
  wei = 3,
  per = 4,
  pla: [number, string] = [0, ''],
  cor = 5
): ISvgElement[] {
  const opf = function (ptlist: Point[]) {
    if (rot < 0.5) {
      return flip(ptlist);
    } else {
      return ptlist;
    }
  };
  const rrot = rot < 0.5 ? 1 - rot : rot;

  const mid = -strokeWidth * 0.5 + strokeWidth * rrot;
  // const bmid = -strokeWidth * 0.5 + strokeWidth * (1 - rrot);
  const quat = (mid + strokeWidth * 0.5) * 0.5 - mid;

  const ptlist = [];
  ptlist.push(
    div(
      opf([
        new Point(-strokeWidth * 0.5 + quat, -hei - per / 2),
        new Point(-strokeWidth * 0.5 + quat * 0.5, -hei / 2 - per / 4),
        new Point(-strokeWidth * 0.5 - cor, 0),
      ]),
      5
    )
  );
  ptlist.push(
    div(
      opf([
        new Point(mid + quat, -hei),
        new Point((mid + quat + strokeWidth * 0.5) / 2, -hei / 2),
        new Point(strokeWidth * 0.5 + cor, 0),
      ]),
      5
    )
  );
  ptlist.push(
    div(
      opf([
        new Point(mid + quat, -hei),
        new Point(mid + quat / 2, -hei / 2 + per / 2),
        new Point(mid + cor, per),
      ]),
      5
    )
  );

  ptlist.push(
    div(
      opf([new Point(-strokeWidth * 0.5 - cor, 0), new Point(mid + cor, per)]),
      5
    )
  );
  ptlist.push(
    div(
      opf([new Point(strokeWidth * 0.5 + cor, 0), new Point(mid + cor, per)]),
      5
    )
  );

  ptlist.push(
    div(
      opf([
        new Point(-strokeWidth * 0.5 + quat, -hei - per / 2),
        new Point(mid + quat, -hei),
      ]),
      5
    )
  );

  const polylines: ISvgElement[] = [];

  const polist = opf([
    new Point(-strokeWidth * 0.5, 0),
    new Point(-strokeWidth * 0.5 + quat, -hei - per / 2),
    new Point(mid + quat, -hei),
    new Point(strokeWidth * 0.5, 0),
    new Point(mid, per),
  ]);
  polylines.push(poly(polist, xoff, yoff, 'white', 'none'));

  for (let i = 0; i < ptlist.length; i++) {
    polylines.push(
      stroke(
        prng,
        ptlist[i].map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        'rgba(100,100,100,0.4)',
        'rgba(100,100,100,0.4)',
        wei,
        1,
        1,
        (_) => 1
      )
    );
  }

  if (pla[0] === 1) {
    let pp = opf([
      new Point(mid + quat / 2, -hei / 2 + per / 2),
      new Point(-strokeWidth * 0.5 + quat * 0.5, -hei / 2 - per / 4),
    ]);
    if (pp[0].x > pp[1].x) {
      pp = [pp[1], pp[0]];
    }
    const mp = midPt(pp);
    const a = Math.atan2(pp[1].y - pp[0].y, pp[1].x - pp[0].x);
    const adeg = (a * 180) / Math.PI;

    const text = new SvgText(pla[1], {
      fontSize: hei * 0.6,
      fontFamily: 'Verdana',
      textAnchor: 'middle',
      transform: `translate(${mp.x + xoff},${mp.y + yoff}) rotate(${adeg})`,
      style: {
        fill: 'rgba(100, 100, 100, 0.9)',
      },
    });

    polylines.push(text);
  }
  return polylines;
}

function pagroof(
  prng: PRNG,
  xoff: number,
  yoff: number,
  hei = 20,
  strokeWidth = 120,
  wei = 3,
  per = 4
): SvgPolyline[] {
  const cor = 10,
    sid = 4;
  const ptlist: Point[][] = [];
  const polist: Point[] = [new Point(0, -hei)];
  const polylines: SvgPolyline[] = [];

  for (let i = 0; i < sid; i++) {
    const fx = strokeWidth * ((i * 1.0) / (sid - 1) - 0.5);
    const fy = per * (1 - Math.abs((i * 1.0) / (sid - 1) - 0.5) * 2);
    const fxx = (strokeWidth + cor) * ((i * 1.0) / (sid - 1) - 0.5);
    if (i > 0) {
      ptlist.push([ptlist[ptlist.length - 1][2], new Point(fxx, fy)]);
    }
    ptlist.push([
      new Point(0, -hei),
      new Point(fx * 0.5, (-hei + fy) * 0.5),
      new Point(fxx, fy),
    ]);
    polist.push(new Point(fxx, fy));
  }

  polylines.push(poly(polist, xoff, yoff, 'white', 'none'));

  for (let i = 0; i < ptlist.length; i++) {
    polylines.push(
      stroke(
        prng,
        div(ptlist[i], 5).map(function (p) {
          return new Point(p.x + xoff, p.y + yoff);
        }),
        'rgba(100,100,100,0.4)',
        'rgba(100,100,100,0.4)',
        wei,
        1,
        1,
        (_) => 1
      )
    );
  }

  return polylines;
}

export function arch01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  hei = 70,
  strokeWidth = 180,
  per = 5
): SvgPolyline[] {
  const p = 0.4 + prng.random() * 0.2;
  const h0 = hei * p;
  const h1 = hei * (1 - p);

  const polylinelists: SvgPolyline[][] = [];
  polylinelists.push(hut(prng, xoff, yoff - hei, h0, strokeWidth));
  polylinelists.push(
    box(prng, xoff, yoff, h1, (strokeWidth * 2) / 3, 0.7, per, true, false)
  );

  polylinelists.push(
    rail(
      prng,
      xoff,
      yoff,
      seed,
      true,
      10,
      strokeWidth,
      per * 2,
      (3 + prng.random() * 3) | 0,
      false
    )
  );

  const mcnt = randChoice(prng, [0, 1, 1, 2]);
  if (mcnt === 1) {
    polylinelists.push(
      man(
        prng,
        xoff + normRand(prng, -strokeWidth / 3, strokeWidth / 3),
        yoff,
        randChoice(prng, [true, false]),
        0.42
      )
    );
  } else if (mcnt === 2) {
    polylinelists.push(
      man(
        prng,
        xoff + normRand(prng, -strokeWidth / 4, -strokeWidth / 5),
        yoff,
        false,
        0.42
      )
    );
    polylinelists.push(
      man(
        prng,
        xoff + normRand(prng, strokeWidth / 5, strokeWidth / 4),
        yoff,
        true,
        0.42
      )
    );
  }
  polylinelists.push(
    rail(
      prng,
      xoff,
      yoff,
      seed,
      false,
      10,
      strokeWidth,
      per * 2,
      (3 + prng.random() * 3) | 0,
      true
    )
  );

  return polylinelists.flat();
}

export function arch02(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  strokeWidth = 50,
  sto = 3,
  rot = 0.3,
  sty = 1
): ISvgElement[] {
  const hei = 10,
    per = 5,
    rai = false;

  const elementlists: ISvgElement[][] = [];

  let hoff = 0;
  const dec = (pul: Point, pur: Point, pdl: Point, pdr: Point) =>
    deco(
      sty,
      pul,
      pur,
      pdl,
      pdr,
      [[], [1, 5], [1, 5], [1, 4]][sty],
      [[], [1, 2], [1, 2], [1, 3]][sty]
    );
  for (let i = 0; i < sto; i++) {
    elementlists.push(
      box(
        prng,
        xoff,
        yoff - hoff,
        hei,
        strokeWidth * Math.pow(0.85, i),
        rot,
        per,
        false,
        true,
        1.5,
        dec
      )
    );
    elementlists.push(
      rai
        ? rail(
            prng,
            xoff,
            yoff - hoff,
            i * 0.2,
            false,
            hei / 2,
            strokeWidth * Math.pow(0.85, i) * 1.1,
            per,
            4,
            true,
            rot,
            0.5
          )
        : []
    );

    const pla: [number, string] =
      sto === 1 && prng.random() < 1 / 3 ? [1, 'Pizza Hut'] : [0, ''];
    elementlists.push(
      roof(
        prng,
        xoff,
        yoff - hoff - hei,
        hei,
        strokeWidth * Math.pow(0.9, i),
        rot,
        1.5,
        per,
        pla
      )
    );

    hoff += hei * 1.5;
  }
  return elementlists.flat();
}

export function arch03(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  strokeWidth = 50,
  sto = 7
): SvgPolyline[] {
  const hei = 10,
    rot = 0.7,
    per = 5;

  const polylinelists: SvgPolyline[][] = [];

  let hoff = 0;
  const dec = (pul: Point, pur: Point, pdl: Point, pdr: Point) =>
    deco(1, pul, pur, pdl, pdr, [1, 4], [1, 2]);
  for (let i = 0; i < sto; i++) {
    polylinelists.push(
      box(
        prng,
        xoff,
        yoff - hoff,
        hei,
        strokeWidth * Math.pow(0.85, i),
        rot,
        per / 2,
        false,
        true,
        1.5,
        dec
      )
    );
    polylinelists.push(
      rail(
        prng,
        xoff,
        yoff - hoff,
        i * 0.2,
        false,
        hei / 2,
        strokeWidth * Math.pow(0.85, i) * 1.1,
        per / 2,
        5,
        true,
        rot,
        0.5
      )
    );
    polylinelists.push(
      pagroof(
        prng,
        xoff,
        yoff - hoff - hei,
        hei * 1.5,
        strokeWidth * Math.pow(0.9, i),
        1.5,
        per
      )
    );
    hoff += hei * 1.5;
  }
  return polylinelists.flat();
}

export function arch04(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  sto = 2
): SvgPolyline[] {
  const hei = 15,
    strokeWidth = 30,
    rot = 0.7,
    per = 5;

  const polylinelists: SvgPolyline[][] = [];

  let hoff = 0;
  const dec = (_1: Point, _2: Point, _3: Point, _4: Point) => [];
  for (let i = 0; i < sto; i++) {
    polylinelists.push(
      box(
        prng,
        xoff,
        yoff - hoff,
        hei,
        strokeWidth * Math.pow(0.85, i),
        rot,
        per / 2,
        true,
        true,
        1.5,
        dec
      )
    );
    polylinelists.push(
      rail(
        prng,
        xoff,
        yoff - hoff,
        i * 0.2,
        true,
        hei / 3,
        strokeWidth * Math.pow(0.85, i) * 1.2,
        per / 2,
        3,
        true,
        rot,
        0.5
      )
    );
    polylinelists.push(
      pagroof(
        prng,
        xoff,
        yoff - hoff - hei,
        hei * 1,
        strokeWidth * Math.pow(0.9, i),
        1.5,
        per
      )
    );
    hoff += hei * 1.2;
  }
  return polylinelists.flat();
}

export function boat01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  sca = 1,
  fli = false
): Chunk {
  const len = 120;
  const polylinelists: SvgPolyline[][] = [];

  const dir = fli ? -1 : 1;
  polylinelists.push(
    man(
      prng,
      xoff + 20 * sca * dir,
      yoff,
      !fli,
      0.5 * sca,
      [0, 30, 20, 30, 10, 30, 30, 30, 30],
      stick01,
      hat02
    )
  );

  const plist1: Point[] = [];
  const plist2: Point[] = [];
  const fun1 = (x: number) => Math.pow(Math.sin(x * Math.PI), 0.5) * 7 * sca;
  const fun2 = (x: number) => Math.pow(Math.sin(x * Math.PI), 0.5) * 10 * sca;

  for (let i = 0; i < len * sca; i += 5 * sca) {
    plist1.push(new Point(i * dir, fun1(i / len)));
    plist2.push(new Point(i * dir, fun2(i / len)));
  }
  const plist: Point[] = plist1.concat(plist2.reverse());
  polylinelists.push([poly(plist, xoff, yoff, 'white')]);
  polylinelists.push([
    stroke(
      prng,
      plist.map((v) => new Point(xoff + v.x, yoff + v.y)),
      'rgba(100,100,100,0.4)',
      'rgba(100,100,100,0.4)',
      1,
      0.5,
      1,
      (x) => Math.sin(x * Math.PI * 2)
    ),
  ]);

  const chunk: Chunk = new Chunk('boat', xoff, yoff, polylinelists.flat());
  return chunk;
}

export function transmissionTower01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0
): SvgPolyline[] {
  const hei = 100,
    strokeWidth = 20;

  const polylines: SvgPolyline[] = [];

  const toGlobal = (v: Point) => new Point(v.x + xoff, v.y + yoff);

  const quickstroke = function (pl: Point[]) {
    return stroke(
      prng,
      div(pl, 5).map(toGlobal),
      'rgba(100,100,100,0.4)',
      'rgba(100,100,100,0.4)',
      1,
      0.5,
      1,
      (_) => 0.5
    );
  };

  const p00 = new Point(-strokeWidth * 0.05, -hei);
  const p01 = new Point(strokeWidth * 0.05, -hei);

  const p10 = new Point(-strokeWidth * 0.1, -hei * 0.9);
  const p11 = new Point(strokeWidth * 0.1, -hei * 0.9);

  const p20 = new Point(-strokeWidth * 0.2, -hei * 0.5);
  const p21 = new Point(strokeWidth * 0.2, -hei * 0.5);

  const p30 = new Point(-strokeWidth * 0.5, 0);
  const p31 = new Point(strokeWidth * 0.5, 0);

  const bch = [
    new Point(0.7, -0.85),
    new Point(1, -0.675),
    new Point(0.7, -0.5),
  ];

  bch.forEach((i) => {
    polylines.push(
      quickstroke([
        new Point(-i.x * strokeWidth, i.y * hei),
        new Point(i.x * strokeWidth, i.y * hei),
      ])
    );
    polylines.push(
      quickstroke([
        new Point(-i.x * strokeWidth, i.y * hei),
        new Point(0, (i.y - 0.05) * hei),
      ])
    );
    polylines.push(
      quickstroke([
        new Point(i.x * strokeWidth, i.y * hei),
        new Point(0, (i.y - 0.05) * hei),
      ])
    );

    polylines.push(
      quickstroke([
        new Point(-i.x * strokeWidth, i.y * hei),
        new Point(-i.x * strokeWidth, (i.y + 0.1) * hei),
      ])
    );
    polylines.push(
      quickstroke([
        new Point(i.x * strokeWidth, i.y * hei),
        new Point(i.x * strokeWidth, (i.y + 0.1) * hei),
      ])
    );
  });

  const l10 = div([p00, p10, p20, p30], 5);
  const l11 = div([p01, p11, p21, p31], 5);

  for (let i = 0; i < l10.length - 1; i++) {
    polylines.push(quickstroke([l10[i], l11[i + 1]]));
    polylines.push(quickstroke([l11[i], l10[i + 1]]));
  }

  polylines.push(quickstroke([p00, p01]));
  polylines.push(quickstroke([p10, p11]));
  polylines.push(quickstroke([p20, p21]));
  polylines.push(quickstroke([p00, p10, p20, p30]));
  polylines.push(quickstroke([p01, p11, p21, p31]));

  return polylines;
}
