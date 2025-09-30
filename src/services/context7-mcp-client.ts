/**
 * Context7 MCP Client Service
 * Handles communication with the Context7 MCP server via HTTP
 */

import { Context7MCPResponse, LibraryInfo, ServerConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { 
  CONTENT_TYPE_JSON, 
  ACCEPT_HEADER, 
  AUTH_BEARER_PREFIX,
  DEFAULT_DESCRIPTION
} from '../constants/index.js';

export class Context7MCPClient {
  private sessionId: string | null = null;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  /**
   * Make a direct HTTP call to Context7 MCP server
   */
  private async callMCP(method: string, params: any): Promise<Context7MCPResponse | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': CONTENT_TYPE_JSON,
        'Accept': ACCEPT_HEADER,
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `${AUTH_BEARER_PREFIX}${this.config.apiKey}`;
      }

      if (this.sessionId) {
        headers['MCP-Session-Id'] = this.sessionId;
      }

      const response = await fetch(this.config.context7MCPUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse SSE response
      const text = await response.text();
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.substring(6));
          
          // Extract session ID from response headers
          const sessionId = response.headers.get('MCP-Session-Id');
          if (sessionId) {
            this.sessionId = sessionId;
          }
          
          return data;
        }
      }

      throw new Error('No valid response data found');
    } catch (error) {
      logger.error('Context7 MCP call failed', { method, params, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Resolve a library name to Context7-compatible library ID
   */
  async resolveLibrary(libraryName: string): Promise<LibraryInfo | null> {
    logger.debug('Resolving library', { libraryName });

    const result = await this.callMCP('tools/call', {
      name: 'resolve-library-id',
      arguments: { libraryName },
    });

    if (!result?.result?.content?.[0]?.text) {
      return null;
    }

    const text = result.result.content[0].text;
    return this.parseLibraryResponse(text, libraryName);
  }

  /**
   * Get library documentation
   */
  async getLibraryDocs(libraryId: string, topic?: string, tokens?: number): Promise<string | null> {
    logger.debug('Getting library docs', { libraryId, topic, tokens });

    const result = await this.callMCP('tools/call', {
      name: 'get-library-docs',
      arguments: {
        context7CompatibleLibraryID: libraryId,
        topic,
        tokens: tokens || this.config.defaultTokens,
      },
    });

    if (!result?.result?.content?.[0]?.text) {
      return null;
    }

    return result.result.content[0].text;
  }

  /**
   * Parse Context7 response to extract library information
   */
  private parseLibraryResponse(text: string, originalQuery: string): LibraryInfo | null {
    const lines = text.split('\n');
    let bestMatch: LibraryInfo | null = null;
    let highestTrustScore = 0;

    // Look for the library with the highest trust score
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Context7-compatible library ID:')) {
        const idMatch = line.match(/Context7-compatible library ID: (.+)/);
        if (idMatch) {
          const id = idMatch[1];
          
          // Look for trust score in nearby lines
          let trustScore = 0;
          for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
            const trustMatch = lines[j].match(/Trust Score: ([\d.]+)/);
            if (trustMatch) {
              trustScore = parseFloat(trustMatch[1]);
              break;
            }
          }
          
          // Look for name and description
          let name = originalQuery;
          let description = DEFAULT_DESCRIPTION;
          let codeSnippets = 0;
          const versions: string[] = [];
          
          for (let j = Math.max(0, i - 10); j < Math.min(lines.length, i + 10); j++) {
            const nameMatch = lines[j].match(/- Title: (.+)/);
            if (nameMatch) {
              name = nameMatch[1];
            }
            
            const descMatch = lines[j].match(/- Description: (.+)/);
            if (descMatch) {
              description = descMatch[1];
            }
            
            const snippetsMatch = lines[j].match(/Code Snippets: (\d+)/);
            if (snippetsMatch) {
              codeSnippets = parseInt(snippetsMatch[1], 10);
            }
            
            const versionsMatch = lines[j].match(/Versions: (.+)/);
            if (versionsMatch) {
              versions.push(...versionsMatch[1].split(', '));
            }
          }
          
          if (trustScore > highestTrustScore) {
            highestTrustScore = trustScore;
            bestMatch = {
              id,
              name,
              description,
              trustScore,
              codeSnippets,
              versions: versions.length > 0 ? versions : undefined,
            };
          }
        }
      }
    }

    if (bestMatch) {
      logger.debug('Library resolved', { 
        originalQuery, 
        resolved: bestMatch,
        trustScore: bestMatch.trustScore 
      });
    }

    return bestMatch;
  }
}
