// TODO It would probably be better to use a library to properly construct this schema.
const GRAPHQL_AUTH_LOGIN_MUTATION_QUERY = `
mutation AuthLoginMutation(
  $realm: String!
  $email: String!
  $password: String!
  $organizationSlug: String
  $accountId: Int
) {
  mutationResponse: authLogin(
    input: {
      realm: $realm
      email: $email
      password: $password
      organizationSlug: $organizationSlug
      accountId: $accountId
    }
  ) {
    success
    errors {
      field
      messages
      __typename
    }
    token {
      tokenType
      token
      accountId
      prompt2FA
      __typename
    }
    __typename
  }
}
`;


const buildAuthLoginMutationBody = (email, password) => {
  return {
    'operationName': 'AuthLoginMutation',
    'variables': {
      'organizationSlug': '',
      'realm': 'user',
      'email': email,
      'password': password,
    },
    'query': GRAPHQL_AUTH_LOGIN_MUTATION_QUERY,
  };
};

export { buildAuthLoginMutationBody };
