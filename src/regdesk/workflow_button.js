// eslint-disable-next-line no-unused-vars
import { RegState } from './states/reg_state.js';

/**
 * Wrapper for one of the side gutter buttons for navigating workflows
 */
export class WorkflowButton {
  #element;

  /**
   * @type {RegState}
   */
  #transitionEventTarget;
  #transitionEvent;

  #buttonClickEvent = 'click';

  /**
   * Initializes a new instance of the WorkflowButton class.
   * @param {Element} buttonElement - The button to wrap
   */
  constructor(buttonElement) {
    this.#element = buttonElement;
    this.#element.addEventListener(this.#buttonClickEvent, this.handleClickEvent.bind(this));
  }

  /**
   * Hide this button.
   * @return {WorkflowButton} - This button.
   */
  invisible() {
    this.#element.classList.remove('visible');
    this.#element.classList.add('invisible');
    return this;
  }

  /**
   * Show this button
   * @return {WorkflowButton} - This button.
   */
  visible() {
    this.#element.classList.remove('invisible');
    this.#element.classList.add('visible');
    return this;
  }

  /**
   * Remove the transition callback registered on the button.
   * @return {WorkflowButton} - This button.
   */
  clearTransitionCallback() {
    this.#transitionEventTarget = undefined;
    this.#transitionEvent = undefined;
    return this;
  }

  /**
   * Register a transition event for this button to fire on a click.
   * Overwrites any existing transitions.
   * @param {RegState} transitionEventSender - The object to send the event through
   * @param {string} event - The event name to send
   * @return {WorkflowButton} - This button.
   */
  setTransitionCallback(transitionEventSender, event) {
    this.#transitionEventTarget = transitionEventSender;
    this.#transitionEvent = event;
    return this;
  }

  /**
   * Dispatch a click event, if relevant to do so.
   */
  handleClickEvent() {
    if (this.#transitionEventTarget) {
      // Only should be attempted if we acutally have a target.
      this.#transitionEventTarget.dispatchTransition(
        this.#transitionEvent,
      );
    }
  }
}
