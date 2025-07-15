# Float MCP Server

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

A comprehensive **Model Context Protocol (MCP) server** that provides seamless integration with [Float.com](https://float.com) - the resource management and project planning platform. This server exposes Float's complete API as MCP tools, enabling AI assistants like Claude to interact with Float for project management, resource allocation, time tracking, and team coordination.

## 🌟 Features

### **Complete Float API Coverage**

- **👥 People Management** - Full CRUD operations for team members
- **📁 Project Management** - Projects, phases, tasks, and milestones
- **⏱️ Time Tracking** - Logged time, timesheets, and billable hours
- **📊 Resource Allocation** - Team member assignments and scheduling
- **🎯 Task Management** - Project tasks, dependencies, and workflows
- **🏢 Organization** - Departments, roles, accounts, and permissions
- **📅 Time Off** - PTO requests, approvals, and holiday management
- **📈 Reports** - Time reports, utilization, and project analytics

### **Advanced Features**

- **🔄 Rate Limiting** - Built-in API rate limiting with exponential backoff
- **🛡️ Type Safety** - Full TypeScript support with Zod schema validation
- **📝 Comprehensive Logging** - Detailed logging for debugging and monitoring
- **⚡ Performance** - Optimized for fast response times and efficient API usage
- **🧪 Testing** - Comprehensive integration test suite
- **🐳 Docker Support** - Ready-to-deploy Docker container

## 🚀 Quick Start

### **Prerequisites**

- Node.js 22.0.0 or later
- Float.com account with API access
- Valid Float API key

### **1. Installation Options**

#### **A. DXT Extension (Recommended)**

For DXT-compatible environments, download the latest DXT package:

**[📦 Download Float MCP Extension (.dxt)](https://github.com/asachs01/float-mcp/releases/latest)**

Install the `.dxt` file through your DXT-compatible application.

#### **B. Manual Installation**

```bash
# Using npm
npm install

# Using yarn
yarn install
```

### **2. Configuration**

Create a `.env` file in the project root:

```env
# Float API Configuration
FLOAT_API_KEY=flt_your_api_key_here
FLOAT_API_BASE_URL=https://api.float.com/v3

# Optional: Enable debug logging
LOG_LEVEL=info
```

### **3. Build & Run**

```bash
# Build the project
npm run build

# Start the MCP server
npm start

# For development with auto-reload
npm run dev
```

### **4. MCP Client Integration**

#### **For DXT Installation**

After installing the DXT extension, configure your Float API key in the extension settings. The extension will handle the MCP server configuration automatically.

#### **For Manual Installation**

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "float-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "FLOAT_API_KEY=YOURAPIKEY",
        "-e",
        "LOG_LEVEL=debug",
        "ghcr.io/asachs01/float-mcp:latest"
      ]
    }
  }
}
```

## 📚 Available Tools

The Float MCP server provides **246+ tools** organized into logical categories:

### **Core Entity Management**

- **People**: `list-people`, `get-person`, `create-person`, `update-person`, `delete-person`
- **Departments**: `list-departments`, `get-department`, `create-department`, `update-department`, `delete-department`
- **Roles**: `list-roles`, `get-role`, `create-role`, `update-role`, `delete-role`
- **Accounts**: `list-accounts`, `get-account`, `create-account`, `update-account`, `deactivate-account`

### **Project Management**

- **Projects**: `list-projects`, `get-project`, `create-project`, `update-project`, `delete-project`
- **Tasks**: `list-tasks`, `get-task`, `create-task`, `update-task`, `delete-task`
- **Phases**: `list-phases`, `get-phase`, `create-phase`, `update-phase`, `delete-phase`
- **Milestones**: `list-milestones`, `get-milestone`, `create-milestone`, `complete-milestone`
- **Clients**: `list-clients`, `get-client`, `create-client`, `update-client`, `delete-client`

### **Resource Allocation**

- **Allocations**: `list-allocations`, `get-allocation`, `create-allocation`, `update-allocation`, `delete-allocation`
- **Project Tasks**: `list-project-tasks`, `get-project-task`, `bulk-create-project-tasks`, `reorder-project-tasks`

### **Time Management**

- **Time Off**: `list-timeoff`, `create-timeoff`, `approve-timeoff`, `reject-timeoff`, `get-timeoff-calendar`
- **Logged Time**: `list-logged-time`, `create-logged-time`, `get-timesheet`, `get-billable-time-report`
- **Holidays**: `list-public-holidays`, `list-team-holidays`, `create-public-holiday`

### **Reporting & Analytics**

- **Reports**: `get-time-report`, `get-project-report`, `get-people-utilization-report`
- **Analytics**: `get-person-logged-time-summary`, `get-project-logged-time-summary`

## 🔧 Configuration

### **Environment Variables**

| Variable             | Description                                      | Required | Default                    |
| -------------------- | ------------------------------------------------ | -------- | -------------------------- |
| `FLOAT_API_KEY`      | Your Float API key (starts with `flt_`)          | ✅ Yes   | -                          |
| `FLOAT_API_BASE_URL` | Float API base URL                               | ❌ No    | `https://api.float.com/v3` |
| `LOG_LEVEL`          | Logging level (`error`, `warn`, `info`, `debug`) | ❌ No    | `info`                     |
| `MAX_RETRIES`        | Maximum API retry attempts                       | ❌ No    | `3`                        |
| `REQUEST_TIMEOUT`    | API request timeout (ms)                         | ❌ No    | `30000`                    |

