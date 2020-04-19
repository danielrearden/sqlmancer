module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/all',
  ],
  rules: {
    '@typescript-eslint/member-delimiter-style': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-var-requires': ['off'],
    'jest/prefer-expect-assertions': ['off'],
    'jest/no-hooks': ['off'],
    'jest/no-expect-resolves': ['off'],
    'jest/prefer-inline-snapshots': ['off'],
    'jest/lowercase-name': ['off'],
    'jest/consistent-test-it': [
      'error',
      {
        fn: 'test',
        withinDescribe: 'test',
      },
    ],
  },
}
