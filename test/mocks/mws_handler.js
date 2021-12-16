import { graphql } from 'msw';
import { REGFOX_GRAPHQL_URL } from '../../src/regfox/regfox_api.js';

const regfox = graphql.link(REGFOX_GRAPHQL_URL)

const getRegistrantsSearchHandler = (getResponse) => {
  return [
    regfox.query('RegistrantsSearch', (req, res, ctx) => {
      return res(
        ctx.data({ response: getResponse(req) }),
      )
    }),
  ];
}

export { getRegistrantsSearchHandler };