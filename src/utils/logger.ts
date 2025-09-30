/**
 * Professional logging utility for the Context7 MCP Server
 * Uses @dolasoftfree/logger for enterprise-grade logging
 */

import { getLogger, LOG_MODES } from '@dolasoftfree/logger';
import { Logger } from '../types/index.js';
import { IS_DEVELOPMENT } from '../constants/index.js';

/**
 * Professional logger wrapper that implements our Logger interface
 */
class ProfessionalLogger implements Logger {
  private dolasoftLogger = getLogger({
    logMode: IS_DEVELOPMENT ? LOG_MODES.CONSOLE : LOG_MODES.CONSOLE, // Use console for now
    routeUrl: process.env.LOG_ROUTE_URL || 'http://localhost:3000/api/logs',
    maxLogs: 10000,
    maxSessions: 100,
    sensitiveFields: ['apiKey', 'password', 'token', 'secret'],
  });

  info(message: string, meta?: any): void {
    this.dolasoftLogger.info(message, meta || {});
  }

  warn(message: string, meta?: any): void {
    this.dolasoftLogger.warn(message, meta || {});
  }

  error(message: string, meta?: any): void {
    this.dolasoftLogger.error(message, meta || {});
  }

  debug(message: string, meta?: any): void {
    this.dolasoftLogger.debug(message, meta || {});
  }

  /**
   * Start a new session for tracking operations
   */
  startSession(id: string, type: 'trace' | 'execution' | 'general' = 'general', metadata?: Record<string, unknown>): void {
    this.dolasoftLogger.startSession(id, type, metadata);
  }

  /**
   * End the current session
   */
  endSession() {
    return this.dolasoftLogger.endSession();
  }

  /**
   * Add a trace step for detailed operation tracking
   */
  addTraceStep(level: 'start' | 'complete' | 'error' | 'info', message: string, metadata?: Record<string, unknown>): void {
    this.dolasoftLogger.addTraceStep(level, message, metadata);
  }

  /**
   * Start a timed trace step
   */
  startTraceStep(stepName: string, message: string, metadata?: Record<string, unknown>): void {
    this.dolasoftLogger.startTraceStep(stepName, message, metadata);
  }

  /**
   * Complete a timed trace step
   */
  completeTraceStep(stepName: string, message?: string, metadata?: Record<string, unknown>): void {
    this.dolasoftLogger.completeTraceStep(stepName, message, metadata);
  }

  /**
   * Custom logging with emoji for better visual distinction
   */
  logCustom(emoji: string, message: string, metadata?: Record<string, unknown>): void {
    this.dolasoftLogger.logCustom(emoji, message, metadata);
  }

  /**
   * Get all logs for debugging
   */
  getAllLogs() {
    return this.dolasoftLogger.getAllLogs();
  }

  /**
   * Clear old sessions
   */
  clearOldSessions(): void {
    this.dolasoftLogger.clearOldSessions();
  }
}

/**
 * Singleton professional logger instance
 */
export const logger: Logger = new ProfessionalLogger();