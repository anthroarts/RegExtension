
/**
 * Manages the toggle payments display button.
 */
export class TogglePaymentsBtn extends EventTarget {
  /**
   * Get the events this object can generate.
   */
  static get events() {
    return {
      TOGGLE_PAYMENTS: 'TOGGLE_PAYMENTS',
    };
  }

  #acceptingPayments;
  #togglePaymentsBtn;
  #togglePaymentsSwitch;
  #togglePaymentsLabelAllowed;
  #togglePaymentsLabelDenied;

  /**
   * Initializes a new instance of the TogglePaymentsBtn class.
   * @param {Element} togglePaymentsBtn - The button to toggle payments
   */
  constructor(togglePaymentsBtn) {
    super();

    this.#togglePaymentsBtn = togglePaymentsBtn;
    this.#togglePaymentsSwitch = togglePaymentsBtn.querySelector('input');
    this.#togglePaymentsLabelAllowed = togglePaymentsBtn.querySelector('label.pmt-allowed');
    this.#togglePaymentsLabelDenied = togglePaymentsBtn.querySelector('label.pmt-denied');
    this.#togglePaymentsBtn.addEventListener('click', this.handleTogglePayments.bind(this));

    // Start with accepting payments to true, then toggle it off to set the UI elements.
    this.#acceptingPayments = true;
    this.handleTogglePayments();
  }

  /**
   * Handle the toggle event from the button.
   * @param {Event} e - The event object.
   */
  handleTogglePayments(e) {
    e?.preventDefault();

    const accepting = !this.#acceptingPayments;
    this.#acceptingPayments = accepting;
    this.#togglePaymentsSwitch.checked = accepting;

    if (accepting) {
      this.#togglePaymentsBtn.classList.remove('btn-outline-warning');
      this.#togglePaymentsBtn.classList.add('btn-success');
      this.#togglePaymentsLabelAllowed.classList.remove('d-none');
      this.#togglePaymentsLabelDenied.classList.add('d-none');
    } else {
      this.#togglePaymentsBtn.classList.remove('btn-success');
      this.#togglePaymentsBtn.classList.add('btn-outline-warning');
      this.#togglePaymentsLabelDenied.classList.remove('d-none');
      this.#togglePaymentsLabelAllowed.classList.add('d-none');
    }

    this.dispatchEvent(new CustomEvent(
      this.constructor.events.TOGGLE_PAYMENTS,
      { detail: { acceptingPayments: accepting } }));
  }
}
