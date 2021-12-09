import { boat01 } from '../parts/arch';
import { distMount, flatMount, mountain } from '../parts/mountain';
import { design } from './designer';
import { water } from '../parts/water';
import { Chunk, IChunk } from './chunk';
import PRNG from './PRNG';
import { randChoice } from './utils';

class Memory {
  canv: string = '';
  chunks: Chunk[] = [];
  xmin: number = 0;
  xmax: number = 0;
  cwid: number = 512;
  mountain_cover: number[] = [];

  chunkloader(xmin: number, xmax: number) {
    while (xmax > this.xmax - this.cwid || xmin < this.xmin + this.cwid) {
      console.log('generating new chunk...');

      let plan: IChunk[] = [];
      if (xmax > this.xmax - this.cwid) {
        plan = design(this.mountain_cover, this.xmax, this.xmax + this.cwid);
        this.xmax = this.xmax + this.cwid;
      } else {
        plan = design(this.mountain_cover, this.xmin - this.cwid, this.xmin);
        this.xmin = this.xmin - this.cwid;
      }

      for (let i = 0; i < plan.length; i++) {
        if (plan[i].tag === 'mount') {
          this.chunks.push(
            mountain(plan[i].x, plan[i].y, i * 2 * PRNG.random())
          );
          this.chunks.push(water(plan[i].x, plan[i].y, i * 2));
        } else if (plan[i].tag === 'flatmount') {
          this.chunks.push(
            flatMount(plan[i].x, plan[i].y, 2 * PRNG.random() * Math.PI, {
              strokeWidth: 600 + PRNG.random() * 400,
              hei: 100,
              cho: 0.5 + PRNG.random() * 0.2,
            })
          );
        } else if (plan[i].tag === 'distmount') {
          this.chunks.push(
            distMount(plan[i].x, plan[i].y, PRNG.random() * 100, {
              hei: 150,
              len: randChoice([500, 1000, 1500]),
            })
          );
        } else if (plan[i].tag === 'boat') {
          this.chunks.push(
            boat01(plan[i].x, plan[i].y, PRNG.random(), {
              sca: plan[i].y / 800,
              fli: randChoice([true, false]),
            })
          );
        }
      }
    }
    this.chunks.sort((a, b) => a.y - b.y);
  }

  chunkrender(xmin: number, xmax: number) {
    const left = xmin - this.cwid;
    const right = xmax + this.cwid;
    this.canv = this.chunks
      .filter((c) => c.x >= left && c.x < right)
      .map((c) => c.render())
      .join('\n');
  }

  update(xmin: number, xmax: number) {
    this.chunkloader(xmin, xmax);
    this.chunkrender(xmin, xmax);
  }
}

const MEM: Memory = new Memory();

export { MEM };
