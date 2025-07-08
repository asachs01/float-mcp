import { z } from 'zod';
import { config } from 'dotenv';

config();

const configSchema = z.object({
  // Float API Configuration
  floatApiKey: z.string().min(1, 'FLOAT_API_KEY is required'),
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
  try {
    return configSchema.parse({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors
        .filter((err) => err.code === 'too_small')
        .map((err) => err.path.join('.'));

      const errorMessages = error.errors.map((err) => {
        if (err.path.includes('floatApiKey')) {
          return `- Missing: FLOAT_API_KEY (get this from your Float.com account settings)`;
        }
        return `- Missing: ${err.path.join('.')}`;
      });

      throw new Error(
        `Configuration validation failed:\n${errorMessages.join('\n')}\n\nFor Claude Desktop, ensure your config includes:\n{\n  "env": {\n    "FLOAT_API_KEY": "your_actual_api_key"\n  }\n}`
      );
    }
    throw error;
  }
}

export const appConfig = parseConfig();
