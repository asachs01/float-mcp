import { logger } from '../utils/logger.js';
import { appConfig } from '../config/index.js';
import { z } from 'zod';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

// Response format types
export type ResponseFormat = 'json' | 'xml';

// Base error class for Float API errors
export class FloatApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
    public code?: string
  ) {
    super(message);
    this.name = 'FloatApiError';
    this.code = code;
  }
}

// Rate limit error (429 responses)
export class FloatRateLimitError extends FloatApiError {
  constructor(
    message: string,
    public retryAfter?: number,
    public data?: unknown
  ) {
    super(message, 429, data, 'RATE_LIMIT_EXCEEDED');
    this.name = 'FloatRateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Authentication error (401 responses)
export class FloatAuthError extends FloatApiError {
  constructor(
    message: string,
    public data?: unknown
  ) {
    super(message, 401, data, 'AUTHENTICATION_FAILED');
    this.name = 'FloatAuthError';
  }
}

// Authorization error (403 responses)
export class FloatAuthorizationError extends FloatApiError {
  constructor(
    message: string,
    public data?: unknown
  ) {
    super(message, 403, data, 'AUTHORIZATION_FAILED');
    this.name = 'FloatAuthorizationError';
  }
}

// Validation error (400 responses)
export class FloatValidationError extends FloatApiError {
  constructor(
    message: string,
    public validationErrors?: Record<string, string[]>,
    public data?: unknown
  ) {
    super(message, 400, data, 'VALIDATION_ERROR');
    this.name = 'FloatValidationError';
    this.validationErrors = validationErrors;
  }
}

// Not found error (404 responses)
export class FloatNotFoundError extends FloatApiError {
  constructor(
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message, 404, undefined, 'RESOURCE_NOT_FOUND');
    this.name = 'FloatNotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

// Server error (5xx responses)
export class FloatServerError extends FloatApiError {
  constructor(
    message: string,
    status: number,
    public data?: unknown
  ) {
    super(message, status, data, 'SERVER_ERROR');
    this.name = 'FloatServerError';
  }
}

// Network/connection error
export class FloatNetworkError extends FloatApiError {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message, undefined, undefined, 'NETWORK_ERROR');
    this.name = 'FloatNetworkError';
    this.originalError = originalError;
  }
}

// Response parsing error
export class FloatParseError extends FloatApiError {
  constructor(
    message: string,
    public originalError?: Error,
    public rawResponse?: string
  ) {
    super(message, undefined, undefined, 'PARSE_ERROR');
    this.name = 'FloatParseError';
    this.originalError = originalError;
    this.rawResponse = rawResponse;
  }
}

// Schema validation error
export class FloatSchemaValidationError extends FloatApiError {
  constructor(
    message: string,
    public validationError: Error,
    public receivedData?: unknown
  ) {
    super(message, undefined, undefined, 'SCHEMA_VALIDATION_ERROR');
    this.name = 'FloatSchemaValidationError';
    this.validationError = validationError;
    this.receivedData = receivedData;
  }
}

// XML parser configuration
const xmlParserOptions = {
  ignoreAttributes: false,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  ignoreNameSpace: false,
  removeNSPrefix: false,
  parseNodeValue: true,
  cdataTagName: '__cdata',
  cdataPositionChar: '\\c',
  arrayMode: false,
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
};

const xmlParser = new XMLParser(xmlParserOptions);

// Format conversion utilities
export class FormatConverter {
  static parseXmlToJson(xmlString: string): any {
    try {
      return xmlParser.parse(xmlString);
    } catch (error) {
      logger.error('Failed to parse XML:', error);
      throw new FloatApiError('Invalid XML format in response');
    }
  }

  static jsonToXml(jsonData: any): string {
    try {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
      });
      return builder.build(jsonData);
    } catch (error) {
      logger.error('Failed to convert JSON to XML:', error);
      throw new FloatApiError('Failed to convert response to XML format');
    }
  }

  static getAcceptHeader(format: ResponseFormat): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml, text/xml';
      default:
        return 'application/json';
    }
  }

  static getContentType(format: ResponseFormat): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/json';
    }
  }

  static processResponse(data: any, format: ResponseFormat, originalFormat: ResponseFormat): any {
    // If requested format matches original format, return as-is
    if (format === originalFormat) {
      return data;
    }

    // Convert between formats
    if (originalFormat === 'json' && format === 'xml') {
      return FormatConverter.jsonToXml(data);
    } else if (originalFormat === 'xml' && format === 'json') {
      return FormatConverter.parseXmlToJson(data);
    }

    return data;
  }
}

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

