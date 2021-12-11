import React from 'react';
import ButtonSet from './ButtonSet';
import Menu from './Menu';
import './styles.css';

interface IProps {
  seed: string;
  changeSeed: (seed: string) => void;
  step: number;
  changeStep: (step: number) => void;
  reloadWSeed: () => void;
  xscroll: (v: number) => void;
  toggleAutoScroll: (v: boolean) => void;
  cursx: number;
}

interface State {
  menu_visible: boolean;
}

class SettingPanel extends React.Component<IProps, State> {
  static id = 'SETTING';

  constructor(props: IProps) {
    super(props);

    this.state = {
      menu_visible: false,
    };
  }

  render() {
    const { menu_visible } = this.state;
    const toggleVisible = () => this.setState({ menu_visible: !menu_visible });

    const left = 40;

    return (
      <div id={SettingPanel.id} style={{ left }}>
        <ButtonSet
          onClick={toggleVisible}
          menu_visible={this.state.menu_visible}
          left={left}
        />
        <div style={{ height: 4 }} />
        <Menu
          display={menu_visible ? 'block' : 'none'}
          seed={this.props.seed}
          changeSeed={this.props.changeSeed}
          step={this.props.step}
          changeStep={this.props.changeStep}
          reloadWSeed={this.props.reloadWSeed}
          xscroll={this.props.xscroll}
          toggleAutoScroll={this.props.toggleAutoScroll}
          cursx={this.props.cursx}
        />
      </div>
    );
  }
}

export default SettingPanel;
