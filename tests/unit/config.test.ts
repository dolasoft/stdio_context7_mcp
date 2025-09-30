/**
 * Unit its for configuration management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, validateConfig } from '../../src/config/index.js';
import { ServerConfig } from '../../src/types/index.js';

// Mock process.argv
const originalArgv = process.argv;
const originalEnv = process.env;

describe('Configuration Management', () => {
  beforeEach(() => {
    process.argv = ['node', 'it.js'];
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return default configuration', () => {
      const config = getConfig();
      
      expect(config).toHaveProperty('transport', 'stdio');
      expect(config).toHaveProperty('context7MCPUrl', 'https://mcp.context7.com/mcp');
      expect(config).toHaveProperty('context7APIBase', 'https://context7.com/api/v1');
      expect(config).toHaveProperty('cacheTTL', 3600000);
      expect(config).toHaveProperty('minTokens', 1000);
      expect(config).toHaveProperty('defaultTokens', 5000);
      expect(config).toHaveProperty('connectionTimeout', 5000);
    });

    it('should parse CLI arguments', () => {
      process.argv = ['node', 'it.js', '--api-key', 'it-key', '--transport', 'http'];
      
      const config = getConfig();
      
      expect(config.apiKey).toBe('it-key');
      expect(config.transport).toBe('http');
    });

    it('should override with environment variables', () => {
      process.env.CONTEXT7_API_KEY = 'env-key';
      process.env.MCP_TRANSPORT = 'sse';
      
      const config = getConfig();
      
      expect(config.apiKey).toBe('env-key');
      expect(config.transport).toBe('sse');
    });

    it('should prioritize environment variables over CLI args', () => {
      process.argv = ['node', 'it.js', '--api-key', 'cli-key'];
      process.env.CONTEXT7_API_KEY = 'env-key';
      
      const config = getConfig();
      
      expect(config.apiKey).toBe('env-key');
    });

    it('should handle invalid transport gracefully', () => {
      process.argv = ['node', 'it.js', '--transport', 'invalid'];
      
      const config = getConfig();
      
      expect(config.transport).toBe('stdio'); // Should fall back to default
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const validConfig: ServerConfig = {
        transport: 'stdio',
        context7MCPUrl: 'https://mcp.context7.com/mcp',
        context7APIBase: 'https://context7.com/api/v1',
        cacheTTL: 3600000,
        minTokens: 1000,
        defaultTokens: 5000,
        connectionTimeout: 5000,
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should throw error for connection timeout too low', () => {
      const invalidConfig: ServerConfig = {
        transport: 'stdio',
        context7MCPUrl: 'https://mcp.context7.com/mcp',
        context7APIBase: 'https://context7.com/api/v1',
        cacheTTL: 3600000,
        minTokens: 1000,
        defaultTokens: 5000,
        connectionTimeout: 500, // Too low
      };

      expect(() => validateConfig(invalidConfig)).toThrow('Connection timeout must be at least 1000ms');
    });

    it('should throw error for min tokens too low', () => {
      const invalidConfig: ServerConfig = {
        transport: 'stdio',
        context7MCPUrl: 'https://mcp.context7.com/mcp',
        context7APIBase: 'https://context7.com/api/v1',
        cacheTTL: 3600000,
        minTokens: 50, // Too low
        defaultTokens: 5000,
        connectionTimeout: 5000,
      };

      expect(() => validateConfig(invalidConfig)).toThrow('Minimum tokens must be at least 100');
    });

    it('should throw error for default tokens less than min tokens', () => {
      const invalidConfig: ServerConfig = {
        transport: 'stdio',
        context7MCPUrl: 'https://mcp.context7.com/mcp',
        context7APIBase: 'https://context7.com/api/v1',
        cacheTTL: 3600000,
        minTokens: 2000,
        defaultTokens: 1000, // Less than min tokens
        connectionTimeout: 5000,
      };

      expect(() => validateConfig(invalidConfig)).toThrow('Default tokens must be greater than or equal to minimum tokens');
    });
  });
});

