import { LP2844 } from 'WebZLP/src/LP2844'

export class PrinterDropdown extends EventTarget {

  /**
   * The printer displayed by this class.
   * @type {LP2844}
   */
  #printer;
  /**
   * Get the printer this dropdown is bound to.
   */
  get printer() { return this.#printer; }

  #dropdownName;
  /**
   * Get the name of this dropdown
   */
  get dropdownName() { return this.#dropdownName; }

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
    this.#connectElement.addEventListener('click', () => this.showConfig());

    // Safe to call this without an await because there won't be a printer yet.
    // TODO: kinda makes me itchy though.
    this.removePrinter();
  }

  #connectPrinter() {
    let event = new CustomEvent(
      this.constructor.ConnectEventName,
      { target: this,  });
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
        if (e.name === "NotFoundError") {
          // Device was already disconnected, we tried to disconnect again. This is fine.
        } else {
          throw e;
        }
      }
    }
    this.#printer = undefined;

    this.#iconElement.textContent = "❌"
    this.#printerNameElement.textContent = "(No Printer)"
    this.#show(this.#connectElement);
    this.#hide(
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

    this.#iconElement.textContent = "🖨";
    this.#printerNameElement.textContent = `(${this.#printer.serial})`;
    this.#hide(this.#connectElement);
    this.#show(
      this.#disconnectElement,
      this.#testPrintElement,
      this.#feedPrintElement,
      this.#configElement,
    );
  }

  /**
   * Print a test page.
   */
  async printTest() {
    if (!this.#printer) {
      console.error("No printer selected, can't print test page.");
    }

    try {
      await this.#printer.printTestPage();
    }
    catch (error) {
      console.error("Failed to print test page.", error);
    }
  }

  /**
   * Feed one label from the printer.
   */
  async feedLabel() {
    if (!this.#printer) {
      console.error("No printer selected, can't feed a label.");
    }

    try {
      await this.#printer.feed(1);
    }
    catch (error) {
      console.error("Failed to feed label.", error);
    }
  }

  showConfig() {
    // idk figure out how to show the modal with the printer config.
  }

  #hide(...elements) {
    elements.forEach((e) => {
      e.classList.remove('visible');
      e.classList.add('invisible');
    });
  }

  #show(...elements) {
    elements.forEach((e) => {
      e.classList.remove('invisible');
      e.classList.add('visible');
    });
  }

  /**
   * Gets the connect event name
   */
  static get ConnectEventName() { return "connect"; }

  /**
   * Query the document for the elements that make up a dropdown.
   *
   * @param {string} prefix - The prefix for this dropdown's element collection. Usually either "minor" or "clear"
   * @param {Document} doc - The Document object to query for IDs.
   * @returns An object containing all of the elements for a dropdown's constructor.
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
    };
  }
}
