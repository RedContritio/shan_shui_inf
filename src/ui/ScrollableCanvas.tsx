import React from 'react';
import { MEM } from '../render/basic/memory';
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
}

class ScrollableCanvas extends React.Component<IProps> {
  static id = 'SCROLLABLE_CANVAS';

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

  render() {
    const xscroll = this.props.xscroll;
    const viewbox = this.calcViewBox();
    console.log('ScrollableCanvas render');
    MEM.update(this.props.cursx, this.props.windx);
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
          dangerouslySetInnerHTML={{ __html: MEM.canv }}
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
