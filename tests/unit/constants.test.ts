/**
 * Unit its for constants
 */

import { describe, it, expect } from 'vitest';
import {
  SERVER_NAME,
  SERVER_VERSION,
  MIN_TOKENS,
  DEFAULT_TOKENS,
  CONNECTION_TIMEOUT_MS,
  CACHE_TTL_MS,
  CONTEXT7_MCP_URL,
  CONTEXT7_API_BASE,
  ERROR_INVALID_LIBRARY_ID_FORMAT,
  DEFAULT_DESCRIPTION,
  URL_PARAMS,
  HTTP_METHODS,
  AUTH_BEARER_PREFIX,
  LOG_LEVELS,
  TRANSPORT_TYPES,
} from '../../src/constants/index.js';

describe('Constants', () => {
  describe('Server Configuration', () => {
    it('should have correct server name', () => {
      expect(SERVER_NAME).toBe('stdio-context7-mcp');
    });

    it('should have correct server version', () => {
      expect(SERVER_VERSION).toBe('1.0.0');
    });
  });

  describe('Token Configuration', () => {
    it('should have correct minimum tokens', () => {
      expect(MIN_TOKENS).toBe(1000);
    });

    it('should have correct default tokens', () => {
      expect(DEFAULT_TOKENS).toBe(5000);
    });

    it('should have minimum tokens less than default', () => {
      expect(MIN_TOKENS).toBeLessThan(DEFAULT_TOKENS);
    });
  });

  describe('Timeout Configuration', () => {
    it('should have reasonable connection timeout', () => {
      expect(CONNECTION_TIMEOUT_MS).toBe(5000);
      expect(CONNECTION_TIMEOUT_MS).toBeGreaterThan(0);
    });

    it('should have reasonable cache TTL', () => {
      expect(CACHE_TTL_MS).toBe(3600000); // 1 hour
      expect(CACHE_TTL_MS).toBeGreaterThan(0);
    });
  });

  describe('API Endpoints', () => {
    it('should have correct Context7 MCP URL', () => {
      expect(CONTEXT7_MCP_URL).toBe('https://mcp.context7.com/mcp');
      expect(CONTEXT7_MCP_URL).toMatch(/^https:\/\//);
    });

    it('should have correct Context7 API base', () => {
      expect(CONTEXT7_API_BASE).toBe('https://context7.com/api/v1');
      expect(CONTEXT7_API_BASE).toMatch(/^https:\/\//);
    });
  });

  describe('Error Messages', () => {
    it('should have descriptive error messages', () => {
      expect(ERROR_INVALID_LIBRARY_ID_FORMAT).toContain('Invalid library ID format');
      expect(ERROR_INVALID_LIBRARY_ID_FORMAT).toContain('/owner/repo');
    });
  });

  describe('Default Values', () => {
    it('should have reasonable default description', () => {
      expect(DEFAULT_DESCRIPTION).toBe('No description available');
    });
  });

  describe('URL Parameters', () => {
    it('should have all required URL parameter keys', () => {
      expect(URL_PARAMS).toHaveProperty('QUERY', 'q');
      expect(URL_PARAMS).toHaveProperty('LIMIT', 'limit');
      expect(URL_PARAMS).toHaveProperty('TYPE', 'type');
      expect(URL_PARAMS).toHaveProperty('TOPIC', 'topic');
      expect(URL_PARAMS).toHaveProperty('TOKENS', 'tokens');
    });
  });

  describe('HTTP Methods', () => {
    it('should have POST method', () => {
      expect(HTTP_METHODS).toHaveProperty('POST', 'POST');
    });
  });

  describe('Authorization', () => {
    it('should have correct bearer prefix', () => {
      expect(AUTH_BEARER_PREFIX).toBe('Bearer ');
    });
  });

  describe('Log Levels', () => {
    it('should have all log levels', () => {
      expect(LOG_LEVELS).toHaveProperty('INFO', 'info');
      expect(LOG_LEVELS).toHaveProperty('WARN', 'warn');
      expect(LOG_LEVELS).toHaveProperty('ERROR', 'error');
      expect(LOG_LEVELS).toHaveProperty('DEBUG', 'debug');
    });
  });

  describe('Transport Types', () => {
    it('should have all transport types', () => {
      expect(TRANSPORT_TYPES).toHaveProperty('STDIO', 'stdio');
      expect(TRANSPORT_TYPES).toHaveProperty('HTTP', 'http');
      expect(TRANSPORT_TYPES).toHaveProperty('SSE', 'sse');
    });
  });
});

