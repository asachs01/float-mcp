import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { FloatApi, FloatApiError } from '../../../src/services/float-api.js';

describe('FloatApi', () => {
  let api: FloatApi;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    api = new FloatApi('test-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('should make a GET request with correct headers', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.get('/test');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.float.com/v3/test',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should throw FloatApiError on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      await expect(api.get('/test')).rejects.toThrow(FloatApiError);
    });
  });

  describe('post', () => {
    it('should make a POST request with correct headers and body', async () => {
      const mockResponse = { data: 'test' };
      const requestBody = { test: 'data' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.post('/test', requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.float.com/v3/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('put', () => {
    it('should make a PUT request with correct headers and body', async () => {
      const mockResponse = { data: 'test' };
      const requestBody = { test: 'data' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.put('/test', requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.float.com/v3/test',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('delete', () => {
    it('should make a DELETE request with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.float.com/v3/test',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limits', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Make multiple requests in quick succession
      const requests = Array(5)
        .fill(null)
        .map(() => api.get('/test'));
      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toEqual(mockResponse);
      });
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });
});
