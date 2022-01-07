// eslint-disable-next-line no-unused-vars
import { BadgeLabelBuilder } from '../label_builder.js';
// eslint-disable-next-line no-unused-vars
import { RegistrantDetails } from '../registrant_details.js';
// eslint-disable-next-line no-unused-vars
import { PrinterManager } from '../printer_manager.js';
import { RegState } from './reg_state.js';

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
   * @param {CustomEvent<{searchResult: RegistrantDetails}>} e - Event that resulted in this state.
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
    this.regAge.textContent = searchResult.age;

    const label = searchResult.label;
    label.renderToImageData(this.badgeCanvas.width, this.badgeCanvas.height, this.badgeCanvas);

    this.printButton.setClickCallback(this.printLabel.bind(this));
  }

  /**
   * Exit this state.
   */
  exitState() {
    this.hide(this.screenRow);
    this.cancelButton.clearTransitionCallback();
    const ctx = this.badgeCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.badgeCanvas.width, this.badgeCanvas.height);

    this.printButton.clearClickCallback();
  }

  /**
   * Print the label from the latest result.
   */
  async printLabel() {
    const label = this.#currentResult.label;
    await this.printerManager.printLabelBuilder(label);
  }
}
