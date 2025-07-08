import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { tools } from '../../../src/tools/index.ts';
import { TEST_CONFIG, sleep, retryOperation } from '../setup.ts';
import { logger } from '../../../src/utils/logger.ts';
import { z } from 'zod';

// Test server instance
let testServer: Server | null = null;

// Create test server
export const createTestServer = () => {
  if (testServer) {
    return testServer;
  }

  testServer = new Server(
    {
      name: 'float-mcp-test',
      version: '0.2.2',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register tool list handler
  testServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.inputSchema),
      })),
    };
  });

  // Register tool call handler
  testServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = tools.find((t) => t.name === toolName);

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const result = await tool.handler(request.params.arguments || {});

    // Extract data from ToolResponse if needed
    const responseData =
      result && typeof result === 'object' && 'data' in result ? result.data : result;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(responseData, null, 2),
        },
      ],
    };
  });

  return testServer;
};

// Execute a tool with proper error handling and retries
export const executeToolWithRetry = async <T>(
  toolName: string,
  params: Record<string, any>,
  maxRetries: number = TEST_CONFIG.retryAttempts
): Promise<T> => {
  return retryOperation(async () => {
    const server = createTestServer();

    // Add delay between calls to avoid rate limiting
    await sleep(TEST_CONFIG.apiCallDelay);

    const result = await server.processRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    });

    if ('error' in result) {
      throw new Error(result.error.message);
    }

    // Parse the text response
    const content = result.result.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }

    throw new Error('Unexpected response format');
  }, maxRetries);
};

// Execute a tool without retries (for testing error scenarios)
export const executeTool = async <T>(toolName: string, params: Record<string, any>): Promise<T> => {
  return executeToolWithRetry(toolName, params, 1);
};

// Get all available tools
export const getAvailableTools = async () => {
  const server = createTestServer();

  const result = await server.processRequest({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  });

  if ('error' in result) {
    throw new Error(result.error.message);
  }

  return result.result.tools;
};

// Validate tool response against schema
export const validateToolResponse = <T>(response: any, schema: z.ZodSchema<T>): T => {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Schema validation failed: ${error.message}`);
    }
    throw error;
  }
};

// Test data generators
export const generateTestProjectData = (overrides: Partial<any> = {}) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Project ${timestamp}_${random}`,
    client_id: 1,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    notes: 'Test project created by integration tests',
    active: 1,
    ...overrides,
  };
};

export const generateTestPersonData = (overrides: Partial<any> = {}) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Person ${timestamp}_${random}`,
    email: `test.person.${timestamp}@example.com`,
    job_title: 'Test Developer',
    active: 1,
    employee_type: 1,
    ...overrides,
  };
};

export const generateTestTaskData = (overrides: Partial<any> = {}) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Task ${timestamp}_${random}`,
    project_id: 1,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    notes: 'Test task created by integration tests',
    ...overrides,
  };
};

export const generateTestClientData = (overrides: Partial<any> = {}) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Client ${timestamp}_${random}`,
    notes: 'Test client created by integration tests',
    ...overrides,
  };
};

export const generateTestAllocationData = (overrides: Partial<any> = {}) => {
  return {
    person_id: 1,
    project_id: 1,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    hours: 8,
    notes: 'Test allocation created by integration tests',
    ...overrides,
  };
};

// Helper to clean up test data
export const cleanupTestData = async (entityType: string, entityId: number): Promise<void> => {
  if (!TEST_CONFIG.enableRealApiCalls) {
    return; // Skip cleanup for mocked tests
  }

  try {
    const deleteToolName = `delete-${entityType}`;
    const idParam = `${entityType}_id`;

    await executeTool(deleteToolName, { [idParam]: entityId });
    logger.info(`Cleaned up test ${entityType} ${entityId}`);
  } catch (error) {
    logger.warn(`Failed to clean up test ${entityType} ${entityId}:`, error);
  }
};

// Helper to wait for async operations
export const waitFor = async (
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 500
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

// Helper to check if a tool exists
export const toolExists = (toolName: string): boolean => {
  return tools.some((tool) => tool.name === toolName);
};

// Helper to get tool schema
export const getToolSchema = (toolName: string) => {
  const tool = tools.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }
  return tool.inputSchema;
};

// Helper to validate tool parameters
export const validateToolParameters = <T>(toolName: string, params: any): T => {
  const schema = getToolSchema(toolName);
  return validateToolResponse(params, schema);
};

// Error assertion helpers
export const expectError = async (
  operation: () => Promise<any>,
  expectedErrorMessage?: string
): Promise<Error> => {
  try {
    await operation();
    throw new Error('Expected operation to throw an error');
  } catch (error) {
    if (expectedErrorMessage && error instanceof Error) {
      expect(error.message).toContain(expectedErrorMessage);
    }
    return error as Error;
  }
};

// Rate limiting helper
export const withRateLimit = async <T>(operation: () => Promise<T>): Promise<T> => {
  await sleep(TEST_CONFIG.apiCallDelay);
  return operation();
};

// Batch operation helper
export const executeBatch = async <T>(
  operations: Array<() => Promise<T>>,
  batchSize: number = TEST_CONFIG.maxConcurrentRequests
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((op) => withRateLimit(op)));
    results.push(...batchResults);
  }

  return results;
};
