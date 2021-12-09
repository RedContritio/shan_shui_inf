import { arch02, boat01 } from '../parts/arch';
import { distMount, flatMount, mountain } from '../parts/mountain';
import { mountplanner } from '../parts/mountainPlanner';
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
  cursx: number = 0;
  lasttick: number = 0;
  windx: number = 3000;
  windy: number = 800;
  planmtx: number[] = [];

  private appendChunk(nch: Chunk): void {
    if (this.chunks.length === 0) {
      this.chunks.push(nch);
      return;
    }

    if (nch.y <= this.chunks[0].y) {
      this.chunks.unshift(nch);
      return;
    }

    if (nch.y >= this.chunks[this.chunks.length - 1].y) {
      this.chunks.push(nch);
      return;
    }

    for (let j = 0; j < this.chunks.length - 1; j++) {
      if (this.chunks[j].y <= nch.y && nch.y <= this.chunks[j + 1].y) {
        this.chunks.splice(j + 1, 0, nch);
        return;
      }
    }

    console.log('EH?WTF!');
    console.log(this.chunks);
    console.log(nch);
  }

  chunkloader(xmin: number, xmax: number) {
    while (xmax > this.xmax - this.cwid || xmin < this.xmin + this.cwid) {
      console.log('generating new chunk...');

      let plan: IChunk[] = [];
      if (xmax > this.xmax - this.cwid) {
        plan = mountplanner(this.planmtx, this.xmax, this.xmax + this.cwid);
        this.xmax = this.xmax + this.cwid;
      } else {
        plan = mountplanner(this.planmtx, this.xmin - this.cwid, this.xmin);
        this.xmin = this.xmin - this.cwid;
      }

      for (let i = 0; i < plan.length; i++) {
        if (plan[i].tag === 'mount') {
          this.appendChunk(
            mountain(plan[i].x, plan[i].y, i * 2 * PRNG.random())
          );
          this.appendChunk(water(plan[i].x, plan[i].y, i * 2));
        } else if (plan[i].tag === 'flatmount') {
          this.appendChunk(
            flatMount(plan[i].x, plan[i].y, 2 * PRNG.random() * Math.PI, {
              strokeWidth: 600 + PRNG.random() * 400,
              hei: 100,
              cho: 0.5 + PRNG.random() * 0.2,
            })
          );
        } else if (plan[i].tag === 'distmount') {
          this.appendChunk(
            distMount(plan[i].x, plan[i].y, PRNG.random() * 100, {
              hei: 150,
              len: randChoice([500, 1000, 1500]),
            })
          );
        } else if (plan[i].tag === 'boat') {
          this.appendChunk(
            boat01(plan[i].x, plan[i].y, PRNG.random(), {
              sca: plan[i].y / 800,
              fli: randChoice([true, false]),
            })
          );
        }
      }
    }
  }

  chunkrender(xmin: number, xmax: number) {
    const left = xmin - this.cwid;
    const right = xmax + this.cwid;
    this.canv = this.chunks
      .filter((c) => c.x >= left && c.x < right)
      .map((c) => c.render())
      .join('\n');
  }

  update() {
    console.log(`MEM.cursx: ${MEM.cursx}`);
    this.chunkloader(MEM.cursx, MEM.cursx + MEM.windx);
    this.chunkrender(MEM.cursx, MEM.cursx + MEM.windx);
  }
}

const MEM: Memory = new Memory();

export { MEM };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dummyloader(xmin: number, xmax: number) {
  for (let i = xmin; i < xmax; i += 200) {
    //MEM.chunks.push({tag:"?",x:i,y:100,canv:Tree.tree08(i,500,i)})
    //MEM.chunks.push({tag:"?",x:i,y:100,canv:Man.man(i,500)})
    //MEM.chunks.push({tag:"?",x:i,y:100,canv:Arch.arch01(i,500)})
    //MEM.chunks.push({tag:"?",x:i,y:100,canv:Arch.boat01(i,500)})
    //MEM.chunks.push({tag:"?",x:i,y:100,canv:Arch.transmissionTower01(i,500)})
    MEM.chunks.push(
      new Chunk('?', i, 100, arch02(i, 500, 0, { sto: 1, rot: PRNG.random() }))
    );
  }
}
