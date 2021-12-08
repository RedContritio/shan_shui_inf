import { ISvgAttributes, ISvgElement, ISvgStyles } from './interfaces';

function SvgAttributeKey(key: string): string {
  var result = key.replace(/([A-Z])/g, ' $1');
  return result.split(' ').join('-').toLowerCase();
}

function SvgStyleRender(attr: Partial<ISvgStyles>): string {
  const strlist = Object.entries(attr).map(
    ([k, v]) => `${SvgAttributeKey(k)}:${v}`
  );
  return `${strlist.join(';')}`;
}

function SvgAttributeRender(attr: Partial<ISvgAttributes>): string {
  const strlist = Object.entries(attr).map(([k, v]) => {
    const vstr = k === 'style' && attr.style ? SvgStyleRender(attr.style) : v;
    return `${SvgAttributeKey(k)}='${vstr}'`;
  });
  return strlist.join(' ');
}

interface IPoint {
  x: number;
  y: number;
}

export class SvgPoint implements ISvgElement, IPoint {
  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  attr = {};
  x: number = 0;
  y: number = 0;

  static from(p: IPoint): SvgPoint {
    return new SvgPoint(p.x, p.y);
  }
  render(): string {
    return `${this.x.toFixed(1)},${this.y.toFixed(1)}`;
  }
}

export class SvgPolyline implements ISvgElement {
  attr: Partial<ISvgAttributes> = {};
  points: SvgPoint[] = [];

  constructor(points: SvgPoint[], style: Partial<ISvgStyles>) {
    this.points = points;
    this.attr = { style };
  }

  render(): string {
    const attrstr = SvgAttributeRender(this.attr);
    return `<polyline points='${this.points
      .map((p) => p.render())
      .join(' ')}' ${attrstr}/>`;
  }

  toString(): string {
    console.error('call Polyline.toString');
    return this.render();
  }
}

export class SvgText implements ISvgElement {
  attr: Partial<ISvgAttributes> = {};
  content: string = '';

  constructor(content: string, attr: Partial<ISvgAttributes>) {
    this.content = content;
    this.attr = attr;
  }

  render() {
    const attrstr = SvgAttributeRender(this.attr);
    return `<text ${attrstr}>${this.content}</text>`;
  }
}
