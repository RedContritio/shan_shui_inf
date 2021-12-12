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

  const texures = texture(prng, ptlist, {
    xof: xoff,
    yof: yoff,
    tex: tex,
    strokeWidth: 1,
    len: 0.25,
    col: function (x) {
      return 'rgba(120,120,120,' + (0.3 + prng.random() * 0.3).toFixed(3) + ')';
    },
    dis: function () {
      return wtrand(prng, (a) => a * a);
    },
    noi: function (x) {
      return 5;
    },
  });

  // for (let i = 0; i < reso[0]; i++) {
  //   //canv += poly(ptlist[i],{xof:xoff,yof:yoff,fill:"none",stroke:"red",strokeWidth:2})
  // }

  return polylines.concat(texures);
}

class BoxArgs {
  hei: number = 20;
  strokeWidth: number = 120;
  rot: number = 0.7;
  per: number = 4;
  tra: boolean = true;
  bot: boolean = true;
  wei: number = 3;
  dec: (a: Partial<DecoArgs>) => Point[][] = (_) => [];
}

function box(
  prng: PRNG,
  xoff: number,
  yoff: number,
  args: Partial<BoxArgs> | undefined = undefined
): SvgPolyline[] {
  const _args = new BoxArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, tra, bot, wei, dec } = _args;

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
    dec({
      pul: new Point(surf * strokeWidth * 0.5, -hei),
      pur: new Point(mid, -hei + per),
      pdl: new Point(surf * strokeWidth * 0.5, 0),
      pdr: new Point(mid, per),
    })
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
        {
          fill: 'rgba(100,100,100,0.4)',
          stroke: 'rgba(100,100,100,0.4)',
          noi: 1,
          strokeWidth: wei,
          fun: function (x) {
            return 1;
          },
        }
      )
    );
  }
  return polylines;
}

class DecoArgs {
  pul: Point = Point.O;
  pur: Point = new Point(0, 100);
  pdl: Point = new Point(100, 0);
  pdr: Point = new Point(100, 100);
  hsp: number[] = [1, 3];
  vsp: number[] = [1, 2];
}

function deco(
  style: number,
  args: Partial<DecoArgs> | undefined = undefined
): Point[][] {
  const _args = new DecoArgs();
  Object.assign(_args, args);

  const { pul, pur, pdl, pdr, hsp, vsp } = _args;

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

class RailArgs {
  hei: number = 20;
  strokeWidth: number = 180;
  rot: number = 0.7;
  per: number = 4;
  seg: number = 4;
  wei: number = 1;
  tra: boolean = true;
  fro: boolean = true;
}

function rail(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<RailArgs> | undefined = undefined
): SvgPolyline[] {
  const _args = new RailArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, seg, wei, tra, fro } = _args;

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
        {
          fill: 'rgba(100,100,100,0.5)',
          stroke: 'rgba(100,100,100,0.5)',
          noi: 0.5,
          strokeWidth: wei,
          fun: function (x) {
            return 1;
          },
        }
      )
    );
  }
  return polylines;
}

class RoofArgs {
  hei = 20;
  strokeWidth = 120;
  rot = 0.7;
  per = 4;
  cor = 5;
  wei = 3;
  pla: [number, string] = [0, ''];
}

function roof(
  prng: PRNG,
  xoff: number,
  yoff: number,
  args: Partial<RoofArgs> | undefined = undefined
): ISvgElement[] {
  const _args = new RoofArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, cor, wei, pla } = _args;

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
        {
          fill: 'rgba(100,100,100,0.4)',
          stroke: 'rgba(100,100,100,0.4)',
          noi: 1,
          strokeWidth: wei,
          fun: function (x) {
            return 1;
          },
        }
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

class PagRoofArgs {
  hei = 20;
  strokeWidth = 120;
  per = 4;
  cor = 10;
  sid = 4;
  wei = 3;
}

function pagroof(
  prng: PRNG,
  xoff: number,
  yoff: number,
  args: Partial<PagRoofArgs> | undefined = undefined
): SvgPolyline[] {
  const _args = new PagRoofArgs();
  Object.assign(_args, args);

  const { hei, strokeWidth, per, cor, sid, wei } = _args;

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
        {
          fill: 'rgba(100,100,100,0.4)',
          stroke: 'rgba(100,100,100,0.4)',
          noi: 1,
          strokeWidth: wei,
          fun: function (x) {
            return 1;
          },
        }
      )
    );
  }

  return polylines;
}

