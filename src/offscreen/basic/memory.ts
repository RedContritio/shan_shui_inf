import { boat01 } from '../parts/arch';
import { distMount, flatMount, mountain } from '../parts/mountain';
import { mountplanner } from '../parts/mountainPlanner';
import { water } from '../parts/water';
import { Chunk } from './chunk';
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
    if (!nch.validate()) {
      console.log(`gotcha: ${nch.tag}`);
    }

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

      let plan: Chunk[] = [];
      if (xmax > this.xmax - this.cwid) {
        plan = mountplanner(this.xmax, this.xmax + this.cwid);
        this.xmax = this.xmax + this.cwid;
      } else {
        plan = mountplanner(this.xmin - this.cwid, this.xmin);
        this.xmin = this.xmin - this.cwid;
      }

      for (let i = 0; i < plan.length; i++) {
        if (plan[i].tag == 'mount') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              mountain(plan[i].x, plan[i].y, i * 2 * Math.random())
              //{col:function(x){return "rgba(100,100,100,"+(0.5*Math.random()*plan[i].y/this.windy)+")"}}),
            )
          );
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y - 10000,
              water(plan[i].x, plan[i].y, i * 2)
            )
          );
        } else if (plan[i].tag == 'flatmount') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              flatMount(plan[i].x, plan[i].y, 2 * Math.random() * Math.PI, {
                wid: 600 + Math.random() * 400,
                hei: 100,
                cho: 0.5 + Math.random() * 0.2,
              })
            )
          );
        } else if (plan[i].tag == 'distmount') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              distMount(plan[i].x, plan[i].y, Math.random() * 100, {
                hei: 150,
                len: randChoice([500, 1000, 1500]),
              })
            )
          );
        } else if (plan[i].tag == 'boat') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              boat01(plan[i].x, plan[i].y, Math.random(), {
                sca: plan[i].y / 800,
                fli: randChoice([true, false]),
              })
            )
          );
        } else if (plan[i].tag == 'redcirc') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              "<circle cx='" +
                plan[i].x +
                "' cy='" +
                plan[i].y +
                "' r='20' stroke='black' fill='red' />"
            )
          );
        } else if (plan[i].tag == 'greencirc') {
          this.appendChunk(
            new Chunk(
              plan[i].tag,
              plan[i].x,
              plan[i].y,
              "<circle cx='" +
                plan[i].x +
                "' cy='" +
                plan[i].y +
                "' r='20' stroke='black' fill='green' />"
            )
          );
        }
      }
    }
  }

  chunkrender(xmin: number, xmax: number) {
    this.canv = '';

    for (var i = 0; i < this.chunks.length; i++) {
      if (
        xmin - this.cwid < this.chunks[i].x &&
        this.chunks[i].x < xmax + this.cwid
      ) {
        this.canv += this.chunks[i].canv;
      }
    }
  }

  update() {
    this.chunkloader(MEM.cursx, MEM.cursx + MEM.windx);
    this.chunkrender(MEM.cursx, MEM.cursx + MEM.windx);
  }
}

const MEM: Memory = new Memory();

export { MEM };
