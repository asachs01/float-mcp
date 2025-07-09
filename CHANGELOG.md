# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2025-07-07

### Added

- Debug logging to troubleshoot environment variable issues in MCP contexts
- Better error handling for dotenv loading in Docker containers

### Fixed

- Made dotenv loading optional to work properly in Docker/MCP environments
- Improved environment variable debugging for Claude Desktop integration

## [0.2.1] - 2025-07-07

### Fixed

- Improved error handling and messaging when FLOAT_API_KEY is missing
- Enhanced configuration validation with clearer guidance for Claude Desktop users
- Better troubleshooting documentation with specific error scenarios

### Added

- Dedicated troubleshooting section for missing API key errors
- More helpful error messages that guide users to their Claude Desktop configuration

## [0.2.0] - 2025-07-07

### Changed

- **BREAKING**: Simplified Docker usage for Claude Desktop integration
- Docker container now defaults to MCP mode (`--mcp` flag)
- Simplified Claude Desktop configuration to just require the Docker image name
- Removed need for complex command arguments and environment file mounting
- Updated README with much simpler Docker setup instructions

### Added

- Created `.env.example` file for easier environment setup
- Added optional environment variables documentation

### Fixed

- Streamlined Docker configuration removes complexity and potential setup errors
- Launch script now uses simplified Docker command

## [0.1.1] - 2025-07-07

### Fixed

- Updated Docker image references from placeholder to actual repository
- Fixed inconsistent GitHub Container Registry URLs in documentation
- Corrected version references in README

### Added

- Pre-built Docker images available on GitHub Container Registry

## [0.1.0] - 2025-07-07

### Added

- Initial release of Float.com MCP Integration
- 25 tools for managing Float.com resources:
  - Project Management (create, read, update, delete, list)
  - Task Management (create, read, update, delete, list)
  - People Management (create, read, update, delete, list)
  - Client Management (create, read, update, delete, list)
  - Allocation Management (create, read, update, delete, list)
- Docker support with multi-stage builds
- Docker Compose configuration
- Claude Desktop integration
- Rate limiting and API protection
- Structured logging with configurable levels
- Health checks and monitoring
- Comprehensive error handling
- TypeScript support
- Environment-based configuration
- Setup script for easy installation

## [0.3.0] - 2025-07-09

### Added
- Comprehensive test mocking for all Float API endpoints
- 100% test pass rate (189/189 tests passing)
- Docker image and Docker Compose fully validated for MCP mode
- Test isolation and state reset for reliable CI runs

### Fixed
- All ESLint and Prettier errors (reduced from 51 to 0)
- Test data generation now uses proper helpers with required fields
- Mock state pollution between tests resolved

### Changed
- Dramatic improvement in test execution time (217s → 28s)
- CI/CD pipeline now fully reliable and compliant

[Unreleased]: https://github.com/asachs01/float-mcp/compare/v0.3.0...HEAD
[0.2.2]: https://github.com/asachs01/float-mcp/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/asachs01/float-mcp/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/asachs01/float-mcp/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/asachs01/float-mcp/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/asachs01/float-mcp/releases/tag/v0.1.0
[0.3.0]: https://github.com/asachs01/float-mcp/compare/v0.2.2...v0.3.0
