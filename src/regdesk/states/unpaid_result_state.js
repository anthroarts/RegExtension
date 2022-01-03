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

  #latestResult;

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
   * @param {CustomEvent} e - Event that resulted in this state.
   */
  enterState(e) {
    this.show(this.screenRow);
    this.printButton.invisible();
    this.cancelButton.visible()
      .setTransitionCallback(this, this.constructor.events.CANCEL);

    const acceptingPayments = this.commManager.acceptingPayments;
    const { searchResult } = e.detail || {};

    // TODO: Better handling if we get an invalid object
    this.#latestResult = searchResult;

    this.regPreferredName.value = searchResult.preferredName;
    this.regLegalName.value = searchResult.legalName;
    this.regBirthdate.value = searchResult.birthdate;
    const age = this.#getAge(searchResult.birthdate);
    this.regAge.textContent = age;
    this.regPayment.value = searchResult.amountDue;

    // TODO: Move this to some Registrant class?
    const label = new BadgeLabelBuilder({
      line1: searchResult.badgeLine1,
      line2: searchResult.badgeLine2,
      badgeId: searchResult.regNumber,
      level: searchResult.sponsorLevel,
      isMinor: (age < 18),
    });
    label.renderToImageData(this.badgeCanvas.width, this.badgeCanvas.height, this.badgeCanvas);

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
    await this.commManager.markRegistrantAsPaid(this.#latestResult);

    this.dispatchTransition(
      this.constructor.events.PAID,
      { searchResult: this.#latestResult },
    );
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
