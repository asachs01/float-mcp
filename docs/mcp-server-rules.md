# General Rules for Creating MCP Servers

## 1. Tool Design

- Each tool must have a clear, single responsibility.
- Input and output schemas must be strictly validated.
- Tool names must be unique and descriptive.

## 2. Error Handling

- All errors must be structured with `success: false`, `error`, and `errorCode`.
- Validation errors must be clear and actionable.

## 3. Mocking

- All external dependencies must be mockable for tests.
- Mock state must be reset between tests to ensure isolation.

## 4. Testing

- 100% test coverage is required.
- Use test data generators for all entity creation.
- All tests must pass in both mock and real API modes.

## 5. Documentation

- Every tool must be documented with input/output schemas and examples.
- Update the changelog for every release.

## 6. Security

- Never commit secrets or API keys.
- Use environment variables for all sensitive data.

## 7. CI/CD

- All code must pass linting, formatting, and type checks before merging.
- Docker image must be built and validated in CI.

## 8. Versioning

- Use semantic versioning for all releases.
- Update `CHANGELOG.md` for every release.

## 9. Extensibility

- New tools/features must follow the same structure and conventions.
- All new features must include tests and documentation. 