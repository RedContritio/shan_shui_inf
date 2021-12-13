import { Chunk, IChunk } from '../render/basic/chunk';
import { design } from '../render/basic/designer';
import { PRNG } from '../render/basic/PRNG';
import { Range } from '../render/basic/range';
import { randChoice } from '../render/basic/utils';
import { boat01 } from '../render/parts/arch';
import { distMount, flatMount, mountain } from '../render/parts/mountain';
import { water } from '../render/parts/water';

export class ChunkCache {
  chunks: Chunk[] = [];
  orange: Range = new Range();
  mountain_cover: number[] = [];

  update(prng: PRNG, nrange: Range, cwid: number = 512): void {
    if (nrange.r > this.orange.r - cwid || nrange.l < this.orange.l + cwid) {
      while (
        nrange.r > this.orange.r - cwid ||
        nrange.l < this.orange.l + cwid
      ) {
        console.log(`generating new chunk... ${nrange.l}, ${nrange.r}`);

        let plan: IChunk[] = [];
        if (nrange.r > this.orange.r - cwid) {
          plan = design(
            prng,
            this.mountain_cover,
            this.orange.r,
            this.orange.r + cwid
          );
          this.orange.r = this.orange.r + cwid;
        } else {
          plan = design(
            prng,
            this.mountain_cover,
            this.orange.l - cwid,
            this.orange.l
          );
          this.orange.l = this.orange.l - cwid;
        }

        for (let i = 0; i < plan.length; i++) {
          if (plan[i].tag === 'mount') {
            this.chunks.push(
              mountain(prng, plan[i].x, plan[i].y, prng.random(0, 2 * i))
            );
            this.chunks.push(water(prng, plan[i].x, plan[i].y, i * 2));
          } else if (plan[i].tag === 'flatmount') {
            this.chunks.push(
              flatMount(
                prng,
                plan[i].x,
                plan[i].y,
                prng.random(0, 2 * Math.PI),
                100,
                prng.random(0.5, 0.7),
                prng.random(600, 1000)
              )
            );
          } else if (plan[i].tag === 'distmount') {
            this.chunks.push(
              distMount(
                prng,
                plan[i].x,
                plan[i].y,
                prng.random(0, 100),
                150,
                randChoice(prng, [500, 1000, 1500])
              )
            );
          } else if (plan[i].tag === 'boat') {
            this.chunks.push(
              boat01(
                prng,
                plan[i].x,
                plan[i].y,
                prng.random(),
                plan[i].y / 800,
                randChoice(prng, [true, false])
              )
            );
          }
        }
      }
      this.chunks.sort((a, b) => a.y - b.y);
    }
  }

  download(prng: PRNG, seed: string, r: Range, windy: number, cwid: number = 512): void {
    const filename: string = `${seed}-[${r.l}, ${r.r}].svg`;
    const windx: number = r.r - r.l;
    const zoom: number = 1.142;
    const viewbox = `${r.l} 0 ${windx / zoom} ${windy / zoom}`;

    this.update(prng, r);

    const left = r.l - cwid;
    const right = r.r + cwid;

    const content: string = `<svg id="SVG" xmlns="http://www.w3.org/2000/svg" width="${
      r.r - r.l
    }" height="${windy}" style="mix-blend-mode: 'multiply'" viewBox="${viewbox}">${this.chunks
      .filter((c) => c.x >= left && c.x < right)
      .map((c) => `<g transform="translate(0, 0)">${c.render()}</g>`)
      .join('\n')} </svg>`;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
