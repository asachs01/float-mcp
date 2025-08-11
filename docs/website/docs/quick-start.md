# Quick Start Guide

Get Float + Claude working for your project management in under 10 minutes.

## What You'll Need

- **Claude Desktop** ([Download here](https://claude.ai/desktop))
- **Float.com account** with admin or manager access
- **Float API token** (we'll help you get this)

## Step 1: Get Your Float API Token (2 minutes)

1. **Log into Float.com**
2. **Go to Settings > Integrations** 
3. **Click "API Access"**
4. **Generate New Token**
   - Name it "Claude Integration" 
   - Set permissions: "Read & Write" (for full project management capabilities)
5. **Copy the token** (save it somewhere safe - you'll need it in Step 3)

💡 **Don't have admin access?** Ask your Float admin to create an API token for you with read/write permissions.

## Step 2: Install Float MCP Extension (2 minutes)

### Recommended: DXT Package (Easiest)

1. **Download** the latest [Float MCP Extension (.dxt file)](https://github.com/asachs01/float-mcp/releases/latest)
2. **Open Claude Desktop**
3. **Go to Settings > Extensions** 
4. **Click "Install Extension"**
5. **Select the .dxt file** you downloaded
6. **Click "Install"** and wait for confirmation

✅ **Installation complete!** The Float MCP extension is now available in Claude.

### Alternative: Manual Configuration

If the DXT package isn't available yet, you can manually configure the MCP server:

1. **Open Claude Desktop**
2. **Go to Settings > Developer > MCP Servers**
3. **Add new server configuration:**
   ```json
   {
     "command": "npx",
     "args": ["float-mcp"],
     "env": {
       "FLOAT_API_TOKEN": "your-token-here"
     }
   }
   ```
4. **Replace** `your-token-here` with your actual Float API token
5. **Save and restart** Claude Desktop

## Step 3: Connect to Your Float Account (1 minute)

1. **Open a new conversation** with Claude
2. **Test the connection:**
   ```
   Hi Claude, can you connect to my Float account and show me a quick summary?
   ```

3. **If this is your first time**, Claude will ask for your Float API token:
   - Paste the token from Step 1
   - Claude will securely store it for future use

4. **You should see** a response like:
   ```
   ✅ Connected to Float successfully!
   
   Here's your account summary:
   - Active Projects: 8
   - Team Members: 12  
   - This Week's Utilization: 87%
   
   What would you like to know about your projects?
   ```

## Step 4: Take It for a Test Drive (5 minutes)

Now try these essential project manager conversations:

### Check Team Availability
```
Show me who's available next week and their current workload
```

### Project Status Overview  
```
What projects need my attention today?
```

### Resource Planning
```
I have a new 3-month project starting in 2 weeks. Who has capacity to take it on?
```

### Create a Quick Report
```
Generate a one-page summary of all active projects for my weekly team meeting
```

### Check Budget Status
```
Which projects are over budget and by how much?
```

## Troubleshooting

### "Can't connect to Float" Error
- **Double-check your API token** - make sure it's copied correctly
- **Verify permissions** - your token needs "Read & Write" access
- **Check your Float account** - ensure you have admin/manager permissions

### Claude Doesn't Recognize Float Commands
- **Restart Claude Desktop** after installing the extension
- **Try a simple test** first: "Are you connected to Float?"
- **Check the extension is enabled** in Claude Settings > Extensions

### Slow Response Times
- **First response** may be slower as Claude establishes the connection
- **Subsequent requests** should be much faster (under 5 seconds)

## What's Next?

Now that you're connected, explore what Float + Claude can do for your project management:

### Daily Workflows
- **Morning check-in**: "What needs my attention today?"
- **Resource conflicts**: "Are there any scheduling conflicts this week?"
- **Progress updates**: "How are we tracking against project deadlines?"

### Weekly Planning
- **Capacity review**: "Show me next week's team capacity and any gaps"
- **Project health**: "Which projects are at risk and need intervention?"
- **Resource reallocation**: "Can we shift resources to accelerate the priority project?"

### Monthly Strategy
- **Utilization analysis**: "What's our team utilization trend over the past 3 months?"
- **Budget variance**: "Show me budget vs actual for all active projects"
- **Capacity planning**: "Based on current projects, when will we have capacity for new work?"

## Getting Help

- **Stuck on something?** Ask Claude: "Help me troubleshoot my Float connection"
- **Want to learn more?** Try: "What project management tasks can you help me with?"
- **Need specific help?** Check our [Project Manager's Guide](/project-manager-guide) for detailed workflows

**Ready to transform your project management?** Start with simple questions and gradually explore more advanced capabilities as you get comfortable with the system.