// Centralized error handler for Float API responses
class FloatErrorHandler {
  static createErrorFromResponse(response: Response, errorData: any): FloatApiError {
    const status = response.status;
    const statusText = response.statusText;

    switch (status) {
      case 400:
        return new FloatValidationError(
          `Validation failed: ${errorData?.message || statusText}`,
          errorData?.errors || errorData?.validation_errors,
          errorData
        );

      case 401:
        return new FloatAuthError(
          `Authentication failed: ${errorData?.message || 'Invalid or missing API key'}`,
          errorData
        );

      case 403:
        return new FloatAuthorizationError(
          `Authorization failed: ${errorData?.message || 'Insufficient permissions'}`,
          errorData
        );

      case 404:
        return new FloatNotFoundError(
          `Resource not found: ${errorData?.message || statusText}`,
          errorData?.resource_type,
          errorData?.resource_id
        );

      case 429: {
        const retryAfter = response.headers.get('Retry-After');
        return new FloatRateLimitError(
          `Rate limit exceeded: ${errorData?.message || 'Too many requests'}`,
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          errorData
        );
      }

      case 500:
      case 502:
      case 503:
      case 504:
        return new FloatServerError(
          `Server error: ${errorData?.message || statusText}`,
          status,
          errorData
        );

      default:
        return new FloatApiError(
          `Float API request failed: ${status} ${statusText}`,
          status,
          errorData,
          'UNKNOWN_ERROR'
        );
    }
  }

  static async handleNetworkError(error: Error, url: string, method: string): Promise<never> {
    logger.error('Network error:', {
      url,
      method,
      message: error.message,
      stack: error.stack,
    });

    // Check for common network errors
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new FloatNetworkError(
        `Cannot connect to Float API at ${url}. Please check your internet connection and API base URL.`,
        error
      );
    }

    if (error.message.includes('timeout')) {
      throw new FloatNetworkError(
        `Request to Float API timed out. The service may be experiencing high load.`,
        error
      );
    }

    throw new FloatNetworkError(
      `Network error when connecting to Float API: ${error.message}`,
      error
    );
  }

  static formatErrorForMcp(error: FloatApiError): {
    success: false;
    error: string;
    errorCode?: string;
    details?: any;
  } {
    const result: any = {
      success: false,
      error: error.message,
    };

    if (error.code) {
      result.errorCode = error.code;
    }

    // Add specific error details based on error type
    if (error instanceof FloatValidationError && error.validationErrors) {
      result.details = {
        validationErrors: error.validationErrors,
      };
    } else if (error instanceof FloatRateLimitError && error.retryAfter) {
      result.details = {
        retryAfter: error.retryAfter,
      };
    } else if (error instanceof FloatNotFoundError) {
      result.details = {
        resourceType: error.resourceType,
        resourceId: error.resourceId,
      };
    } else if (error instanceof FloatNetworkError && error.originalError) {
      result.details = {
        networkError: error.originalError.message,
      };
    } else if (error instanceof FloatSchemaValidationError) {
      result.details = {
        schemaValidationError: error.validationError.message,
        receivedData: error.receivedData,
      };
    }

    return result;
  }
}

