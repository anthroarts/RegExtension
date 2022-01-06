// eslint-disable-next-line no-unused-vars
import { PrinterManager } from './printer_manager.js';
import { TogglePaymentsBtn } from './toggle_payments_btn.js';

import { MESSAGE_TYPE } from '../coms/communication.js';
import { RegistrantDetails } from './registrant_details.js';

/**
 * Manager for handling communication to the extension and APIs.
 */
export class CommunicationManager {
  #acceptingPayments;
  #togglePaymentsBtn;
  #printerMgr;

  /**
   * Indicates whether this terminal is accepting payments.
   */
  get acceptingPayments() {
    return this.#acceptingPayments;
  }

  /**
   * Iniitalizes a new instance of the CommunicationManager class.
   * @param {PrinterManager} printerMgr - The printer manager to use for print requests.
   * @param {TogglePaymentsBtn} togglePaymentsBtn - Button to toggle payment acceptance.
   */
  constructor(printerMgr, togglePaymentsBtn) {
    this.#printerMgr = printerMgr;

    this.#acceptingPayments = false;
    this.#togglePaymentsBtn = togglePaymentsBtn;
    this.#togglePaymentsBtn.addEventListener(
      TogglePaymentsBtn.events.TOGGLE_PAYMENTS,
      this.#togglePayments.bind(this));

    chrome.runtime.onMessage.addListener(this.#handleExtensionMessage.bind(this));
  }

  /**
   * Search for a registrant by name, populating the result if available.
   * @param {string} searchString - The string to search for.
   * @return {Promise<RegistrantDetails[]>} The promise that will return the search results.
   */
  startSearchForRegByName(searchString) {
    // Start the search process, internally storing the promise and handling
    // the return value. Something like:
    // this.#searhPromise = this
    //   .whateverCommunicationThing.actuallyDoTheSearch(searchString)
    //   .then(handleSearchResults);

    // We then expect the LoadingState to add its own .then to the promise and
    // handle it appropriately.

    // In the meantime, mock it out
    const arr = [];
    const len = Math.floor(Math.random() * (4));
    for (let i = 0; i < len; i++) {
      arr.push(this.#testGetRandomReg());
    }

    return new Promise((resolve) => setTimeout(resolve, 500))
      .then(() => arr) // The mock one!
      .then(this.handleSearchResults.bind(this)); // The real one!
  }

  /**
   * Mark a registratnt as paid.
   * @param {RegistrantDetails} reg - The registrant to mark as paid.
   */
  async markRegistrantAsPaid(reg) {
    // TODO: Do it!
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Handle the results from a search.
   * @param {*} results - The results.
   * @return {RegistrantDetails[]} - The array of results.
   */
  handleSearchResults(results) {
    // TODO: Assumes an array, who knows what we get back from the API though.
    // TODO: Whatever massaging necessary from the real API.
    return results;
  }

  /**
   * Handle a request from the extension to print a label.
   * @param {RegistrantDetails} reg - The reg to print the label for.
   * @return { {success: boolean } } Result object of the print request.
   */
  async #handleExtensionPrintRequest(reg) {
    if (!reg) {
      return { success: false };
    }

    const label = reg.label;

    try {
      await this.#printerMgr.printLabelBuilder(label);
    } catch {
      return { success: false };
    }

    return { success: true };
  }

  /**
   * Handle messages from other extension components.
   * @param {object} o - The request object.
   * @param {string} o.type - The request type.
   * @param {*} o.payload - The request payload.
   * @param {chrome.runtime.MessageSender} sender - The sender of the event.
   * @param {function(*)} callback - Callback message to response to the event sender.
   * @return {boolean} - True to indicate this will response async.
   */
  #handleExtensionMessage({ type, payload }, sender, callback) {
    console.debug('Received extension message', type, payload, sender);

    // NOTE: Any object that is passed through the message system will STRIP all
    // public methods on all objects, recursively! This means objects can't be
    // used directly and MUST be copied to FRESH instances. Create copy constructors
    // where necessary to accomplish this.

    switch (type) {
    case MESSAGE_TYPE.printLabel:
      const reg = RegistrantDetails.copy(payload?.registrantDetails);
      this.#handleExtensionPrintRequest(reg).then(callback);
      break;
    default:
      console.warning(`Received message with unknown type '${type}', dropping.`);
      break;
    }

    // Indicates we will run the callback async.
    return true;
  }

  /**
   * Toggle the state of accepting payments.
   * @param {CustomEvent} e - The event object
   */
  #togglePayments(e) {
    this.#acceptingPayments = e.detail.acceptingPayments;
  }

  /**
   * Temp method to generate random values.
   * @return {string} Random string
   */
  #testGetRandomReg() {
    const r = (l) => (Math.random().toString(36)+'00000000000000000').slice(2, l+2);
    return new RegistrantDetails({
      preferredName: r(5),
      legalName: r(10),
      birthdate: '1994-05-22',
      amountDue: 50,
      badgeLine1: r(8),
      badgeLine2: r(8) + r(8),
      badgeId: '12345678',
      conbookCount: 1,
      sponsorLevel: 'Sponsor',
      checkinDate: undefined,
      paymentStatus: 'completed',
    });
  }
}
