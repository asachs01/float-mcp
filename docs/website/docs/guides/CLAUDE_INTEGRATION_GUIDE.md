# Claude Desktop + Float MCP Setup Guide

Complete guide for integrating Float.com with Claude Desktop for powerful project management conversations.

## Overview

The Float MCP (Model Context Protocol) server enables Claude Desktop to directly access your Float.com data for intelligent project management assistance. This guide covers both basic setup and advanced configuration options.

## Prerequisites

- **Claude Desktop application** (latest version)
- **Float.com account** with appropriate permissions
- **Float API token** with read/write access
- **Administrative access** to Claude Desktop settings

## Basic Setup

### 1. Obtain Float API Credentials

#### For Float Administrators
1. Log into your Float account
2. Navigate to **Settings > Integrations > API**
3. Click **"Generate New Token"**
4. Configure the token:
   - **Name**: "Claude Desktop Integration" 
   - **Permissions**: "Read & Write" (recommended for full functionality)
   - **Scope**: "All Projects" or specific project access as needed
5. **Copy and securely store** the generated token

#### For Team Members
Request an API token from your Float administrator with these specifications:
- **Read access**: For project viewing and reporting
- **Write access**: For creating/updating projects and time entries (optional)
- **Scope**: Appropriate to your role and responsibilities

### 2. Install Float MCP Server

#### Method A: DXT Package (Recommended)

