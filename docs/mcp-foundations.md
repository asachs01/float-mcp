# MCP Foundations & Key Concepts

## What is MCP?

MCP (Model Context Protocol) is a protocol and server architecture for exposing structured, tool-based APIs to AI agents and clients.

---

## Core Concepts

- **Tool**: A discrete, self-describing API operation (e.g., `list-people`, `create-project`).
- **Tool Schema**: Each tool defines its input and output schemas (usually with JSON Schema or Zod).
- **MCP Protocol**: JSON-RPC 2.0 based, with methods like `tools/list` and `tools/call`.
- **Mocking**: For testing, all external dependencies (e.g., Float API) must be mockable.
- **Error Handling**: All errors must be structured and informative.

---

## Server Structure

- `src/tools/`: Tool definitions and handlers
- `src/services/`: Service integrations (e.g., Float API)
- `src/config/`: Configuration and environment management
- `tests/`: Comprehensive test suite (integration, unit, mocks)

---

## Key Endpoints

- `/tools/list`: List all available tools and their schemas
- `/tools/call`: Invoke a tool with arguments

---

## Best Practices

- All tools must validate input and output.
- Use Zod for schema validation.
- Ensure all tools are discoverable via `/tools/list`.
- Provide clear error messages and codes. 