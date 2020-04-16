module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  extends: ['prettier', 'airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    d3: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
  },
  plugins: ['prettier'],
};
