import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.js';
import { tools } from './tools/index.js';

// Load environment variables
config();

// Create MCP server
const server = new McpServer({
  name: 'float-mcp',
  version: '0.1.0'
});

// Set up transport
const transport = new StdioServerTransport();

// Register tools
tools.forEach(tool => {
  server.registerTool(tool);
});

// Connect server to transport
server.connect(transport).catch((error) => {
  logger.error('Failed to connect server to transport:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.disconnect().catch((error) => {
    logger.error('Error during server disconnect:', error);
    process.exit(1);
  });
}); 