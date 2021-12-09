import React from 'react';
import ButtonSet from './ButtonSet';
import Menu from './Menu';
import './styles.css';

interface Props {
  seed: string;
  changeSeed: (seed: string) => void;
  step: number;
  changeStep: (step: number) => void;
  reloadWSeed: () => void;
  xscroll: (v: number) => void;
  toggleAutoScroll: (v: boolean) => void;
  scrollx: number;
}

interface State {
  menu_visible: boolean;
}

class SettingPanel extends React.Component<Props, State> {
  static id = 'SETTING';

  constructor(props: any) {
    super(props);

    this.state = {
      menu_visible: false,
    };
  }

  render() {
    const { menu_visible } = this.state;
    const toggleVisible = () => this.setState({ menu_visible: !menu_visible });

    const left = Math.max(4, 40 - this.props.scrollx);

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
        />
      </div>
    );
  }
}

export default SettingPanel;
