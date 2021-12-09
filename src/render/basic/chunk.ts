import { ISvgAttributes, ISvgElement } from '../svg';
import { IPoint } from './point';

type ChunkTag = 'mount' | 'flatmount' | 'distmount' | 'boat' | '?';

export interface IChunk extends IPoint {
  tag: ChunkTag;
  x: number;
  y: number;
}

export class Chunk implements ISvgElement {
  constructor(tag: ChunkTag, x: number, y: number, elements: ISvgElement[]) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.elements = elements;
  }

  tag: ChunkTag = '?';
  x: number = 0;
  y: number = 0;
  elements: ISvgElement[] = [];

  /**
   * @deprecated never used
   */
  attr: Partial<ISvgAttributes> = {};

  render(): string {
    return this.elements.map((p) => p.render()).join('\n');
  }
}

export class DesignChunk implements IChunk {
  constructor(tag: ChunkTag, x: number, y: number, h: number = 0) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.h = h;
  }

  tag: ChunkTag = '?';
  x: number = 0;
  y: number = 0;
  h: number = 0;
}
