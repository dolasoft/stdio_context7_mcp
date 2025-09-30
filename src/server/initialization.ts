/**
 * Server initialization utilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
} from '../handlers/index.js';
import {
  SERVER_NAME,
  SERVER_VERSION,
  TRANSPORT_TYPES,
  SHUTDOWN_DELAY_MS,
} from '../constants/index.js';
import { ServerConfig } from '../types/index.js';

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
export function createMCPServer(libraryService: LibraryService): Server {
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
  
  server.setRequestHandler(ListToolsRequestSchema, createListToolsHandler());
  server.setRequestHandler(CallToolRequestSchema, createToolExecutionHandler(libraryService));
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
export async function startServer(server: Server, transport: any): Promise<void> {
  logger.info('🚀 Starting server', { transport: transport.constructor.name });
  
  await server.connect(transport);
  
  logger.info('✅ Server started successfully');
}

/**
 * Set up graceful shutdown handlers
 */
export function setupGracefulShutdown(server: Server): void {
  logger.info('🛡️ Setting up graceful shutdown handlers');

  const shutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
    
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
    logger.error('❌ Uncaught exception', { error: error.message, stack: error.stack });
    shutdown('UNCAUGHT_EXCEPTION');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled promise rejection', { reason, promise });
    shutdown('UNHANDLED_REJECTION');
  });
}