class Arch01Args {
  hei = 70;
  strokeWidth = 180;
  per = 5;
}

export function arch01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<Arch01Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Arch01Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, per } = _args;

  const p = 0.4 + prng.random() * 0.2;
  const h0 = hei * p;
  const h1 = hei * (1 - p);

  const polylinelists: SvgPolyline[][] = [];
  polylinelists.push(hut(prng, xoff, yoff - hei, h0, strokeWidth));
  polylinelists.push(
    box(prng, xoff, yoff, {
      hei: h1,
      strokeWidth: (strokeWidth * 2) / 3,
      per: per,
      bot: false,
    })
  );

  polylinelists.push(
    rail(prng, xoff, yoff, seed, {
      tra: true,
      fro: false,
      hei: 10,
      strokeWidth: strokeWidth,
      per: per * 2,
      seg: (3 + prng.random() * 3) | 0,
    })
  );

  const mcnt = randChoice(prng, [0, 1, 1, 2]);
  if (mcnt === 1) {
    polylinelists.push(
      man(
        prng,
        xoff + normRand(prng, -strokeWidth / 3, strokeWidth / 3),
        yoff,
        {
          fli: randChoice(prng, [true, false]),
          sca: 0.42,
        }
      )
    );
  } else if (mcnt === 2) {
    polylinelists.push(
      man(
        prng,
        xoff + normRand(prng, -strokeWidth / 4, -strokeWidth / 5),
        yoff,
        {
          fli: false,
          sca: 0.42,
        }
      )
    );
    polylinelists.push(
      man(prng, xoff + normRand(prng, strokeWidth / 5, strokeWidth / 4), yoff, {
        fli: true,
        sca: 0.42,
      })
    );
  }
  polylinelists.push(
    rail(prng, xoff, yoff, seed, {
      tra: false,
      fro: true,
      hei: 10,
      strokeWidth: strokeWidth,
      per: per * 2,
      seg: (3 + prng.random() * 3) | 0,
    })
  );

  return polylinelists.flat();
}

class Arch02Args {
  hei = 10;
  strokeWidth = 50;
  rot = 0.3;
  per = 5;
  sto = 3;
  sty = 1;
  rai = false;
}

export function arch02(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<Arch02Args> | undefined = undefined
): ISvgElement[] {
  const _args = new Arch02Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, sto, sty, rai } = _args;

  const elementlists: ISvgElement[][] = [];

  let hoff = 0;
  for (let i = 0; i < sto; i++) {
    elementlists.push(
      box(prng, xoff, yoff - hoff, {
        tra: false,
        hei: hei,
        strokeWidth: strokeWidth * Math.pow(0.85, i),
        rot: rot,
        wei: 1.5,
        per: per,
        dec: function (a) {
          return deco(
            sty,
            Object.assign({}, a, {
              hsp: [[], [1, 5], [1, 5], [1, 4]][sty],
              vsp: [[], [1, 2], [1, 2], [1, 3]][sty],
            })
          );
        },
      })
    );
    elementlists.push(
      rai
        ? rail(prng, xoff, yoff - hoff, i * 0.2, {
            strokeWidth: strokeWidth * Math.pow(0.85, i) * 1.1,
            hei: hei / 2,
            per: per,
            rot: rot,
            wei: 0.5,
            tra: false,
          })
        : []
    );

    elementlists.push(
      sto === 1 && prng.random() < 1 / 3
        ? roof(prng, xoff, yoff - hoff - hei, {
            hei: hei,
            strokeWidth: strokeWidth * Math.pow(0.9, i),
            rot: rot,
            wei: 1.5,
            per: per,
            pla: [1, 'Pizza Hut'],
          })
        : roof(prng, xoff, yoff - hoff - hei, {
            hei: hei,
            strokeWidth: strokeWidth * Math.pow(0.9, i),
            rot: rot,
            wei: 1.5,
            per: per,
          })
    );

    hoff += hei * 1.5;
  }
  return elementlists.flat();
}

class Arch03Args {
  hei = 10;
  strokeWidth = 50;
  rot = 0.7;
  per = 5;
  sto = 7;
}

