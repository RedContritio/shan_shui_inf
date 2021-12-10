import React from 'react';
import { Chunk, IChunk } from '../render/basic/chunk';
import { design } from '../render/basic/designer';
import { PRNG } from '../render/basic/PRNG';
import { Range } from '../render/basic/range';
import { randChoice } from '../render/basic/utils';
import { boat01 } from '../render/parts/arch';
import { distMount, flatMount, mountain } from '../render/parts/mountain';
import { water } from '../render/parts/water';
import './styles.css';

interface IBarProps {
  id: string;
  height: number;
  onClick: () => void;
  icon: string;
}

interface IBarState {
  isHover: boolean;
}

class ScrollBar extends React.Component<IBarProps, IBarState> {
  constructor(props: IBarProps) {
    super(props);
    this.state = {
      isHover: false,
    };
  }

  render() {
    const onMouseOver = () => this.setState({ isHover: true });
    const onMouseOut = () => this.setState({ isHover: false });
    const bgrColor = this.state.isHover ? 0.1 : 0;

    return (
      <div
        id={this.props.id}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={this.props.onClick}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${bgrColor})`,
          height: this.props.height,
        }}
      >
        <div id={`${this.props.id}.t`}>
          <span>{this.props.icon}</span>
        </div>
      </div>
    );
  }
}

interface IProps {
  xscroll: (v: number) => void;
  windy: number;
  background: string | undefined;
  seed: string;
  cursx: number;
  windx: number;
  updateflag: boolean;
  prng: PRNG;
}

interface IState {}

class ScrollableCanvas extends React.Component<IProps, IState> {
  static id = 'SCROLLABLE_CANVAS';
  cwid: number = 512;
  oldrange: Range = new Range();
  chunks: Chunk[] = [];
  mountain_cover: number[] = [];
  canv: string = '';

  calcViewBox() {
    const zoom = 1.142;
    return (
      '' +
      this.props.cursx +
      ' 0 ' +
      this.props.windx / zoom +
      ' ' +
      this.props.windy / zoom
    );
  }

  update(_or: Range, prng: PRNG, nr: Range, cwid: number) {
    const or = new Range(_or.l, _or.r);
    if (nr.r > or.r - cwid || nr.l < or.l + cwid) {
      while (nr.r > or.r - cwid || nr.l < or.l + cwid) {
        console.log(`generating new chunk... ${nr.l}, ${nr.r}`);

        let plan: IChunk[] = [];
        if (nr.r > or.r - cwid) {
          plan = design(prng, this.mountain_cover, or.r, or.r + cwid);
          or.r = or.r + cwid;
        } else {
          plan = design(prng, this.mountain_cover, or.l - cwid, or.l);
          or.l = or.l - cwid;
        }

        for (let i = 0; i < plan.length; i++) {
          if (plan[i].tag === 'mount') {
            this.chunks.push(
              mountain(prng, plan[i].x, plan[i].y, i * 2 * prng.random())
            );
            this.chunks.push(water(prng, plan[i].x, plan[i].y, i * 2));
          } else if (plan[i].tag === 'flatmount') {
            this.chunks.push(
              flatMount(
                prng,
                plan[i].x,
                plan[i].y,
                2 * prng.random() * Math.PI,
                {
                  strokeWidth: 600 + prng.random() * 400,
                  hei: 100,
                  cho: 0.5 + prng.random() * 0.2,
                }
              )
            );
          } else if (plan[i].tag === 'distmount') {
            this.chunks.push(
              distMount(prng, plan[i].x, plan[i].y, prng.random() * 100, {
                hei: 150,
                len: randChoice(prng, [500, 1000, 1500]),
              })
            );
          } else if (plan[i].tag === 'boat') {
            this.chunks.push(
              boat01(prng, plan[i].x, plan[i].y, prng.random(), {
                sca: plan[i].y / 800,
                fli: randChoice(prng, [true, false]),
              })
            );
          }
        }
      }
      this.chunks.sort((a, b) => a.y - b.y);

      const left = nr.l - cwid;
      const right = nr.r + cwid;

      this.canv = this.chunks
        .filter((c) => c.x >= left && c.x < right)
        .map((c) => c.render())
        .join('\n');
    }

    return or;
  }

  render() {
    const xscroll = this.props.xscroll;
    const viewbox = this.calcViewBox();
    const nr = new Range(this.props.cursx, this.props.windx);
    this.oldrange = this.update(this.oldrange, this.props.prng, nr, this.cwid);

    const canv = this.canv;

    const foreground = (
      <svg
        id="SVG"
        xmlns="http://www.w3.org/2000/svg"
        width={this.props.windx}
        height={this.props.windy}
        style={{ mixBlendMode: 'multiply' }}
        viewBox={viewbox}
      >
        <g
          id="G"
          transform="translate(0, 0)"
          dangerouslySetInnerHTML={{ __html: canv }}
        />
      </svg>
    );

    return (
      <table id={ScrollableCanvas.id}>
        <tbody>
          <tr>
            <td>
              <ScrollBar
                id="L"
                onClick={() => xscroll(-200)}
                height={this.props.windy - 8}
                icon="&#x3008;"
              />
            </td>
            <td>
              <div
                id="BG"
                style={{
                  backgroundImage: `url(${this.props.background})`,
                  width: this.props.windx,
                  height: this.props.windy,
                  left: 0,
                  position: 'fixed',
                  top: 0,
                }}
              >
                {foreground}
              </div>
            </td>
            <td>
              <ScrollBar
                id="R"
                onClick={() => xscroll(200)}
                height={this.props.windy - 8}
                icon="&#x3009;"
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default ScrollableCanvas;
