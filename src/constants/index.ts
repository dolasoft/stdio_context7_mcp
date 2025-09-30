/**
 * Application constants
 */

// Server configuration
export const SERVER_NAME = 'stdio-context7-mcp';
export const SERVER_VERSION = '1.0.0';

// Tool names
export const TOOL_RESOLVE_LIBRARY_ID = 'resolve-library-id';
export const TOOL_GET_LIBRARY_DOCS = 'get-library-docs';

// Token limits
export const MIN_TOKENS = 1000;
export const DEFAULT_TOKENS = 5000;
export const MIN_TOKENS_LIMIT = 100;

// Timeouts and intervals
export const CONNECTION_TIMEOUT_MS = 5000;
export const MIN_CONNECTION_TIMEOUT_MS = 1000;
export const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
export const CACHE_CLEANUP_INTERVAL_MS = 300000; // 5 minutes
export const SHUTDOWN_DELAY_MS = 100; // Graceful shutdown delay
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes default

// API endpoints
export const CONTEXT7_MCP_URL = 'https://mcp.context7.com/mcp';
export const CONTEXT7_API_BASE = 'https://context7.com/api/v1';

// HTTP headers
export const CONTENT_TYPE_JSON = 'application/json';
export const ACCEPT_HEADER = 'application/json, text/event-stream';

// Cache keys
export const CACHE_KEY_PREFIX_RESOLVE = 'resolve:';
export const CACHE_KEY_PREFIX_DOCS = 'docs:';

// Error messages
export const ERROR_INVALID_LIBRARY_ID_FORMAT = 'Invalid library ID format. Expected format: /owner/repo';
export const ERROR_CONNECTION_TIMEOUT_TOO_LOW = 'Connection timeout must be at least 1000ms';
export const ERROR_MIN_TOKENS_TOO_LOW = 'Minimum tokens must be at least 100';
export const ERROR_DEFAULT_TOKENS_TOO_LOW = 'Default tokens must be greater than or equal to minimum tokens';
export const ERROR_INVALID_LIBRARY_DATA = 'Invalid library data: missing owner or repo';
export const ERROR_LIBRARY_NOT_FOUND = 'Library not found. Please try using the full library ID format or check the library name spelling.';
export const ERROR_DOCS_RETRIEVAL_FAILED = 'Failed to fetch documentation. Please verify the library ID is correct and try again.';

// Default values
export const DEFAULT_DESCRIPTION = 'No description available';
export const DEFAULT_LIMIT = '1';
export const DEFAULT_TYPE = 'txt';

// URL parameters
export const URL_PARAMS = {
  QUERY: 'q',
  LIMIT: 'limit',
  TYPE: 'type',
  TOPIC: 'topic',
  TOKENS: 'tokens',
} as const;

// HTTP methods
export const HTTP_METHODS = {
  POST: 'POST',
} as const;

// Authorization
export const AUTH_BEARER_PREFIX = 'Bearer ';

// Log levels
export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
} as const;

// Transport types
export const TRANSPORT_TYPES = {
  STDIO: 'stdio',
  HTTP: 'http',
  SSE: 'sse',
} as const;

// Environment variables
export const ENV_VARS = {
  CONTEXT7_API_KEY: 'CONTEXT7_API_KEY',
  MCP_TRANSPORT: 'MCP_TRANSPORT',
  NODE_ENV: 'NODE_ENV',
} as const;

// Development mode
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
