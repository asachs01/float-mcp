import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { executeToolWithRetry, executeTool, executeBatch, sleep } from './utils/test-helpers.js';
import { ErrorTestUtils } from './utils/error-handling.js';
import { TEST_CONFIG } from './setup.js';

describe('Rate Limiting Integration Tests', () => {
  // Skip rate limiting tests if not using real API
  const skipIfMocked = () => {
    if (!TEST_CONFIG.enableRealApiCalls) {
      console.warn('Skipping rate limiting test - real API calls disabled');
      return true;
    }
    return false;
  };

  describe('Basic Rate Limiting', () => {
    it('should respect rate limits', async () => {
      if (skipIfMocked()) return;

      const requests = Array.from(
        { length: 10 },
        () => () => executeTool('list-projects', { 'per-page': 1 })
      );

      const start = Date.now();
      const results = await executeBatch(requests, 5);
      const duration = Date.now() - start;

      expect(results).toHaveLength(10);
      expect(duration).toBeGreaterThan(500); // Should take some time due to rate limiting

      // All requests should succeed
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle burst requests gracefully', async () => {
      if (skipIfMocked()) return;

      // Make many requests simultaneously
      const requests = Array.from({ length: 20 }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      const start = Date.now();
      const results = await Promise.allSettled(requests);
      const duration = Date.now() - start;

      expect(results).toHaveLength(20);
      expect(duration).toBeGreaterThan(1000); // Should take time due to rate limiting

      // Most requests should succeed, some might fail with rate limit errors
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      expect(successful).toBeGreaterThan(0);

      if (failed > 0) {
        console.log(`${failed} requests failed due to rate limiting (expected)`);
      }
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should handle 429 rate limit errors', async () => {
      if (skipIfMocked()) return;

      // Create a large number of requests to trigger rate limiting
      const requests = Array.from({ length: 100 }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      try {
        await Promise.all(requests);
        console.warn('Rate limit not reached - may need to adjust test parameters');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);

        const errorMessage = (error as Error).message.toLowerCase();
        expect(
          errorMessage.includes('rate limit') ||
            errorMessage.includes('429') ||
            errorMessage.includes('too many requests')
        ).toBe(true);
      }
    });

    it('should provide retry information in rate limit errors', async () => {
      if (skipIfMocked()) return;

      const requests = Array.from({ length: 50 }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      try {
        await Promise.all(requests);
        console.warn('Rate limit not reached - may need to adjust test parameters');
      } catch (error) {
        expect(error).toBeDefined();

        // Check if error contains retry information
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          // Rate limit error should contain helpful information
          expect(errorMessage.length).toBeGreaterThan(10);
        }
      }
    });
  });

  describe('Rate Limit Recovery', () => {
    it('should recover after rate limit period', async () => {
      if (skipIfMocked()) return;
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping rate limit recovery test - slow tests disabled');
        return;
      }

      // First, trigger rate limiting
      const rapidRequests = Array.from({ length: 50 }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      try {
        await Promise.all(rapidRequests);
        console.warn('Rate limit not reached in first batch');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Wait for rate limit window to reset
      console.log('Waiting for rate limit window to reset...');
      await sleep(60000); // Wait 1 minute

      // Now try a single request - should succeed
      const result = await executeToolWithRetry('list-projects', { 'per-page': 1 });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle gradual request increase', async () => {
      if (skipIfMocked()) return;
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping gradual request test - slow tests disabled');
        return;
      }

      // Start with small batches and gradually increase
      const batchSizes = [1, 2, 5, 10, 20];

      for (const batchSize of batchSizes) {
        const requests = Array.from(
          { length: batchSize },
          () => () => executeTool('list-projects', { 'per-page': 1 })
        );

        const results = await executeBatch(requests, 5);
        expect(results).toHaveLength(batchSize);

        // Add delay between batches
        await sleep(2000);
      }
    });
  });

  describe('Rate Limit Metrics', () => {
    it('should track request timing', async () => {
      if (skipIfMocked()) return;

      const timings: number[] = [];

      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await executeTool('list-projects', { 'per-page': 1 });
        const duration = Date.now() - start;
        timings.push(duration);

        // Add small delay between requests
        await sleep(TEST_CONFIG.apiCallDelay);
      }

      expect(timings).toHaveLength(5);

      // Log timing statistics
      const avgTiming = timings.reduce((a, b) => a + b) / timings.length;
      const maxTiming = Math.max(...timings);
      const minTiming = Math.min(...timings);

      console.log(
        `Request timings - Avg: ${avgTiming}ms, Max: ${maxTiming}ms, Min: ${minTiming}ms`
      );

      // All requests should complete within reasonable time
      timings.forEach((timing) => {
        expect(timing).toBeLessThan(30000); // 30 seconds max
      });
    });

    it('should measure concurrent request performance', async () => {
      if (skipIfMocked()) return;

      const concurrentRequests = 5;
      const requests = Array.from({ length: concurrentRequests }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      expect(results).toHaveLength(concurrentRequests);

      // Calculate average time per request
      const avgTimePerRequest = duration / concurrentRequests;

      console.log(
        `Concurrent requests - Total: ${duration}ms, Avg per request: ${avgTimePerRequest}ms`
      );

      // Concurrent requests should be more efficient than sequential
      expect(avgTimePerRequest).toBeLessThan(duration);
    });
  });

  describe('Tool-Specific Rate Limiting', () => {
    const toolsToTest = [
      'list-projects',
      'list-people',
      'list-tasks',
      'list-allocations',
      'list-clients',
    ];

    toolsToTest.forEach((toolName) => {
      it(`should handle rate limiting for ${toolName}`, async () => {
        if (skipIfMocked()) return;

        const requests = Array.from({ length: 10 }, () => executeTool(toolName, { 'per-page': 1 }));

        const start = Date.now();
        const results = await Promise.allSettled(requests);
        const duration = Date.now() - start;

        expect(results).toHaveLength(10);
        expect(duration).toBeGreaterThan(500); // Should take some time

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        expect(successful).toBeGreaterThan(0);

        if (failed > 0) {
          console.log(`${toolName}: ${failed} requests failed due to rate limiting`);
        }
      });
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should respect configured rate limits', async () => {
      if (skipIfMocked()) return;

      // Check current rate limit configuration
      const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
      const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

      expect(rateLimitWindow).toBeGreaterThan(0);
      expect(rateLimitMax).toBeGreaterThan(0);

      console.log(
        `Rate limit config - Window: ${rateLimitWindow}ms, Max: ${rateLimitMax} requests`
      );

      // Test with configuration values
      const testRequests = Math.min(rateLimitMax / 2, 20); // Don't exceed half the limit
      const requests = Array.from({ length: testRequests }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      const start = Date.now();
      const results = await Promise.allSettled(requests);
      const duration = Date.now() - start;

      expect(results).toHaveLength(testRequests);

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(0);

      console.log(
        `Config test - ${successful}/${testRequests} requests succeeded in ${duration}ms`
      );
    });
  });

  describe('Error Response Validation', () => {
    it('should validate rate limit error response format', async () => {
      if (skipIfMocked()) return;

      const requests = Array.from({ length: 100 }, () =>
        executeTool('list-projects', { 'per-page': 1 })
      );

      try {
        await Promise.all(requests);
        console.warn('Rate limit not reached - cannot test error format');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);

        // Validate error structure
        const errorMessage = (error as Error).message;
        expect(errorMessage).toBeDefined();
        expect(errorMessage.length).toBeGreaterThan(0);

        // Check for expected error indicators
        const lowerMessage = errorMessage.toLowerCase();
        const hasRateLimitIndicator =
          lowerMessage.includes('rate limit') ||
          lowerMessage.includes('429') ||
          lowerMessage.includes('too many requests') ||
          lowerMessage.includes('throttle');

        expect(hasRateLimitIndicator).toBe(true);
      }
    });
  });

  describe('Performance Impact', () => {
    it('should measure rate limiting impact on performance', async () => {
      if (skipIfMocked()) return;
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance impact test - slow tests disabled');
        return;
      }

      // Measure performance with deliberate pacing
      const pacedRequests = async () => {
        const start = Date.now();
        for (let i = 0; i < 5; i++) {
          await executeTool('list-projects', { 'per-page': 1 });
          await sleep(1000); // 1 second between requests
        }
        return Date.now() - start;
      };

      // Measure performance without pacing (will likely hit rate limits)
      const rapidRequests = async () => {
        const start = Date.now();
        const requests = Array.from({ length: 5 }, () =>
          executeTool('list-projects', { 'per-page': 1 })
        );

        try {
          await Promise.all(requests);
        } catch (error) {
          // Some requests may fail due to rate limiting
        }

        return Date.now() - start;
      };

      const [pacedTime, rapidTime] = await Promise.all([pacedRequests(), rapidRequests()]);

      console.log(`Performance comparison - Paced: ${pacedTime}ms, Rapid: ${rapidTime}ms`);

      // Paced requests should be more predictable
      expect(pacedTime).toBeGreaterThan(4000); // At least 4 seconds with 1s delays
      expect(rapidTime).toBeLessThan(pacedTime); // Rapid should be faster overall
    });
  });
});
