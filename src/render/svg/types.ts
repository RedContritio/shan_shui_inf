import { ISvgAttributes, ISvgElement } from './interfaces';

function SvgAttributeKey(key: string): string {
  var result = key.replace(/([A-Z])/g, ' $1');
  return result.split(' ').join('-').toLowerCase();
}

function SvgAttributeRender(attr: Partial<ISvgAttributes>): string {
  const strlist = Object.entries(attr).map(
    ([k, v]) => `${SvgAttributeKey(k)}:${v}`
  );
  return `style='${strlist.join(';')}'`;
}

interface IPoint {
  x: number;
  y: number;
}

export class Point implements ISvgElement, IPoint {
  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  attr = {};
  x: number = 0;
  y: number = 0;

  static from(p: IPoint): Point {
    return new Point(p.x, p.y);
  }
  render(): string {
    return `${this.x.toFixed(1)},${this.y.toFixed(1)}`;
  }
}

export class Polyline implements ISvgElement {
  attr: Partial<ISvgAttributes> = {};
  points: Point[] = [];

  constructor(points: Point[], attr: Partial<ISvgAttributes>) {
    this.points = points;
    this.attr = attr;
  }

  render(): string {
    const style = SvgAttributeRender(this.attr);
    return `<polyline points='${this.points
      .map((p) => p.render())
      .join(' ')}' ${style}/>`;
  }

  toString(): string {
    console.error('call Polyline.toString');
    return this.render();
  }
}