### **Getting a Float API Key**

1. Log in to your Float account
2. Go to **Settings** > **API** > **Personal Access Tokens**
3. Click **Generate New Token**
4. Copy the token (it starts with `flt_`)
5. Add it to your `.env` file

## 📖 Usage Examples

### **Basic Operations**

```typescript
// List all projects
const projects = await listProjects({});

// Get a specific project
const project = await getProject({ project_id: 12345 });

// Create a new person
const person = await createPerson({
  name: 'John Doe',
  email: 'john@example.com',
  department_id: 1,
});

// Schedule an allocation
const allocation = await createAllocation({
  project_id: 12345,
  people_id: 67890,
  start_date: '2024-01-15',
  end_date: '2024-01-31',
  hours: 8,
});
```

### **Advanced Workflows**

```typescript
// Get team utilization report
const utilization = await getPeopleUtilizationReport({
  start_date: '2024-01-01',
  end_date: '2024-12-31',
});

// Bulk create project tasks
const tasks = await bulkCreateProjectTasks({
  project_id: 12345,
  tasks: [
    { name: 'Design Phase', start_date: '2024-01-01' },
    { name: 'Development Phase', start_date: '2024-01-15' },
  ],
});

// Process time off request
await createTimeOff({
  people_ids: [67890],
  timeoff_type_id: 1,
  start_date: '2024-02-01',
  end_date: '2024-02-05',
  status: 1, // Pending approval
});

await approveTimeOff({
  timeoff_id: 123,
  approved_by: 456,
  notes: 'Approved for vacation',
});
```

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm test

# Run integration tests (requires API key)
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:integration:mock  # Mock API responses
npm run test:integration:real  # Real API calls (use with caution)
```

### **Test Configuration**

For integration tests with real API calls:

```env
# .env.test
FLOAT_API_KEY=flt_your_test_api_key
TEST_REAL_API=true
TEST_MOCK_MODE=false
```

## 🐳 Docker Support

### **Using Docker**

```bash
# Build the image
docker build -t float-mcp .

# Run the container
docker run -d \
  --name float-mcp \
  -e FLOAT_API_KEY=flt_your_api_key_here \
  -p 3000:3000 \
  float-mcp
```

### **Docker Compose**

```yaml
version: '3.8'
services:
  float-mcp:
    build: .
    environment:
      - FLOAT_API_KEY=flt_your_api_key_here
      - LOG_LEVEL=info
    ports:
      - '3000:3000'
    restart: unless-stopped
```

## 🔍 Troubleshooting

### **Common Issues**

**API Key Issues**

```bash
Error: Unauthorized (401)
# Solution: Check your API key format and validity
```

**Rate Limiting**

```bash
Error: Too Many Requests (429)
# Solution: The server automatically handles rate limiting with exponential backoff
```

**Connection Issues**

```bash
Error: Network timeout
# Solution: Check your internet connection and Float API status
```

### **Debug Mode**

Enable detailed logging:

```env
LOG_LEVEL=debug
```

This will show all API requests/responses and internal operations.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/guides/CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# Clone the repository
git clone https://github.com/asachs01/float-mcp.git
cd float-mcp

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Float API key

# Run in development mode
npm run dev
```

### **Code Quality**

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

## 📄 Documentation

- **[API Documentation](docs/api/API_DOCUMENTATION.md)** - Complete API reference
- **[Tool Reference](docs/api/TOOL_REFERENCE.md)** - Detailed tool documentation
- **[Usage Guide](docs/guides/API_USAGE_GUIDE.md)** - Usage patterns and examples
- **[Integration Testing](docs/testing/INTEGRATION_TESTING.md)** - Testing guide
- **[Claude Integration](docs/guides/CLAUDE_INTEGRATION_GUIDE.md)** - Claude Desktop setup

## 📊 Project Status

- ✅ **Complete Float API Coverage** - All Float v3 endpoints implemented
- ✅ **Production Ready** - Full error handling, rate limiting, and logging
- ✅ **Well Tested** - Comprehensive integration test suite
- ✅ **Type Safe** - Full TypeScript with Zod validation
- ✅ **Docker Ready** - Production-ready containerization
- ✅ **MCP Compatible** - Full Model Context Protocol compliance

## 🗺️ Roadmap

- [ ] **Float API v4 Support** - When released by Float
- [ ] **Enhanced Caching** - Optional Redis caching layer
- [ ] **Webhook Support** - Real-time Float event notifications
- [ ] **Bulk Operations** - Enhanced bulk import/export tools
- [ ] **Custom Reports** - Advanced reporting and analytics
- [ ] **Multi-tenant Support** - Multiple Float account support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **📖 Documentation**: See the [docs](docs/) directory
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/asachs01/float-mcp/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/asachs01/float-mcp/discussions)

## 🏷️ Tags

`float` `mcp` `model-context-protocol` `project-management` `resource-management` `time-tracking` `typescript` `api-integration` `claude` `ai-tools`

---

**Built with ❤️ for the Float and MCP communities**
