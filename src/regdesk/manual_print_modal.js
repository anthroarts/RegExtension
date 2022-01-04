import { BadgeLabelBuilder } from './label_builder.js';

/**
 * Manaages the manual print modal dialog.
 */
export class ManualPrintModal extends EventTarget {
  /**
   * Get the events this class supports
   */
  static get events() {
    return {
      PRINT_LABEL: 'PRINT_LABEL',
    };
  }

  #modalPrintForm;
  #modalBadgePreview;

  /**
   * Initializes a new instance of the ManualPrintModal class.
   * @param {Element} modalPrintBtn - The print button on the modal popup.
   * @param {Element} modalPrintForm - The form element for the badge form.
   * @param {HTMLCanvasElement} modalBadgePreview - The badge preview canvas.
   */
  constructor(modalPrintBtn, modalPrintForm, modalBadgePreview) {
    super();

    this.#modalPrintForm = modalPrintForm;
    this.#modalBadgePreview = modalBadgePreview;

    this.#modalPrintForm.addEventListener('change', this.updateBadgePreview.bind(this));
    this.#modalPrintForm.querySelectorAll('input[type=text]')
      .forEach((e) => e.addEventListener('keyup', this.updateBadgePreview.bind(this)));
    modalPrintBtn.addEventListener('click', this.printForm.bind(this));
  }

  /**
   * Update the bage preview based on the current form data.
   */
  updateBadgePreview() {
    const label = this.getLabelBuilderFromForm();
    const canvas = this.#modalBadgePreview;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    label.renderToImageData(canvas.width, canvas.height, canvas);
  }

  /**
   * Get a BadgeLabelBuilder from the form.
   * @return {BadgeLabelBuilder} - The badge label builder based on the form state.
   */
  getLabelBuilderFromForm() {
    const form = this.#modalPrintForm;
    return new BadgeLabelBuilder({
      line1: form.querySelector('#manualPrintLine1').value,
      line2: form.querySelector('#manualPrintLine2').value,
      badgeId: form.querySelector('#manualPrintBadgeNumber').value,
      level: form.querySelector('#manualPrintLevel').value,
      isMinor: form.querySelector('#manualPrintIsMinor').checked,
    });
  }

  /**
   * Print the form to a label based on the current form.
   */
  printForm() {
    const label = this.getLabelBuilderFromForm();
    this.dispatchEvent(new CustomEvent(
      this.constructor.events.PRINT_LABEL,
      { detail: label }));
  }

  /**
   * Get a ManualPrintModal from the Document element.
   * @param {Document} doc - The document element to find the elements on the page.
   * @return {ManualPrintModal} - Ready to go manual print modal.
   */
  static getFromDocument(doc) {
    return new ManualPrintModal(
      doc.getElementById('manualPrintModalBtn'),
      doc.getElementById('manualPrintModalForm'),
      doc.getElementById('manualPrintBadgePreview'),
    );
  }
}
