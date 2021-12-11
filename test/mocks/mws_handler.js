const { graphql } = require('msw');
const { REGFOX_GRAPHQL_URL } = require('../../src/regfox/regfox_api');

const regfox = graphql.link(REGFOX_GRAPHQL_URL)

const handlers_registrantsSearchSuccess = [
  regfox.query('RegistrantsSearch', (req, res, ctx) => {
    return res(
      ctx.data({
        response: {
          success: true,
          registrants: [{
            name: 'Bob',
          }]
        }
      }),
    )
  }),
];

const handlers_registrantsSearchErrors = [
  regfox.query('RegistrantsSearch', (req, res, ctx) => {
    return res(
      ctx.data({
        response: {
          errors: ['heky!'],
          registrants: [{
            name: 'Fred',
          }]
        }
      }),
    )
  }),
];

const handlers_registrantsSearchResponseErrors = [
  regfox.query('RegistrantsSearch', (req, res, ctx) => {
    return res(
      ctx.data({
        response: {
          success: false,
          registrants: [{
            name: 'George',
          }]
        }
      }),
    )
  }),
];

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