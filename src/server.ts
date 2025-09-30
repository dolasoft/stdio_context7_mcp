#!/usr/bin/env node

/**
 * Context7 MCP Server - Main Entry Point
 * 
 * A clean, production-ready MCP server that provides access to Context7's
 * up-to-date code documentation for LLMs and AI code editors.
 */

import { getConfig, validateConfig } from './config/index.js';
import { logger } from './utils/logger.js';
import {
  initializeServices,
  createMCPServer,
  setupRequestHandlers,
  createTransport,
  startServer,
  setupGracefulShutdown,
} from './server/initialization.js';
import { SERVER_NAME, SERVER_VERSION } from './constants/index.js';

/**
 * Main server initialization and startup
 */
async function main() {
  try {
    // Parse and validate configuration
    const config = getConfig();
    validateConfig(config);
    
    logger.info(`🚀 Starting ${SERVER_NAME} v${SERVER_VERSION}`, {
      transport: config.transport,
    });

    // Initialize services
    const libraryService = initializeServices(config);
    
    // Create and configure MCP server
    const server = createMCPServer();
    setupRequestHandlers(server, libraryService);

    // Create transport and start server
    const transport = createTransport(config.transport);
    await startServer(server, transport);

    // Set up graceful shutdown
    setupGracefulShutdown(server);

  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error('❌ Unhandled error in main', { error: error as Error });
  process.exit(1);
});