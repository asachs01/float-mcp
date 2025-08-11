# Manual Test Scripts

This directory contains standalone test scripts for manual validation and development purposes.

## Scripts

### test-optimized-timeoff.js
Manual test script for the optimized time tracking functionality specifically for time off operations.

**Usage:**
```bash
node tests/manual/test-optimized-timeoff.js
```

**Purpose:**
- Tests the `manage-time-tracking` tool with time off creation
- Uses hardcoded test data for quick validation
- Requires `.env` configuration with valid API credentials

### test-timeoff.js
Manual test script for Float API time off creation with endpoint validation.

**Usage:**
```bash
node tests/manual/test-timeoff.js
```

**Purpose:**
- Tests direct Float API integration for time off operations
- Fetches available time off types and people dynamically
- Includes cleanup functionality to remove test entries
- Validates API endpoint functionality

## Requirements

- Built project (`npm run build`)
- Environment variables configured (`.env` file)
- Valid Float API credentials

## Notes

These scripts are intended for development and manual validation, not automated testing. For automated tests, see the `integration/` directory.