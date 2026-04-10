/**
 * Jest Test Setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock console for cleaner test output
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: console.error,
};

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
    // Add any cleanup logic here
});
