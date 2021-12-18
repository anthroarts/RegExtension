import { LabelEpl, LP2844 } from 'WebZLP/src/LP2844'
import { PrinterDropdown } from './printer_dropdown.js';

export class PrinterManager {

  #adultDropdown;
  #minorDropdown;
  #dropdowns;

  #printerType = LP2844;

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
    this.#adultDropdown.addEventListener(PrinterDropdown.DisconnectEventName, async (e) => this.handleRequestDisconnect(e));

    this.#minorDropdown = minorDropdown;
    this.#minorDropdown.addEventListener(PrinterDropdown.ConnectEventName, async (e) => this.handleRequestConnect(e));
    this.#minorDropdown.addEventListener(PrinterDropdown.DisconnectEventName, async (e) => this.handleRequestDisconnect(e));

    // Convenience array
    this.#dropdowns = [this.#adultDropdown, this.#minorDropdown];

    nav.usb.addEventListener('connect', async (e) => this.handleConnectPrinter(e));
    nav.usb.addEventListener('disconnect', async (e) => this.handleDisconnectPrinter(e));
  }

  /**
   * Assign a printer to a dropdown
   * @param {LP2844} printer
   * @param {PrinterDropdown} dropdown
   */
  assignPrinter(printer, dropdown) {
    // Find the first dropdown in order, hope it's the right one!
    // TODO: Make this smarter and pull from a cache or something for assignment
    // instead of just first past the post.
    dropdown = dropdown || this.#dropdowns.find(d => !d.printer);
    if (dropdown) {
      dropdown.setPrinter(printer);
    } else {
      console.warn("Connected to a printer that we couldn't assign anywhere!");
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
   * @returns
   */
  async handleConnectPrinter({ device }) {
    // If we already have a tracked printer we shouldn't try to add it.
    if (this.#dropdowns.some((d) => d.printer?.device === device)) {
      return;
    }

    let printer = new this.#printerType(device);
    try {
      await printer.connect();
    } catch (e) {
      // TODO: Display something more useful.
      console.error("Failed to connect to printer: " + e);
    }

    return printer;
  }

  /**
   * Disconnect a printer from the page.
   * @param {Object} o - Container object
   * @param {USBDevice} o.device - The device to disconnect.
   * @returns
   */
  async handleDisconnectPrinter({ device }) {
    let dropdown = this.#dropdowns.filter(d => d.printer?.device === device);
    if (!dropdown) {
      return;
    }

    await dropdown.removePrinter();
  }

  /**
   * Add a new printer to the page and connect to it.
   * @param {PrinterDropdown} dropdown - The dropdown to add the printer to.
   * @returns {LP2844} connected printer.
   */
  async pairPrinter(dropdown) {
    var device;
    try {
      device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: this.#printerType.usbVendorId }
        ]
      });
    } catch (e) {
      // TODO: One of the exceptions we can catch here is "user clicked cancel."
      // Figure out how to separate that out as 'not an actual exception'.
      console.error("Couldn't add new printer: " + e);
      return undefined; // Nothing to return, can't proceed here.
    }

    let printer = await this.handleConnectPrinter({ device: device });
    if (printer) {
      this.assignPrinter(printer, dropdown);
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
   * Disconnect and reconnect to all printers. NOTE: May shuffle position of printers!
   */
  async refreshPrinters() {
    this.#dropdowns.forEach(async d => {
      await d.removePrinter();
    })

    navigator.usb.getDevices().then((devices) => {
      devices.forEach(async d => {
        let printer = await this.handleConnectPrinter({ device: d });
        this.assignPrinter(printer);
      });
    });
  }
}
