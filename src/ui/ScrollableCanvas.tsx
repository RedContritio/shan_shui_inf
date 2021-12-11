import React from 'react';
import { PRNG } from '../render/basic/PRNG';
import { Range } from '../render/basic/range';
import { ChunkCache } from '../render/chunkCache';
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
  chunkCache: ChunkCache;
}

interface IState {}

class ScrollableCanvas extends React.Component<IProps, IState> {
  static id = 'SCROLLABLE_CANVAS';
  cwid: number = 512;
  canv: string = '';
  zoom: number = 1.142;

  render() {
    const { prng, chunkCache } = this.props;

    const xscroll = this.props.xscroll;
    const viewbox = `${this.props.cursx} 0 ${this.props.windx / this.zoom} ${
      this.props.windy / this.zoom
    }`;
    const nr = new Range(this.props.cursx, this.props.cursx + this.props.windx);
    chunkCache.update(prng, nr, this.cwid);

    const left = nr.l - this.cwid;
    const right = nr.r + this.cwid;

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
                <svg
                  id="SVG"
                  xmlns="http://www.w3.org/2000/svg"
                  width={this.props.windx}
                  height={this.props.windy}
                  style={{ mixBlendMode: 'multiply' }}
                  viewBox={viewbox}
                >
                  {chunkCache.chunks
                    .filter((c) => c.x >= left && c.x < right)
                    .map((c) => (
                      <g
                        key={`${c.tag} ${c.x} ${c.y}`}
                        transform="translate(0, 0)"
                        dangerouslySetInnerHTML={{ __html: c.render() }}
                      ></g>
                    ))}
                </svg>
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
