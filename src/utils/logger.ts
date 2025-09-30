/**
 * Simple logger for the Context7 MCP Server
 * Uses @dolasoftfree/logger directly
 */

import { getLogger, LOG_MODES } from '@dolasoftfree/logger';
import { IS_DEVELOPMENT } from '../constants';

/**
 * Create and configure the logger instance
 */
const dolasoftLogger = getLogger({
  logMode: IS_DEVELOPMENT ? LOG_MODES.CONSOLE : LOG_MODES.CONSOLE,
  routeUrl: process.env.LOG_ROUTE_URL || 'http://localhost:3000/api/logs',
  maxLogs: 10000,
  maxSessions: 100,
  sensitiveFields: ['apiKey', 'password', 'token', 'secret'],
});

/**
 * Export the configured logger directly - no unnecessary wrapping
 */
export const logger = dolasoftLogger;