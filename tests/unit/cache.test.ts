/**
 * Unit its for cache management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cache, startCacheCleanup } from '../../src/utils/cache.js';
import { CACHE_TTL_MS } from '../../src/constants/index.js';

describe('Cache Management', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get data', () => {
      const itData = { name: 'it', value: 123 };
      cache.set('it-key', itData);
      
      const result = cache.get('it-key');
      expect(result).toEqual(itData);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('it-key', 'it-value');
      
      expect(cache.has('it-key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should clear all data', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      
      cache.clear();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect TTL', (done) => {
      const itData = { name: 'it' };
      const shortTTL = 100; // 100ms
      
      cache.set('it-key', itData, shortTTL);
      
      // Should be available immediately
      expect(cache.get('it-key')).toEqual(itData);
      
      // Should expire after TTL
      setTimeout(() => {
        expect(cache.get('it-key')).toBeNull();
        done();
      }, shortTTL + 50);
    });

    it('should use default TTL when not specified', () => {
      const itData = { name: 'it' };
      cache.set('it-key', itData);
      
      // Should be available immediately
      expect(cache.get('it-key')).toEqual(itData);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = (cache as any).getStats();
      
      expect(stats).toHaveProperty('size', 2);
      expect(stats).toHaveProperty('keys');
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired entries', (done) => {
      const shortTTL = 100; // 100ms
      
      cache.set('expired-key', 'value', shortTTL);
      cache.set('valid-key', 'value', 10000); // Long TTL
      
      // Both should be available initially
      expect(cache.has('expired-key')).toBe(true);
      expect(cache.has('valid-key')).toBe(true);
      
      // Wait for expiration and cleanup
      setTimeout(() => {
        (cache as any).cleanup();
        
        expect(cache.has('expired-key')).toBe(false);
        expect(cache.has('valid-key')).toBe(true);
        done();
      }, shortTTL + 50);
    });

    it('should return number of cleaned entries', (done) => {
      const shortTTL = 100;
      
      cache.set('key1', 'value1', shortTTL);
      cache.set('key2', 'value2', shortTTL);
      
      setTimeout(() => {
        const cleaned = (cache as any).cleanup();
        expect(cleaned).toBe(2);
        done();
      }, shortTTL + 50);
    });
  });

  describe('Cache Cleanup Timer', () => {
    it('should start cache cleanup timer', () => {
      const timer = startCacheCleanup(100); // 100ms interval
      
      expect(timer).toBeDefined();
      expect(typeof timer.ref).toBe('function');
      
      // Clean up the timer
      clearInterval(timer);
    });
  });

  describe('Type Safety', () => {
    it('should handle different data types', () => {
      const stringData = 'it string';
      const numberData = 42;
      const objectData = { nested: { value: 'it' } };
      const arrayData = [1, 2, 3];
      
      cache.set('string', stringData);
      cache.set('number', numberData);
      cache.set('object', objectData);
      cache.set('array', arrayData);
      
      expect(cache.get('string')).toBe(stringData);
      expect(cache.get('number')).toBe(numberData);
      expect(cache.get('object')).toEqual(objectData);
      expect(cache.get('array')).toEqual(arrayData);
    });
  });
});

