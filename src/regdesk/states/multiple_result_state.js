import { RegState } from './reg_state.js';

/**
 * Multiple result state
 */
export class MultipleResultState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    return {
      CANCEL: 'CANCEL',
      SELECTED_SINGLE_RESULT: 'SELECTED_SINGLE_RESULT',
    };
  }

  /**
   * Initializes a new instance of the MultipleResultState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);

    this.button1 = this.screenRow.querySelector('#multipleResultExampleOne');
    this.button1.addEventListener('click', () => {
      this.dispatchTransition(
        MultipleResultState.events.SELECTED_SINGLE_RESULT,
        { badgeLine1: 'ASDF', fromMultiple: true });
    });
    this.button2 = this.screenRow.querySelector('#multipleResultExampleTwo');
    this.button2.addEventListener('click', () => {
      this.dispatchTransition(
        MultipleResultState.events.SELECTED_SINGLE_RESULT,
        { badgeLine1: 'FDSA', fromMultiple: true });
    });
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.show(this.screenRow);
    this.cancelButton.visible().setTransitionCallback(this, MultipleResultState.events.CANCEL);
    this.printButton.visible();
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();
  }
}
