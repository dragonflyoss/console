module.exports = {
  '*.{js,ts,tsx,}': ['eslint --fix'],
  '**/*.ts?(x)': () => 'yarn type-check',
  '*.{json,yaml,yml}': ['prettier --write'],
};
