import React from 'react';
import SettingPanel from './ui/SettingPanel';
import ButtonSource from './ui/ButtonSource';
import ScrollableCanvas from './ui/ScrollableCanvas';
import BackgroundRender from './ui/BackgroundRender';
import { PRNG } from './render/basic/PRNG';
import './App.css';
import { PerlinNoise } from './render/basic/perlinNoise';

interface AppState {
  seed: string;
  inc_step: number;
  auto_scroll: boolean;
  background_image: string | undefined;
  foreground_image: string;
  cursx: number;
  windx: number;
  windy: number;
  updateflag: boolean;
}

class App extends React.Component<{}, AppState> {
  bgrender = React.createRef<BackgroundRender>();
  pFrame = 0;
  prng = new PRNG();
  noise = new PerlinNoise();

  constructor(props: {}) {
    super(props);

    const urlParams = new URLSearchParams(window.location.search);
    const qseed: string | null = urlParams.get('seed');

    this.state = {
      seed: qseed == null ? new Date().getTime().toString() : qseed,
      inc_step: 200,
      auto_scroll: false,
      background_image: undefined,
      foreground_image: '',
      cursx: 0,
      windx: window.innerWidth,
      windy: window.innerHeight,
      updateflag: false,
    };

    this.prng.seed(this.state.seed);
  }

  componentDidMount() {
    const url = this.bgrender.current?.generate(this.prng, this.noise);
    this.setState({ background_image: url });
  }

  xscroll(v: number) {
    this.setState({ cursx: this.state.cursx + v });
    this.setState({ updateflag: !this.state.updateflag });

    console.log(`xscroll(${v}) => set cursx = ${this.state.cursx + v}`);
  }

  autoxcroll(v: number) {
    if (this.state.auto_scroll) {
      this.xscroll(v);
      const autoxscroll = (v: number) => this.autoxcroll(v);
      setTimeout(function () {
        autoxscroll(v);
      }, 2000);
    }
  }

  calcViewBox() {
    const zoom = 1.142;
    return (
      '' +
      this.state.cursx +
      ' 0 ' +
      this.state.windx / zoom +
      ' ' +
      this.state.windy / zoom
    );
  }

  viewupdate() {
    try {
      document
        ?.getElementById('SVG')
        ?.setAttribute('viewBox', this.calcViewBox());
    } catch (e) {
      console.log('not possible');
    }
    //setTimeout(viewupdate,100)
  }

  reloadWSeed() {
    var u = window.location.href.split('?')[0];
    window.location.href = u + '?seed=' + this.state.seed;
    //window.location.reload(true)
  }

  render() {
    const xscroll = (v: number) => this.xscroll(v);
    const reloadWSeed = () => this.reloadWSeed();
    const changeSeed = (seed: string) => this.setState({ seed });
    const changeStep = (inc_step: number) => this.setState({ inc_step });
    const toggleAutoScroll = (autoscroll: boolean) => {
      this.setState({ auto_scroll: autoscroll });
      this.autoxcroll(this.state.inc_step);
    };

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
            windy={this.state.windy}
            background={this.state.background_image}
            seed={this.state.seed}
            cursx={this.state.cursx}
            windx={this.state.windx}
            updateflag={this.state.updateflag}
            prng={this.prng}
          />
        </div>
        <BackgroundRender ref={this.bgrender} />
      </>
    );
  }
}

export default App;