**Download and Install**
1. Download the latest [Float MCP Extension (.dxt)](https://github.com/asachs01/float-mcp/releases/latest)
2. Open Claude Desktop
3. Go to **Settings > Extensions**
4. Click **"Install Extension"** and select the .dxt file
5. Confirm installation when prompted

**Configure Connection**
1. In Claude Desktop, locate the Float MCP extension settings
2. Enter your Float API token
3. Test the connection
4. Save the configuration

#### Method B: Manual MCP Server Configuration

**Add Server Configuration**
1. Open Claude Desktop
2. Navigate to **Settings > Developer > MCP Servers**
3. Add a new server with these settings:
   ```json
   {
     "name": "float-mcp",
     "command": "npx",
     "args": ["float-mcp"],
     "env": {
       "FLOAT_API_TOKEN": "your_api_token_here"
     }
   }
   ```
4. Replace `your_api_token_here` with your actual Float API token
5. Save configuration and restart Claude Desktop

### 3. Verify Connection

**Test Basic Connectivity**
Open a new conversation with Claude and try:
```
Hi Claude, can you access my Float account? Please show me a summary of active projects.
```

**Expected Response**
```
✅ Connected to Float successfully!

Here's your current project summary:
• Active Projects: 12
• Team Members: 8
• Current Week Utilization: 89%
• Projects Requiring Attention: 2

Would you like me to dive deeper into any specific area?
```

## Advanced Configuration

### Environment Variables

For enhanced functionality, configure these optional environment variables:

```json
{
  "env": {
    "FLOAT_API_TOKEN": "your_token_here",
    "FLOAT_API_URL": "https://api.float.com/v3",
    "FLOAT_TIMEOUT": "30000",
    "FLOAT_CACHE_DURATION": "300",
    "DEBUG_FLOAT_MCP": "false"
  }
}
```

**Variable Descriptions:**
- `FLOAT_API_URL`: Float API endpoint (default: standard Float API)
- `FLOAT_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `FLOAT_CACHE_DURATION`: Cache duration in seconds (default: 300)
- `DEBUG_FLOAT_MCP`: Enable debug logging (default: false)

### Multi-Environment Setup

For organizations with multiple Float accounts or environments:

```json
{
  "name": "float-mcp-production",
  "command": "npx",
  "args": ["float-mcp"],
  "env": {
    "FLOAT_API_TOKEN": "prod_token_here",
    "ENVIRONMENT_NAME": "Production"
  }
}
```

### Performance Optimization

#### Caching Configuration
Optimize response times by configuring intelligent caching:

```json
{
  "env": {
    "FLOAT_CACHE_DURATION": "600",
    "FLOAT_CACHE_STRATEGY": "intelligent",
    "FLOAT_PRELOAD_DATA": "projects,people,recent_time"
  }
}
```

#### Connection Pool Settings
For high-usage scenarios:

```json
{
  "env": {
    "FLOAT_MAX_CONCURRENT_REQUESTS": "5",
    "FLOAT_REQUEST_RETRY_COUNT": "3",
    "FLOAT_REQUEST_RETRY_DELAY": "1000"
  }
}
```

## Conversation Optimization

### Best Practices for Project Management Queries

**Effective Query Patterns:**
```
✅ "Show me capacity for the design team next month"
✅ "Which projects are over budget and by how much?"
✅ "Create a status report for projects due this quarter"

❌ "Show me everything"
❌ "What's the status?" (too vague)
❌ "Give me all the data" (overwhelming)
```

**Progressive Conversation Techniques:**
1. **Start broad**: "What needs my attention today?"
2. **Get specific**: "Tell me more about the ABC project risks"
3. **Take action**: "Create a task to address the resource conflict"

### Conversation Templates

#### Daily Management Routine
```
Morning Check-in:
"Hi Claude, what should I prioritize today based on project deadlines and team availability?"

Midday Status:
"Any urgent issues or conflicts that have come up since this morning?"

End-of-day Wrap-up:
"Summarize today's project progress and flag anything for tomorrow's attention."
```

#### Weekly Planning Session
```
"Let's review this week:
1. Show me utilization rates for all team members
2. Identify any projects falling behind schedule
3. Preview next week's capacity and potential conflicts
4. Suggest priority adjustments based on current status"
```

## Security Configuration

### Token Management
- **Store tokens securely** using Claude Desktop's encrypted storage
- **Rotate tokens regularly** (recommended: every 90 days)  
- **Use minimum required permissions** for each user role
- **Monitor token usage** through Float's admin dashboard

### Access Control
```json
{
  "env": {
    "FLOAT_READ_ONLY_MODE": "false",
    "FLOAT_ALLOWED_OPERATIONS": "read,write,report",
    "FLOAT_RESTRICTED_ENDPOINTS": "users,billing"
  }
}
```

### Audit Logging
Enable comprehensive logging for compliance and debugging:

```json
{
  "env": {
    "FLOAT_AUDIT_LOG": "true",
    "FLOAT_LOG_LEVEL": "info",
    "FLOAT_LOG_FILE": "/var/log/float-mcp.log"
  }
}
```

## Troubleshooting

### Common Connection Issues

**Problem: "Authentication Failed"**
- Verify API token is correct and hasn't expired
- Check token permissions in Float admin panel
- Ensure token has appropriate scope for requested operations

**Problem: "Timeout Errors"**
- Increase timeout value: `"FLOAT_TIMEOUT": "60000"`
- Check network connectivity to Float API
- Verify Float service status

**Problem: "Rate Limiting"**
- Implement request throttling: `"FLOAT_REQUEST_DELAY": "100"`
- Consider caching frequently accessed data
- Contact Float support for rate limit increases

### Performance Troubleshooting

**Slow Response Times:**
1. Enable caching with longer duration
2. Preload commonly accessed data
3. Use more specific queries to reduce data transfer
4. Check network latency to Float servers

**High Memory Usage:**
1. Reduce cache duration
2. Limit concurrent requests
3. Implement data pagination for large datasets
4. Clear cache periodically

### Debug Mode

Enable detailed logging for troubleshooting:

```json
{
  "env": {
    "DEBUG_FLOAT_MCP": "true",
    "FLOAT_LOG_LEVEL": "debug"
  }
}
```

Check Claude Desktop's developer console for detailed error messages and API call traces.

## System Verification

### Health Check Commands

Verify your setup with these Claude conversations:

**Connection Test:**
```
"Test my Float connection and show system status"
```

**Data Integrity Check:**
```  
"Verify that project data is syncing correctly from Float"
```

**Performance Test:**
```
"Show me response times for the last few queries and overall system performance"
```

### Automated Monitoring

Set up automated health checks:

```json
{
  "env": {
    "FLOAT_HEALTH_CHECK_INTERVAL": "300",
    "FLOAT_HEALTH_CHECK_ENABLED": "true",
    "FLOAT_AUTO_RECONNECT": "true"
  }
}
```

## Getting Support

- **Claude Desktop Issues**: Check [Claude Desktop documentation](https://claude.ai/desktop/help)
- **Float API Problems**: Consult [Float API documentation](https://developer.float.com)
- **Integration Questions**: Ask Claude directly for help with specific setup issues
- **Bug Reports**: Submit issues to the [Float MCP GitHub repository](https://github.com/asachs01/float-mcp/issues)

Your Float + Claude integration should now be fully operational and optimized for professional project management workflows.