import { graphql, rest } from 'msw';
import { TEST_REGFOX_GRAPHQL_URL, TEST_REGFOX_EXCHANGE_TOKEN_URL, testGetRegistrationInfoUrl, testGetMarkRegistrationCompleteUrl } from '../../src/regfox/regfox_api.js';

const regfox = graphql.link(TEST_REGFOX_GRAPHQL_URL);

const getRegistrantsSearchHandler = (getResponse) => {
  return [
    regfox.query('RegistrantsSearch', (req, res, ctx) => {
      return res(
        ctx.data({ response: getResponse(req) }),
      );
    }),
  ];
};

const exchangeBearerTokenHandler = (getResponse) => {
  return [
    rest.put(TEST_REGFOX_EXCHANGE_TOKEN_URL, (req, res, ctx) => {
      return res(
        ctx.json(getResponse(req)),
      );
    }),
  ];
};

const loginHandler = (getResponse) => {
  return [
    regfox.mutation('AuthLoginMutation', (req, res, ctx) => {
      return res(
        ctx.data({ mutationResponse: getResponse(req) }),
      );
    }),
  ];
};

const getRegistrationInfoHandler = (id, getResponse) => {
  return [
    rest.get(testGetRegistrationInfoUrl(id), (req, res, ctx) => {
      return res(
        ctx.json(getResponse(req)),
      );
    }),
  ];
};

const markRegistrationCompleteHandler = (formId, registrationId, getResponse) => {
  return [
    rest.put(testGetMarkRegistrationCompleteUrl(formId, registrationId), (req, res, ctx) => {
      return res(
        ctx.json(getResponse(req)),
      );
    }),
  ];
};

export { getRegistrantsSearchHandler, exchangeBearerTokenHandler, loginHandler, getRegistrationInfoHandler, markRegistrationCompleteHandler };
