/**
 * Core types and interfaces for the Context7 MCP Server
 */

export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  trustScore?: number;
  codeSnippets?: number;
  versions?: string[];
}

export interface Context7MCPResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content?: Array<{
      type: string;
      text: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface Context7APISearchResult {
  id?: string;
  owner?: string;
  repo?: string;
  name?: string;
  description?: string;
  results?: Context7APISearchResult[];
}

export interface ServerConfig {
  apiKey?: string;
  transport: 'stdio' | 'http' | 'sse';
  context7MCPUrl: string;
  context7APIBase: string;
  cacheTTL: number;
  minTokens: number;
  defaultTokens: number;
  connectionTimeout: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}


export interface Context7Client {
  resolveLibrary(libraryName: string): Promise<LibraryInfo>;
  getLibraryDocs(libraryId: string, topic?: string, tokens?: number): Promise<string>;
}

export interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  clear(): void;
  has(key: string): boolean;
  getStats(): { size: number; keys: string[] };
  cleanup(): number;
}
export type Metadata = Record<string, unknown>;
