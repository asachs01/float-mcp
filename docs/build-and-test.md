# Building and Testing

## Overview

This document covers how to build, test, and validate the Float MCP project, including CI/CD and linting.

---

## Building

```sh
npm run clean
npm run build
```

- Output is placed in the `dist/` directory.

---

## Running Tests

### All Tests

```sh
npm test
```

### Integration Tests (Mock Mode)

```sh
npm run test:integration:mock
```

### Integration Tests (Real API)

```sh
npm run test:integration:real
```

- Set `FLOAT_API_KEY` for real API tests.

---

## Linting and Formatting

```sh
npm run lint
npm run format
```

- All code must pass ESLint and Prettier checks before merging.

---

## Type Checking

```sh
npm run typecheck
```

---

## CI/CD

- All tests and linting must pass in CI.
- Docker image is built and validated as part of the pipeline.

---

## Troubleshooting Test Failures

- Ensure mock state is reset between tests.
- Use the provided test data generators for required fields.
- See `troubleshooting.md` for more. 