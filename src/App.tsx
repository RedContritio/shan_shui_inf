import React from "react";
import SettingPanel from "./ui/SettingPanel";
import ButtonSource from "./ui/ButtonSource";
import ScrollableCanvas from "./ui/ScrollableCanvas";
import BackgroundRender from "./ui/BackgroundRender";
import PRNG from "./offscreen/basic/PRNG";
import { MEM } from "./offscreen/basic/memory";
import "./App.css";

interface AppState {
  seed: string;
  inc_step: number;
  auto_scroll: boolean;
  image_url: string | undefined;
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
      image_url: undefined,
      cursx: 0,
    };

    PRNG.seed(this.state.seed);
  }

  componentDidMount() {
    const url = this.bgrender.current?.generate();
    this.setState({ image_url: url });
  }

  render() {
    const reloadWSeed = () => alert(`not implement`);
    const xscroll = (v: number) => {
      this.setState({ cursx: this.state.cursx + v});
    }
    const changeSeed = (seed: string) => this.setState({ seed });
    const changeStep = (inc_step: number) => this.setState({ inc_step });
    const toggleAutoScroll = (autoscroll: boolean) =>
      this.setState({ auto_scroll: autoscroll });

    return (
      <>
        <div
          className="App"
          style={{ backgroundImage: `url(${this.state.image_url})` }}
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
            url={this.state.image_url}
            seed={this.state.seed}
            windx={this.mem.windx}
          />
        </div>
        <BackgroundRender ref={this.bgrender} />
      </>
    );
  }
}

export default App;
