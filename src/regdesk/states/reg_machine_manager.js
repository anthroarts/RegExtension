import { LoadingSearchResultState } from './loading_search_result_state.js';
import { MultipleResultState } from './multiple_result_state.js';
import { NewSearchState } from './new_search_state.js';
import { SingleResultState } from './single_result_state.js';
import { UnpaidResultState } from './unpaid_result_state.js';
// eslint-disable-next-line no-unused-vars
import { RegMachineArgs } from './reg_machine_args.js';

/**
 * State mchine manager for the reg lookup interface.
 */
export class RegMachineManager {
  /**
   * Stores the state machine.
   */
  #machine;

  /**
   * Gets the state machine for this machine
   */
  get machine() {
    return this.#machine;
  }

  /**
   * Stores the current state of the machine.
   */
  #currentState;

  #regMachineArgs;

  /**
   * Initializes a new instance of the RegMachineManager class.
   * @param {RegMachineArgs} regMachineArgs - The standard record for each state class.
   */
  constructor(regMachineArgs) {
    this.#regMachineArgs = regMachineArgs;

    const machine = {
      states: {},
    };

    // TODO: Is there a better way to store this?
    const eventMap = [
      {
        type: LoadingSearchResultState,
        events: {
          [LoadingSearchResultState.events.CANCEL]: () => NewSearchState.name,
          [LoadingSearchResultState.events.SINGLE_RESULT_READY]: this.#maybeSingleResultToUnpaid.bind(this),
          [LoadingSearchResultState.events.MULTIPLE_RESULTS_READY]: () => MultipleResultState.name,
        },
      },
      {
        type: NewSearchState,
        events: {
          [NewSearchState.events.START_SEARCH]: () => LoadingSearchResultState.name,
          [NewSearchState.events.RESET]: () => NewSearchState.name,
        },
      },
      {
        type: SingleResultState,
        events: {
          [SingleResultState.events.BADGE_PRINTED]: () => NewSearchState.name,
          [SingleResultState.events.CANCEL]: this.#maybeCancelSingleResultToMultipleResult.bind(this),
        },
      },
      {
        type: UnpaidResultState,
        events: {
          [UnpaidResultState.events.CANCEL]: this.#maybeCancelSingleResultToMultipleResult.bind(this),
          [UnpaidResultState.events.PAID]: () => SingleResultState.name,
        },
      },
      {
        type: MultipleResultState,
        events: {
          [MultipleResultState.events.CANCEL]: () => NewSearchState.name,
          [MultipleResultState.events.SELECTED_SINGLE_RESULT]: this.#maybeSingleResultToUnpaid.bind(this),
        },
      },
    ];

    // TODO: Probably a way to merge the event map with the machine declaration
    // whem I'm not mentally fried on my third flight of the day.
    eventMap.forEach((state) => {
      // Interesting, eslint doesn't handle this correctly.
      // eslint-disable-next-line new-cap
      machine.states[state.type.name] = new state.type(regMachineArgs, state.events);

      for (const [eventName] of Object.entries(state.events)) {
        machine.states[state.type.name]
          .addEventListener(eventName, (e) => this.transition(e));
      }
    });

    this.#machine = machine;
    this.transition(new CustomEvent(NewSearchState.events.RESET), NewSearchState.name);
  }

  /**
   * Apply the transition of an event to the current state.
   * @param {CustomEvent} event - The event triggered on the current state.
   * @param {RegState} state - The current state.
   * @return {string} - The resulting state.
   */
  transition(event, state = this.#currentState) {
    // TODO: If an invalid event is fired this is currently throwing an error.
    // Investigate why it isn't properly coalescing.
    const nextStateName = this.#machine
      .states[state]
      .eventMap?.[event.type]?.() ??
      state;

    try {
      this.#machine.states[state]?.exitState?.(event);
    } catch (e) {
      // TODO: Display an error or something.
      console.error(`Failed to run actions from ${state} exit event ${event.type}.`, e);
    }

    try {
      this.#machine.states[nextStateName]?.enterState?.(event);
    } catch (e) {
      // TODO: Display an error or something.
      console.error(`Failed to run actions from ${state} enter event ${event.type}.`, e);
    }

    this.#currentState = nextStateName;
    return this.#currentState;
  }

  /**
   * Determine if a cancel should go back to a multiple result page or the new search page.
   * @return {string} - The next state to switch to.
   */
  #maybeCancelSingleResultToMultipleResult() {
    if (this.#machine.states[MultipleResultState.name].hasMultipleResults) {
      return MultipleResultState.name;
    } else {
      return NewSearchState.name;
    }
  }

  /**
   * Determine if a single result is unpaid and should get an unpaid screen.
   * @return {string} - The next state to switch to.
   */
  #maybeSingleResultToUnpaid() {
    if (this.#regMachineArgs.commManager.selectedSearchResult?.amountDue === 0) {
      return SingleResultState.name;
    } else {
      return UnpaidResultState.name;
    }
  }
}
