const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Add more setup options before each test is run.
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}', '!**/node_modules/**'],
  moduleNameMapper: {
    // Handle module aliases.
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
