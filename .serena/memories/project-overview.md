# Float MCP Server - Project Overview

## Project Purpose
The Float MCP Server is a comprehensive Model Context Protocol (MCP) server that provides seamless integration with Float.com - a resource management and project planning platform. It exposes Float's complete REST API as MCP tools, enabling AI assistants like Claude to interact with Float for project management, resource allocation, time tracking, and team coordination.

## Tech Stack
- **Runtime**: Node.js 22.0.0+
- **Language**: TypeScript with strict type checking
- **Framework**: Model Context Protocol (MCP) SDK v1.8.0
- **Validation**: Zod v3.22.4 for schema validation and runtime type checking
- **Logging**: Pino v8.19.0 for structured logging
- **Testing**: Jest v29.7.0 with ts-jest for TypeScript support
- **Build**: TypeScript compiler (tsc)
- **Package Management**: npm
- **Docker**: Ready-to-deploy containerization

## Key Dependencies
- `@modelcontextprotocol/sdk`: Core MCP functionality
- `zod`: Runtime schema validation and type safety
- `dotenv`: Environment variable management
- `pino`: High-performance structured logging
- `fast-xml-parser`: XML parsing for Float API responses

## Project Structure
```
src/
├── config/           # Configuration management
├── services/         # Float API service layer
├── tools/           # MCP tool implementations
│   ├── core/        # Core entities (people, departments, roles, accounts)
│   ├── project-management/  # Project-related tools
│   ├── time-management/     # Time tracking and PTO tools
│   ├── reporting/   # Reports and analytics
│   └── base.ts      # Base tool class and utilities
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (logger, helpers)
└── index.ts         # Main MCP server entry point
```

## Architecture Highlights
- **246+ granular tools** organized by domain (currently the refactoring target)
- **Rate limiting** with exponential backoff for Float API compliance
- **Comprehensive error handling** with specific error types
- **Type safety** throughout with Zod schema validation
- **Pagination support** for large result sets
- **Format flexibility** (JSON/XML output options)
- **Docker containerization** for easy deployment