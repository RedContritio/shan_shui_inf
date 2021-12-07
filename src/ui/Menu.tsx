import React, { ChangeEvent } from 'react';
import './styles.css';

interface MenuProps {
  display: string;
  seed: string;
  changeSeed: (seed: string) => void;
  step: number;
  changeStep: (step: number) => void;
  reloadWSeed: () => void;
  xscroll: (v: number) => void;
  toggleAutoScroll: (v: boolean) => void;
}

class Menu extends React.Component<MenuProps> {
  static id: string = 'MENU';

  render() {
    const changeSeed = (event: ChangeEvent<HTMLInputElement>) =>
      this.props.changeSeed(event.target.value);
    const changeStep = (event: ChangeEvent<HTMLInputElement>) =>
      this.props.changeStep(event.target.valueAsNumber);
    const xscrollLeft = () => this.props.xscroll(-1 * this.props.step);
    const xscrollRight = () => this.props.xscroll(this.props.step);
    const toggleAutoScroll = (event: ChangeEvent<HTMLInputElement>) =>
      this.props.toggleAutoScroll(event.target.checked);

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
                <pre>VIEW</pre>
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
                  value={this.props.step}
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
          </tbody>
        </table>
      </div>
    );
  }
}

export default Menu;
