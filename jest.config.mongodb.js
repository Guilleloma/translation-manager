/**
 * Configuración específica de Jest para tests de MongoDB
 */

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.mongodb.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }]
  },
  testMatch: [
    '**/__tests__/**/*mongodb*.(ts|tsx|js)',
    '**/?(*.)+(mongodb).(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 30000, // 30 segundos para operaciones de BD
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(mongodb|mongoose)/)'
  ],
  globalTeardown: '<rootDir>/src/test-teardown.ts'
};
