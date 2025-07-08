import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { logger, startHealthChecks } from './utils/logger.js';
import { tools } from './tools/index.js';
import { appConfig } from './config/index.js';

// Load environment variables
config();

// Detect if we're running as an MCP server
// Check for explicit --mcp flag or typical MCP environment (piped stdin/stdout)
const isMCPServer = process.argv.includes('--mcp') || (!process.stdin.isTTY && !process.stdout.isTTY);

// Only log startup info if not running as MCP server
if (!isMCPServer) {
  logger.info('Starting Float MCP Server', {
    version: '0.2.0',
    nodeEnv: appConfig.nodeEnv,
    logLevel: appConfig.logLevel,
  });
}

// Create MCP server
const server = new Server(
  {
    name: 'float-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = tools.find((t) => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  try {
    const result = await tool.handler(request.params.arguments || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    // Only log errors if not MCP server to avoid protocol interference
    if (!isMCPServer) {
      logger.error(`Error executing tool ${toolName}:`, error);
    }
    throw error;
  }
});

// Only log registration if not MCP server
if (!isMCPServer) {
  logger.info(`Registered ${tools.length} tools`);
}

// Start health checks
const stopHealthChecks = startHealthChecks();

// Set up transport and run server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Only log success if not MCP server
  if (!isMCPServer) {
    logger.info('Float MCP Server started successfully');
  }
}

// Handle process termination
const gracefulShutdown = (signal: string) => {
  if (!isMCPServer) {
    logger.info(`${signal} received. Shutting down gracefully...`);
  }

  // Stop health checks
  stopHealthChecks();

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
main().catch((error) => {
  // Only log startup errors to stderr if not MCP server
  if (!isMCPServer) {
    logger.error('Failed to start server:', error);
  } else {
    // For MCP server, write to stderr directly
    console.error('Failed to start MCP server:', error);
  }
  process.exit(1);
});