export class FloatApi {
  private baseURL: string;
  private apiKey: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || appConfig.floatApiKey;
    this.baseURL = baseURL || appConfig.floatApiBaseUrl;
  }

  // Enhanced rate limit handling with retry logic
  private async handleRateLimitRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: FloatRateLimitError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof FloatRateLimitError) {
          lastError = error;

          if (attempt === maxRetries) {
            logger.error('Rate limit exceeded after all retries:', {
              attempts: attempt + 1,
              retryAfter: error.retryAfter,
            });
            throw error;
          }

          // Calculate delay: use Retry-After header if available, otherwise exponential backoff
          const delay = error.retryAfter
            ? error.retryAfter * 1000
            : baseDelay * Math.pow(2, attempt);

          logger.warn('Rate limit exceeded, retrying...', {
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
            delayMs: delay,
            retryAfter: error.retryAfter,
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Re-throw non-rate-limit errors immediately
        throw error;
      }
    }

    throw lastError || new FloatRateLimitError('Rate limit exceeded after all retries');
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: unknown,
    schema?: z.ZodType<T>,
    format: ResponseFormat = 'json'
  ): Promise<T> {
    await waitForRateLimit();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': FormatConverter.getContentType(format),
      Accept: FormatConverter.getAcceptHeader(format),
      'User-Agent': 'Float MCP Server v0.3.1 (github.com/asachs01/float-mcp)', // Required by Float API
    };

    const requestUrl = `${this.baseURL}${url}`;
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (format === 'xml') {
        requestOptions.body = FormatConverter.jsonToXml(data);
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      logger.debug('API Request:', {
        url: requestUrl,
        method,
        format,
        data: data
          ? format === 'xml'
            ? FormatConverter.jsonToXml(data)
            : JSON.stringify(data)
          : undefined,
      });

      const response = await fetch(requestUrl, requestOptions);

      logger.debug('API Response:', {
        url: requestUrl,
        method,
        status: response.status,
        statusText: response.statusText,
      });

      return this.handleResponse(response, schema, format);
    } catch (error) {
      // Handle network errors (fetch failures)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await FloatErrorHandler.handleNetworkError(error, requestUrl, method);
      }

      // Re-throw FloatApiError instances (from handleResponse)
      if (error instanceof FloatApiError) {
        throw error;
      }

      // Handle other unexpected errors
      logger.error('Unexpected API Error:', {
        url: requestUrl,
        method,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new FloatApiError(
        `Unexpected error during API request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  private async handleResponse<T>(
    response: Response,
    schema?: z.ZodType<T>,
    requestedFormat: ResponseFormat = 'json'
  ): Promise<T> {
    if (!response.ok) {
      let errorData: any = null;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
          const xmlText = await response.text();
          errorData = FormatConverter.parseXmlToJson(xmlText);
        } else {
          errorData = await response.json();
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorData = { message: response.statusText };
      }

      logger.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        format: requestedFormat,
      });

      throw FloatErrorHandler.createErrorFromResponse(response, errorData);
    }

    let data: any;
    let originalFormat: ResponseFormat = 'json';

    try {
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        originalFormat = 'xml';
        const xmlText = await response.text();
        data = FormatConverter.parseXmlToJson(xmlText);
      } else {
        originalFormat = 'json';
        data = await response.json();
      }
    } catch (parseError) {
      logger.error('Failed to parse API response:', parseError);
      const rawResponse = await response.text();
      throw new FloatParseError(
        `Invalid ${originalFormat.toUpperCase()} response from Float API`,
        parseError instanceof Error ? parseError : new Error(String(parseError)),
        rawResponse
      );
    }

    logger.debug('API Response parsed:', {
      status: response.status,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : undefined,
      originalFormat,
      requestedFormat,
    });

    if (schema) {
      try {
        const validatedData = schema.parse(data);
        // Apply format conversion after validation
        return FormatConverter.processResponse(validatedData, requestedFormat, originalFormat);
      } catch (error) {
        logger.error('Schema validation failed:', {
          error: error instanceof Error ? error.message : 'Unknown validation error',
          receivedData: data,
          originalFormat,
          requestedFormat,
        });
        throw new FloatSchemaValidationError(
          `API response validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error : new Error(String(error)),
          data
        );
      }
    }

    // Apply format conversion for non-schema responses
    return FormatConverter.processResponse(data, requestedFormat, originalFormat) as T;
  }

  async get<T>(url: string, schema?: z.ZodType<T>, format: ResponseFormat = 'json'): Promise<T> {
    return this.handleRateLimitRetry(() =>
      this.makeRequest<T>('GET', url, undefined, schema, format)
    );
  }

  async post<T>(
    url: string,
    data: unknown,
    schema?: z.ZodType<T>,
    format: ResponseFormat = 'json'
  ): Promise<T> {
    return this.handleRateLimitRetry(() => this.makeRequest<T>('POST', url, data, schema, format));
  }

  async put<T>(
    url: string,
    data: unknown,
    schema?: z.ZodType<T>,
    format: ResponseFormat = 'json'
  ): Promise<T> {
    return this.handleRateLimitRetry(() => this.makeRequest<T>('PUT', url, data, schema, format));
  }

  async patch<T>(
    url: string,
    data: unknown,
    schema?: z.ZodType<T>,
    format: ResponseFormat = 'json'
  ): Promise<T> {
    return this.handleRateLimitRetry(() => this.makeRequest<T>('PATCH', url, data, schema, format));
  }

  async delete<T>(url: string, schema?: z.ZodType<T>, format: ResponseFormat = 'json'): Promise<T> {
    return this.handleRateLimitRetry(() =>
      this.makeRequest<T>('DELETE', url, undefined, schema, format)
    );
  }

  // Helper method to build query parameters
  buildQueryParams(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Helper method for paginated requests
  async getPaginated<T>(
    url: string,
    params?: Record<string, any>,
    schema?: z.ZodType<T[]>,
    format: ResponseFormat = 'json'
  ): Promise<T[]> {
    const queryString = this.buildQueryParams({
      ...params,
      'per-page': params?.['per-page'] || 200, // Float API max page size
    });

    return this.get<T[]>(`${url}${queryString}`, schema, format);
  }
}

// Create and export a default instance
export const floatApi = new FloatApi();

// Export error handler for external use
export { FloatErrorHandler };
