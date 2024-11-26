const nextJest = require('next/jest');

// Provide the path to your Next.js app to load its configuration.
const createJestConfig = nextJest({
  dir: './',  // Adjust this if your next app is in a different directory
});

const customJestConfig = {
  moduleNameMapper: {
    // Handle module aliasing in your Next.js project
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',  // Use jsdom to simulate a browser environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // Add if you need additional setup files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Ensure Babel transforms your JS/TS files
  },
  // Add any additional custom Jest configuration options here if necessary
};

module.exports = createJestConfig(customJestConfig);