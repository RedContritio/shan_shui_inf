import React from 'react';
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
  height: number;
  background: string | undefined;
  seed: string;
  windx: number;
  foreground: string;
}

class ScrollableCanvas extends React.Component<IProps> {
  static id = 'SCROLLABLE_CANVAS';

  render() {
    const xscroll = this.props.xscroll;

    return (
      <table id={ScrollableCanvas.id}>
        <tbody>
          <tr>
            <td>
              <ScrollBar
                id="L"
                onClick={() => xscroll(-200)}
                height={this.props.height}
                icon="&#x3008;"
              />
            </td>
            <td>
              <div
                id="BG"
                style={{
                  backgroundImage: `url(${this.props.background})`,
                  width: this.props.windx,
                }}
                dangerouslySetInnerHTML={{
                  __html: this.props.foreground,
                }}
              ></div>
            </td>
            <td>
              <ScrollBar
                id="R"
                onClick={() => xscroll(-200)}
                height={this.props.height}
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
