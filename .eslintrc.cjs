module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 13,
    'sourceType': 'module',
  },
  'rules': {
    'linebreak-style': 'off',
    'max-len': 'off',
    'prefer-const': 'error',
    'object-curly-spacing': ['error', 'always'],
    'indent': ['error', 2, {
      'FunctionDeclaration': {
        'parameters': 1,
        'body': 1,
      },
    }],
  },
};
