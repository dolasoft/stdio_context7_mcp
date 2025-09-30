/**
 * Error handling utilities to reduce code duplication
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Create a standardized error object for logging
 */
export function createErrorLog(error: unknown, context?: Record<string, unknown>): Record<string, unknown> {
  return {
    error: getErrorMessage(error),
    ...context,
  };
}
