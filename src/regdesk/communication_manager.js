// eslint-disable-next-line no-unused-vars
import { PrinterManager } from './printer_manager.js';
import { TogglePaymentsBtn } from './toggle_payments_btn.js';

import { MESSAGE_TYPE } from '../coms/communication.js';
import { RegistrantDetails } from './registrant_details.js';
import { RegfoxApi } from '../regfox/regfox_api.js';

/**
 * Manager for handling communication to the extension and APIs.
 */
export class CommunicationManager {
  #acceptingPayments;
  #togglePaymentsBtn;
  #printerMgr;
  #loginMgr;

  /**
   * Indicates whether this terminal is accepting payments.
   */
  get acceptingPayments() {
    return this.#acceptingPayments;
  }

  /**
   * Iniitalizes a new instance of the CommunicationManager class.
   * @param {PrinterManager} printerMgr - The printer manager to use for print requests.
   * @param {LoginManager} loginMgr - The login manager that gives tokens we can use to call the api.
   * @param {TogglePaymentsBtn} togglePaymentsBtn - Button to toggle payment acceptance.
   */
  constructor(printerMgr, loginMgr, togglePaymentsBtn) {
    this.#printerMgr = printerMgr;
    this.#loginMgr = loginMgr;

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
  async startSearchForRegByName(searchString) {
    // FIXME I think we still need to do some client side filtering for cancelled/duplicate/etc memberships.
    const bearerToken = await this.#loginMgr.getBearerToken();
    return RegfoxApi.searchRegistrations(searchString, bearerToken)
      .then((result) => result.registrants.slice(0, 10)) // The next call hammers regfox, so we want to limit this as much as possible
      .then((results) => Promise.all(results.map((result) => RegfoxApi.getRegistrationInfo(result.id, bearerToken))))
      .then((results) => results.map((result) => new RegistrantDetails({
        preferredName: result.preferredFirstName || result.name,
        legalName: result.name,
        birthdate: result.dateOfBirth,
        amountDue: result.outstandingAmount100x, // FIXME there is a bug where #maybeSingleResultToUnpaid
        // is unable to view this value, and therefor thinks everyone is unpaid.
        badgeLine1: result.badgeLine1Text,
        badgeLine2: result.badgeLine2Text || '',
        badgeId: '12345678', // I have no idea which of id is this one.
        conbookCount: result.attendeeSwag,
        sponsorLevel: result.reportingData.registrationOptionLabel,
        checkinDate: result.checkedIn,
        paymentStatus: result.statusString,
      })));
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
}
