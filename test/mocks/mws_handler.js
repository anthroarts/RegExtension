import { graphql, rest } from 'msw';
import { REGFOX_GRAPHQL_URL, REGFOX_EXCHANGE_TOKEN_URL } from '../../src/regfox/regfox_api.js';

const regfox = graphql.link(REGFOX_GRAPHQL_URL)

const getRegistrantsSearchHandler = (getResponse) => {
  return [
    regfox.query('RegistrantsSearch', (req, res, ctx) => {
      return res(
        ctx.data({ response: getResponse(req) }),
      );
    }),
  ];
}

const exchangeBearerTokenHandler = (getResponse) => {
  return [
    rest.put(REGFOX_EXCHANGE_TOKEN_URL, (req, res, ctx) => {
      return res(
        ctx.json(getResponse(req))
      );
    }),
  ];
}

export { getRegistrantsSearchHandler, exchangeBearerTokenHandler };