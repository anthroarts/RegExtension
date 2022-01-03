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

  #acceptResults = false;

  /**
   * Initializes a new instance of the LoadingState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap, 'loadingSearchResultState');

    this.loadingSpinners = this.screenRow.querySelector('#loadingSearchResultSpinners');
    this.searchValueSpan = this.screenRow.querySelector('#loadingSearchText');

    this.searchEmptyAlert = this.screenRow.querySelector('#loadingSearchResultEmpty');
    this.searchEmptyAlertText = this.searchEmptyAlert.querySelector('#loadingSearchTextEmpty');
  }

  /**
   * Actions to perform when entering the state.
   * @param {CustomEvent} e - Event that resulted in this state.
   */
  enterState(e) {
    this.show(this.screenRow);
    this.cancelButton.visible().setTransitionCallback(this, LoadingSearchResultState.events.CANCEL);
    this.printButton.invisible();

    this.hide(this.searchEmptyAlert);
    this.show(this.loadingSpinners);

    this.#acceptResults = true;

    const { searchText, searchPromise } = e.detail || {};

    const search = this.#santizeStringForHtml(searchText ?? '');
    this.searchValueSpan.textContent = search;
    this.searchEmptyAlertText.textContent = search;

    const promise = searchPromise ?? Promise.resolve([]);
    promise.then(this.handleResultsReady.bind(this));
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();

    // No way to cancel a promise, so let it proceed in the background and just
    // ignore it.
    this.#acceptResults = false;
  }

  /**
   * Handle the search results once they're available.
   * @param {*} results - The results of the search.
   */
  handleResultsReady(results) {
    if (!this.#acceptResults) {
      return;
    }

    if (results?.length <= 0) {
      this.hide(this.loadingSpinners);
      this.show(this.searchEmptyAlert);
      return;
    }

    if (results?.length > 1) {
      this.dispatchTransition(
        LoadingSearchResultState.events.MULTIPLE_RESULTS_READY,
        { searchResults: results },
      );
    } else {
      this.dispatchTransition(
        LoadingSearchResultState.events.SINGLE_RESULT_READY,
        { searchResult: results[0] },
      );
    }
  }

  /**
   * Sanitize a string for HTML display, such as inside a <span>.
   * @param {string} str - The string to sanitize
   * @return {string} The sanitized string
   */
  #santizeStringForHtml(str) {
    const escMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#x27;',
    };
    return str.replace(/[&<>"'/]/ig, (c) => escMap[c]);
  }
}
