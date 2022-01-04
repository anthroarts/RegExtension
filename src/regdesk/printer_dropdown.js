// eslint-disable-next-line no-unused-vars
import { LabelEpl } from 'webzlp/src/LabelEpl';
// eslint-disable-next-line no-unused-vars
import { LP2844 } from 'webzlp/src/LP2844';

/**
 * Class for managing a printer dropdown
 */
export class PrinterDropdown extends EventTarget {
  /**
   * Get the events this dropdown can generate.
   */
  static get events() {
    return {
      CONNECT_PRINTER: 'CONNECT_PRINTER',
      PRINT_KIT_BADGE: 'PRINT_KIT_BADGE',
      CONFIGURE_PRINTER: 'CONFIGURE_PRINTER',
    };
  }
  /**
   * The printer displayed by this class.
   * @type {LP2844}
   */
  #printer;
  /**
   * Get the printer this dropdown is bound to.
   */
  get printer() {
    return this.#printer;
  }

  #dropdownName;
  /**
   * Get the name of this dropdown
   */
  get dropdownName() {
    return this.#dropdownName;
  }

  // Icon next to printer name
  #iconElement;
  // Text name of the printer
  #printerNameElement;
  // Button for connecting a printer
  #connectElement;
  // Button for disconnecting a printer
  #disconnectElement;
  // Button for sending a test print
  #testPrintElement;
  // Button for feeding one label
  #feedPrintElement;
  // Button for showing the config dialog
  #configElement;
  // Button for printing a KIT badge
  #kitBadgeElement;

  /**
   * Initializes a new instance of the PrinterDropdown class.
   *
   * @param {object} o - The element collection that makes up a dropdown.
   * @param {string} o.dropdownName - The name of this dropdown.
   * @param {Element} o.iconElement - The span containing the dropdown icon.
   * @param {Element} o.nameElement - The span containig the dropdown name.
   * @param {Element} o.connectElement - The printer connect button.
   * @param {Element} o.disconnectElement - The printer disconnect button.
   * @param {Element} o.testElement - The print test page button.
   * @param {Element} o.feedElement - The feed label button.
   * @param {Element} o.configElement - The configure dialog button.
   * @param {Element} o.kitBadgeElement - The print KIT badge element.
   */
  constructor({
    dropdownName,
    iconElement,
    nameElement,
    connectElement,
    disconnectElement,
    testElement,
    feedElement,
    configElement,
    kitBadgeElement,
  }) {
    super();

    this.#dropdownName = dropdownName;

    this.#iconElement = iconElement;
    this.#printerNameElement = nameElement;

    this.#connectElement = connectElement;
    this.#connectElement.addEventListener('click', () => this.#connectPrinter());

    this.#disconnectElement = disconnectElement;
    this.#disconnectElement.addEventListener('click', () => this.removePrinter());

    this.#testPrintElement = testElement;
    this.#testPrintElement.addEventListener('click', () => this.printTest());

    this.#feedPrintElement = feedElement;
    this.#feedPrintElement.addEventListener('click', () => this.feedLabel());

    this.#configElement = configElement;
    this.#configElement.addEventListener('click', this.#showConfig.bind(this));

    this.#kitBadgeElement = kitBadgeElement;
    this.#kitBadgeElement?.addEventListener('click', () => this.#printKitBadge());

    // Safe to call this without an await because there won't be a printer yet.
    // TODO: kinda makes me itchy though.
    this.removePrinter();
  }