export function arch03(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<Arch03Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Arch03Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, sto } = _args;

  const polylinelists: SvgPolyline[][] = [];

  let hoff = 0;
  for (let i = 0; i < sto; i++) {
    polylinelists.push(
      box(prng, xoff, yoff - hoff, {
        tra: false,
        hei: hei,
        strokeWidth: strokeWidth * Math.pow(0.85, i),
        rot: rot,
        wei: 1.5,
        per: per / 2,
        dec: function (a) {
          return deco(1, Object.assign({}, a, { hsp: [1, 4], vsp: [1, 2] }));
        },
      })
    );
    polylinelists.push(
      rail(prng, xoff, yoff - hoff, i * 0.2, {
        seg: 5,
        strokeWidth: strokeWidth * Math.pow(0.85, i) * 1.1,
        hei: hei / 2,
        per: per / 2,
        rot: rot,
        wei: 0.5,
        tra: false,
      })
    );
    polylinelists.push(
      pagroof(prng, xoff, yoff - hoff - hei, {
        hei: hei * 1.5,
        strokeWidth: strokeWidth * Math.pow(0.9, i),
        wei: 1.5,
        per: per,
      })
    );
    hoff += hei * 1.5;
  }
  return polylinelists.flat();
}

class Arch04Args {
  hei = 15;
  strokeWidth = 30;
  rot = 0.7;
  per = 5;
  sto = 2;
}

export function arch04(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<Arch04Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new Arch04Args();
  Object.assign(_args, args);

  const { hei, strokeWidth, rot, per, sto } = _args;

  const polylinelists: SvgPolyline[][] = [];

  let hoff = 0;
  for (let i = 0; i < sto; i++) {
    polylinelists.push(
      box(prng, xoff, yoff - hoff, {
        tra: true,
        hei: hei,
        strokeWidth: strokeWidth * Math.pow(0.85, i),
        rot: rot,
        wei: 1.5,
        per: per / 2,
        dec: function (a) {
          return [];
        },
      })
    );
    polylinelists.push(
      rail(prng, xoff, yoff - hoff, i * 0.2, {
        seg: 3,
        strokeWidth: strokeWidth * Math.pow(0.85, i) * 1.2,
        hei: hei / 3,
        per: per / 2,
        rot: rot,
        wei: 0.5,
        tra: true,
      })
    );
    polylinelists.push(
      pagroof(prng, xoff, yoff - hoff - hei, {
        hei: hei * 1,
        strokeWidth: strokeWidth * Math.pow(0.9, i),
        wei: 1.5,
        per: per,
      })
    );
    hoff += hei * 1.2;
  }
  return polylinelists.flat();
}

class Boat01Args {
  len = 120;
  sca = 1;
  fli = false;
}

export function boat01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<Boat01Args> | undefined = undefined
): Chunk {
  const _args = new Boat01Args();
  Object.assign(_args, args);

  const { len, sca, fli } = _args;
  const polylinelists: SvgPolyline[][] = [];

  const dir = fli ? -1 : 1;
  polylinelists.push(
    man(prng, xoff + 20 * sca * dir, yoff, {
      ite: stick01,
      hat: hat02,
      sca: 0.5 * sca,
      fli: !fli,
      len: [0, 30, 20, 30, 10, 30, 30, 30, 30],
    })
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
      {
        strokeWidth: 1,
        fun: function (x) {
          return Math.sin(x * Math.PI * 2);
        },
        fill: 'rgba(100,100,100,0.4)',
        stroke: 'rgba(100,100,100,0.4)',
      }
    ),
  ]);

  const chunk: Chunk = new Chunk('boat', xoff, yoff, polylinelists.flat());
  return chunk;
}

class TransmissionTower01Args {
  hei = 100;
  strokeWidth = 20;
}

export function transmissionTower01(
  prng: PRNG,
  xoff: number,
  yoff: number,
  seed: number = 0,
  args: Partial<TransmissionTower01Args> | undefined = undefined
): SvgPolyline[] {
  const _args = new TransmissionTower01Args();
  Object.assign(_args, args);

  const { hei, strokeWidth } = _args;

  const polylines: SvgPolyline[] = [];

  const toGlobal = (v: Point) => new Point(v.x + xoff, v.y + yoff);

  const quickstroke = function (pl: Point[]) {
    return stroke(prng, div(pl, 5).map(toGlobal), {
      strokeWidth: 1,
      fun: (x) => 0.5,
      fill: 'rgba(100,100,100,0.4)',
      stroke: 'rgba(100,100,100,0.4)',
    });
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
