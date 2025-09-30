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
 * Simple logger that just uses the library directly
 * No unnecessary wrapping or abstraction
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    dolasoftLogger.info(message, meta || {});
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    dolasoftLogger.warn(message, meta || {});
  },

  error: (message: string, meta?: Record<string, unknown>) => {
    dolasoftLogger.error(message, meta || {});
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    dolasoftLogger.debug(message, meta || {});
  },

  startSession: (id: string, type: 'trace' | 'execution' | 'general' = 'general', metadata?: Record<string, unknown>) => {
    dolasoftLogger.startSession(id, type, metadata || {});
  },

  endSession: () => {
    return dolasoftLogger.endSession();
  },

  addTraceStep: (level: 'start' | 'complete' | 'error' | 'info', message: string, metadata?: Record<string, unknown>) => {
    dolasoftLogger.addTraceStep(level, message, metadata || {});
  },

  startTraceStep: (stepName: string, message: string, metadata?: Record<string, unknown>) => {
    dolasoftLogger.startTraceStep(stepName, message, metadata || {});
  },

  completeTraceStep: (stepName: string, message?: string, metadata?: Record<string, unknown>) => {
    dolasoftLogger.completeTraceStep(stepName, message, metadata || {});
  },

  logCustom: (emoji: string, message: string, metadata?: Record<string, unknown>) => {
    dolasoftLogger.logCustom(emoji, message, metadata || {});
  },

  getAllLogs: () => {
    return dolasoftLogger.getAllLogs();
  },

  clearOldSessions: () => {
    dolasoftLogger.clearOldSessions();
  },

  // Simple error logging helpers
  logError: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    dolasoftLogger.error(message, { error: errorMessage, ...context });
  },

  logWarning: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    dolasoftLogger.warn(message, { error: errorMessage, ...context });
  },
};