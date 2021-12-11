import React, { ChangeEvent } from 'react';
import { PRNG } from '../render/basic/PRNG';
import { Range } from '../render/basic/range';
import { ChunkCache } from '../render/chunkCache';
import './styles.css';

interface IProps {
  display: string;
  seed: string;
  changeSeed: (seed: string) => void;
  reloadWSeed: () => void;
  xscroll: (v: number) => void;
  toggleAutoScroll: (s: boolean, v: number) => void;
  cursx: number;
  windx: number;
  windy: number;
  chunkCache: ChunkCache;
  prng: PRNG;
}

interface IState {
  saveRange: Range;
  step: number;
}

class Menu extends React.Component<IProps, IState> {
  static id: string = 'MENU';

  constructor(props: IProps) {
    super(props);

    this.state = {
      saveRange: new Range(),
      step: 200,
    };
  }

  render() {
    const changeSeed = (event: ChangeEvent<HTMLInputElement>) =>
      this.props.changeSeed(event.target.value);
    const changeStep = (event: ChangeEvent<HTMLInputElement>) =>
      this.setState({ step: event.target.valueAsNumber });
    const xscrollLeft = () => this.props.xscroll(-1 * this.state.step);
    const xscrollRight = () => this.props.xscroll(this.state.step);
    const toggleAutoScroll = (event: ChangeEvent<HTMLInputElement>) =>
      this.props.toggleAutoScroll(event.target.checked, this.state.step);
    const downloadSvg = () => {
      this.props.chunkCache.download(
        this.props.prng,
        this.props.seed,
        this.state.saveRange,
        this.props.windy
      );
    };
    const loadCurrentRange = () => {
      this.setState({
        saveRange: new Range(
          this.props.cursx,
          this.props.cursx + this.props.windx
        ),
      });
    };
    const onChangeSaveRangeL = (event: ChangeEvent<HTMLInputElement>) =>
      this.setState({
        saveRange: new Range(
          event.target.valueAsNumber,
          this.state.saveRange.r
        ),
      });
    const onChangeSaveRangeR = (event: ChangeEvent<HTMLInputElement>) =>
      this.setState({
        saveRange: new Range(
          this.state.saveRange.l,
          event.target.valueAsNumber
        ),
      });

    return (
      <div id={Menu.id} style={{ display: this.props.display }}>
        <table>
          <tbody>
            <tr>
              <td>
                <pre>SEED</pre>
              </td>
            </tr>
            <tr>
              <td>
                <input
                  id="INP_SEED"
                  title="random seed"
                  value={this.props.seed}
                  onChange={changeSeed}
                />
                <button onClick={this.props.reloadWSeed}>Generate</button>
              </td>
            </tr>
            <tr>
              <td>
                <pre>VIEW [{this.props.cursx}, {this.props.cursx + this.props.windx}]</pre>
              </td>
            </tr>
            <tr>
              <td>
                <button title="view left" onClick={xscrollLeft}>
                  &lt;
                </button>
                <input
                  id="INC_STEP"
                  title="increment step"
                  type="number"
                  value={this.state.step}
                  min={0}
                  max={10000}
                  step={20}
                  onChange={changeStep}
                />
                <button title="view right" onClick={xscrollRight}>
                  &gt;
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <pre>
                  <input
                    id="AUTO_SCROLL"
                    type="checkbox"
                    onChange={toggleAutoScroll}
                  />
                  Auto-scroll
                </pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>SAVE</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>from</pre>
                <input
                  type="number"
                  value={this.state.saveRange.l}
                  onChange={onChangeSaveRangeL}
                />
                <pre>to</pre>
                <input
                  type="number"
                  value={this.state.saveRange.r}
                  onChange={onChangeSaveRangeR}
                />
              </td>
            </tr>
            <tr>
              <td>
                <button
                  title="load current range"
                  type="button"
                  id="loadrange-btn"
                  value="Load Range"
                  onClick={loadCurrentRange}
                >
                  Load Current Range
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  title="WARNING: This may take a while..."
                  type="button"
                  id="dwn-btn"
                  value="Download as SVG"
                  onClick={downloadSvg}
                >
                  Download as .SVG
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Menu;
