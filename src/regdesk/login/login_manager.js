import { RegfoxApi } from '../../regfox/regfox_api.js';

const STORAGE_LOCAL_KEY = 'regfox-bearer-details';

/**
 * Class has these main responsibilities.
 * 1. Responds to user input and grabs a new bearer token.
 * 1. Keeps the bearer token fresh and regfox status connected.
 */
export class LoginManager extends EventTarget {
  /**
   * Get the events this class supports
   */
  static get events() {
    return {
      SET_REGFOX_LOGIN_STATUS: 'SET_REGFOX_LOGIN_STATUS',
    };
  }

  static #instance;
  /** Only one instance of LoginManager can exist. */
  constructor() {
    if (LoginManager.#instance) {
      throw new Error('LoginManager already has an instance!!!');
    }
    super();
    LoginManager.#instance = this;
    chrome.storage.onChanged.addListener(this.#onChange.bind(this));

    setInterval(async () => {
      try {
        await this.refresh();
      } catch (e) {
        console.error('Failed to refresh bearer token, user will need to re-login.', e);
        await this.#setBearerDetails(null);
      }
    }, 1000 * 30); // 30 seconds.
  }

  /**
   * Listener to chrome.storage.onChanged events to trigger the isLoggedInListeners.
   * @param {*} changes from chrome.storage.onChanged
   */
  #onChange(changes) {
    const isLoggedIn = changes?.[STORAGE_LOCAL_KEY]?.newValue?.ttl > Date.now();
    this.dispatchEvent(new CustomEvent(
      this.constructor.events.SET_REGFOX_LOGIN_STATUS,
      { detail: { isLoggedIn } }));
  }

  /**
   * Will refresh the bearerDetails if they are stale.
   * @param {boolean} ignoreTtl true if this should "force" a refresh, ignoring the ttl timeout.
   */
  async refresh(ignoreTtl = false) {
    const bearerDetails = await this.#getBearerDetails();
    if (bearerDetails == null) {
      return;
    }

    const now = new Date();
    const oneMinuteFromNow = (new Date()).setMinutes(now.getMinutes() + 1);
    if (bearerDetails.ttl > oneMinuteFromNow && !ignoreTtl) {
      return;
    }

    const response = await RegfoxApi.exchangeBearerToken(bearerDetails.bearerToken);
    const ttl = (new Date()).setSeconds(now.getSeconds() + response.ttl);
    await this.#setBearerDetails(this.#makeBearerDetails(response.token, ttl));
  }

  /**
   * @return {*} the full bearerDetails, which includes the bearerToken, and TTL.
   */
  async #getBearerDetails() {
    return chrome.storage.local.get([STORAGE_LOCAL_KEY]).then((o) => o?.[STORAGE_LOCAL_KEY]);
  }

  /**
   * @param {*} bearerDetails which includes the bearerToken, and the TTL.
   */
  async #setBearerDetails(bearerDetails) {
    await chrome.storage.local.set({ [STORAGE_LOCAL_KEY]: bearerDetails });
  }

  /**
   * @return {string} the bearerToken which can be passed to other regfox APIs.
   */
  async getBearerToken() {
    return this.#getBearerDetails().then((o) => o?.bearerToken);
  }

  /**
   * @return {boolean} indicating true/false if the user is logged in.
   */
  async isLoggedIn() {
    return this.#getBearerDetails().then((o) => o?.ttl > Date.now());
  }

  /**
   * Sets the user as logged out and deletes the current bearerToken.
   */
  async logout() {
    await this.#setBearerDetails(null);
  }

  /**
   * Logs in the user.
   * @param {*} email from the login modal.
   * @param {*} password from the login modal.
   */
  async login(email, password) {
    const loginResponse = await RegfoxApi.login(email, password);
    const bearerDetails = this.#makeBearerDetails(loginResponse.token.token);

    await this.#setBearerDetails(bearerDetails);
    await this.refresh(/* ignoreTtl= */ true);
  }

  /**
   * @param {string} bearerToken from login.
   * @param {*} ttl the time (in milliseconds since epoch) this bearerToken expires.
   * @return {*} bearerDetails.
   */
  #makeBearerDetails(bearerToken, ttl = (new Date()).setMinutes((new Date()).getMinutes() + 10)) {
    return { bearerToken, ttl };
  }
}
