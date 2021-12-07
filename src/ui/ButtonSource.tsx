import React from 'react';
import './styles.css';

interface IState {
  isHover: boolean;
  left: number;
}

class ButtonSource extends React.Component<{}, IState> {
  static id = 'SOURCE_BTN';

  constructor(props: any) {
    super(props);
    this.state = {
      isHover: false,
      left: 77,
    };
  }

  componentDidMount() {
    const updateLeft = (x: number) =>
      this.setState({ left: Math.max(41, 77 - x) });
    window.addEventListener('scroll', (e) => updateLeft(window.scrollX));
  }

  render() {
    const { isHover, left } = this.state;
    const bgrColor: string = `rgba(0, 0, 0, ${isHover ? 0.1 : 0})`;
    const onMouseOver = () => this.setState({ isHover: true });
    const onMouseOut = () => this.setState({ isHover: false });
    const onClick = () => alert('not implement');

    return (
      <div
        id={ButtonSource.id}
        style={{ backgroundColor: bgrColor, left }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        title="Fork me on Github!"
      >
        <div>
          <span id="SRC_BTN.t">&lt;/&gt;</span>
        </div>
      </div>
    );
  }
}

export default ButtonSource;
