module.exports = {
  '*.{js,ts,tsx}': ['eslint --fix', 'eslint', 'prettier --write'],
  '*.{json,yaml,yml}': ['prettier --write'],
  '**/*.ts?(x)': () => 'yarn type-check',
};
