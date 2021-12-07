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
  updateflag: boolean;
}

class App extends React.Component<{}, AppState> {
  bgrender = React.createRef<BackgroundRender>();
  mem = MEM;
  lastScrollX = 0;
  pFrame = 0;

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
      updateflag: false,
    };

    PRNG.seed(this.state.seed);
  }

  componentDidMount() {
    const url = this.bgrender.current?.generate();
    this.setState({ background_image: url });
  }

  xscroll(v: number) {
    this.setState({ cursx: this.state.cursx + v });
    MEM.cursx = this.state.cursx;
    if (this.needupdate()) {
      this.setState({ updateflag: !this.state.updateflag });
    } else {
      this.viewupdate();
    }
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

  needupdate() {
    return true;
    if (MEM.xmin < MEM.cursx && MEM.cursx < MEM.xmax - MEM.windx) {
      return false;
    }
    return true;
  }

  calcViewBox() {
    const zoom = 1.142;
    return '' + MEM.cursx + ' 0 ' + MEM.windx / zoom + ' ' + MEM.windy / zoom;
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

  present() {
    var currScrollX = window.scrollX;
    var step = 1;
    document.body.scrollTo(Math.max(0, this.pFrame - 10), window.scrollY);

    this.pFrame += step;

    //console.log([lastScrollX,currScrollX]);

    if (
      this.pFrame < 20 ||
      Math.abs(this.lastScrollX - currScrollX) < step * 2
    ) {
      this.lastScrollX = currScrollX;
      const present = this.present;
      setTimeout(present, 1);
    }
  }

  reloadWSeed() {
    var u = window.location.href.split("?")[0];
    window.location.href = u + "?seed=" + this.state.seed;
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
    }

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
            updateflag={this.state.updateflag}
          />
        </div>
        <BackgroundRender ref={this.bgrender} />
      </>
    );
  }
}

export default App;
