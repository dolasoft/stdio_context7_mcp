/**
 * Integration its for Library Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LibraryService } from '../../src/services/library-service.js';
import { Context7MCPClient } from '../../src/services/context7-mcp-client.js';
import { Context7APIClient } from '../../src/services/context7-api-client.js';
import { ServerConfig } from '../../src/types/index.js';

// Mock the dependencies
vi.mock('../../src/services/context7-mcp-client.js', () => ({
  Context7MCPClient: vi.fn(),
}));

vi.mock('../../src/services/context7-api-client.js', () => ({
  Context7APIClient: vi.fn(),
}));

describe('Library Service Integration', () => {
  let libraryService: LibraryService;
  let mockMCPClient: vi.Mocked<Context7MCPClient>;
  let mockAPIClient: vi.Mocked<Context7APIClient>;
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

    // Create mock instances
    mockMCPClient = {
      resolveLibrary: vi.fn(),
      getLibraryDocs: vi.fn(),
    } as any;

    mockAPIClient = {
      searchLibraries: vi.fn(),
      getLibraryDocs: vi.fn(),
    } as any;

    // Mock the constructors to return our mock instances
    vi.mocked(Context7MCPClient).mockImplementation(() => mockMCPClient);
    vi.mocked(Context7APIClient).mockImplementation(() => mockAPIClient);

    libraryService = new LibraryService(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveLibrary', () => {
    it('should resolve library via MCP client successfully', async () => {
      const mockLibrary = {
        id: '/facebook/react',
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        trustScore: 10,
        codeSnippets: 1000
      };

      mockMCPClient.resolveLibrary.mockResolvedValue(mockLibrary);

      const result = await libraryService.resolveLibrary('react');

      expect(result).toEqual(mockLibrary);
      expect(mockMCPClient.resolveLibrary).toHaveBeenCalledWith('react');
      expect(mockAPIClient.searchLibraries).not.toHaveBeenCalled();
    });

    it('should fallback to API client when MCP fails', async () => {
      const mockLibrary = {
        id: '/facebook/react',
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        codeSnippets: 1000,
        trustScore: 10,
      };

      mockMCPClient.resolveLibrary.mockResolvedValue(null);
      mockAPIClient.searchLibraries.mockResolvedValue(mockLibrary);

      const result = await libraryService.resolveLibrary('react');

      expect(result).toEqual(mockLibrary);
      expect(mockMCPClient.resolveLibrary).toHaveBeenCalledWith('react');
      expect(mockAPIClient.searchLibraries).toHaveBeenCalledWith('react');
    });

    it('should throw error when both MCP and API fail', async () => {
      mockMCPClient.resolveLibrary.mockResolvedValue(null);
      mockAPIClient.searchLibraries.mockResolvedValue(null);

      await expect(libraryService.resolveLibrary('nonexistent')).rejects.toThrow(
        'Library "nonexistent" not found'
      );
    });

    it('should handle MCP client errors gracefully', async () => {
      const mockLibrary = {
        id: '/facebook/react',
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        codeSnippets: 1000,
        trustScore: 10,
      };

      mockMCPClient.resolveLibrary.mockRejectedValue(new Error('MCP Error'));
      mockAPIClient.searchLibraries.mockResolvedValue(mockLibrary);

      const result = await libraryService.resolveLibrary('react');

      expect(result).toEqual(mockLibrary);
      expect(mockAPIClient.searchLibraries).toHaveBeenCalledWith('react');
    });

    it('should handle API client errors gracefully', async () => {
      mockMCPClient.resolveLibrary.mockResolvedValue(null);
      mockAPIClient.searchLibraries.mockRejectedValue(new Error('API Error'));

      await expect(libraryService.resolveLibrary('react')).rejects.toThrow(
        'Library "react" not found'
      );
    });
  });

  describe('getLibraryDocs', () => {
    it('should get docs via MCP client successfully', async () => {
      const mockDocs = '# React Documentation\n\nReact is a library...';
      mockMCPClient.getLibraryDocs.mockResolvedValue(mockDocs);

      const result = await libraryService.getLibraryDocs('/facebook/react', 'hooks', 2000);

      expect(result).toBe(mockDocs);
      expect(mockMCPClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', 'hooks', 2000);
      expect(mockAPIClient.getLibraryDocs).not.toHaveBeenCalled();
    });

    it('should fallback to API client when MCP fails', async () => {
      const mockDocs = '# React Documentation\n\nReact is a library...';
      mockMCPClient.getLibraryDocs.mockResolvedValue(null);
      mockAPIClient.getLibraryDocs.mockResolvedValue(mockDocs);

      const result = await libraryService.getLibraryDocs('/facebook/react', 'hooks', 2000);

      expect(result).toBe(mockDocs);
      expect(mockMCPClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', 'hooks', 2000);
      expect(mockAPIClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', 'hooks', 2000);
    });

    it('should throw error when both MCP and API fail', async () => {
      mockMCPClient.getLibraryDocs.mockResolvedValue(null);
      mockAPIClient.getLibraryDocs.mockResolvedValue(null);

      await expect(libraryService.getLibraryDocs('/facebook/react')).rejects.toThrow(
        'Failed to fetch documentation for "/facebook/react"'
      );
    });

    it('should handle MCP client errors gracefully', async () => {
      const mockDocs = '# React Documentation\n\nReact is a library...';
      mockMCPClient.getLibraryDocs.mockRejectedValue(new Error('MCP Error'));
      mockAPIClient.getLibraryDocs.mockResolvedValue(mockDocs);

      const result = await libraryService.getLibraryDocs('/facebook/react');

      expect(result).toBe(mockDocs);
      expect(mockAPIClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', undefined, 5000);
    });

    it('should handle API client errors gracefully', async () => {
      mockMCPClient.getLibraryDocs.mockResolvedValue(null);
      mockAPIClient.getLibraryDocs.mockRejectedValue(new Error('API Error'));

      await expect(libraryService.getLibraryDocs('/facebook/react')).rejects.toThrow(
        'Failed to fetch documentation for "/facebook/react"'
      );
    });

    it('should enforce minimum tokens', async () => {
      const mockDocs = '# React Documentation';
      mockMCPClient.getLibraryDocs.mockResolvedValue(mockDocs);

      await libraryService.getLibraryDocs('/facebook/react', undefined, 500); // Below minimum

      expect(mockMCPClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', undefined, 1000);
    });

    it('should use default tokens when not provided', async () => {
      const mockDocs = '# React Documentation';
      mockMCPClient.getLibraryDocs.mockResolvedValue(mockDocs);

      await libraryService.getLibraryDocs('/facebook/react');

      expect(mockMCPClient.getLibraryDocs).toHaveBeenCalledWith('/facebook/react', undefined, 5000);
    });
  });

  describe('getStats', () => {
    it('should return service statistics', () => {
      const stats = libraryService.getStats();
      
      expect(stats).toHaveProperty('cacheStats');
      expect(stats.cacheStats).toHaveProperty('size');
      expect(stats.cacheStats).toHaveProperty('keys');
    });
  });
});

