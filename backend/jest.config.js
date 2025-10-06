module.exports = {
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A preset that is used as a base for Jest's configuration
  preset: '@shelf/jest-mongodb',

  // The test script timeout for tests, in milliseconds
  testTimeout: 20000,
};