# Float MCP Server - Code Style & Conventions

## TypeScript Configuration
- **Target**: ES2022 (latest ECMAScript features)
- **Module**: CommonJS for Node.js compatibility
- **Strict Mode**: Enabled with comprehensive type checking
- **Type Definitions**: All exports have explicit types in dist/index.d.ts

## Code Style (ESLint + Prettier)

### ESLint Rules
- **Function Return Types**: Warn if not explicit (`@typescript-eslint/explicit-function-return-type`)
- **No Any**: Warn on `any` usage (`@typescript-eslint/no-explicit-any`)
- **Unused Variables**: Error, except args starting with `_` (`@typescript-eslint/no-unused-vars`)
- **Console Usage**: Warn except for `console.warn` and `console.error`
- **Prettier Integration**: All prettier rules enforced as errors

### Prettier Configuration
```json
{
  "semi": true,                 // Always use semicolons
  "trailingComma": "es5",      // Trailing comma in ES5-valid locations
  "singleQuote": true,         // Use single quotes for strings
  "printWidth": 100,           // Line width limit
  "tabWidth": 2,               // 2-space indentation
  "useTabs": false,            // Use spaces, not tabs
  "endOfLine": "lf"            // Unix line endings
}
```

## Naming Conventions
- **Files**: Kebab-case (e.g., `float-api.ts`, `project-tasks.ts`)
- **Classes**: PascalCase (e.g., `FloatApi`, `BaseTool`)
- **Functions/Variables**: camelCase (e.g., `createTool`, `listPeople`)
- **Constants**: camelCase or UPPER_SNAKE_CASE for environment vars
- **Tool Names**: Kebab-case with descriptive verbs (e.g., `list-people`, `create-project`)

## Architecture Patterns

### Tool Structure
- All tools extend or use `BaseTool` class pattern
- Tools created with `createTool()` helper function
- Consistent parameter validation using Zod schemas
- Standard response format with error handling

### API Integration
- Single `FloatApi` service class handles all HTTP requests
- Centralized error handling with specific error types
- Rate limiting with exponential backoff
- Pagination support with consistent interface

### Type Safety
- Zod schemas for all API request/response validation
- Runtime type checking for all external data
- Explicit return types for all public functions
- Schema-to-JSON conversion for MCP tool definitions

## File Organization
- Domain-driven structure under `src/tools/`
- Logical grouping: `core/`, `project-management/`, `time-management/`, `reporting/`
- Centralized exports in `index.ts` files
- Shared utilities in `utils/` and base classes in `tools/base.ts`

## Error Handling
- Custom error classes for different failure modes
- Consistent error propagation through the stack
- Structured logging with Pino for debugging
- Graceful degradation with meaningful error messages