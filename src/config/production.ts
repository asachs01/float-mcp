// Production configuration for Float MCP Server
// This file defines production-ready defaults and validation

export interface ProductionConfig {
  // API Configuration
  readonly maxRetries: number;
  readonly timeoutMs: number;
  readonly rateLimit: {
    readonly requestsPerSecond: number;
    readonly burstLimit: number;
  };
  
  // Logging Configuration
  readonly logging: {
    readonly level: 'error' | 'warn' | 'info' | 'debug';
    readonly enableRequestLogging: boolean;
    readonly enableErrorTracking: boolean;
  };
  
  // Validation Configuration
  readonly validation: {
    readonly strictMode: boolean;
    readonly enableSchemaValidation: boolean;
  };
}

export const PRODUCTION_CONFIG: ProductionConfig = {
  maxRetries: 3,
  timeoutMs: 30000, // 30 seconds
  rateLimit: {
    requestsPerSecond: 10,
    burstLimit: 50,
  },
  logging: {
    level: 'warn',
    enableRequestLogging: false,
    enableErrorTracking: true,
  },
  validation: {
    strictMode: true,
    enableSchemaValidation: true,
  },
} as const;

export const DEVELOPMENT_CONFIG: ProductionConfig = {
  ...PRODUCTION_CONFIG,
  logging: {
    level: 'debug',
    enableRequestLogging: true,
    enableErrorTracking: true,
  },
  validation: {
    strictMode: false,
    enableSchemaValidation: true,
  },
} as const;

export function getConfig(): ProductionConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
} 