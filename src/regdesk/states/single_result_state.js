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
      BADGE_PRINTED: 'BADGE_PRINTED',
    };
  }

  #currentResult;

  /**
   * Initializes a new instance of the SingleResultState class.
   * @param {RegMachineArgs} regMachineArgs - Standard argument set for states.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super(regMachineArgs, eventMap);

    this.regPreferredName = this.screenRow.querySelector('#regPreferredName');
    this.regLegalName = this.screenRow.querySelector('#regLegalName');
    this.regBirthdate = this.screenRow.querySelector('#regBirthdate');
    this.regAge = this.screenRow.querySelector('#regAge');
    this.badgeCanvas = this.screenRow.querySelector('#regBadgePreview');
  }

  /**
   * Enter this state.
   * @param {CustomEvent} e - Event that resulted in this state.
   */
  enterState(e) {
    this.show(this.screenRow);
    this.printButton.visible();
    this.cancelButton.visible()
      .setTransitionCallback(this, SingleResultState.events.CANCEL);

    // TODO: Better handling if we get an invalid object
    const { searchResult } = e.detail || {};
    this.#currentResult = searchResult;

    this.regPreferredName.value = searchResult.preferredName;
    this.regLegalName.value = searchResult.legalName;
    this.regBirthdate.value = searchResult.birthdate;
    const age = this.#getAge(searchResult.birthdate);
    this.regAge.textContent = age;

    const label = new BadgeLabelBuilder({
      line1: searchResult.badgeLine1,
      line2: searchResult.badgeLine2,
      badgeId: searchResult.regNumber,
      level: searchResult.sponsorLevel,
      isMinor: (age < 18),
    });
    label.renderToImageData(this.badgeCanvas.width, this.badgeCanvas.height, this.badgeCanvas);
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();
    const ctx = this.badgeCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.badgeCanvas.width, this.badgeCanvas.height);
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
