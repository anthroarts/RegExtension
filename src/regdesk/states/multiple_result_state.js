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

    this.template = this.screenRow.querySelector('#multipleResultTemplate');
    this.listContainer = this.screenRow.querySelector('ol');
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.show(this.screenRow);
    this.cancelButton.visible().setTransitionCallback(this, MultipleResultState.events.CANCEL);
    this.printButton.invisible();

    this.listContainer.innerHTML = '';

    this.commManager.regSearchResults.forEach((reg, index) => {
      const clone = this.template.content.firstElementChild.cloneNode(true);
      clone.querySelector('input[name=preferredName]').value = reg.preferredName;
      clone.querySelector('input[name=legalName]').value = reg.legalName;
      clone.querySelector('input[name=dob]').value = reg.birthdate;
      const age = this.#getAge(reg.birthdate);
      clone.querySelector('span[name=age]').textContent = age;
      clone.querySelector('input[name=resultId]').value = index;
      clone.querySelector('form')
        .addEventListener('submit', this.handleRegSelection.bind(this));

      this.listContainer.appendChild(clone);
    });
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();
  }

  /**
   * Handle the registration selection
   * @param {Event} e - The submit event object
   */
  handleRegSelection(e) {
    e.preventDefault();

    const regId = e.target.querySelector('input[name=resultId').value;
    this.commManager.setSelectedSearchResult(regId);

    this.dispatchTransition(MultipleResultState.events.SELECTED_SINGLE_RESULT);
  }

  /**
   * Get an age in years between the birthdate and today.
   * @param {string} birthdate - The raw birthdate string, in YYYY-mm-dd format.
   * @param {Date} today - The 'today' value to use. Defaults to new Date().
   * @return {number} - Age in years between the birthdate and today.
   */
  #getAge(birthdate, today = new Date()) {
    // TODO: This method should move to a dedicated Registrant class.
    const yearInMs = 3.15576e+10;
    return Math.floor((today - new Date(birthdate).getTime()) / yearInMs);
  }
}
