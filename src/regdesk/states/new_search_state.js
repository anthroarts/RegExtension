import { RegState } from './reg_state.js';

/**
 * New Search state
 */
export class NewSearchState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    // TODO: This is apparently how TS does enums, make it an enum someday?
    return {
      START_SEARCH: 'START_SEARCH',
      RESET: 'RESET',
    };
  }

  /**
   * Initializes a new instance of the NewSearch class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);

    this.searchForm = this.screenRow.querySelector('#newSearchForm');
    this.searchInput = this.screenRow.querySelector('#newSearchText');

    // TODO: Figure out how to auto-trigger a search when a barcode is scanned.

    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Just to demonstrate the setup, this would talk to the commMgr
      // and actually run the search.
      // TODO: Should the event objects be strongly typed? Correlated somehow?
      const searchText = this.searchInput.value;
      this.dispatchTransition(NewSearchState.events.START_SEARCH, { searchText: searchText });
    });
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.show(this.screenRow)
    this.cancelButton.invisible();
    this.printButton.invisible();
    this.searchInput.focus();
  }

  /**
   * Exit this state
   */
  exitState() {
    this.hide(this.screenRow);
  }
}
