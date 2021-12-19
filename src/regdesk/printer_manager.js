import { LabelEpl, LP2844 } from 'WebZLP/src/LP2844'
import { PrinterDropdown } from './printer_dropdown.js';

export class PrinterManager {

  #adultDropdown;
  #minorDropdown;
  #dropdowns;

  #printerType = LP2844;

  #nav;

  /**
   * Initializes a new instance of the PrinterManager class.
   *
   * @param {Navigator} nav - Browser Navigator to hook up events to.
   * @param {PrinterDropdown} adultDropdown - The dropdown object managing the adult printer.
   * @param {PrinterDropdown} minorDropdown - The dropdown object managing the Minor printer.
   */
  constructor(nav, adultDropdown, minorDropdown) {
    this.#adultDropdown = adultDropdown;
    this.#adultDropdown.addEventListener(PrinterDropdown.ConnectEventName, async (e) => this.handleRequestConnect(e));

    this.#minorDropdown = minorDropdown;
    this.#minorDropdown.addEventListener(PrinterDropdown.ConnectEventName, async (e) => this.handleRequestConnect(e));

    // Convenience array
    this.#dropdowns = [this.#adultDropdown, this.#minorDropdown];

    this.#nav = nav;

    this.#nav.usb.addEventListener('connect', async (e) => {
      const printer = await this.handleConnectPrinter(e);
      if (printer) { await this.assignPrinter(printer); }
    });
    this.#nav.usb.addEventListener('disconnect', async (e) => this.handleDisconnectPrinter(e));
  }

  /**
   * Assign a printer to a dropdown
   * @param {LP2844} printer
   * @param {PrinterDropdown} dropdown
   */
  async assignPrinter(printer, dropdown) {
    // Find the first dropdown in order, hope it's the right one!
    // TODO: Make this smarter and pull from a page-refresh-durable cache or
    // something for assignment instead of just first past the post.
    dropdown = dropdown || this.#dropdowns.find(d => !d.printer);
    if (dropdown) {
      dropdown.setPrinter(printer);
    } else {
      console.warn("Connected to a printer that we couldn't assign anywhere!");
      await printer.dispose();
    }
  }

  /**
   * Handle a recquest to add a printer to a dropdown.
   * @param {CustomEvent} o - PrinterDropdown connect event
   * @param {PrinterDropdown} o.target - The dropdown target.
   */
  async handleRequestConnect({ target: dropdown }) {
    if (dropdown.printer) {
      // Spurious event dispatch?
      return;
    }

    this.pairPrinter(dropdown);
  }

  /**
   *
   * @param {Object} o - Event Object.
   * @param {USBDevice} o.device - The USB device to connect to as a printer.
   * @returns The printer connected to, or {undefined} if no printer was connected.
   */
  async handleConnectPrinter({ device }) {
    // If we already have a tracked printer we shouldn't try to add it.
    if (this.#dropdowns.some((d) => d.printer?.device === device)) {
      // TODO: Display something more useful.
      console.warn("Reconnected to a printer already managed by a dropdown.");
      return undefined;
    }

    let printer = new this.#printerType(device);
    try {
      await printer.connect();
    } catch (e) {
      // TODO: Display something more useful.
      console.error("Failed to connect to printer, ", e);
    }

    return printer;
  }

  /**
   * Disconnect a printer from the page.
   * @param {Object} o - Container object
   * @param {USBDevice} o.device - The device to disconnect.
   */
  async handleDisconnectPrinter({ device }) {
    let dropdown = this.#dropdowns.find(d => d.printer?.device === device);
    if (!dropdown) {
      return;
    }

    await dropdown.removePrinter();
  }

  /**
   * Add a new printer to the page and connect to it.
   * @param {PrinterDropdown} dropdown - The dropdown to add the printer to.
   * @returns {LP2844} connected printer, or {undefined} if the printer couldn't connect..
   */
  async pairPrinter(dropdown) {
    var device;
    try {
      device = await this.#nav.usb.requestDevice({
        filters: [
          { vendorId: this.#printerType.usbVendorId }
        ]
      });
    } catch (e) {
      if (e.name === "NotFoundError") {
        // User clicked cancel, this is okay to ignore.
      } else {
        console.error("Couldn't add new printer.", e);
      }
      return undefined; // Nothing to return, can't proceed here.
    }

    let printer = await this.handleConnectPrinter({ device: device });
    if (printer) {
      await this.assignPrinter(printer, dropdown);
    }
  }

  /**
   * Print a badge label to the adult printer.
   * @param {LabelEpl} label
   */
  async printAdultLabel(label) {
    if (!this.#adultDropdown.printer) {
      // TODO: Make this more clear
      console.error("Adult printer not present to print to!");
    }

    await this.#adultDropdown.printer.printLabel(label);
  }

  /**
   * Print a badge label to the minor printer.
   * @param {LabelEpl} label
   */
  async printMinorLabel(label) {
    if (!this.#minorDropdown.printer) {
      // TODO: Make this more clear
      console.error("Minor printer not present to print to!");
    }

    await this.#minorDropdown.printer.printLabel(label);
  }

  /**
   * Disconnect and reconnect to all printers.
   */
  async refreshPrinters() {
    // On initial page load these won't be connected anyway, but just to be safe..
    await Promise.all(this.#dropdowns.map(async d => await d.removePrinter()));

    return this.#nav.usb.getDevices().then(async (devices) => {
      if (devices.length > 1) {
        // TODO: Show a UI popup telling the user to manually connect.
        // TODO: Remove this if we have a page-refresh-durable cache we can
        // positively identify printers in for reassignment? Probably will still
        // need a fallback to tell the user to manually select them.
        console.warn("Can't assign printers");
        return;
      }

      // Connect to the printers and hand them off for assignment to dropdowns.
      return Promise.all(devices.map(async device => {
        const printer = await this.handleConnectPrinter({ device });
        await this.assignPrinter(printer);
      }));
    });
  }
}
