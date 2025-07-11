# Troubleshooting Guide

## Common Issues

### 1. Docker Build Fails

- Ensure Docker and Docker Compose are up to date.
- Clean previous builds: `npm run clean`

### 2. Tests Fail in CI

- Check for missing required fields in test data.
- Ensure mock state is reset between tests.
- Run `npm run lint` and `npm run typecheck`.

### 3. Authentication Errors

- For real API tests, ensure `FLOAT_API_KEY` is set.
- For mock mode, use `NODE_ENV=test`.

### 4. Linting/Formatting Errors

- Run `npm run format` and `npm run lint`.
- Fix all errors before committing.

### 5. MCP Protocol Errors

- Ensure JSON-RPC 2.0 format is used.
- Check tool names and input schemas.

---

## Debugging Tips

- Add debug logging with `LOG_LEVEL=debug`.
- Use the test data generators for all entity creation in tests.
- Check `tests/setup.ts` for mock configuration.

---

## Getting Help

- Review the `CHANGELOG.md` for recent changes.
- Check GitHub Issues for known problems. 