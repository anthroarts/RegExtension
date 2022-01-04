// This is used in doc comments..
// eslint-disable-next-line no-unused-vars
import { LabelEpl, LP2844 } from 'webzlp/src/LP2844';
import { BadgeLabelBuilder } from './label_builder.js';
// eslint-disable-next-line no-unused-vars
import { PrinterConfigModal } from './printer_config_modal.js';
import { PrinterDropdown } from './printer_dropdown.js';

/**
 * Manages printer connection and lifetime.
 */
export class PrinterManager {
  #adultDropdown;
  #minorDropdown;
  #dropdowns;

  #printerConfigModal;

  #printerType = LP2844;

  #nav;

  /**
   * Initializes a new instance of the PrinterManager class.
   *
   * @param {Navigator} nav - Browser Navigator to hook up events to.
   * @param {PrinterDropdown} adultDropdown - The dropdown object managing the adult printer.
   * @param {PrinterDropdown} minorDropdown - The dropdown object managing the Minor printer.
   * @param {PrinterConfigModal} printerConfigModal - The printer configuration modal.
   */
  constructor(nav, adultDropdown, minorDropdown, printerConfigModal) {
    this.#printerConfigModal = printerConfigModal;

    this.#adultDropdown = adultDropdown;
    this.#adultDropdown.addEventListener(
      PrinterDropdown.events.CONNECT_PRINTER,
      this.handleRequestConnect.bind(this));
    this.#adultDropdown.addEventListener(
      PrinterDropdown.events.CONFIGURE_PRINTER,
      this.handleConfigurePrinter.bind(this),
    );

    this.#minorDropdown = minorDropdown;
    this.#minorDropdown.addEventListener(
      PrinterDropdown.events.CONNECT_PRINTER,
      this.handleRequestConnect.bind(this));
    this.#minorDropdown.addEventListener(
      PrinterDropdown.events.CONFIGURE_PRINTER,
      this.handleConfigurePrinter.bind(this),
    );
    this.#minorDropdown.addEventListener(
      PrinterDropdown.events.PRINT_KIT_BADGE,
      this.printKitBadge.bind(this));

    // Convenience array
    this.#dropdowns = [this.#adultDropdown, this.#minorDropdown];

    this.#nav = nav;

    this.#nav.usb.addEventListener('connect', async (e) => {
      const printer = await this.handleConnectPrinter(e);
      if (printer) {
        await this.assignPrinter(printer);
      }
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
    dropdown = dropdown || this.#dropdowns.find((d) => !d.printer);
    if (dropdown) {
      dropdown.setPrinter(printer);
    } else {
      console.warn('Connected to a printer that we couldn\'t assign anywhere!');
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
   * Handle a request to connect a printer
   * @param {Object} o - Event Object.
   * @param {USBDevice} o.device - The USB device to connect to as a printer.
   * @return {LP2844} The printer connected to, or {undefined} if no printer was connected.
   */
  async handleConnectPrinter({ device }) {
    // If we already have a tracked printer we shouldn't try to add it.
    if (this.#dropdowns.some((d) => d.printer?.device === device)) {
      // TODO: Display something more useful.
      console.warn('Reconnected to a printer already managed by a dropdown.');
      return undefined;
    }

    const printer = new this.#printerType(device);
    try {
      await printer.connect();
    } catch (e) {
      // TODO: Display something more useful.
      console.error('Failed to connect to printer, ', e);
    }

    return printer;
  }

  /**
   * Handle a request to configure a printer
   * @param {CustomEvent} e - The event object
   */
  handleConfigurePrinter(e) {
    this.#printerConfigModal.open(e.detail);
  }

  /**
   * Disconnect a printer from the page.
   * @param {Object} o - Container object
   * @param {USBDevice} o.device - The device to disconnect.
   */
  async handleDisconnectPrinter({ device }) {
    const dropdown = this.#dropdowns.find((d) => d.printer?.device === device);
    if (!dropdown) {
      return;
    }

    await dropdown.removePrinter();
  }

  /**
   * Add a new printer to the page and connect to it.
   * @param {PrinterDropdown} dropdown - The dropdown to add the printer to.
   * @return {LP2844} connected printer, or {undefined} if the printer couldn't connect..
   */
  async pairPrinter(dropdown) {
    let device;
    try {
      device = await this.#nav.usb.requestDevice({
        filters: [
          { vendorId: this.#printerType.usbVendorId },
        ],
      });
    } catch (e) {
      if (e.name === 'NotFoundError') {
        // User clicked cancel, this is okay to ignore.
      } else {
        console.error('Couldn\'t add new printer.', e);
      }
      return undefined; // Nothing to return, can't proceed here.
    }

    const printer = await this.handleConnectPrinter({ device: device });
    if (printer) {
      await this.assignPrinter(printer, dropdown);
    }
  }

  /**
   * Get a label for the adult printer.
   * @return {LabelEpl} - The label, or {undefined} if the printer isn't connected.
   */
  getAdultLabel() {
    if (!this.#adultDropdown.printer) {
      // TODO: Make this more clear
      console.error('Adult printer not present to print to!');
      return;
    }

    return this.#adultDropdown.printer.getLabel();
  }

  /**
   * Print a badge label to the adult printer.
   * @param {LabelEpl} label
   */
  async printAdultLabel(label) {
    if (!this.#adultDropdown.printer) {
      // TODO: Make this more clear
      console.error('Adult printer not present to print to!');
      return;
    }

    await this.#adultDropdown.printLabel(label);
  }

  /**
   * Get a label for the minor printer.
   * @return {LabelEpl} - The label, or {undefined} if the printer isn't connected.
   */
  getMinorLabel() {
    if (!this.#minorDropdown.printer) {
      // TODO: Make this more clear
      console.error('Minor printer not present to print to!');
      return;
    }

    return this.#minorDropdown.printer.getLabel();
  }

  /**
   * Print a badge label to the minor printer.
   * @param {LabelEpl} label
   */
  async printMinorLabel(label) {
    if (!this.#minorDropdown.printer) {
      // TODO: Make this more clear
      console.error('Minor printer not present to print to!');
      return;
    }

    await this.#minorDropdown.printLabel(label);
  }

  /**
   * Print a label buider to the printer determined by the label builder.
   * @param {BadgeLabelBuilder} builder
   */
  async printLabelBuilder(builder) {
    let label;
    if (builder.isMinor) {
      label = this.getMinorLabel();
    } else {
      label = this.getAdultLabel();
    }

    if (!label) {
      // Means the printer wasn't available.
      return;
    }

    const labelImage = builder.renderToImageSizedToLabel(label.labelWidthDots, label.labelHeightDots);
    label.setOffset(labelImage.widthOffset).addImage(labelImage.canvasData);

    if (builder.isMinor) {
      return this.printMinorLabel(label);
    } else {
      return this.printAdultLabel(label);
    }
  }

  /**
   * Print a KIT badge
   * @return {Promise} - The promise to complete when done printing.
   */
  async printKitBadge() {
    const labelBuilder = new BadgeLabelBuilder({
      line1: 'KID IN TOW',
      line2: 'KIT',
      badgeId: '',
      level: '',
      isMinor: true,
    });

    return this.printLabelBuilder(labelBuilder);
  }

  /**
   * Disconnect and reconnect to all printers.
   */
  async refreshPrinters() {
    // On initial page load these won't be connected anyway, but just to be safe..
    await Promise.all(this.#dropdowns.map(async (d) => await d.removePrinter()));

    return this.#nav.usb.getDevices().then(async (devices) => {
      if (devices.length > 1) {
        // TODO: Show a UI popup telling the user to manually connect.
        // TODO: Remove this if we have a page-refresh-durable cache we can
        // positively identify printers in for reassignment? Probably will still
        // need a fallback to tell the user to manually select them.
        console.warn('Can\'t assign printers');
        return;
      }

      // Connect to the printers and hand them off for assignment to dropdowns.
      return Promise.all(devices.map(async (device) => {
        const printer = await this.handleConnectPrinter({ device });
        await this.assignPrinter(printer);
      }));
    });
  }
}
