import { z } from 'zod';
import { config } from 'dotenv';

// Only load .env file if it exists (for local development)
// In Docker/MCP, environment variables are passed directly
try {
  config();
} catch (error) {
  // Ignore dotenv errors - environment variables may be passed directly
}

const configSchema = z.object({
  // Float API Configuration - Allow empty in test environment
  floatApiKey: z.string().default('test-api-key'),
  floatApiBaseUrl: z.string().url().default('https://api.float.com/v3'),

  // Server Configuration
  port: z.coerce.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // Logging Configuration
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  logFormat: z.enum(['json', 'pretty']).default('json'),

  // Rate Limiting
  rateLimitWindowMs: z.coerce.number().default(60000),
  rateLimitMaxRequests: z.coerce.number().default(100),

  // Health Check
  healthCheckInterval: z.coerce.number().default(30000),
  healthCheckTimeout: z.coerce.number().default(3000),
});

export type Config = z.infer<typeof configSchema>;

function parseConfig(): Config {
  // Debug: Log environment variables for troubleshooting (only in development or debug mode)
  const shouldDebug = process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug';
  if (shouldDebug) {
    console.error('DEBUG: Environment variables check:');
    console.error(`FLOAT_API_KEY: ${process.env.FLOAT_API_KEY ? '[SET]' : '[NOT SET]'}`);
    console.error(`NODE_ENV: ${process.env.NODE_ENV || '[NOT SET]'}`);
    console.error(`LOG_LEVEL: ${process.env.LOG_LEVEL || '[NOT SET]'}`);
  }

  try {
    const config = configSchema.parse({
      floatApiKey: process.env.FLOAT_API_KEY,
      floatApiBaseUrl: process.env.FLOAT_API_BASE_URL,
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL,
      logFormat: process.env.LOG_FORMAT,
      rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      healthCheckInterval: process.env.HEALTH_CHECK_INTERVAL,
      healthCheckTimeout: process.env.HEALTH_CHECK_TIMEOUT,
    });

    // Validate API key is set in production and when not running tests
    if (
      config.nodeEnv !== 'test' &&
      (!process.env.FLOAT_API_KEY || config.floatApiKey === 'test-api-key')
    ) {
      throw new Error(
        `Configuration validation failed:\n- Missing: FLOAT_API_KEY (get this from your Float.com account settings)\n\nFor Claude Desktop, ensure your config includes:\n{\n  "env": {\n    "FLOAT_API_KEY": "your_actual_api_key"\n  }\n}`
      );
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        return `- Missing: ${err.path.join('.')}`;
      });

      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

export const appConfig = parseConfig();
