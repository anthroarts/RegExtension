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
      CANCEL_FROM_MULTIPLE: 'CANCEL_FROM_MULTIPLE',
    };
  }

  /**
   * Initializes a new instance of the SingleResultState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);

    this.canvas = this.screenRow.querySelector('#canvas');
  }

  /**
   * Enter this state.
   * @param {CustomEvent} e - The event details object.
   */
  enterState(e) {
    this.show(this.screenRow);
    this.printButton.visible();

    if (e.detail?.fromMultiple) {
      this.cancelButton.visible()
        .setTransitionCallback(this, SingleResultState.events.CANCEL_FROM_MULTIPLE);
    } else {
      this.cancelButton.visible()
        .setTransitionCallback(this, SingleResultState.events.CANCEL);
    }

    // More demo code! This would be pulled from commMgr or the event details.
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const label = new BadgeLabelBuilder({
      line1: e.detail.badgeLine1,
      line2: 'Just an example',
      badgeId: '12345678',
      level: 'Super Sponsor',
      isMinor: false,
    });
    label.renderToImageData(this.canvas.width, this.canvas.height, this.canvas);
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();
  }
}
