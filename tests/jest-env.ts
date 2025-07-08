// Jest environment setup - runs before all tests
// This ensures NODE_ENV is set to 'test' so configuration validation allows tests to run
process.env.NODE_ENV = 'test';
// Set a valid test API key that meets the format requirements
process.env.FLOAT_API_KEY = 'flt_test_key_for_jest_validation';
