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
  #transitionEventDetails;

  #buttonClickEvent = 'click';

  /**
   * Initializes a new instance of the WorkflowButton class.
   * @param {Element} buttonElement - The button to wrap
   */
  constructor(buttonElement) {
    this.#element = buttonElement;
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
    this.#transitionEventDetails = undefined;
    this.#element.removeEventListener(this.#buttonClickEvent, this.handleClickEvent);
    return this;
  }

  /**
   * Register a transition event for this button to fire on a click.
   * Overwrites any existing transitions.
   * @param {RegState} transitionEventSender - The object to send the event through
   * @param {string} event - The event name to send
   * @param {*} details - Optional details object to add to the event.
   * @return {WorkflowButton} - This button.
   */
  setTransitionCallback(transitionEventSender, event, details) {
    this.clearTransitionCallback();
    this.#transitionEventTarget = transitionEventSender;
    this.#transitionEvent = event;
    this.#transitionEventDetails = details;
    this.#element.addEventListener(this.#buttonClickEvent, this.handleClickEvent.bind(this));
    return this;
  }

  /**
   * Dispatch a click event, if relevant to do so.
   *
   * @description Okay but why though? So we can remove this event listener.
   * Event listeners are identified by the _combination_ of their event, such as
   * 'click', _and_ the _specific_ handler function passed in. See the docs:
   * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
   * Anonymous functions, the ususal way of writing handler methods are abnonymous.
   * Once you send them off to handle the event you can't find them again. Therefore
   * you can't _remove_ that event handler if you need to for any reason.
   * The two options boil down to either "replace the element with a clone which
   * strips the event handlers" or "keep track of your event handlers". This class
   * is how we implemented the latter.
   * Sidenote this is what a "remarks" field is for and I miss it.
   */
  handleClickEvent() {
    if (this.#transitionEventTarget) {
      // Only should be attempted if we acutally have a target.
      this.#transitionEventTarget.dispatchTransition(
        this.#transitionEvent,
        this.#transitionEventDetails,
      );
    }
  }
}
