import { RegState } from './reg_state.js';

import { BadgeLabelBuilder } from '../label_builder.js';

/**
 * Loading state
 */
export class SingleResultState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    return {
      CANCEL: 'CANCEL',
    };
  }

  /**
   * Initializes a new instance of the SingleResultState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.leftButton.show().setTransitionCallback(this, SingleResultState.events.CANCEL);
    this.rightButton.show();

    // More demo code! This would be pulled from commMgr or the event details.
    this.centerField.innerHTML = this.#getCenterTemplate();
    const canvas = this.centerField.querySelector('canvas');
    const label = new BadgeLabelBuilder({
      line1: 'EXAMPLE',
      line2: 'Just an example',
      badgeId: '12345678',
      level: 'Super Sponsor',
      isMinor: false,
    });
    label.renderToImageData(canvas.width, canvas.height, canvas);
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.leftButton.clearTransitionCallback();
  }

  /**
   * Get the center field template.
   * @return {string} - innerHTML for the centerField.
   */
  #getCenterTemplate() {
    return `
<div id="searchResults" class="row">
  <!-- Demonstration canvas, actual layout will be different. -->
  <canvas id="canvas" width="589" height="193" style="background-color: white; width: 589px; height: 193px; padding: 0;"></canvas>
</div>`;
  }
}
