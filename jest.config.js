<<<<<<< HEAD
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');
=======
// jest.config.js

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.test.json');
>>>>>>> 77f930577d6f878e48ed4d2165670eacb47ec513

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
<<<<<<< HEAD
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!(your-esm-module|another-esm-module)/)'],
};
=======
  //testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', // Add this line
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ["/node_modules/(?!@prisma/client)"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),

};



>>>>>>> 77f930577d6f878e48ed4d2165670eacb47ec513
