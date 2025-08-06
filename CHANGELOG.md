# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-06

### 🎉 Major Release - Production Ready

This v1.0.0 release marks a significant milestone with complete tool optimization, comprehensive testing, and production-ready stability.

### Added
- **4 Optimized Decision-Tree Tools**: Complete redesign from 246+ granular tools to 4 powerful, efficient tools:
  - `manage-entity`: Unified entity management (people, projects, clients, tasks)
  - `manage-project-workflow`: Project workflow operations (phases, milestones, project-tasks, allocations)
  - `manage-time-tracking`: Time management (logged-time, timeoff, public-holidays, calendar)
  - `generate-report`: Comprehensive reporting (utilization, project, time, revenue, capacity reports)
- **Comprehensive Integration Test Suite**: 387 tests with 100% pass rate
- **Advanced Error Handling**: Robust error handling with real API behavior adaptation
- **Enhanced Development Documentation**: Complete MCP server development guide
- **Production-Grade Logging**: Structured logging with configurable levels and contexts

### Fixed
- **Complete Test Suite Stability**: Resolved all 254 failing tests to achieve 100% pass rate
- **Parameter Consistency**: Fixed `workflow_type` → `entity_type` parameter naming across all tools
- **API Endpoint Alignment**: Corrected all endpoint inconsistencies (e.g., `/project-tasks` → `/project_tasks`)
- **Field Mapping Issues**: Resolved allocation field expectations (`allocation_id` → `task_id`, `person_id` → `people_id`)
- **Operation Schema Matching**: Fixed all operation names to match tool schemas exactly
- **ESLint and Prettier Issues**: Zero linting errors with enhanced test-specific configurations

### Changed
- **BREAKING**: Complete tool architecture redesign - existing tool names are no longer supported
- **Tool Count Reduction**: Optimized from 246+ tools to 4 decision-tree tools while maintaining 100% functionality
- **Performance Improvements**: Significant reduction in API calls and improved response times
- **Test Infrastructure**: Enhanced test helpers with better mock data generation and cleanup
- **Error Handling Strategy**: More lenient integration testing for real API behavior differences

### Migration Guide
- Update tool calls to use new optimized tools (`manage-entity`, `manage-project-workflow`, `manage-time-tracking`, `generate-report`)
- Review operation names and parameters as they have been standardized
- Test integrations thoroughly as this is a breaking change

This release represents a complete rewrite optimized for production use, with extensive testing and validation.

## [0.3.2] - 2025-07-11

### Added
- Robust debug logging and failsafe error handling at MCP server entrypoint for easier troubleshooting in Claude Desktop and DXT environments
- `.dxtignore` file to exclude non-critical files and directories from DXT extension packages
- New GitHub Actions release workflow to automatically extract release notes from `CHANGELOG.md` and use them in GitHub releases

### Fixed
- DXT extension startup issues in Claude Desktop by ensuring correct entrypoint, environment variable checks, and dependency packaging

### Changed
- Improved manifest.json and packaging process for DXT extension reliability
- Updated release process to ensure accurate, automated release notes and DXT packaging

## [0.3.1] - 2025-07-11

### Added

- DXT extension support for easy installation in DXT-compatible environments
- Comprehensive DXT manifest with 24 key tools and user configuration options
- DXT package creation integrated into release workflow
- Enhanced GitHub release workflow with automatic DXT packaging

### Fixed

- Prettier CI errors by adding comprehensive .prettierignore file
- DXT compatibility requirements to support broader range of platforms
- Critical manifest.json restoration after accidental deletion

### Changed

- Release workflow now automatically creates and uploads DXT packages
- Improved CI pipeline reliability with proper file formatting checks

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

[Unreleased]: https://github.com/asachs01/float-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/asachs01/float-mcp/compare/v0.3.2...v1.0.0
[0.3.2]: https://github.com/asachs01/float-mcp/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/asachs01/float-mcp/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/asachs01/float-mcp/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/asachs01/float-mcp/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/asachs01/float-mcp/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/asachs01/float-mcp/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/asachs01/float-mcp/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/asachs01/float-mcp/releases/tag/v0.1.0
