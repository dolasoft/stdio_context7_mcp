/**
 * Context7 Direct API Client Service
 * Handles direct API calls to Context7 as a fallback
 */

import { Context7APISearchResult, LibraryInfo, ServerConfig } from '../types';
import { logger } from '../utils/logger.js';
import { 
  CONTENT_TYPE_JSON, 
  ERROR_INVALID_LIBRARY_ID_FORMAT,
  ERROR_INVALID_LIBRARY_DATA,
  DEFAULT_DESCRIPTION,
  DEFAULT_LIMIT,
  DEFAULT_TYPE,
  URL_PARAMS,
  AUTH_BEARER_PREFIX
} from '../constants';

export class Context7APIClient {
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  /**
   * Search for libraries using Context7 direct API
   */
  async searchLibraries(query: string): Promise<LibraryInfo | null> {
    logger.debug('Searching libraries via direct API', { query });

    try {
      const searchUrl = this.buildSearchUrl(query);
      const headers = this.buildHeaders();
      
      const response = await this.makeRequest(searchUrl, headers);
      if (!response) {
        return null;
      }

      const data = await this.parseResponse<Context7APISearchResult>(response);
      return this.extractLibraryFromSearchResult(data, query);
      
    } catch (error) {
      logger.error('Direct API search error', { 
        query, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Build search URL with query parameters
   */
  private buildSearchUrl(query: string): string {
    const url = new URL(`${this.config.context7APIBase}/search`);
    url.searchParams.set(URL_PARAMS.QUERY, query);
    url.searchParams.set(URL_PARAMS.LIMIT, DEFAULT_LIMIT);
    return url.toString();
  }

  /**
   * Build request headers
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPE_JSON,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `${AUTH_BEARER_PREFIX}${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest(url: string, headers: Record<string, string>): Promise<Response | null> {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      logger.warn('API request failed', { 
        url, 
        status: response.status, 
        statusText: response.statusText 
      });
      return null;
    }

    return response;
  }

  /**
   * Parse JSON response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    return await response.json() as T;
  }

  /**
   * Extract library info from search result
   */
  private extractLibraryFromSearchResult(data: Context7APISearchResult, originalQuery: string): LibraryInfo | null {
    if (!data.results?.length) {
      return null;
    }

    const result = data.results[0];
    const library: LibraryInfo = {
      id: result.id || this.buildLibraryId(result.owner, result.repo),
      name: result.name || result.repo || originalQuery,
      description: result.description || DEFAULT_DESCRIPTION,
    };

    logger.debug('Library found via direct API', { query: originalQuery, library });
    return library;
  }

  /**
   * Build library ID from owner and repo
   */
  private buildLibraryId(owner?: string, repo?: string): string {
    if (!owner || !repo) {
      throw new Error(ERROR_INVALID_LIBRARY_DATA);
    }
    return `/${owner}/${repo}`;
  }

  /**
   * Get library documentation using Context7 direct API
   */
  async getLibraryDocs(libraryId: string, topic?: string, tokens?: number): Promise<string | null> {
    logger.debug('Getting library docs via direct API', { libraryId, topic, tokens });

    try {
      const { owner, repo } = this.parseLibraryId(libraryId);
      const docsUrl = this.buildDocsUrl(owner, repo, topic, tokens);
      const headers = this.buildHeaders();
      
      const response = await this.makeRequest(docsUrl, headers);
      if (!response) {
        return null;
      }

      const docs = await response.text();
      logger.debug('Library docs retrieved via direct API', { 
        libraryId, 
        length: docs.length 
      });

      return docs;
    } catch (error) {
      // Re-throw validation errors (like invalid library ID format)
      if (error instanceof Error && error.message.includes(ERROR_INVALID_LIBRARY_ID_FORMAT)) {
        throw error;
      }
      
      logger.error('Direct API docs error', { 
        libraryId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Parse library ID into owner and repo components
   */
  private parseLibraryId(libraryId: string): { owner: string; repo: string } {
    const match = libraryId.match(/^\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`${ERROR_INVALID_LIBRARY_ID_FORMAT}: ${libraryId}`);
    }
    return { owner: match[1], repo: match[2] };
  }

  /**
   * Build documentation URL with parameters
   */
  private buildDocsUrl(owner: string, repo: string, topic?: string, tokens?: number): string {
    const url = new URL(`${this.config.context7APIBase}/${owner}/${repo}`);
    url.searchParams.set(URL_PARAMS.TYPE, DEFAULT_TYPE);

    if (topic) {
      url.searchParams.set(URL_PARAMS.TOPIC, topic);
    }

    if (tokens) {
      url.searchParams.set(URL_PARAMS.TOKENS, tokens.toString());
    }

    return url.toString();
  }
}
