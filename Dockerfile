# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production dependencies stage
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Production stage - using distroless for minimal attack surface
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Note: distroless images run as non-root by default (user 65532)
# No need to create a separate user

# Default to MCP mode for Claude Desktop compatibility
CMD ["dist/index.js", "--mcp"] 