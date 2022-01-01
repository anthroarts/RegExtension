import { LoadingSearchResultState } from './loading_state.js';
import { NewSearchState } from './new_search_state.js';
import { SingleResultState } from './single_result_state.js';

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

  /**
   * Initializes a new instance of the RegMachineManager class.
   * @param {RegMachineArgs} regMachineArgs - The standard record for each state class.
   */
  constructor(regMachineArgs) {
    const machine = {
      initial: NewSearchState.name,
      states: {},
    };

    // TODO: Is there a better way to store this?
    const eventMap = [
      {
        type: LoadingSearchResultState,
        events: {
          [LoadingSearchResultState.events.CANCEL]: NewSearchState.name,
          [LoadingSearchResultState.events.SINGLE_RESULT_READY]: SingleResultState.name,
        },
      },
      {
        type: NewSearchState,
        events: {
          [NewSearchState.events.START_SEARCH]: LoadingSearchResultState.name,
          [NewSearchState.events.RESET]: NewSearchState.name,
        },
      },
      {
        type: SingleResultState,
        events: {
          [SingleResultState.events.CANCEL]: NewSearchState.name,
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
    this.#currentState = machine.initial;
  }

  /**
   * Apply the transition of an event to the current state.
   * @param {CustomEvent} event - The event triggered on the current state.
   * @param {RegState} state - The current state.
   * @return {string} - The resulting state.
   */
  transition(event, state = this.#currentState) {
    console.log('TRANSITION!', event);
    const nextStateName = this.#machine
      .states[state]
      .eventMap?.[event.type] ??
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
}
