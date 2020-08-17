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
    renderMathInElement: true,
    CodeMirror: true,
    js_beautify: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-param-reassign': 0,
    'import/extensions': 'off',
    'no-restricted-syntax': 0,
    'max-len': 0,
  },
};
