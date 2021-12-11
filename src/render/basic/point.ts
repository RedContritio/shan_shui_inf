export interface IPoint {
  x: number;
  y: number;
}

export class Point implements IPoint {
  constructor(X: number = 0, Y: number = 0) {
    this.x = X;
    this.y = Y;
  }
  x: number = 0;
  y: number = 0;
  toArray(): number[] {
    return [this.x, this.y];
  }
  to(dst: Point): Vector {
    return new Vector(dst.x - this.x, dst.y - this.y);
  }
  from(src: Point): Vector {
    return src.to(this);
  }
  move(vec: Vector): Point {
    return new Point(this.x + vec.x, this.y + vec.y);
  }
  isFinite(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }
  copy(): Point {
    return new Point(this.x, this.y);
  }
  static fromArray(a: number[]): Point {
    return new Point(a[0], a[1]);
  }
  static origin(): Point {
    return new Point(0, 0);
  }
  static readonly O: Point = Point.origin();
}

export class Vector implements IPoint {
  constructor(X: number, Y: number) {
    this.x = X;
    this.y = Y;
  }
  x: number = 0;
  y: number = 0;
  toArray(): number[] {
    return [this.x, this.y];
  }
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  movefrom(src: Point) {
    return src.move(this);
  }
  move(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y);
  }
  scale(ratio: number): Vector {
    return new Vector(this.x * ratio, this.y * ratio);
  }
  static unit(angle: number = 0): Vector {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }
  static fromArray(a: number[]): Vector {
    return new Vector(a[0], a[1]);
  }
}

export function distance(p0: Point, p1: Point): number {
  return p0.to(p1).length();
}
