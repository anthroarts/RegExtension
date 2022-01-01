import { RegState } from './reg_state.js';

/**
 * Loading state
 */
export class LoadingSearchResultState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    return {
      CANCEL: 'CANCEL',
      SINGLE_RESULT_READY: 'SINGLE_RESULT_READY',
      MULTIPLE_RESULTS_READY: 'MULTIPLE_RESULTS_READY',
    };
  }

  /**
   * Initializes a new instance of the LoadingState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap, 'loadingSearchResultState');

    this.searchValueSpan = this.screenRow.querySelector('#loadingSearchText');
  }

  /**
   * Actions to perform when entering the state.
   * @param {CustomEvent} e - The event details object.
   */
  enterState(e) {
    this.show(this.screenRow);
    this.cancelButton.visible().setTransitionCallback(this, LoadingSearchResultState.events.CANCEL);
    this.printButton.invisible();

    this.searchValueSpan.innerText = e.detail.searchText;

    // Demo code!
    // Actually wait for results from commMgr instead of this lol.
    // And if there aren't any results, display an error about it.
    setTimeout(() => {
      this.dispatchTransition(LoadingSearchResultState.events.MULTIPLE_RESULTS_READY, { badgeLine1: e.detail.searchText });
    }, 1000);
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();

    // TODO: cancel any in-progress searches!
  }
}
