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

  /** @type {BadgeLabelBuilder} */
  #labelBuilder;

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
   */
  enterState() {
    this.show(this.screenRow);
    this.printButton.visible();
    this.cancelButton.visible()
      .setTransitionCallback(this, SingleResultState.events.CANCEL);

    const reg = this.commManager.selectedSearchResult;

    this.regPreferredName.value = reg.preferredName;
    this.regLegalName.value = reg.legalName;
    this.regBirthdate.value = reg.birthdate;
    const age = this.#getAge(reg.birthdate);
    this.regAge.textContent = age;

    this.#labelBuilder = new BadgeLabelBuilder({
      line1: reg.badgeLine1,
      line2: reg.badgeLine2,
      badgeId: reg.regNumber,
      level: reg.sponsorLevel,
      isMinor: (age < 18),
    });
    this.#labelBuilder.renderToImageData(this.badgeCanvas.width, this.badgeCanvas.height, this.badgeCanvas);
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
