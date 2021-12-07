import React from 'react';
import { Noise } from '../offscreen/basic/perlinNoise';

interface IProps {}

class BackgroundRender extends React.Component<IProps> {
  canvasRef = React.createRef<HTMLCanvasElement>();

  generate(): string | undefined {
    const ctx = this.canvasRef.current?.getContext('2d');
    if (ctx === null || ctx === undefined) {
      return undefined;
    }
    const resolution = 512;

    for (let i = 0; i < resolution / 2 + 1; i++) {
      for (let j = 0; j < resolution / 2 + 1; j++) {
        let c = 245 + Noise.noise(i * 0.1, j * 0.1) * 10;
        c -= Math.random() * 20;

        const r = c.toFixed(0);
        const g = (c * 0.95).toFixed(0);
        const b = (c * 0.85).toFixed(0);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i, j, 1, 1);
        ctx.fillRect(resolution - i, j, 1, 1);
        ctx.fillRect(i, resolution - j, 1, 1);
        ctx.fillRect(resolution - i, resolution - j, 1, 1);
      }
    }
    return this.canvasRef.current?.toDataURL('image/png');
  }

  render() {
    return (
      <canvas
        id="bgcanv"
        ref={this.canvasRef}
        width="512"
        height="512"
        hidden
      />
    );
  }
}

export default BackgroundRender;
