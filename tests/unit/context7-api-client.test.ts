/**
 * Unit its for Context7 API Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context7APIClient } from '../../src/services/context7-api-client.js';
import { ServerConfig } from '../../src/types/index.js';
import { ERROR_INVALID_LIBRARY_ID_FORMAT, ERROR_INVALID_LIBRARY_DATA } from '../../src/constants/index.js';

// Mock fetch
global.fetch = vi.fn();

describe('Context7 API Client', () => {
  let client: Context7APIClient;
  let mockConfig: ServerConfig;

  beforeEach(() => {
    mockConfig = {
      transport: 'stdio',
      context7MCPUrl: 'https://mcp.context7.com/mcp',
      context7APIBase: 'https://context7.com/api/v1',
      cacheTTL: 3600000,
      minTokens: 1000,
      defaultTokens: 5000,
      connectionTimeout: 5000,
    };
    client = new Context7APIClient(mockConfig);
    (fetch as vi.Mock).mockClear();
  });

  describe('searchLibraries', () => {
    it('should search libraries successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: [{
            id: '/facebook/react',
            name: 'React',
            description: 'A JavaScript library for building user interfaces',
            owner: 'facebook',
            repo: 'react'
          }]
        })
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await client.searchLibraries('react');

      expect(result).toEqual({
        id: '/facebook/react',
        name: 'React',
        description: 'A JavaScript library for building user interfaces'
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://context7.com/api/v1/search?q=react&limit=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await client.searchLibraries('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

      const result = await client.searchLibraries('react');

      expect(result).toBeNull();
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [] })
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await client.searchLibraries('nonexistent');

      expect(result).toBeNull();
    });

    it('should include API key in headers when provided', async () => {
      const configWithKey = { ...mockConfig, apiKey: 'it-key' };
      const clientWithKey = new Context7APIClient(configWithKey);

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [] })
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      await clientWithKey.searchLibraries('react');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer it-key'
          })
        })
      );
    });
  });

  describe('getLibraryDocs', () => {
    it('should get library documentation successfully', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('# React Documentation\n\nReact is a library...')
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await client.getLibraryDocs('/facebook/react', 'hooks', 2000);

      expect(result).toBe('# React Documentation\n\nReact is a library...');
      expect(fetch).toHaveBeenCalledWith(
        'https://context7.com/api/v1/facebook/react?type=txt&topic=hooks&tokens=2000',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle invalid library ID format', async () => {
      await expect(client.getLibraryDocs('invalid-id')).rejects.toThrow(
        `${ERROR_INVALID_LIBRARY_ID_FORMAT}: invalid-id`
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await client.getLibraryDocs('/facebook/react');

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

      const result = await client.getLibraryDocs('/facebook/react');

      expect(result).toBeNull();
    });

    it('should include optional parameters in URL', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('docs')
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      await client.getLibraryDocs('/facebook/react', 'hooks', 3000);

      expect(fetch).toHaveBeenCalledWith(
        'https://context7.com/api/v1/facebook/react?type=txt&topic=hooks&tokens=3000',
        expect.any(Object)
      );
    });

    it('should work without optional parameters', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('docs')
      };
      (fetch as vi.Mock).mockResolvedValue(mockResponse);

      await client.getLibraryDocs('/facebook/react');

      expect(fetch).toHaveBeenCalledWith(
        'https://context7.com/api/v1/facebook/react?type=txt',
        expect.any(Object)
      );
    });
  });

  describe('Private Methods', () => {
    it('buildLibraryId should create correct ID format', () => {
      const result = (client as any).buildLibraryId('facebook', 'react');
      expect(result).toBe('/facebook/react');
    });

    it('buildLibraryId should throw error for missing data', () => {
      expect(() => (client as any).buildLibraryId('facebook')).toThrow(ERROR_INVALID_LIBRARY_DATA);
      expect(() => (client as any).buildLibraryId(undefined, 'react')).toThrow(ERROR_INVALID_LIBRARY_DATA);
    });

    it('parseLibraryId should parse valid library ID', () => {
      const result = (client as any).parseLibraryId('/facebook/react');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('parseLibraryId should throw error for invalid format', () => {
      expect(() => (client as any).parseLibraryId('invalid')).toThrow(
        `${ERROR_INVALID_LIBRARY_ID_FORMAT}: invalid`
      );
    });

    it('buildSearchUrl should create correct URL', () => {
      const result = (client as any).buildSearchUrl('react');
      expect(result).toBe('https://context7.com/api/v1/search?q=react&limit=1');
    });

    it('buildDocsUrl should create correct URL with parameters', () => {
      const result = (client as any).buildDocsUrl('facebook', 'react', 'hooks', 2000);
      expect(result).toBe('https://context7.com/api/v1/facebook/react?type=txt&topic=hooks&tokens=2000');
    });

    it('buildHeaders should include API key when provided', () => {
      const configWithKey = { ...mockConfig, apiKey: 'it-key' };
      const clientWithKey = new Context7APIClient(configWithKey);
      
      const result = (clientWithKey as any).buildHeaders();
      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer it-key'
      });
    });

    it('buildHeaders should not include API key when not provided', () => {
      const result = (client as any).buildHeaders();
      expect(result).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });
});

