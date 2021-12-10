// Modified from https://raw.githubusercontent.com/processing/p5.js/master/src/math/noise.js
import { PRNG } from './PRNG';

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;
const PERLIN_OCTAVES = 4;
const PERLIN_AMP_FALLOFF = 0.5;

function scaled_cosine(i: number): number {
  return 0.5 * (1.0 - Math.cos(i * Math.PI));
}

const lcg = {
  m: 4294967296,
  a: 1664525,
  c: 1013904223,
  seed: -1,
  z: -1,
  setSeed(prng: PRNG, val: number): void {
    // make seed unsigned
    this.z = this.seed = (val == null ? prng.random() * this.m : val) >>> 0;
  },
  getSeed: function (): number {
    return this.seed;
  },
  rand: function (): number {
    this.z = (this.a * this.z + this.c) % this.m;
    return this.z / this.m;
  },
};

export class PerlinNoise {
  perlin: number[] | undefined;

  noise(prng: PRNG, x: number, y: number = 0, z: number = 0): number {
    if (this.perlin === undefined) {
      this.perlin = new Array(PERLIN_SIZE + 1);
      for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        this.perlin[i] = prng.random();
      }
    }

    x = Math.abs(x);
    y = Math.abs(y);
    z = Math.abs(z);
    let xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let r = 0;
    let ampl = 0.5;

    for (let o = 0; o < PERLIN_OCTAVES; o++) {
      let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
      const rxf = scaled_cosine(xf);
      const ryf = scaled_cosine(yf);
      let n1 = this.perlin[of & PERLIN_SIZE];
      n1 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n1);
      let n2 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n2 += rxf * (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);
      of += PERLIN_ZWRAP;
      n2 = this.perlin[of & PERLIN_SIZE];
      n2 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n2);
      let n3 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n3 += rxf * (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);
      n1 += scaled_cosine(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= PERLIN_AMP_FALLOFF;
      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;
      if (xf >= 1.0) {
        xi++;
        xf--;
      }
      if (yf >= 1.0) {
        yi++;
        yf--;
      }
      if (zf >= 1.0) {
        zi++;
        zf--;
      }
    }
    return r;
  }

  seed(prng: PRNG, seed: number): void {
    lcg.setSeed(prng, seed);
    this.perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      this.perlin[i] = lcg.rand();
    }
  }
}

const Noise = new PerlinNoise();

export { Noise };
