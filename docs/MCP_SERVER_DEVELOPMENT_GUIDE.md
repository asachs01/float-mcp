# MCP Server Development Guide

A comprehensive guide for creating production-ready Model Context Protocol (MCP) servers, based on real-world development experience.

## Table of Contents

1. [Project Setup](#project-setup)
2. [API Integration](#api-integration)
3. [Testing Strategy](#testing-strategy)
4. [DXT Extension Packaging](#dxt-extension-packaging)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Project Setup

### Initial Structure

```
mcp-server-template/
├── .github/workflows/
│   ├── ci.yml
│   ├── release.yml
│   └── docker-publish.yml
├── src/
│   ├── index.ts                 # MCP server entrypoint
│   ├── config/
│   │   ├── index.ts
│   │   └── production.ts
│   ├── services/
│   │   └── api-client.ts        # API integration layer
│   ├── tools/
│   │   ├── base.ts              # Base tool class
│   │   ├── index.ts
│   │   └── [domain]/            # Domain-specific tools
│   ├── types/
│   │   └── api.ts               # API response types
│   └── utils/
│       └── logger.ts
├── tests/
│   ├── integration/
│   ├── unit/
│   └── setup.ts
├── docker-compose.yml
├── Dockerfile
├── manifest.json                # DXT manifest
├── .dxtignore
├── .prettierignore
├── jest.config.ts
├── tsconfig.json
└── package.json
```

### Key Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Essential Configuration Files

#### `.prettierignore`
```
node_modules/
dist/
coverage/
*.log
.env
```

#### `.dxtignore`
```
plans/
coverage/
.taskmaster/
.roo/
.husky/
.cursor/
.github/
prompt_logs/
docs/
tests/
Dockerfile
docker-compose.yml
README.md
CHANGELOG.md
setup.sh
scripts/
jest.config.ts
jest.resolver.js
package-lock.json
*.log
*.md
*.test.*
```

## API Integration

### Base API Client Pattern

```typescript
// src/services/api-client.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';

export class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    // Add request/response interceptors for logging
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`[API] Error: ${error.response?.status} ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
    const response: AxiosResponse = await this.client.get(url);
    return schema.parse(response.data);
  }
  
  async post<T>(url: string, data: any, schema: z.ZodSchema<T>): Promise<T> {
    const response: AxiosResponse = await this.client.post(url, data);
    return schema.parse(response.data);
  }
  
  // Add other methods as needed
}
```

### Authentication Patterns

#### API Key Authentication
```typescript
// src/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  API_KEY: z.string().min(1, 'API key is required'),
  API_BASE_URL: z.string().url('Invalid API base URL'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const config = configSchema.parse(process.env);
```

#### OAuth Authentication
```typescript
// src/services/oauth-client.ts
export class OAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }
  
  getAuthUrl(): string {
    return `https://api.example.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code`;
  }
  
  async exchangeCodeForToken(code: string): Promise<string> {
    // Implementation for OAuth token exchange
  }
}
```

## Testing Strategy

### Unit Testing Pattern

```typescript
// tests/unit/tools/example.test.ts
import { ExampleTool } from '../../../src/tools/example';

describe('ExampleTool', () => {
  let tool: ExampleTool;
  
  beforeEach(() => {
    tool = new ExampleTool();
  });
  
  describe('execute', () => {
    it('should handle valid input', async () => {
      const result = await tool.execute({ input: 'test' });
      expect(result).toBeDefined();
    });
    
    it('should handle invalid input', async () => {
      await expect(tool.execute({ input: '' }))
        .rejects.toThrow('Input is required');
    });
  });
});
```

### Integration Testing Pattern

```typescript
// tests/integration/api-client.test.ts
import { ApiClient } from '../../src/services/api-client';

describe('ApiClient Integration', () => {
  let client: ApiClient;
  
  beforeAll(() => {
    client = new ApiClient(
      process.env.TEST_API_BASE_URL!,
      process.env.TEST_API_KEY!
    );
  });
  
  it('should fetch data successfully', async () => {
    const data = await client.get('/endpoint', responseSchema);
    expect(data).toBeDefined();
  });
});
```

### Docker Testing Environment

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-api:
    image: mockserver/mockserver
    ports:
      - "1080:1080"
    environment:
      MOCKSERVER_INITIALIZATION_JSON_PATH: /config/initializerJson.json
    volumes:
      - ./tests/mocks:/config
```

## DXT Extension Packaging

### Manifest Structure

```json
{
  "name": "Your MCP Server",
  "version": "1.0.0",
  "description": "MCP server for Your API",
  "entry_point": "dist/index.js",
  "mcp_config": {
    "command": "node",
    "args": ["dist/index.js"],
    "env": {
      "API_KEY": "${user_config.API_KEY}",
      "API_BASE_URL": "${user_config.API_BASE_URL}",
      "LOG_LEVEL": "${user_config.LOG_LEVEL}"
    }
  },
  "user_config": {
    "API_KEY": {
      "type": "string",
      "description": "Your API key",
      "required": true
    },
    "API_BASE_URL": {
      "type": "string",
      "description": "API base URL",
      "default": "https://api.example.com"
    },
    "LOG_LEVEL": {
      "type": "string",
      "enum": ["debug", "info", "warn", "error"],
      "default": "info"
    }
  }
}
```

### Debug Logging for DXT

```typescript
// src/index.ts - Add at the very top
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

console.error('[DEBUG] MCP server entrypoint reached:', __filename, process.cwd(), process.argv, process.env);

if (!process.env.API_KEY) {
  console.error('[DEBUG] API_KEY is missing!');
  process.exit(1);
}
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### GitHub Actions Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Extract version from tag
        id: extract_version
        run: |
          echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Extract release notes from CHANGELOG.md
        id: extract_release_notes
        run: |
          version="${{ steps.extract_version.outputs.VERSION }}"
          echo "Extracting release notes for version $version"
          awk -v version="$version" '
          BEGIN { found=0; content="" }
          /^## \[.*\] - / {
            if (found) exit
            if (match($0, /\[([^\]]+)\]/, arr) && arr[1] == version) found=1
            next
          }
          /^## \[.*\] - / && found { exit }
          found && !/^#/ {
            if (content == "" && $0 == "") next
            content = content $0 "\n"
          }
          END {
            gsub(/\n+$/, "", content)
            print content
          }' CHANGELOG.md > release-notes.md
          echo "Release notes extracted to release-notes.md"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: "Release ${{ github.ref_name }}"
          body_path: release-notes.md
          draft: false
          prerelease: ${{ contains(steps.extract_version.outputs.VERSION, '-') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. DXT Extension Not Starting in Claude Desktop

**Symptoms**: Extension works in MCP Inspector but fails in Claude Desktop
**Solutions**:
- Ensure `dist/index.js` exists and is the entrypoint
- Add robust debug logging at the top of entrypoint
- Check that `node_modules/` is included in DXT package
- Verify environment variables are properly mapped
- Check Claude Desktop logs: `~/Library/Logs/Claude/mcp-*.log`

#### 2. Prettier CI Errors

**Symptoms**: CI fails on formatting checks
**Solutions**:
- Run `npx prettier --write .` locally
- Ensure `.prettierignore` excludes generated files
- Commit formatting fixes before pushing

#### 3. API Rate Limiting

**Symptoms**: API calls fail with 429 errors
**Solutions**:
- Implement exponential backoff
- Add request queuing
- Use API client with built-in rate limiting

#### 4. Type Validation Errors

**Symptoms**: Zod validation fails on API responses
**Solutions**:
- Log raw API responses for debugging
- Make schema fields optional where appropriate
- Add transform functions for data normalization

### Debug Checklist

- [ ] Check Claude Desktop logs
- [ ] Verify environment variables
- [ ] Test entrypoint manually: `node dist/index.js`
- [ ] Check file permissions in DXT package
- [ ] Verify Node.js version compatibility
- [ ] Test API connectivity
- [ ] Review manifest.json configuration

## Best Practices

### Code Organization

1. **Separation of Concerns**: Keep API logic, MCP tools, and configuration separate
2. **Type Safety**: Use Zod for runtime validation and TypeScript for compile-time checks
3. **Error Handling**: Implement comprehensive error handling with meaningful messages
4. **Logging**: Use structured logging with configurable levels

### Performance

1. **Caching**: Implement caching for frequently accessed data
2. **Rate Limiting**: Respect API rate limits and implement backoff strategies
3. **Connection Pooling**: Reuse HTTP connections where possible
4. **Lazy Loading**: Load data only when needed

### Security

1. **Environment Variables**: Never hardcode sensitive data
2. **Input Validation**: Validate all inputs with Zod schemas
3. **Error Messages**: Don't expose sensitive information in error messages
4. **Dependencies**: Regularly update dependencies and audit for vulnerabilities

### Testing

1. **Test Coverage**: Aim for >90% test coverage
2. **Integration Tests**: Test against real or mocked APIs
3. **Docker Testing**: Use Docker for consistent test environments
4. **CI/CD**: Automate testing in CI/CD pipelines

### Documentation

1. **README**: Include setup, usage, and troubleshooting information
2. **API Documentation**: Document all tools and their parameters
3. **Changelog**: Maintain a detailed changelog following Keep a Changelog format
4. **Examples**: Provide usage examples for common scenarios

## Quick Start Checklist

- [ ] Initialize project with TypeScript and essential dependencies
- [ ] Set up API client with authentication
- [ ] Create base tool class and implement domain-specific tools
- [ ] Add comprehensive testing (unit + integration)
- [ ] Configure Docker for development and deployment
- [ ] Set up CI/CD with GitHub Actions
- [ ] Create DXT manifest and test extension packaging
- [ ] Implement release workflow with changelog extraction
- [ ] Add comprehensive error handling and logging
- [ ] Document setup and usage instructions

This guide should provide a solid foundation for creating production-ready MCP servers quickly and efficiently. 