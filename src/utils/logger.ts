import pino from 'pino';
import { appConfig } from '../config/index.js';

// Detect if we're running as an MCP server (Claude Desktop communication)
// Check for explicit --mcp flag or typical MCP environment (piped stdin/stdout)
const isMCPServer =
  process.argv.includes('--mcp') || (!process.stdin.isTTY && !process.stdout.isTTY);

// Conditionally create transport only when needed and available
let transport: pino.DestinationStream | undefined = undefined;

if (appConfig.logFormat === 'pretty' && !isMCPServer) {
  try {
    transport = pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        destination: process.stderr, // Always use stderr for MCP compatibility
      },
    });
  } catch (error) {
    // If pino-pretty is not available (e.g., in production), fall back to JSON
    console.warn('pino-pretty not available, falling back to JSON logging');
    transport = undefined;
  }
}

// Create logger configuration
interface LoggerConfig {
  level: string;
  formatters: {
    level: (label: string) => { level: string };
  };
  transport?: {
    target: string;
    options: {
      destination: number;
    };
  };
}

const loggerConfig: LoggerConfig = {
  level: isMCPServer ? 'silent' : appConfig.logLevel, // Disable logging for MCP server
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
};

// If not using pretty transport and not MCP server, configure for stderr
if (!transport && !isMCPServer) {
  loggerConfig.transport = {
    target: 'pino/file',
    options: {
      destination: process.stderr.fd,
    },
  };
}

export const logger = pino(loggerConfig, transport);

// Health check function
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
};

// Start periodic health checks
export const startHealthChecks = (): (() => void) => {
  // Skip health checks when running as MCP server to avoid noise
  if (isMCPServer) {
    return () => {}; // No-op cleanup function
  }

  const interval = setInterval(async () => {
    try {
      const health = await healthCheck();
      logger.debug('Health check:', health);
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }, appConfig.healthCheckInterval);

  // Cleanup function
  return () => clearInterval(interval);
};
