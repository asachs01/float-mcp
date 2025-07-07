# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- None

### Changed
- None

### Fixed
- None

## [0.1.0] - 2025-07-07

### Added
- **Float.com MCP Integration**: Complete Mission Control Protocol server for Float.com API
- **Project Management Tools**: Create, read, update, and manage Float.com projects
- **Task Management Tools**: Handle tasks, assignments, and scheduling
- **People Management Tools**: Manage team members and their allocations
- **Client Management Tools**: Organize and track client information
- **Allocation Management Tools**: Schedule and track resource allocations
- **Natural Language Processing**: Conversational commands through Claude Desktop
- **Rate Limiting**: Built-in API rate limiting protection (100 requests/minute)
- **Structured Logging**: Comprehensive logging with configurable levels (info, error, debug)
- **Health Checks**: Monitoring and health verification endpoints
- **Docker Support**: Complete containerization with multi-stage builds
- **Docker Compose**: Development and production orchestration
- **TypeScript Configuration**: Full TypeScript setup with strict type checking
- **Jest Testing Framework**: Comprehensive unit and integration testing
- **ESLint & Prettier**: Code linting and formatting
- **Husky Git Hooks**: Pre-commit validation and testing
- **GitHub Actions**: Automated CI/CD with Docker publishing
- **Security Scanning**: Trivy vulnerability scanning in CI/CD
- **Multi-platform Builds**: Support for linux/amd64 and linux/arm64
- **Claude Desktop Integration**: Complete setup instructions and configuration examples
- **Environment Configuration**: Flexible environment variable management
- **Launch Scripts**: Automated setup and launcher scripts
- **MCP Protocol Compliance**: Full JSON-RPC 2.0 specification compliance
- **25 MCP Tools**: Complete API coverage for Float.com operations

### Fixed
- **Docker Build Issues**: Resolved husky conflicts in production builds
- **Logger Configuration**: Fixed pino-pretty dependency issues in production
- **MCP Protocol Communication**: Eliminated stdout pollution for clean JSON-RPC
- **Claude Desktop Compatibility**: Resolved Node.js path issues with nvm
- **Environment Variable Validation**: Proper configuration validation and error handling

### Security
- **Non-root Container**: Docker container runs as non-privileged user
- **API Key Protection**: Secure environment variable handling
- **Input Validation**: Comprehensive request validation for all tools
- **Rate Limiting**: Protection against API abuse 