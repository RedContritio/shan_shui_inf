import React from 'react';
import { PRNG } from '../render/basic/PRNG';
import { Range } from '../render/basic/range';
import { ChunkCache } from '../render/chunkCache';
import ButtonSet from './ButtonSet';
import ButtonSource from './ButtonSource';
import Menu from './Menu';
import './styles.css';

interface IProps {
  seed: string;
  changeSeed: (seed: string) => void;
  reloadWSeed: () => void;
  xscroll: (v: number) => void;
  toggleAutoScroll: (s: boolean, v: number) => void;
  cursx: number;
  chunkCache: ChunkCache;
  windx: number;
  windy: number;
  prng: PRNG;
  saveRange: Range;
  onChangeSaveRange: (r: Range) => void;
  toggleAutoLoad: (s: boolean) => void;
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
        <div id="BTN_ROW">
          <ButtonSet
            onClick={toggleVisible}
            menu_visible={this.state.menu_visible}
            left={left}
          />
          <ButtonSource />
        </div>
        <div style={{ height: 4 }} />
        <Menu
          display={menu_visible ? 'block' : 'none'}
          seed={this.props.seed}
          changeSeed={this.props.changeSeed}
          reloadWSeed={this.props.reloadWSeed}
          xscroll={this.props.xscroll}
          toggleAutoScroll={this.props.toggleAutoScroll}
          cursx={this.props.cursx}
          chunkCache={this.props.chunkCache}
          windx={this.props.windx}
          windy={this.props.windy}
          prng={this.props.prng}
          saveRange={this.props.saveRange}
          onChangeSaveRange={this.props.onChangeSaveRange}
          toggleAutoLoad={this.props.toggleAutoLoad}
        />
      </div>
    );
  }
}

export default SettingPanel;
