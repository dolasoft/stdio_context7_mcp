/**
 * In-memory cache implementation for the Context7 MCP Server
 */

import { CacheManager, CacheEntry } from '../types';
import { logger } from './logger.js';
import { CACHE_TTL_MS, CACHE_CLEANUP_INTERVAL_MS } from '../constants';

/**
 * In-memory cache implementation
 */
export class MemoryCache implements CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`Cache miss (expired): ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = CACHE_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    this.cache.set(key, entry);
    logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }

    return cleaned;
  }
}

/**
 * Singleton cache instance
 */
export const cache: CacheManager = new MemoryCache();

/**
 * Start periodic cache cleanup
 */
export function startCacheCleanup(intervalMs: number = CACHE_CLEANUP_INTERVAL_MS): NodeJS.Timeout {
  return setInterval(() => {
    cache.cleanup();
  }, intervalMs);
}
