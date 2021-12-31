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
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.leftButton.hide();
    this.rightButton.hide();

    this.centerField.innerHTML = this.#getCenterTemplate();
    this.centerField.querySelector('#newSearchText').focus();

    // Search isn't wired up right now so instead we'll just transition
    // to the loading screen.
    this.centerField.querySelector('#newSearchButton')
      .addEventListener('click', (e) => {
        // Just to demonstrate the setup, this would talk to the commMgr
        // and actually run the search.
        // TODO: Should the event objects be strongly typed? Correlated somehow?
        const searchText = this.centerField.querySelector('#newSearchText').value;
        this.dispatchTransition(NewSearchState.events.START_SEARCH, { searchText: searchText });
      });
  }

  /**
   *
   * @return {string} - The center html elements.
   */
  #getCenterTemplate() {
    return `
<form class="row g-3" id="newSearchForm">
  <div class="col-md-9">
    <label for="newSearchText" class="form-label">Legal Name or Scan Barcode</label>
    <input class="form-control form-control-lg" id="newSearchText" type="text" />
  </div>
  <div class="col-md-3 d-grid">
    <button type="button" class="btn btn-primary btn-lg" id="newSearchButton">Search🔎</button>
  </div>
</form>`;
  }
}
