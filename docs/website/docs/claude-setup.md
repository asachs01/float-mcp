# Claude Desktop Setup for Float MCP

**Optimize your Claude Desktop configuration for maximum project management efficiency**

This guide helps you configure Claude Desktop to work seamlessly with Float MCP, including advanced settings, conversation optimization, and troubleshooting.

## Table of Contents

- [Basic Claude Desktop Configuration](#basic-claude-desktop-configuration)
- [Advanced MCP Settings](#advanced-mcp-settings)
- [Conversation Optimization](#conversation-optimization)
- [Security & Privacy Settings](#security--privacy-settings)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [Performance Optimization](#performance-optimization)

---

## Basic Claude Desktop Configuration

### **Initial Claude Desktop Setup**

If you haven't installed Claude Desktop yet:

1. **Download Claude Desktop:**
   - Visit [claude.ai/desktop](https://claude.ai/desktop)
   - Download for your operating system (Windows, macOS, Linux)
   - Install following the standard process

2. **Create Account & Sign In:**
   - Sign up for Claude Pro/Team (recommended for business use)
   - Sign into Claude Desktop with your credentials
   - Verify your account is active

3. **Initial Configuration:**
   - **Language**: Set to your preferred language
   - **Theme**: Choose Light/Dark based on preference
   - **Notifications**: Enable for important MCP events

### **Verify MCP Support**

Ensure your Claude Desktop version supports MCP:

1. **Check Version:** Go to Settings → About
   - **Minimum Required:** Version 1.2.0 or later
   - **Recommended:** Latest version for best compatibility

2. **Enable MCP Features:**
   - Go to **Settings** → **Extensions** or **MCP Servers**
   - Ensure **"Enable MCP Servers"** is checked
   - **Restart Claude Desktop** if you just enabled this

---

## Advanced MCP Settings

### **Float MCP Server Configuration**

#### **Method 1: DXT Package (Recommended)**

If you installed via DXT package:

1. **Locate Float MCP in Extensions:**
   - Go to **Settings** → **Extensions**
   - Find **"Float MCP"** in the list
   - Click **"Configure"** or **"Settings"**

2. **Configure Connection Settings:**
   ```json
   {
     "apiKey": "flt_your_api_key_here",
     "baseUrl": "https://api.float.com/v3",
     "timeout": 30000,
     "logLevel": "info"
   }
   ```

3. **Advanced Settings (Optional):**
   - **Request Timeout**: 30000ms (30 seconds) - increase if you have slow internet
   - **Retry Attempts**: 3 - how many times to retry failed requests
   - **Rate Limiting**: Enabled (recommended) - prevents API quota issues

#### **Method 2: Manual Configuration**

If you need manual MCP server configuration:

1. **Open MCP Configuration:**
   - **macOS**: `~/Library/Application Support/Claude/config.json`
   - **Windows**: `%APPDATA%\Claude\config.json`
   - **Linux**: `~/.config/Claude/config.json`

2. **Add Float MCP Server:**
   ```json
   {
     "mcpServers": {
       "float-mcp": {
         "command": "npx",
         "args": [
           "-y",
           "--package=float-mcp@latest",
           "float-mcp"
         ],
         "env": {
           "FLOAT_API_KEY": "your_float_api_key_here",
           "FLOAT_API_BASE_URL": "https://api.float.com/v3",
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** to apply changes

### **Connection Verification**

Test your setup:

1. **Start New Conversation**
2. **Ask:** "Are you connected to Float? Show me connection status."
3. **Expected Response:**
   ```
   ✅ Float MCP is connected and ready
   📊 API Connection: Active  
   🔑 Authentication: Valid
   📈 Available tools: 120+ Float operations
   
   Try asking: "Show me my Float projects" or "What's my team capacity this week?"
   ```

---

## Conversation Optimization

### **Memory & Context Settings**

Optimize Claude's memory for project management:

1. **Conversation Memory:**
   - **Max Context**: Set to maximum available (usually 200K tokens)
   - **Memory Retention**: Enable "Remember across conversations" if available
   - **Context Preservation**: Enable for project management sessions

2. **Float-Specific Context:**
   - Claude learns your project names, team members, and workflow patterns
   - Reference previous conversations: "Like we discussed yesterday about the website project..."
   - Build on context: "Given that capacity analysis, what about adding the mobile project?"

### **Conversation Templates**

Set up quick-access templates for common workflows:

#### **Daily Standup Template**
Create a saved prompt:
```
"Daily PM Update: Show me today's capacity overview, any overallocations, upcoming deadlines in the next 7 days, and projects needing immediate attention."
```

#### **Weekly Review Template**
```
"Weekly Project Review: Analyze this week's project progress, team utilization, budget status, and prepare action items for next week's team meeting."
```

#### **Monthly Planning Template**
```
"Monthly Planning Session: Review team capacity for next month, analyze project pipeline, identify resource gaps, and recommend priority adjustments."
```

### **Conversation Flow Optimization**

#### **Best Practices for Efficient Conversations:**

1. **Start with Context:**
   ```
   🗣️ Good: "For our website redesign project, show me current status and team allocation"
   🗣️ Better: "For the MegaCorp website redesign project due March 15, show me current status, team allocation, and any risks"
   ```

2. **Be Specific with Timeframes:**
   ```
   🗣️ Good: "Show me team capacity"
   🗣️ Better: "Show me development team capacity for the next two weeks"
   ```

3. **Ask for Actionable Insights:**
   ```
   🗣️ Good: "Show me project budgets"
   🗣️ Better: "Show me project budgets and recommend which projects need immediate attention"
   ```

4. **Use Follow-up Questions:**
   ```
   First: "Show me overallocated team members"
   Follow-up: "What's the best way to redistribute Sarah's workload?"
   Follow-up: "Create a plan to resolve this by Friday"
   ```

---

## Security & Privacy Settings

### **API Key Security**

Protect your Float API key:

1. **Key Storage:**
   - Claude Desktop encrypts API keys locally
   - Keys are never sent to Anthropic's servers
   - Only used for direct Float API communication

2. **Key Management Best Practices:**
   - **Rotate keys regularly** (every 90 days recommended)
   - **Use descriptive names** in Float: "Claude MCP - John Smith"
   - **Monitor API usage** in Float's API dashboard
   - **Revoke immediately** if compromised

3. **Team Security:**
   - **Individual API keys** for each team member
   - **Avoid sharing** keys across multiple users
   - **Document key ownership** in your security records

### **Data Privacy Settings**

Configure data handling:

1. **Conversation Privacy:**
   - **Local Processing**: Float data stays within your Claude Desktop
   - **No Cloud Storage**: Conversations with Float data aren't stored by Anthropic
   - **Team Isolation**: Each user's setup is independent

2. **Audit Trail:**
   - Enable **API request logging** if your organization requires it
   - Monitor **Float API usage** through Float's dashboard
   - Track **team member access** through individual API keys

---

## Troubleshooting Common Issues

### **Connection Problems**

#### **"Float MCP not responding" Error**

**Symptoms:** Claude can't connect to Float or returns timeout errors

**Solutions:**
1. **Check API Key:**
   ```
   🗣️ Ask Claude: "Test my Float API key and show me the connection status"
   ```
   
2. **Verify Internet Connection:**
   - Test Float.com directly in your browser
   - Check firewall/proxy settings
   - Ensure corporate network allows Float API access

3. **Restart MCP Server:**
   - **DXT Package**: Disable and re-enable the extension
   - **Manual Setup**: Restart Claude Desktop entirely

4. **Update Configuration:**
   - Verify your API key hasn't expired
   - Check for typos in configuration
   - Ensure proper JSON formatting

#### **"API Rate Limit Exceeded" Error**

**Symptoms:** Error messages about too many requests

**Solutions:**
1. **Wait and Retry:** Float API limits reset automatically
2. **Optimize Requests:** Ask for broader information in fewer queries
3. **Check Usage:** Review your Float API usage dashboard

#### **"Invalid Authentication" Error**

**Symptoms:** 401/403 errors from Float API

**Solutions:**
1. **Regenerate API Key:**
   - Go to Float Settings → API → Personal Access Tokens
   - Delete old token and create new one
   - Update Claude configuration with new key

2. **Check Permissions:**
   - Ensure API key has appropriate permissions
   - Verify your Float account has access to requested data

### **Performance Issues**

#### **Slow Response Times**

**Symptoms:** Long delays getting responses from Float

**Solutions:**
1. **Increase Timeout Settings:**
   ```json
   {
     "timeout": 60000,
     "retries": 3
   }
   ```

2. **Optimize Query Scope:**
   - Request smaller date ranges
   - Filter results more specifically
   - Break complex requests into smaller parts

3. **Check Float API Status:**
   - Visit Float's status page
   - Check for announced maintenance windows

#### **Memory/Context Issues**

**Symptoms:** Claude forgets previous Float information

**Solutions:**
1. **Start Fresh Conversations** for complex analyses
2. **Reference Key Information** in each query
3. **Save Important Results** outside Claude for reference

---

## Performance Optimization

### **Optimizing Response Speed**

1. **Efficient Query Patterns:**
   ```
   🚀 Fast: "Show me development team capacity for next week"
   🐌 Slow: "Show me all team member details, then filter for developers, then show next week's schedule"
   ```

2. **Batch Related Requests:**
   ```
   🚀 Fast: "Show me project status, team capacity, and upcoming deadlines for the website project"
   🐌 Slow: Three separate questions for the same project
   ```

3. **Use Specific Filters:**
   ```
   🚀 Fast: "Show overallocated team members this week"
   🐌 Slow: "Show all team allocations" then asking to identify overallocations
   ```

### **Memory Management**

1. **Conversation Length:**
   - Start new conversations for different topics
   - Use `/clear` command when switching between projects
   - Save important results externally for reference

2. **Context Efficiency:**
   - Reference project names, dates, and team members consistently
   - Build context gradually rather than repeating information
   - Use follow-up questions to build on previous responses

### **Resource Usage**

1. **System Requirements:**
   - **RAM**: 8GB minimum, 16GB recommended for large teams
   - **Internet**: Stable broadband connection
   - **Disk Space**: 2GB free for Claude Desktop + cache

2. **Optimization Tips:**
   - Close unused browser tabs when using Claude Desktop
   - Restart Claude Desktop daily if using heavily
   - Clear cache if experiencing slowdowns

---

## Advanced Configuration Examples

### **Multi-Environment Setup**

For teams using multiple Float workspaces:

```json
{
  "mcpServers": {
    "float-production": {
      "command": "float-mcp",
      "env": {
        "FLOAT_API_KEY": "flt_production_key",
        "FLOAT_API_BASE_URL": "https://api.float.com/v3",
        "ENVIRONMENT": "production"
      }
    },
    "float-staging": {
      "command": "float-mcp", 
      "env": {
        "FLOAT_API_KEY": "flt_staging_key",
        "FLOAT_API_BASE_URL": "https://staging-api.float.com/v3",
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

### **Custom Logging Configuration**

For debugging and audit requirements:

```json
{
  "env": {
    "FLOAT_API_KEY": "your_key",
    "LOG_LEVEL": "debug",
    "LOG_FILE": "/path/to/float-mcp.log",
    "AUDIT_LOGGING": "true"
  }
}
```

---

## Final Setup Verification

### **Complete System Test**

Run this comprehensive test to verify everything works:

```
🗣️ You: "Let's test all Float MCP functionality:

1. Show me connection status
2. List my projects  
3. Show team capacity for this week
4. Generate a quick project status report
5. Identify any immediate issues that need attention

This will verify our setup is working perfectly."

🤖 Claude: [Should provide detailed responses for each item, confirming full functionality]
```

### **Ongoing Maintenance**

1. **Weekly:**
   - Verify API key is still working
   - Clear conversation cache if performance degrades
   - Update to latest Claude Desktop version if available

2. **Monthly:**
   - Review API usage in Float dashboard
   - Consider API key rotation (security best practice)
   - Update Float MCP package if using manual installation

3. **Quarterly:**
   - Evaluate conversation patterns and optimize workflows
   - Review team member access and API key permissions
   - Plan for any Float API updates or changes

---

**Congratulations!** You now have a fully optimized Claude Desktop setup for Float MCP. You're ready to revolutionize your project management workflow with AI-powered conversations.

**Need help getting started?** Return to the **[Project Manager Guide](./project-manager-guide.md)** to learn the most effective conversation patterns for your daily workflow.