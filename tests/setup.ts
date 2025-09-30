/**
 * Vitest setup file for the Context7 MCP Server tests
 */

import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_ROUTE_URL = 'http://localhost:3000/api/logs';

// Mock console methods to avoid noise in tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock fetch globally
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Reset the UnifiedLogger singleton
  if (typeof (global as any).UnifiedLogger !== 'undefined') {
    (global as any).UnifiedLogger.resetInstance();
  }
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  // Clear any pending timers
  vi.clearAllTimers();
});

// Set test timeout
vi.setConfig({
  testTimeout: 5000,
});