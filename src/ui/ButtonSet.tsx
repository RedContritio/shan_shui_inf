import React from 'react';
import './styles.css';

interface IProps {
  menu_visible: boolean;
  left: number;
  onClick: () => void;
}

interface IState {
  isHover: boolean;
}

class ButtonSet extends React.Component<IProps, IState> {
  static id: string = 'SET_BTN';

  constructor(props: any) {
    super(props);
    this.state = {
      isHover: false,
    };
  }

  render() {
    const { isHover } = this.state;
    const { left } = this.props;
    const bgrColor: string = `rgba(0, 0, 0, ${isHover ? 0.1 : 0})`;
    const icon: string = this.props.menu_visible ? '✕' : '☰';
    const onMouseOver = () => this.setState({ isHover: true });
    const onMouseOut = () => this.setState({ isHover: false });
    const onClick = () => this.props.onClick();

    return (
      <div
        id={ButtonSet.id}
        style={{ backgroundColor: bgrColor, left }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        title="settings"
      >
        <div>
          <span id="SET_BTN.t" style={{ fontSize: 'large' }}>
            {' '}
            {icon}{' '}
          </span>
        </div>
      </div>
    );
  }
}

export default ButtonSet;
