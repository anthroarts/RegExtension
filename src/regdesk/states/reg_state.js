// eslint-disable-next-line no-unused-vars
import { RegMachineArgs } from './reg_machine_args.js';

/**
 * Basic state class
 */
export class RegState extends EventTarget {
  #regMachineArgs;

  /**
   * Get the left gutter button
   */
  get leftButton() {
    return this.#regMachineArgs.leftButton;
  }

  /**
   * Get the right gutter button.
   */
  get rightButton() {
    return this.#regMachineArgs.rightButton;
  }

  /**
   * Get the center field of the page display.
   */
  get centerField() {
    return this.#regMachineArgs.centerField;
  }

  /**
   * Get the PrinterManager
   */
  get printerManager() {
    return this.#regMachineArgs.printerManager;
  }

  /**
   * Get the CommunicationManager
   */
  get commManager() {
    return this.#regMachineArgs.commManager;
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
}
