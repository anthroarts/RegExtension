import { login } from '../../regfox/regfox_api.js';

const STORAGE_LOCAL_KEY = 'regfox-bearer-details';

/**
 * Class has these main responsibilities.
 * 1. Responds to user input and grabs a new bearer token.
 * 1. Keeps the bearer token fresh and regfox status connected.
 */
export class LoginManager {
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
    console.log(bearerDetails);
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
    const loginResponse = await login(email, password);
    const now = new Date();
    const ttl = now.setMinutes(now.getMinutes() + 10);
    const bearerDetails = { bearerToken: loginResponse.token.token, ttl };

    await this.#setBearerDetails(bearerDetails);
  }
}
