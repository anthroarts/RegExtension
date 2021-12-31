import { WorkflowButton } from '../workflow_button.js';

/**
 * Record for the common state machine args for states.
 */
export class RegMachineArgs {
  /**
   * Initializes a new instance of the RegMachineArgs class.
   * @param {WorkflowButton} leftButton - The left side gutter button.
   * @param {WorkflowButton} rightButton - The right side gutter button.
   * @param {Element} centerField - The center container for page content.
   * @param {PrinterManager} printerManager - The printer manager that manages printers.
   * @param {CommunicationManager} commManager - The communication manager for making API calls.
   */
  constructor(
    leftButton,
    rightButton,
    centerField,
    printerManager,
    commManager,
  ) {
    this.leftButton = leftButton;
    this.rightButton = rightButton;
    this.centerField = centerField;
    this.printerManager = printerManager;
    this.commManager = commManager;

    if (this.constructor === RegMachineArgs.constructor) {
      Object.freeze(this);
    }
  }

  /**
   * Get a new RegMachineArgs by querying the document directly.
   * @param {Document} document - Document object to get elements from.
   * @param {PrinterManager} printerManager - The printer manager to use.
   * @param {CommunicationManager} commManager - The comm manager to use.
   * @return {RegMachineArgs} - The constructed object.
   */
  static getFromDocument(document, printerManager, commManager) {
    return new RegMachineArgs(
      new WorkflowButton(document.getElementById('leftButton')),
      new WorkflowButton(document.getElementById('rightButton')),
      document.getElementById('centerField'),
      printerManager,
      commManager,
    );
  }
}
