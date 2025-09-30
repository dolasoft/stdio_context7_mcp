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
 * Only add custom helpers that provide real value
 */
export const logger = {
  // Direct passthrough to the underlying logger
  info: dolasoftLogger.info.bind(dolasoftLogger),
  warn: dolasoftLogger.warn.bind(dolasoftLogger),
  error: dolasoftLogger.error.bind(dolasoftLogger),
  debug: dolasoftLogger.debug.bind(dolasoftLogger),
  startSession: dolasoftLogger.startSession.bind(dolasoftLogger),
  endSession: dolasoftLogger.endSession.bind(dolasoftLogger),
  addTraceStep: dolasoftLogger.addTraceStep.bind(dolasoftLogger),
  startTraceStep: dolasoftLogger.startTraceStep.bind(dolasoftLogger),
  completeTraceStep: dolasoftLogger.completeTraceStep.bind(dolasoftLogger),
  logCustom: dolasoftLogger.logCustom.bind(dolasoftLogger),
  getAllLogs: dolasoftLogger.getAllLogs.bind(dolasoftLogger),
  clearOldSessions: dolasoftLogger.clearOldSessions.bind(dolasoftLogger),

  // Custom error logging helpers that add value
  logError: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    dolasoftLogger.error(message, { error: errorMessage, ...context });
  },

  logWarning: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    dolasoftLogger.warn(message, { error: errorMessage, ...context });
  },
};