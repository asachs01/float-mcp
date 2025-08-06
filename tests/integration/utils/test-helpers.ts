import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { tools } from '../../../src/tools/index.ts';
import { TEST_CONFIG, sleep, retryOperation } from '../setup.ts';

// Re-export commonly used functions
export { sleep } from '../setup.ts';
import { logger } from '../../../src/utils/logger.ts';
import { z } from 'zod';

// Test server instance
let testServer: Server | null = null;

// Create test server for testing (simplified approach)
export const createTestServer = (): Server => {
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

// Execute a tool directly using the tool handler
export const executeToolWithRetry = async <T>(
  toolName: string,
  params: Record<string, any>,
  maxRetries: number = TEST_CONFIG.retryAttempts
): Promise<T> => {
  return retryOperation(async () => {
    // Add delay between calls to avoid rate limiting
    await sleep(TEST_CONFIG.apiCallDelay);

    const tool = tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const result = await tool.handler(params || {});

    // Extract data from ToolResponse if needed
    const responseData =
      result && typeof result === 'object' && 'data' in result ? result.data : result;

    return responseData;
  }, maxRetries);
};

// Execute a tool without retries (for testing error scenarios)
export const executeTool = async <T>(toolName: string, params: Record<string, any>): Promise<T> => {
  return executeToolWithRetry(toolName, params, 1);
};

// Get all available tools
export const getAvailableTools = async (): Promise<
  Array<{ name: string; description: string; inputSchema: any }>
> => {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.inputSchema),
  }));
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
export const generateTestProjectData = (overrides: Partial<any> = {}): Record<string, any> => {
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

export const generateTestPersonData = (overrides: Partial<any> = {}): Record<string, any> => {
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

export const generateTestTaskData = (overrides: Partial<any> = {}): Record<string, any> => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Task ${timestamp}_${random}`,
    project_id: 1,
    people_id: 1, // Required field for create-task
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    notes: 'Test task created by integration tests',
    ...overrides,
  };
};

export const generateTestClientData = (overrides: Partial<any> = {}): Record<string, any> => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `Test Client ${timestamp}_${random}`,
    notes: 'Test client created by integration tests',
    ...overrides,
  };
};

export const generateTestAllocationData = (overrides: Partial<any> = {}): Record<string, any> => {
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

// Optimized tool parameter generators
export const generateManageEntityParams = (
  entity_type: string,
  operation: string,
  overrides: Partial<any> = {}
): Record<string, any> => {
  const baseParams = {
    entity_type,
    operation,
    ...overrides,
  };

  // Add entity-specific fields based on type and operation
  switch (entity_type) {
    case 'people':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          ...generateTestPersonData(overrides),
        };
      }
      break;
    case 'projects':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          ...generateTestProjectData(overrides),
        };
      }
      break;
    case 'tasks':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          ...generateTestTaskData(overrides),
        };
      }
      break;
    case 'clients':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          ...generateTestClientData(overrides),
        };
      }
      break;
  }

  return baseParams;
};

export const generateManageProjectWorkflowParams = (
  entity_type: string,
  operation: string,
  overrides: Partial<any> = {}
): Record<string, any> => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  const baseParams = {
    entity_type,
    operation,
    ...overrides,
  };

  // Add workflow-specific fields
  switch (entity_type) {
    case 'phases':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          name: `Test Phase ${timestamp}_${random}`,
          project_id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          color: '#3498db',
          ...overrides,
        };
      }
      break;
    case 'milestones':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          name: `Test Milestone ${timestamp}_${random}`,
          project_id: 1,
          date: '2024-01-15',
          notes: 'Test milestone created by integration tests',
          ...overrides,
        };
      }
      break;
    case 'project-tasks':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          name: `Test Project Task ${timestamp}_${random}`,
          project_id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          estimated_hours: 8,
          ...overrides,
        };
      }
      break;
    case 'allocations':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          person_id: 1,
          project_id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          hours: 8,
          notes: 'Test allocation created by integration tests',
          ...overrides,
        };
      }
      break;
  }

  return baseParams;
};

export const generateManageTimeTrackingParams = (
  entity_type: string,
  operation: string,
  overrides: Partial<any> = {}
): Record<string, any> => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  const baseParams = {
    entity_type,
    operation,
    ...overrides,
  };

  // Add tracking-specific fields
  switch (entity_type) {
    case 'logged-time':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          person_id: 1,
          project_id: 1,
          task_id: 1,
          hours: 8,
          date: '2024-01-01',
          notes: `Test logged time ${timestamp}_${random}`,
          ...overrides,
        };
      }
      break;
    case 'timeoff':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          person_id: 1,
          timeoff_type_id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-01',
          full_day: 1,
          notes: `Test timeoff ${timestamp}_${random}`,
          ...overrides,
        };
      }
      break;
    case 'public-holidays':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          name: `Test Public Holiday ${timestamp}_${random}`,
          date: '2024-12-25',
          country: 'US',
          ...overrides,
        };
      }
      break;
    case 'team-holidays':
      if (operation === 'create' || operation === 'update') {
        return {
          ...baseParams,
          name: `Test Team Holiday ${timestamp}_${random}`,
          start_date: '2024-01-01',
          end_date: '2024-01-01',
          department_id: 1,
          ...overrides,
        };
      }
      break;
  }

  return baseParams;
};

export const generateReportParams = (
  report_type: string,
  overrides: Partial<any> = {}
): Record<string, any> => {
  const baseParams = {
    report_type,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    ...overrides,
  };

  // Add report-specific parameters
  switch (report_type) {
    case 'time-report':
      return {
        ...baseParams,
        person_id: 1,
        project_id: 1,
        group_by: 'person',
        include_billable: true,
        ...overrides,
      };
    case 'project-report':
      return {
        ...baseParams,
        project_id: 1,
        include_allocations: true,
        include_time_entries: true,
        ...overrides,
      };
    case 'people-utilization-report':
      return {
        ...baseParams,
        department_id: 1,
        include_contractors: true,
        utilization_threshold: 80,
        ...overrides,
      };
    default:
      return baseParams;
  }
};

// Helper to clean up test data using optimized tools
export const cleanupTestDataOptimized = async (
  entityType: string,
  entityId: number
): Promise<void> => {
  if (!TEST_CONFIG.enableRealApiCalls) {
    return; // Skip cleanup for mocked tests
  }

  try {
    // Use the optimized manage-entity tool for cleanup
    await executeTool('manage-entity', {
      entity_type: entityType === 'person' ? 'people' : entityType + 's', // Convert to plural
      operation: 'delete',
      id: entityId,
    });
    logger.info(`Cleaned up test ${entityType} ${entityId} using optimized tools`);
  } catch (error) {
    logger.warn(`Failed to clean up test ${entityType} ${entityId}:`, error);
  }
};

// Helper to clean up test data (legacy version for backward compatibility)
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
export const getToolSchema = (toolName: string): any => {
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
