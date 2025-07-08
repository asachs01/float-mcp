# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only, skip scripts to avoid husky
RUN npm ci --omit=dev --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Create non-root user
RUN groupadd -r floatmcp && useradd -r -g floatmcp floatmcp
RUN chown -R floatmcp:floatmcp /app
USER floatmcp

# Default to MCP mode for Claude Desktop compatibility
CMD ["node", "dist/index.js", "--mcp"] 