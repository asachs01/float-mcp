import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.integration.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
