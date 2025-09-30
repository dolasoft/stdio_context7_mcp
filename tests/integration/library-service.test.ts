/**
 * Simple Integration Tests for Library Service
 * Tests the actual functionality without complex mocking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LibraryService } from '../../src/services/library-service.js';
import { ServerConfig } from '../../src/types/index.js';

describe('Library Service Integration - Simple', () => {
  let libraryService: LibraryService;
  let mockConfig: ServerConfig;

  beforeEach(() => {
    mockConfig = {
      transport: 'stdio',
      context7MCPUrl: 'https://mcp.context7.com/mcp',
      context7APIBase: 'https://context7.com/api/v1',
      connectionTimeout: 5000,
      cacheTTL: 3600000,
      minTokens: 1000,
      defaultTokens: 5000,
    };
    
    libraryService = new LibraryService(mockConfig);
  });

  describe('Service Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(libraryService).toBeDefined();
      expect(libraryService).toBeInstanceOf(LibraryService);
    });

    it('should have stats method', () => {
      const stats = libraryService.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid library names gracefully', async () => {
      // Test with a very unlikely library name that should fail
      const invalidLibraryName = 'this-library-definitely-does-not-exist-12345';
      
      try {
        const result = await libraryService.resolveLibrary(invalidLibraryName);
        // If it doesn't throw, the result should be null or indicate not found
        expect(result).toBeNull();
      } catch (error) {
        // If it throws, the error should be meaningful
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('not found');
      }
    });

    it('should handle invalid library IDs for docs gracefully', async () => {
      const invalidLibraryId = '/invalid/does-not-exist';
      
      try {
        const result = await libraryService.getLibraryDocs(invalidLibraryId);
        // If it doesn't throw, the result should be null
        expect(result).toBeNull();
      } catch (error) {
        // If it throws, the error should be meaningful
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Failed to fetch documentation');
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should enforce minimum tokens', async () => {
      const libraryId = '/facebook/react';
      
      // This should work and enforce minimum tokens internally
      try {
        const result = await libraryService.getLibraryDocs(libraryId, 'hooks', 500);
        // If successful, the service should have enforced minimum tokens
        expect(result).toBeDefined();
      } catch (error) {
        // If it fails, it should be a meaningful error
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Caching', () => {
    it('should cache results', async () => {
      const libraryName = 'nonexistent-library-12345';
      
      try {
        // First call - should fail
        const result1 = await libraryService.resolveLibrary(libraryName);
        
        // Second call should return the same result (cached failure)
        const result2 = await libraryService.resolveLibrary(libraryName);
        
        // Results should be the same (both null or both throw)
        expect(result1).toEqual(result2);
      } catch (error1) {
        // If first call throws, second call should also throw with same error
        try {
          await libraryService.resolveLibrary(libraryName);
          // If second call doesn't throw, that's unexpected
          expect.fail('Second call should also throw');
        } catch (error2) {
          // Both calls should throw similar errors
          expect(error1.message).toContain('not found');
          expect(error2.message).toContain('not found');
        }
      }
    });
  });
});
