import React from 'react';
import SettingPanel from './ui/SettingPanel';
import ScrollableCanvas from './ui/ScrollableCanvas';
import BackgroundRender from './ui/BackgroundRender';
import { PRNG } from './render/basic/PRNG';
import { Range } from './render/basic/range';
import { PerlinNoise } from './render/basic/perlinNoise';
import { ChunkCache } from './render/chunkCache';
import './App.css';

interface AppState {
  seed: string;
  auto_scroll: boolean;
  background_image: string | undefined;
  foreground_image: string;
  cursx: number;
  windx: number;
  windy: number;
  updateflag: boolean;
  saveRange: Range;
  autoLoad: boolean;
}

class App extends React.Component<{}, AppState> {
  bgrender = React.createRef<BackgroundRender>();
  pFrame = 0;
  prng = new PRNG();
  noise = new PerlinNoise();
  chunkCache = new ChunkCache();
  static readonly FPS = 2;

  constructor(props: {}) {
    super(props);

    const urlParams = new URLSearchParams(window.location.search);
    const qseed: string | null = urlParams.get('seed');

    this.state = {
      seed: qseed == null ? new Date().getTime().toString() : qseed,
      auto_scroll: false,
      background_image: undefined,
      foreground_image: '',
      cursx: 0,
      windx: window.innerWidth,
      windy: window.innerHeight,
      updateflag: false,
      saveRange: new Range(0, window.innerWidth),
      autoLoad: false,
    };

    this.prng.seed(this.state.seed);
  }

  componentDidMount() {
    const url = this.bgrender.current?.generate(this.prng, this.noise);
    this.setState({ background_image: url });

    const resizeCallback = () =>
      this.setState({ windx: window.innerWidth, windy: window.innerHeight });
    window.addEventListener('resize', resizeCallback);
  }

  xscroll(v: number) {
    const nextx = this.state.cursx + v;

    this.setState({ cursx: nextx });
    this.setState({ updateflag: !this.state.updateflag });

    if (this.state.autoLoad)
      this.setState({
        saveRange: new Range(nextx, nextx + this.state.windx),
      });

    console.log(`xscroll(${v}) => set cursx = ${nextx}`);
    console.log(`cursx = ${this.state.cursx}`);
  }

  autoxcroll(v: number) {
    if (this.state.auto_scroll) {
      this.xscroll(v / App.FPS);
      const autoxscroll = (v: number) => this.autoxcroll(v);
      setTimeout(function () {
        autoxscroll(v);
      }, 1000 / App.FPS);
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
    const onChangeSaveRange = (saveRange: Range) =>
      this.setState({ saveRange });
    const toggleAutoScroll = (autoscroll: boolean, step: number) =>
      this.setState({ auto_scroll: autoscroll }, () => {
        this.autoxcroll(step);
      });
    const toggleAutoLoad = (autoLoad: boolean) => {
      this.setState({
        autoLoad,
        saveRange: new Range(
          this.state.cursx,
          this.state.cursx + this.state.windx
        ),
      });
    };

    return (
      <>
        <div className="App">
          <SettingPanel
            seed={this.state.seed}
            changeSeed={changeSeed}
            reloadWSeed={reloadWSeed}
            xscroll={xscroll}
            toggleAutoScroll={toggleAutoScroll}
            cursx={this.state.cursx}
            chunkCache={this.chunkCache}
            windx={this.state.windx}
            windy={this.state.windy}
            prng={this.prng}
            saveRange={this.state.saveRange}
            onChangeSaveRange={onChangeSaveRange}
            toggleAutoLoad={toggleAutoLoad}
          />
          <ScrollableCanvas
            xscroll={xscroll}
            windy={this.state.windy}
            background={this.state.background_image}
            seed={this.state.seed}
            cursx={this.state.cursx}
            windx={this.state.windx}
            updateflag={this.state.updateflag}
            prng={this.prng}
            chunkCache={this.chunkCache}
          />
        </div>
        <BackgroundRender ref={this.bgrender} />
      </>
    );
  }
}

export default App;
