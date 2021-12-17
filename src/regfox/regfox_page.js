import { get } from 'lodash-es';

/**
 * Returns the bearer token out of local storage, assuming the user is logged in.
 * Returns undefined if the bearer token cannot be found. Only works when run as a content script.
 */
const getBearerToken = () => {
  const session = JSON.parse(localStorage.getItem('wbcx_sessions'));
  return get(session, '1311.token'); // 1311 is a magic number that means "FC", you can find it in the URL.
}

export { getBearerToken };