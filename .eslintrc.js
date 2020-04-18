module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  extends: ['airbnb-base'],
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
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-param-reassign": 0
  },
};
