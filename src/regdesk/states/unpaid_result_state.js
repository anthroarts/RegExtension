import { BadgeLabelBuilder } from '../label_builder.js';
import { RegState } from './reg_state.js';

/**
 * Loading state
 */
export class UnpaidResultState extends RegState {
  /**
   * Get the transition events this state can process.
   */
  static get events() {
    return {
      CANCEL: 'CANCEL',
      PAID: 'PAID',
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

    this.regUnpaidNotAccepting = this.screenRow.querySelector('#regUnpaidNotAccepting');

    this.regPreferredName = this.screenRow.querySelector('#regPreferredNameUnpaid');
    this.regLegalName = this.screenRow.querySelector('#regLegalNameUnpaid');
    this.regBirthdate = this.screenRow.querySelector('#regBirthdateUnpaid');
    this.regAge = this.screenRow.querySelector('#regAgeUnpaid');
    this.regPayment = this.screenRow.querySelector('#regPaymentUnpaid');

    this.badgeCanvas = this.screenRow.querySelector('#regBadgePreviewUnpaid');

    this.regPaidBtn = this.screenRow.querySelector('#regMarkPaidBtn');
    this.regPaidBtn.addEventListener('click', this.markRegistrantAsPaid.bind(this));

    this.regPaidBtnText = this.regPaidBtn.querySelector('#regMarkPaidBtnText');
    this.regPaidBtnSpinner = this.regPaidBtn.querySelector('#regMarkPaidBtnSpinner');
    this.regPaidBtnTextSpinner = this.regPaidBtn.querySelector('#regMarkPaidBtnTextSpinner');
  }

  /**
   * Enter this state.
   */
  enterState() {
    this.show(this.screenRow);
    this.printButton.invisible();
    this.cancelButton.visible()
      .setTransitionCallback(this, this.constructor.events.CANCEL);

    const acceptingPayments = this.commManager.acceptingPayments;
    const reg = this.commManager.selectedSearchResult;

    this.regPreferredName.value = reg.preferredName;
    this.regLegalName.value = reg.legalName;
    this.regBirthdate.value = reg.birthdate;
    const age = this.#getAge(reg.birthdate);
    this.regAge.textContent = age;
    this.regPayment.value = reg.amountDue;

    // TODO: Move this to some Registrant class?
    this.#labelBuilder = new BadgeLabelBuilder({
      line1: reg.badgeLine1,
      line2: reg.badgeLine2,
      badgeId: reg.regNumber,
      level: reg.sponsorLevel,
      isMinor: (age < 18),
    });
    this.#labelBuilder.renderToImageData(this.badgeCanvas.width, this.badgeCanvas.height, this.badgeCanvas);

    this.show(this.regPaidBtnText);
    this.hide(this.regPaidBtnSpinner, this.regPaidBtnTextSpinner);

    if (acceptingPayments) {
      this.regPaidBtn.disabled = false;
      this.hide(this.regUnpaidNotAccepting);
    } else {
      this.regPaidBtn.disabled = true;
      this.show(this.regUnpaidNotAccepting);
    }
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
   * Mark a registrant as paid.
   */
  async markRegistrantAsPaid() {
    this.regPaidBtn.disabled = true;
    this.hide(this.regPaidBtnText);
    this.show(this.regPaidBtnSpinner, this.regPaidBtnTextSpinner);
    await this.commManager.markRegistrantAsPaid(this.commManager.selectedSearchResult);

    this.dispatchTransition(this.constructor.events.PAID);
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
