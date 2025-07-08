#!/bin/bash

# Float MCP Launcher Script for Claude Desktop
# This script provides a fallback for local Node.js setups

# Check if we should use Docker (recommended)
if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
    # Use Docker if available and project has docker-compose
    exec docker run --rm -i \
        --env-file .env \
        ghcr.io/asachs01/float-mcp:latest
else
    # Fall back to local Node.js
    # Source nvm if it exists
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        nvm use 22 >/dev/null 2>&1
    fi

    # Get the directory where this script is located
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    # Run the MCP server
    exec node "$DIR/dist/index.js" --mcp
fi 