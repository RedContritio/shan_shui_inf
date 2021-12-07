import { IPoint } from './point';

export interface IChunk extends IPoint {
  tag: string;
  x: number;
  y: number;
}

export class Chunk {
  constructor(tag: string, x: number, y: number, canv: string) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.canv = canv;
  }

  tag: string = '?';
  x: number = 0;
  y: number = 0;
  canv: string = '';

  validate(): boolean {
    if (this.canv.includes('NaN')) {
      this.canv = this.canv.replace(/NaN/g, '-1000');
      return false;
    }
    return true;
  }
}
