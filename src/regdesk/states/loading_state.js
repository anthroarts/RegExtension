import { RegState } from './reg_state.js';

/**
 * Loading state
 */
export class LoadingState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    return {
      CANCEL: 'CANCEL',
      SINGLE_RESULT_READY: 'SINGLE_RESULT_READY',
      MULTIPLE_RESULTS_READY: 'MULTIPLE_RESULTS_READY',
      NO_RESULT_READY: 'NO_RESULT_READY',
    };
  }

  /**
   * Initializes a new instance of the LoadingState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);
  }

  /**
   * Actions to perform when entering the state.
   * @param {CustomEvent} e - The event details object.
   */
  enterState(e) {
    this.leftButton.show().setTransitionCallback(this, LoadingState.events.CANCEL);
    this.rightButton.hide();

    // Demo code!
    this.centerField.innerText = `Searching for ${e.detail.searchText}`;

    // Actually wait for results from commMgr instead of this lol.
    setTimeout(() => {
      this.dispatchTransition(LoadingState.events.SINGLE_RESULT_READY);
    }, 1000);
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.leftButton.clearTransitionCallback();
  }
}
