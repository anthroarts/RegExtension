// eslint-disable-next-line no-unused-vars
import { LP2844 } from 'webzlp/src/LP2844';
import { Modal } from 'bootstrap';

/**
 * Manages the printer configuration modal
 */
export class PrinterConfigModal {
  /**
   * Initializes a new instance of the PrinterConfigModal class.
   * @param {Element} printerModal - The modal dialog for configuring the printer.
   */
  constructor(printerModal) {
    this.modal = new Modal(printerModal);
    this.form = printerModal.querySelector('form');
    this.printerSerial = this.form.querySelector('#printerSettingsSerial');
    this.printerLabelWidth = this.form.querySelector('#printerSettingsLabelWidth');
    this.printerLabelHeight = this.form.querySelector('#printerSettingsLabelHeight');
    this.printerDarkness = this.form.querySelector('#printerSettingsDarkness');
    this.printerSpeed = this.form.querySelector('#printerSettingsSpeed');

    this.form.addEventListener('submit', this.#updatePrinterConfig.bind(this));

    this.printer;
  }

  /**
   * Open the printer configuration page.
   * @param {LP2844} printer - The printer to configure.
   */
  open(printer) {
    if (!printer) {
      console.error('Printer argument to config modal was not a printer.');
      return;
    }

    this.printer = printer;

    this.printerSerial.textContent = printer.serial;
    this.printerLabelWidth.value = printer.labelWidth;
    this.printerLabelHeight.value = printer.labelHeight;
    this.printerDarkness.value = printer.density;
    this.printerSpeed.value = printer.speed;

    this.modal.show();
  }

  /**
   * Update the printer configuration.
   * @param {CustomEvent} e - The event object
   */
  async #updatePrinterConfig(e) {
    e.preventDefault();
    this.modal.hide();

    this.printer.labelWidth = (parseFloat(this.printerLabelWidth.value));
    this.printer.labelHeight = (parseFloat(this.printerLabelHeight.value));
    await this.printer.configDensity(this.printerDarkness.value);
    await this.printer.configSpeed(this.printerSpeed.value);
    await this.printer.configPrintDirection();
    await this.printer.configLabelWidth();
    // Sets the label length with a label gap of 25 dots.
    await this.printer.addCmd(`Q${this.printer.labelHeightDots + 5},25`).print();
  }
}
