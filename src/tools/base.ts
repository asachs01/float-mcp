import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { FloatApi } from '../services/float-api.js';

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
}

export const createTool = <T, P extends z.ZodType>(
  name: string,
  description: string,
  schema: P,
  handler: (params: z.infer<P>) => Promise<T>
) => {
  return {
    name,
    description,
    inputSchema: schema,
    handler: async (params: unknown): Promise<ToolResponse<T>> => {
      try {
        // Debug logging
        console.error(`DEBUG: Tool "${name}" received params:`, JSON.stringify(params));
        console.error(`DEBUG: Params type:`, typeof params);
        console.error(`DEBUG: Params is array:`, Array.isArray(params));
        
        const validatedParams = schema.parse(params);
        const result = await handler(validatedParams);
        return { success: true, data: result };
      } catch (error) {
        console.error(`DEBUG: Validation error in ${name}:`, error);
        logger.error(`Error in ${name} tool:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  };
};
