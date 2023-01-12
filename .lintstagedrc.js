module.exports = {
  '*.{js,ts,tsx,yml,yaml}': ['eslint --fix'],
  '**/*.ts?(x)': () => 'yarn type-check',
};
