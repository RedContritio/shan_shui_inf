export class PRNG {
  s: number = 1234;
  p: number = 999979;
  q: number = 999983;
  m: number = this.p * this.q;

  hash(x: any): number {
    const y = window.btoa(JSON.stringify(x));
    let z = 0;
    for (let i = 0; i < y.length; i++) {
      z += y.charCodeAt(i) * Math.pow(128, i);
    }
    return z;
  }

  seed(x: any): void {
    if (x === undefined) {
      x = new Date().getTime();
    }
    let y = 0;
    let z = 0;
    const redo = () => {
      y = (this.hash(x) + z) % this.m;
      z += 1;
    };
    while (y % this.p === 0 || y % this.q === 0 || y === 0 || y === 1) {
      redo();
    }
    this.s = y;
    console.log(`seed(${x}) = ${this.s}`);
    for (let i = 0; i < 10; i++) {
      this.next();
    }
  }

  next(): number {
    this.s = (this.s * this.s) % this.m;
    return this.s / this.m;
  }

  random(l: number = 0, r: number = 1): number {
    return this.next() * (r - l) + l;
  }

  /**
   * @returns -1 or 1
   */
  randsign(): number {
    return this.random() > 0.5 ? -1 : 1;
  }
}
