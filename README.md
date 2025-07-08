# Float.com MCP Integration

A Mission Control Protocol (MCP) server that interfaces with Float.com's API to manage projects and tasks using natural language through Claude Desktop.

## Features

- **Project Management**: Create, read, update, and manage Float.com projects
- **Task Management**: Handle tasks, assignments, and scheduling
- **People Management**: Manage team members and their allocations
- **Client Management**: Organize and track client information
- **Allocation Management**: Schedule and track resource allocations
- **Natural Language Processing**: Use conversational commands through Claude Desktop
- **Rate Limiting**: Built-in API rate limiting protection
- **Structured Logging**: Comprehensive logging with configurable levels
- **Health Checks**: Monitoring and health verification endpoints

## Prerequisites

### For Docker Setup (Recommended)
- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Float.com API Key**: Get from your Float account settings

### For Local Development
- **Node.js**: Version 22.x or later
- **npm**: Comes with Node.js

## Quick Start

### Option 1: Docker Setup (Recommended for Claude Desktop)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd float-mcp
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Float.com API key
   ```

3. **Build and run with Docker Compose**:
   ```bash
   docker compose up --build -d
   ```

4. **Configure Claude Desktop** (see [Claude Desktop Integration](#claude-desktop-integration))

### Option 2: Local Development Setup

1. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

2. **Edit your environment variables**:
   ```bash
   nano .env  # Add your Float.com API key
   ```

3. **Start the development server**:
   ```bash
   npm run build
   npm start
   ```

## Claude Desktop Integration

### Docker-Based Configuration (Recommended)

Add this configuration to your Claude Desktop config file:

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "float-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "ghcr.io/asachs01/float-mcp:latest"
      ],
      "env": {
        "FLOAT_API_KEY": "your_float_api_key_here"
      }
    }
  }
}
```

**Optional environment variables** (add to `env` section if needed):
```json
{
  "FLOAT_API_BASE_URL": "https://api.float.com/v3",
  "NODE_ENV": "production", 
  "LOG_LEVEL": "error",
  "LOG_FORMAT": "json"
}
```

### Local Script Configuration (Alternative)

If you prefer to run locally, use the launcher script:

```json
{
  "mcpServers": {
    "float-mcp": {
      "command": "/path/to/your/float-mcp/launch-mcp.sh",
      "env": {
        "FLOAT_API_KEY": "your_float_api_key_here",
        "FLOAT_API_BASE_URL": "https://api.float.com/v3",
        "NODE_ENV": "production",
        "LOG_LEVEL": "error",
        "LOG_FORMAT": "json"
      }
    }
  }
}
```

## Docker Usage

### Using Pre-built Images

Pre-built Docker images are available from GitHub Container Registry:

```bash
# Latest version
docker pull ghcr.io/asachs01/float-mcp:latest

# Specific version
docker pull ghcr.io/asachs01/float-mcp:v0.2.0
```

### Building Locally

```bash
# Build the image
docker build -t float-mcp .

# Run with environment variables
docker run --rm -i \
  -e FLOAT_API_KEY="your_api_key" \
  -e FLOAT_API_BASE_URL="https://api.float.com/v3" \
  float-mcp node dist/index.js --mcp
```

### Using Docker Compose

```bash
# Start the service
docker compose up -d

# View logs
docker compose logs -f float-mcp

# Stop the service
docker compose down
```

## Environment Variables

Configure these variables in your `.env` file:

```bash
# Float.com API Configuration (Required)
FLOAT_API_KEY=your_float_api_key_here
FLOAT_API_BASE_URL=https://api.float.com/v3

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info          # error, warn, info, debug
LOG_FORMAT=json         # json, pretty

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Health Check
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=3000
```

## Available Tools

This MCP server provides 25 tools organized into categories:

### Project Management
- `create_project` - Create a new project
- `get_project` - Retrieve project details
- `update_project` - Update project information
- `delete_project` - Remove a project
- `list_projects` - List all projects

### Task Management
- `create_task` - Create a new task
- `get_task` - Retrieve task details
- `update_task` - Update task information
- `delete_task` - Remove a task
- `list_tasks` - List all tasks

### People Management
- `create_person` - Add a new team member
- `get_person` - Retrieve person details
- `update_person` - Update person information
- `delete_person` - Remove a person
- `list_people` - List all team members

### Client Management
- `create_client` - Add a new client
- `get_client` - Retrieve client details
- `update_client` - Update client information
- `delete_client` - Remove a client
- `list_clients` - List all clients

### Allocation Management
- `create_allocation` - Create a new allocation
- `get_allocation` - Retrieve allocation details
- `update_allocation` - Update allocation information
- `delete_allocation` - Remove an allocation
- `list_allocations` - List all allocations

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build TypeScript
npm run build

# Development mode (watch)
npm run dev
```

## Troubleshooting

### Common Issues

#### 1. "Float MCP server is disabled" in Claude Desktop

**Cause**: Node.js path issues or configuration errors.

**Solutions**:
- Use the Docker-based configuration (recommended)
- Check that your API key is correct
- Verify the file paths in your configuration
- Check Claude Desktop logs for specific errors

#### 2. "Configuration validation failed"

**Cause**: Missing or invalid environment variables.

**Solution**: Ensure your `.env` file contains all required variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

#### 3. Docker build fails

**Cause**: Missing dependencies or build issues.

**Solution**:
```bash
# Clean rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

#### 4. API connection issues

**Cause**: Invalid API key or network connectivity.

**Solution**:
- Verify your Float.com API key
- Check your internet connection
- Ensure Float.com API is accessible

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
export LOG_LEVEL=debug

# Or in Docker
docker run --rm -i -e LOG_LEVEL=debug ghcr.io/asachs01/float-mcp:latest
```

### Testing MCP Connection

Test the server manually:

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | \
  docker run --rm -i \
    -e FLOAT_API_KEY="your_key" \
    ghcr.io/asachs01/float-mcp:latest
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

[LICENSE](LICENSE)

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review Float.com API documentation 
