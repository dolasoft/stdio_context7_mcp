/**
 * Configuration management for the Context7 MCP Server
 */

import { ServerConfig } from '../types';
import { 
  TRANSPORT_TYPES, 
  CONTEXT7_MCP_URL, 
  CONTEXT7_API_BASE, 
  CACHE_TTL_MS, 
  MIN_TOKENS, 
  DEFAULT_TOKENS, 
  CONNECTION_TIMEOUT_MS,
  MIN_CONNECTION_TIMEOUT_MS,
  MIN_TOKENS_LIMIT,
  ERROR_CONNECTION_TIMEOUT_TOO_LOW,
  ERROR_MIN_TOKENS_TOO_LOW,
  ERROR_DEFAULT_TOKENS_TOO_LOW
} from '../constants';
/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ServerConfig = {
  transport: TRANSPORT_TYPES.STDIO,
  context7MCPUrl: CONTEXT7_MCP_URL,
  context7APIBase: CONTEXT7_API_BASE,
  cacheTTL: CACHE_TTL_MS,
  minTokens: MIN_TOKENS,
  defaultTokens: DEFAULT_TOKENS,
  connectionTimeout: CONNECTION_TIMEOUT_MS,
};

/**
 * Parse command line arguments and environment variables
 */
function parseConfig(): ServerConfig {
  const args = process.argv.slice(2);
  let apiKey = '';
  let transport: 'stdio' | 'http' | 'sse' = 'stdio';

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api-key' && args[i + 1]) {
      apiKey = args[i + 1];
      i++;
    } else if (args[i] === '--transport' && args[i + 1]) {
      const transportArg = args[i + 1] as 'stdio' | 'http' | 'sse';
      if (Object.values(TRANSPORT_TYPES).includes(transportArg)) {
        transport = transportArg;
      }
      i++;
    }
  }

  // Override with environment variables
  const envApiKey = process.env.CONTEXT7_API_KEY;
  const envTransport = process.env.MCP_TRANSPORT as 'stdio' | 'http' | 'sse';

  return {
    ...DEFAULT_CONFIG,
    apiKey: envApiKey || apiKey,
    transport: envTransport || transport,
  };
}

/**
 * Get the current configuration
 */
export function getConfig(): ServerConfig {
  return parseConfig();
}

/**
 * Validate configuration
 */
export function validateConfig(config: ServerConfig): void {
  if (config.connectionTimeout < MIN_CONNECTION_TIMEOUT_MS) {
    throw new Error(ERROR_CONNECTION_TIMEOUT_TOO_LOW);
  }
  
  if (config.minTokens < MIN_TOKENS_LIMIT) {
    throw new Error(ERROR_MIN_TOKENS_TOO_LOW);
  }
  
  if (config.defaultTokens < config.minTokens) {
    throw new Error(ERROR_DEFAULT_TOKENS_TOO_LOW);
  }
}
