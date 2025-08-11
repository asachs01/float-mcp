# Getting Started

Welcome to the comprehensive documentation for the Float MCP Server. This MCP server provides seamless integration with Float.com for project management and time tracking through Claude Desktop.

## What is Float MCP?

Float MCP is a Model Context Protocol (MCP) server that connects Claude Desktop with Float.com's project management platform. It enables you to manage projects, track time, handle team members, and generate reports directly through Claude conversations.

## Quick Start

### Prerequisites

- Node.js 22.0.0 or higher
- Float.com account with API access
- Claude Desktop application

### Installation

1. **Install the package**
   ```bash
   npm install -g float-mcp
   ```

2. **Configure environment variables**
   Create a `.env` file:
   ```env
   FLOAT_API_TOKEN=your_float_api_token
   ```

3. **Configure Claude Desktop**
   Add to your Claude Desktop MCP configuration:
   ```json
   {
     "mcpServers": {
       "float-mcp": {
         "command": "float-mcp"
       }
     }
   }
   ```

## Key Features

- 🏗️ **Project Management** - Create, update, and manage projects
- 👥 **Team Management** - Handle team members and assignments  
- ⏱️ **Time Tracking** - Log time entries and manage timesheets
- 🏖️ **Time Off Management** - Handle vacation and leave requests
- 📊 **Reporting** - Generate comprehensive reports and analytics
- 🔄 **Bulk Operations** - Perform efficient bulk data operations

## Available Tools

The Float MCP server provides several optimized tools:

### Project & Workflow Management
- `manage-project-workflow` - Comprehensive project lifecycle management
- `manage-entity` - Handle people, projects, and organizational entities
- `manage-time-tracking` - Complete time tracking and time off management

### Reporting & Analytics  
- `generate-report` - Create detailed reports with filtering and grouping

### Direct API Access
- `people` - Manage team members and roles
- `projects` - Project creation and management
- `tasks` - Task assignment and tracking

## Next Steps

import DocCardList from '@theme/DocCardList';

<DocCardList />