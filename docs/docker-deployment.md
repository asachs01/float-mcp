# Docker Deployment Guide

## Overview

This document describes how to build, configure, and deploy the Float MCP server using Docker and Docker Compose.

---

## Prerequisites

- Docker (v20+ recommended)
- Docker Compose (v2+ or use `docker compose` with modern Docker)
- Node.js (for local builds, v22+)

---

## Building the Docker Image

```sh
# Clean and build the project
npm run clean && npm run build

# Build the Docker image
docker build -t float-mcp:latest .
```

---

## Running the MCP Server

### Standalone

```sh
docker run --rm -e NODE_ENV=production -p 3000:3000 float-mcp:latest
```

### With Docker Compose

```sh
docker compose up --build -d
```

- The service will be available on port 3000 by default.

---

## Environment Variables

- `NODE_ENV` (default: `production`)
- `LOG_LEVEL` (default: `info`)
- `FLOAT_API_KEY` (required for real API mode)
- See `.env.example` for all options.

---

## Health Checks

- The MCP server exposes a health check endpoint at `/health` (if enabled).

---

## Stopping Services

```sh
docker compose down
```

---

## Notes

- For local development, use `NODE_ENV=test` to enable mock mode.
- For production, ensure all secrets are provided via environment variables or Docker secrets. 