import { logger } from '../utils/logger.js';
import { appConfig } from '../config/index.js';
import { z } from 'zod';

// Request queue for rate limiting
let requestQueue: number[] = [];
let cleanupInterval: NodeJS.Timeout | null = null;

// Clean up old requests
const startCleanup = () => {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    requestQueue = requestQueue.filter(
      (timestamp) => now - timestamp < appConfig.rateLimitWindowMs
    );
  }, 1000);
};

// Stop cleanup
export const stopCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Wait for rate limit
const waitForRateLimit = async (): Promise<void> => {
  startCleanup();
  while (requestQueue.length >= appConfig.rateLimitMaxRequests) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  requestQueue.push(Date.now());
};

export class FloatApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'FloatApiError';
  }
}

export class FloatApi {
  private baseURL: string;
  private apiKey: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || appConfig.floatApiKey;
    this.baseURL = baseURL || appConfig.floatApiBaseUrl;
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: unknown,
    schema?: z.ZodType<T>
  ): Promise<T> {
    await waitForRateLimit();

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const requestUrl = `${this.baseURL}${url}`;
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      logger.debug('API Request:', {
        url: requestUrl,
        method,
      });

      const response = await fetch(requestUrl, requestOptions);

      logger.debug('API Response:', {
        url: requestUrl,
        method,
        status: response.status,
      });

      return this.handleResponse(response, schema);
    } catch (error) {
      logger.error('API Error:', {
        url: requestUrl,
        method,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async handleResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new FloatApiError(`Request failed with status code ${response.status}`, response.status, errorData);
    }

    const data = await response.json();
    
    // Debug logging for response data
    console.error(`DEBUG: API Response status: ${response.status}`);
    console.error(`DEBUG: API Response data type:`, typeof data);
    console.error(`DEBUG: API Response is array:`, Array.isArray(data));
    console.error(`DEBUG: API Response data:`, JSON.stringify(data, null, 2));

    if (schema) {
      try {
      return schema.parse(data);
      } catch (error) {
        console.error(`DEBUG: Schema validation failed:`, error);
        console.error(`DEBUG: Expected schema:`, schema);
        console.error(`DEBUG: Received data:`, data);
        throw error;
      }
    }

    return data as T;
  }

  async get<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
    return this.makeRequest<T>('GET', url, undefined, schema);
  }

  async post<T>(url: string, data: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.makeRequest<T>('POST', url, data, schema);
  }

  async put<T>(url: string, data: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.makeRequest<T>('PUT', url, data, schema);
  }

  async delete<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
    return this.makeRequest<T>('DELETE', url, undefined, schema);
  }
}

// Create and export a default instance
export const floatApi = new FloatApi();