  /**
   * Request a connection for htis printer.
   */
  #connectPrinter() {
    const event = new CustomEvent(this.constructor.events.CONNECT_PRINTER);
    this.dispatchEvent(event);
  }

  /**
   * Request to print a kid-in-tow badge.
   */
  #printKitBadge() {
    const event = new CustomEvent(this.constructor.events.PRINT_KIT_BADGE);
    this.dispatchEvent(event);
  }

  /**
   * Show the configuration for this printer.
   */
  #showConfig() {
    if (!this.#printer) {
      console.error('No printer selected, can\'t configure.');
      return;
    }

    const event = new CustomEvent(
      this.constructor.events.CONFIGURE_PRINTER,
      { detail: this.#printer });
    this.dispatchEvent(event);
  }

  /**
   * Mark this dropdown as not bound to a printer
   */
  async removePrinter() {
    if (this.#printer) {
      try {
        await this.#printer.dispose();
      } catch (e) {
        if (e.name === 'NotFoundError') {
          // Device was already disconnected, we tried to disconnect again. This is fine.
        } else {
          throw e;
        }
      }
    }
    this.#printer = undefined;

    this.#iconElement.textContent = '❌';
    this.#printerNameElement.textContent = '(No Printer)';
    this.#show(this.#connectElement);
    this.#hide(
      this.#kitBadgeElement,
      this.#disconnectElement,
      this.#testPrintElement,
      this.#feedPrintElement,
      this.#configElement,
    );
  }

  /**
   * Mark this dropdown as using a printer
   * @param {LP2844} printer - The printer to set this dropdown to manage.
   */
  setPrinter(printer) {
    this.#printer = printer;

    this.#iconElement.textContent = '🖨';
    this.#printerNameElement.textContent = `(${this.#printer.serial})`;
    this.#hide(this.#connectElement);
    this.#show(
      this.#kitBadgeElement,
      this.#disconnectElement,
      this.#testPrintElement,
      this.#feedPrintElement,
      this.#configElement,
    );
  }

  /**
   * Print a label to this managed printer
   * @param {LabelEpl} label - The label to print
   */
  async printLabel(label) {
    if (!this.#printer) {
      console.error('No printer selected, can\'t print test page.');
      return Promise.resolve();
    }

    return this.#printer.printLabel(label);
  }

  /**
   * Print a test page.
   */
  async printTest() {
    if (!this.#printer) {
      console.error('No printer selected, can\'t print test page.');
      return Promise.resolve();
    }

    try {
      await this.#printer.printTestPage();
    } catch (error) {
      console.error('Failed to print test page.', error);
    }
  }

  /**
   * Feed one label from the printer.
   */
  async feedLabel() {
    if (!this.#printer) {
      console.error('No printer selected, can\'t feed a label.');
      return Promise.resolve();
    }

    try {
      await this.#printer.feed(1);
    } catch (error) {
      console.error('Failed to feed label.', error);
    }
  }

  /**
   * Hide all elements shown by #show.
   * @param  {...Element} elements - The elements to hide.
   */
  #hide(...elements) {
    elements.forEach((e) => {
      e?.classList.remove('visible');
      e?.classList.add('invisible');
    });
  }

  /**
   * Show all elements hidden by #hide.
   * @param  {...Element} elements - The elements to show.
   */
  #show(...elements) {
    elements.forEach((e) => {
      e?.classList.remove('invisible');
      e?.classList.add('visible');
    });
  }

  /**
   * Query the document for the elements that make up a dropdown.
   *
   * @param {string} prefix - The prefix for this dropdown's element collection. Usually either "minor" or "clear"
   * @param {Document} doc - The Document object to query for IDs.
   * @return {*} An object containing all of the elements for a dropdown's constructor.
   */
  static getElementsOnPage(prefix, doc) {
    return {
      iconElement: doc.getElementById(`${prefix}PrintIcon`),
      nameElement: doc.getElementById(`${prefix}PrintName`),
      connectElement: doc.getElementById(`${prefix}PrintConnect`),
      disconnectElement: doc.getElementById(`${prefix}PrintDisconnect`),
      testElement: doc.getElementById(`${prefix}PrintTest`),
      feedElement: doc.getElementById(`${prefix}PrintFeed`),
      configElement: doc.getElementById(`${prefix}PrintConfig`),
      kitBadgeElement: doc.getElementById(`${prefix}PrintKit`),
    };
  }
}
