# Project Specification: Float MCP

## Purpose

Provide a robust, testable, and AI-friendly MCP server for integrating with Float.com's project management API.

---

## Requirements

- Expose all major Float API resources as MCP tools (projects, people, tasks, clients, etc.)
- Support both real API and mock/test modes
- 100% test coverage for all tools
- Dockerized deployment
- CI/CD with full test and linting enforcement

---

## Design Principles

- **Reliability**: All tools must be fully tested and mockable.
- **Discoverability**: All tools and schemas must be self-describing.
- **Extensibility**: Easy to add new tools/features.
- **Security**: No secrets in code; use environment variables.

---

## Deliverables

- MCP server with 70+ tools
- Comprehensive test suite
- Docker and Compose support
- Full documentation for users and contributors 