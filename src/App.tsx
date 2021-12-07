import React from 'react';
import SettingPanel from './ui/SettingPanel';
import ButtonSource from './ui/ButtonSource';
import ScrollableCanvas from './ui/ScrollableCanvas';
import BackgroundRender from './ui/BackgroundRender';
import PRNG from './offscreen/basic/PRNG';
import { MEM } from './offscreen/basic/memory';
import './App.css';

interface AppState {
  seed: string;
  inc_step: number;
  auto_scroll: boolean;
  background_image: string | undefined;
  foreground_image: string;
  cursx: number;
}

class App extends React.Component<{}, AppState> {
  bgrender = React.createRef<BackgroundRender>();
  mem = MEM;

  constructor(props: {}) {
    super(props);

    this.state = {
      seed: new Date().getTime().toString(),
      inc_step: 200,
      auto_scroll: false,
      background_image: undefined,
      foreground_image: '',
      cursx: 0,
    };

    PRNG.seed(this.state.seed);
  }

  componentDidMount() {
    const url = this.bgrender.current?.generate();
    this.setState({ background_image: url });
  }

  calcViewBox() {
    var zoom = 1.142;
    return '' + MEM.cursx + ' 0 ' + MEM.windx / zoom + ' ' + MEM.windy / zoom;
  }

  updateForeground() {
    this.mem.update();

    const svg =
      "<svg id='SVG' xmlns='http://www.w3.org/2000/svg' width='" +
      MEM.windx +
      "' height='" +
      MEM.windy +
      "' style='mix-blend-mode:multiply;'" +
      "viewBox = '" +
      this.calcViewBox() +
      "'" +
      "><g id='G' transform='translate(" +
      0 +
      ",0)'>" +
      MEM.canv +
      //+ "<circle cx='0' cy='0' r='50' stroke='black' fill='red' />"
      '</g></svg>';

    this.setState({ foreground_image: svg });
  }

  render() {
    const xscroll = (v: number) => {
      this.setState({ cursx: this.state.cursx + v });
      console.log(`xscroll(${v}) => set cursx = ${this.state.cursx + v}`);
    };
    const reloadWSeed = () => alert(`not implement`);
    const changeSeed = (seed: string) => this.setState({ seed });
    const changeStep = (inc_step: number) => this.setState({ inc_step });
    const toggleAutoScroll = (autoscroll: boolean) =>
      this.setState({ auto_scroll: autoscroll });

    return (
      <>
        <div
          className="App"
          style={{
            backgroundImage: `url(${this.state.background_image})`,
          }}
        >
          <SettingPanel
            seed={this.state.seed}
            changeSeed={changeSeed}
            step={this.state.inc_step}
            changeStep={changeStep}
            reloadWSeed={reloadWSeed}
            xscroll={xscroll}
            toggleAutoScroll={toggleAutoScroll}
          />
          <ButtonSource />
          <ScrollableCanvas
            xscroll={xscroll}
            height={this.mem.windy}
            background={this.state.background_image}
            seed={this.state.seed}
            windx={this.mem.windx}
            foreground={this.mem.canv}
          />
        </div>
        <BackgroundRender ref={this.bgrender} />
      </>
    );
  }
}

export default App;
