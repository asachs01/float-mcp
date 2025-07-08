#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let mode = 'mock';

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
  
  if (arg === '--mode' || arg === '-m') {
    mode = args[i + 1];
    i++;
    continue;
  }
  
  if (arg === '--real') {
    mode = 'real';
    continue;
  }
  
  if (arg === '--mock') {
    mode = 'mock';
    continue;
  }
  
  if (arg === '--performance') {
    mode = 'performance';
    continue;
  }
  
  if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
    continue;
  }
  
  if (arg === '--watch' || arg === '-w') {
    options.watch = true;
    continue;
  }
  
  if (arg === '--coverage' || arg === '-c') {
    options.coverage = true;
    continue;
  }
  
  if (arg === '--filter' || arg === '-f') {
    options.filter = args[i + 1];
    i++;
    continue;
  }
  
  if (arg === '--timeout' || arg === '-t') {
    options.timeout = parseInt(args[i + 1], 10);
    i++;
    continue;
  }
  
  if (arg === '--parallel' || arg === '-p') {
    options.parallel = parseInt(args[i + 1], 10);
    i++;
    continue;
  }
  
  if (arg === '--bail' || arg === '-b') {
    options.bail = true;
    continue;
  }
  
  if (arg === '--silent' || arg === '-s') {
    options.silent = true;
    continue;
  }
}

function showHelp() {
  console.log(`
Float MCP Integration Test Runner

Usage: node run-integration-tests.js [options]

Options:
  --mode, -m <mode>      Test mode: mock, real, performance (default: mock)
  --real                 Shorthand for --mode real
  --mock                 Shorthand for --mode mock  
  --performance          Shorthand for --mode performance
  --verbose, -v          Verbose output
  --watch, -w            Watch mode for development
  --coverage, -c         Generate coverage report
  --filter, -f <pattern> Filter tests by name pattern
  --timeout, -t <ms>     Set test timeout (default: 30000)
  --parallel, -p <n>     Number of parallel workers
  --bail, -b             Stop on first test failure
  --silent, -s           Minimal output
  --help, -h             Show this help message

Examples:
  node run-integration-tests.js                    # Run mock tests
  node run-integration-tests.js --real             # Run real API tests
  node run-integration-tests.js --performance      # Run performance tests
  node run-integration-tests.js --filter projects  # Run only project tests
  node run-integration-tests.js --coverage         # Run with coverage
  node run-integration-tests.js --watch            # Run in watch mode
`);
}

function validateEnvironment(mode) {
  console.log(`🔍 Validating environment for ${mode} mode...`);
  
  // Check if .env.test exists
  const envTestPath = join(rootDir, '.env.test');
  if (!existsSync(envTestPath)) {
    console.error('❌ .env.test file not found. Please create it from .env.test.example');
    process.exit(1);
  }
  
  // Check for API key if running real tests
  if (mode === 'real' || mode === 'performance') {
    const apiKey = process.env.FLOAT_API_KEY;
    if (!apiKey || apiKey === 'flt_test_key_placeholder') {
      console.error('❌ FLOAT_API_KEY environment variable is required for real API tests');
      console.error('   Please set a valid Float API key in .env.test or as an environment variable');
      process.exit(1);
    }
    
    if (!apiKey.startsWith('flt_')) {
      console.warn('⚠️  FLOAT_API_KEY does not start with "flt_" prefix - this may not be a valid Float API key');
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion < 20) {
    console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 20 or higher.`);
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

function getTestCommand(mode, options) {
  const baseCommand = 'npm';
  const baseArgs = ['run'];
  
  // Determine test script
  let testScript;
  switch (mode) {
    case 'mock':
      testScript = 'test:integration:mock';
      break;
    case 'real':
      testScript = 'test:integration:real';
      break;
    case 'performance':
      testScript = 'test:performance';
      break;
    default:
      console.error(`❌ Unknown test mode: ${mode}`);
      process.exit(1);
  }
  
  if (options.coverage) {
    testScript = 'test:coverage';
  }
  
  const args = [testScript];
  
  // Add Jest options
  if (options.watch) {
    args.push('--', '--watch');
  }
  
  if (options.filter) {
    args.push('--', '--testNamePattern', options.filter);
  }
  
  if (options.timeout) {
    args.push('--', '--testTimeout', options.timeout.toString());
  }
  
  if (options.parallel) {
    args.push('--', '--maxWorkers', options.parallel.toString());
  }
  
  if (options.bail) {
    args.push('--', '--bail');
  }
  
  if (options.silent) {
    args.push('--', '--silent');
  }
  
  if (options.verbose) {
    args.push('--', '--verbose');
  }
  
  return { command: baseCommand, args };
}

function setEnvironmentVariables(mode, options) {
  // Set common environment variables
  process.env.NODE_ENV = 'test';
  process.env.FORCE_COLOR = '1';
  
  // Set mode-specific variables
  switch (mode) {
    case 'mock':
      process.env.TEST_MOCK_MODE = 'true';
      process.env.TEST_REAL_API = 'false';
      process.env.TEST_SKIP_SLOW = 'true';
      break;
    case 'real':
      process.env.TEST_MOCK_MODE = 'false';
      process.env.TEST_REAL_API = 'true';
      process.env.TEST_SKIP_SLOW = 'true';
      break;
    case 'performance':
      process.env.TEST_MOCK_MODE = 'false';
      process.env.TEST_REAL_API = 'true';
      process.env.TEST_SKIP_SLOW = 'false';
      break;
  }
  
  // Set timeout if specified
  if (options.timeout) {
    process.env.TEST_TIMEOUT = options.timeout.toString();
  }
  
  // Set log level based on verbosity
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  } else if (options.silent) {
    process.env.LOG_LEVEL = 'error';
  } else {
    process.env.LOG_LEVEL = 'warn';
  }
}

function runTests(mode, options) {
  console.log(`🚀 Running integration tests in ${mode} mode...`);
  
  if (options.coverage) {
    console.log('📊 Coverage reporting enabled');
  }
  
  if (options.watch) {
    console.log('👀 Watch mode enabled');
  }
  
  if (options.filter) {
    console.log(`🔍 Filtering tests by pattern: ${options.filter}`);
  }
  
  const { command, args } = getTestCommand(mode, options);
  
  console.log(`📋 Command: ${command} ${args.join(' ')}`);
  console.log('');
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd: rootDir,
    env: process.env,
  });
  
  child.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log('✅ Tests completed successfully!');
      
      if (options.coverage) {
        console.log('📊 Coverage report generated in coverage/ directory');
      }
      
      if (mode === 'real') {
        console.log('🌐 Real API tests completed - check for any rate limiting warnings');
      }
      
    } else {
      console.log(`❌ Tests failed with exit code ${code}`);
      
      if (mode === 'real') {
        console.log('💡 If tests failed due to rate limiting, try running with fewer parallel workers');
      }
    }
    
    process.exit(code);
  });
  
  child.on('error', (error) => {
    console.error('❌ Failed to start test process:', error);
    process.exit(1);
  });
}

// Show startup banner
console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     Float MCP Integration Test Runner                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// Validate environment
validateEnvironment(mode);

// Set environment variables
setEnvironmentVariables(mode, options);

// Run tests
runTests(mode, options);