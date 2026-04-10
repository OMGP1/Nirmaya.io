/**
 * Jest Configuration for Backend Tests
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js', '**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'routes/**/*.js',
        'middleware/**/*.js',
        'schemas/**/*.js',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 10000,
};
