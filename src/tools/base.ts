import { z } from 'zod';
import { logger } from '../utils/logger.js';
import {
  FloatApi,
  ResponseFormat,
  FloatApiError,
  FloatErrorHandler,
} from '../services/float-api.js';

export class BaseTool {
  protected api: FloatApi;
  protected logger = logger;

  constructor(api: FloatApi) {
    this.api = api;
  }
}

export interface ToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  details?: Record<string, unknown>;
  format?: ResponseFormat;
}

// Common format parameter schema
export const formatSchema = z.object({
  format: z
    .enum(['json', 'xml'])
    .optional()
    .default('json')
    .describe('Response format - either "json" or "xml"'),
});

// Helper function to add format parameter to existing schemas
export function withFormatParam<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<T & { format: z.ZodDefault<z.ZodOptional<z.ZodEnum<['json', 'xml']>>> }> {
  return schema.extend({
    format: z
      .enum(['json', 'xml'])
      .optional()
      .default('json')
      .describe('Response format - either "json" or "xml"'),
  }) as z.ZodObject<T & { format: z.ZodDefault<z.ZodOptional<z.ZodEnum<['json', 'xml']>>> }>;
}

export const createTool = <T, P extends z.ZodType>(
  name: string,
  description: string,
  schema: P,
  handler: (params: z.infer<P>) => Promise<T>
): {
  name: string;
  description: string;
  inputSchema: P;
  handler: (params: unknown) => Promise<ToolResponse<T>>;
} => {
  return {
    name,
    description,
    inputSchema: schema,
    handler: async (params: unknown): Promise<ToolResponse<T>> => {
      try {
        const validatedParams = schema.parse(params);
        const result = await handler(validatedParams);

        // Extract format from params if available
        const responseFormat =
          ((validatedParams as Record<string, unknown>).format as ResponseFormat) || 'json';

        return { success: true, data: result, format: responseFormat };
      } catch (error) {
        logger.error(`Error in ${name} tool:`, error);

        // Handle Float API errors with enhanced formatting
        if (error instanceof FloatApiError) {
          return FloatErrorHandler.formatErrorForMcp(error) as ToolResponse<T>;
        }

        // Handle parameter validation errors
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: `Parameter validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
            errorCode: 'PARAMETER_VALIDATION_ERROR',
            details: {
              validationErrors: error.errors,
            },
          } as ToolResponse<T>;
        }

        // Handle other errors
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          errorCode: 'UNKNOWN_ERROR',
        } as ToolResponse<T>;
      }
    },
  };
};
