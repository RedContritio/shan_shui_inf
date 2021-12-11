export interface IRange {
  l: number;
  r: number;
}

export class Range {
  constructor(start: number = 0, end: number = 1) {
    this.l = start;
    this.r = end;
  }
  l: number = 0;
  r: number = 1;
  length(): number {
    return this.r - this.l;
  }
  copy(): Range {
    return new Range(this.l, this.r);
  }
  contains(v: number): boolean {
    return v >= this.l && v <= this.r;
  }
  toratio(x: number): number {
    return (x - this.l) / (this.r - this.l);
  }
  fromratio(p: number): number {
    return p * this.length() + this.l;
  }
  static fromArray(a: number[]): Range {
    return new Range(a[0], a[1]);
  }
}

export class Bound {
  constructor(
    xMin: number = 0,
    xMax: number = 0,
    yMin: number = 0,
    yMax: number = 0
  ) {
    this.xmin = xMin;
    this.xmax = xMax;
    this.ymin = yMin;
    this.ymax = yMax;
  }

  xmin: number = 0;
  xmax: number = 0;
  ymin: number = 0;
  ymax: number = 0;
}
