/**
 * Library Service
 * Main service that orchestrates library resolution and documentation retrieval
 */

import { LibraryInfo, Context7Client, ServerConfig } from '../types/index.js';
import { Context7MCPClient } from './context7-mcp-client.js';
import { Context7APIClient } from './context7-api-client.js';
import { cache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { 
  CACHE_KEY_PREFIX_RESOLVE, 
  CACHE_KEY_PREFIX_DOCS,
  ERROR_LIBRARY_NOT_FOUND,
  ERROR_DOCS_RETRIEVAL_FAILED
} from '../constants/index.js';

export class LibraryService implements Context7Client {
  private mcpClient: Context7MCPClient;
  private apiClient: Context7APIClient;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.mcpClient = new Context7MCPClient(config);
    this.apiClient = new Context7APIClient(config);
  }

  /**
   * Resolve a library name to Context7-compatible library ID
   * Uses MCP server first, then falls back to direct API
   */
  async resolveLibrary(libraryName: string): Promise<LibraryInfo> {
    const sessionId = `resolve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.startSession?.(sessionId, 'trace', { libraryName, operation: 'resolveLibrary' });
    
    const cacheKey = `${CACHE_KEY_PREFIX_RESOLVE}${libraryName.toLowerCase().trim()}`;
    
    // Check cache first
    const cached = cache.get<LibraryInfo>(cacheKey);
    if (cached) {
      logger.debug('Library resolved from cache', { libraryName });
      logger.addTraceStep?.('complete', 'Library found in cache', { libraryName, cached: true });
      logger.endSession?.();
      return cached;
    }

    logger.info('Resolving library', { libraryName });
    logger.addTraceStep?.('start', 'Starting library resolution', { libraryName, method: 'MCP' });

    // Try Context7 MCP server first
    try {
      logger.startTraceStep?.('mcp-call', 'Calling Context7 MCP server', { libraryName });
      const mcpResult = await this.mcpClient.resolveLibrary(libraryName);
      if (mcpResult) {
        cache.set(cacheKey, mcpResult, this.config.cacheTTL);
        logger.completeTraceStep?.('mcp-call', 'MCP resolution successful', { 
          libraryName, 
          resolved: mcpResult.name,
          trustScore: mcpResult.trustScore 
        });
        logger.addTraceStep?.('complete', 'Library resolved via MCP', { 
          libraryName, 
          resolved: mcpResult.name,
          trustScore: mcpResult.trustScore 
        });
        logger.endSession?.();
        return mcpResult;
      }
      logger.completeTraceStep?.('mcp-call', 'MCP returned no results', { libraryName });
    } catch (error) {
      logger.completeTraceStep?.('mcp-call', 'MCP call failed', { 
        libraryName, 
        error: error instanceof Error ? error.message : String(error) 
      });
      logger.addTraceStep?.('error', 'MCP resolution failed, trying direct API', { 
        libraryName, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    // Fallback to direct API
    try {
      const apiResult = await this.apiClient.searchLibraries(libraryName);
      if (apiResult) {
        cache.set(cacheKey, apiResult, this.config.cacheTTL);
        logger.info('Library resolved via direct API', { 
          libraryName, 
          resolved: apiResult.name 
        });
        return apiResult;
      }
    } catch (error) {
      logger.warn('Direct API resolution failed', { 
        libraryName, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    // If all else fails, provide helpful error message
    const errorMessage = `${ERROR_LIBRARY_NOT_FOUND} "${libraryName}". ` +
      `Please try using the full library ID format (e.g., "/facebook/react", "/vercel/next.js") or check the library name spelling. ` +
      `You can also try searching for a more specific library name.`;

    logger.error('Library resolution failed', { libraryName });
    throw new Error(errorMessage);
  }

  /**
   * Get library documentation
   * Uses MCP server first, then falls back to direct API
   */
  async getLibraryDocs(libraryId: string, topic?: string, tokens?: number): Promise<string> {
    const maxTokens = Math.max(tokens || this.config.defaultTokens, this.config.minTokens);
    const cacheKey = `${CACHE_KEY_PREFIX_DOCS}${libraryId}|${topic || ''}|${maxTokens}`;
    
    // Check cache first
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      logger.debug('Library docs retrieved from cache', { libraryId, topic });
      return cached;
    }

    logger.info('Getting library documentation', { libraryId, topic, tokens: maxTokens });

    // Try Context7 MCP server first
    try {
      const mcpResult = await this.mcpClient.getLibraryDocs(libraryId, topic, maxTokens);
      if (mcpResult) {
        cache.set(cacheKey, mcpResult, this.config.cacheTTL);
        logger.info('Library docs retrieved via MCP', { 
          libraryId, 
          length: mcpResult.length 
        });
        return mcpResult;
      }
    } catch (error) {
      logger.warn('MCP docs failed, trying direct API', { 
        libraryId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    // Fallback to direct API
    try {
      const apiResult = await this.apiClient.getLibraryDocs(libraryId, topic, maxTokens);
      if (apiResult) {
        cache.set(cacheKey, apiResult, this.config.cacheTTL);
        logger.info('Library docs retrieved via direct API', { 
          libraryId, 
          length: apiResult.length 
        });
        return apiResult;
      }
    } catch (error) {
      logger.warn('Direct API docs failed', { 
        libraryId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    // If all else fails
    const errorMessage = `${ERROR_DOCS_RETRIEVAL_FAILED} "${libraryId}". ` +
      `Please verify the library ID is correct and try again.`;

    logger.error('Library docs retrieval failed', { libraryId });
    throw new Error(errorMessage);
  }

  /**
   * Get service statistics
   */
  getStats(): { cacheStats: any } {
    return {
      cacheStats: (cache as any).getStats(),
    };
  }
}
