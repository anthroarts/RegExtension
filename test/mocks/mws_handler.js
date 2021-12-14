const { graphql } = require('msw');
const { REGFOX_GRAPHQL_URL } = require('../../src/regfox/regfox_api');

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

module.exports = { getRegistrantsSearchHandler };