// Modified from https://raw.githubusercontent.com/processing/p5.js/master/src/math/noise.js
import PRNG from './PRNG';

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;
let perlin_octaves = 4;
let perlin_amp_falloff = 0.5;

function scaled_cosine(i: number): number {
  return 0.5 * (1.0 - Math.cos(i * Math.PI));
}

let perlin: Array<number> | null = null;

export function noise(x: number, y: number = 0, z: number = 0) {
  if (perlin == null) {
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = PRNG.random();
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
  //   const rxf, ryf;
  let r = 0;
  let ampl = 0.5;
  //   const n1, n2, n3;
  for (let o = 0; o < perlin_octaves; o++) {
    let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
    const rxf = scaled_cosine(xf);
    const ryf = scaled_cosine(yf);
    let n1 = perlin[of & PERLIN_SIZE];
    n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
    let n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
    n1 += ryf * (n2 - n1);
    of += PERLIN_ZWRAP;
    n2 = perlin[of & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
    let n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
    n2 += ryf * (n3 - n2);
    n1 += scaled_cosine(zf) * (n2 - n1);
    r += n1 * ampl;
    ampl *= perlin_amp_falloff;
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

export function noiseDetail(lod: number, falloff: number) {
  if (lod > 0) {
    perlin_octaves = lod;
  }
  if (falloff > 0) {
    perlin_amp_falloff = falloff;
  }
}

const lcg = {
  m: 4294967296,
  a: 1664525,
  c: 1013904223,
  seed: -1,
  z: -1,
  setSeed(val: number): void {
    this.z = this.seed = (val == null ? PRNG.random() * this.m : val) >>> 0;
  },
  getSeed: function (): number {
    return this.seed;
  },
  rand: function (): number {
    this.z = (this.a * this.z + this.c) % this.m;
    return this.z / this.m;
  },
};

export function noiseSeed(seed: number) {
  lcg.setSeed(seed);
  perlin = new Array(PERLIN_SIZE + 1);
  for (let i = 0; i < PERLIN_SIZE + 1; i++) {
    perlin[i] = lcg.rand();
  }
}

export const Noise = {
  noise,
  noiseDetail,
  noiseSeed,
};
