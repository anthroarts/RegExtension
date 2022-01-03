// eslint-disable-next-line no-unused-vars
import { RegMachineArgs } from './reg_machine_args.js';

/**
 * Basic state class
 */
export class RegState extends EventTarget {
  #regMachineArgs;

  /**
   * Get the cancel gutter button.
   */
  get cancelButton() {
    return this.#regMachineArgs.cancelButton;
  }

  /**
   * Get the print gutter button.
   */
  get printButton() {
    return this.#regMachineArgs.printButton;
  }

  /**
   * Get the PrinterManager.
   */
  get printerManager() {
    return this.#regMachineArgs.printerManager;
  }

  /**
   * Get the CommunicationManager.
   */
  get commManager() {
    return this.#regMachineArgs.commManager;
  }

  #screenRow;
  /**
   * Get the HTML div this reg state manages.
   */
  get screenRow() {
    return this.#screenRow;
  }

  #eventMap;
  /**
   * Get the event map for this state.
   */
  get eventMap() {
    return this.#eventMap;
  }

  /**
   * Initializes a new instance of the RegState class.
   * @param {RegMachineArgs} regMachineArgs - The reg state machine args.
   * @param {*} eventMap - Mapping of this object's transition events to new states.
   */
  constructor(regMachineArgs, eventMap) {
    super();
    // TODO: Make this a Map()?
    this.#eventMap = eventMap;
    this.#regMachineArgs = regMachineArgs;

    // Assumed convention: The CSS ID of the HTML element under management is the
    // class name, but with the first character lowercased
    const className = this.constructor.name;
    const cssId = '#' + className.charAt(0).toLowerCase() + className.slice(1);
    this.#screenRow = regMachineArgs.centerField.querySelector(cssId);
  }

  /**
   * Dispatch a transition event off of this state.
   * @param {string} eventName - The transition event being dispatched
   * @param {*} details - The details object to attach to the event
   */
  dispatchTransition(eventName, details) {
    const event = new CustomEvent(eventName, { detail: details });
    this.dispatchEvent(event);
  }

  /**
   * No-op when entering the state.
   */
  enterState() {}

  /**
   * No-op when exiting the state.
   */
  exitState() {}

  /**
   * Show any elements hidden with hide.
   * @param  {...Element} elements - The elements to show.
   */
  show(...elements) {
    elements.forEach((e) => {
      e.classList.remove('d-none');
    });
  }

  /**
   * Display-none elements.
   * @param  {...Element} elements - The elements to hide.
   */
  hide(...elements) {
    elements.forEach((e) => {
      e.classList.add('d-none');
    });
  }
}
