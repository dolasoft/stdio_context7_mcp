/**
 * Server initialization utilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LibraryService } from '../services/library-service.js';
import { logger } from '../utils/logger.js';
import { startCacheCleanup } from '../utils/cache.js';
import {
  createListToolsHandler,
  createToolExecutionHandler,
} from '../handlers';
import {
  SERVER_NAME,
  SERVER_VERSION,
  TRANSPORT_TYPES,
  SHUTDOWN_DELAY_MS,
  INACTIVITY_TIMEOUT_MS,
} from '../constants';
import { ServerConfig } from '../types';

/**
 * Initialize the library service and start cache cleanup
 */
export function initializeServices(config: ServerConfig): LibraryService {
  logger.info('🔧 Initializing services', {
    context7MCPUrl: config.context7MCPUrl,
    context7APIBase: config.context7APIBase,
  });

  const libraryService = new LibraryService(config);
  startCacheCleanup();

  return libraryService;
}

/**
 * Create and configure the MCP server
 */
export function createMCPServer(): Server {
  logger.info('🏗️ Creating MCP server', {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  return server;
}

/**
 * Set up request handlers for the MCP server
 */
export function setupRequestHandlers(server: Server, libraryService: LibraryService): void {
  logger.info('🔗 Setting up request handlers');
  
  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    updateActivity();
    return await createListToolsHandler()();
  });
  
  // Tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    updateActivity();
    return await createToolExecutionHandler(libraryService)(request);
  });
}

/**
 * Create the appropriate transport based on configuration
 */
export function createTransport(transportType: string) {
  logger.info('🚀 Creating transport', { transport: transportType });

  switch (transportType) {
    case TRANSPORT_TYPES.STDIO:
      return new StdioServerTransport();
    default:
      throw new Error(`Unsupported transport: ${transportType}`);
  }
}

/**
 * Start the MCP server with the given transport
 */
export async function startServer(server: Server, transport: Transport): Promise<void> {
  logger.info('🚀 Starting server', { transport: transport.constructor.name });
  
  await server.connect(transport);
  
  logger.info('✅ Server started successfully');
}

/**
 * Set up graceful shutdown handlers
 */
// Global activity tracker
let lastActivity = Date.now();

export function updateActivity(): void {
  lastActivity = Date.now();
}

export function setupGracefulShutdown(server: Server): void {
  logger.info('🛡️ Setting up graceful shutdown handlers');

  // Set up inactivity timeout (configurable, default 5 minutes)
  const INACTIVITY_TIMEOUT = process.env.INACTIVITY_TIMEOUT_MS 
    ? parseInt(process.env.INACTIVITY_TIMEOUT_MS, 10) 
    : INACTIVITY_TIMEOUT_MS;
  
  const checkInactivity = () => {
    if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
      logger.info('⏰ Inactivity timeout reached, shutting down...');
      shutdown('INACTIVITY_TIMEOUT');
    }
  };
  
  // Check for inactivity every minute
  const inactivityTimer = setInterval(checkInactivity, 60000);

  const shutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
    
    // Clear the inactivity timer
    clearInterval(inactivityTimer);
    
    try {
      // Close the server
      await server.close();
      logger.info('✅ Server shutdown complete');
      
      // Force exit after a short delay to ensure cleanup
      setTimeout(() => {
        process.exit(0);
      }, SHUTDOWN_DELAY_MS);
    } catch (error) {
      logger.error('❌ Error during shutdown', { error });
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught exception', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    shutdown('UNCAUGHT_EXCEPTION');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled promise rejection', { reason, promise });
    shutdown('UNHANDLED_REJECTION');
  });
}
