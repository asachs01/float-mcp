#!/usr/bin/env node

// Debug script to check what endpoints work
const { config } = require('dotenv');
const { FloatApi } = require('./dist/services/float-api.js');

config();

async function debugEndpoints() {
  try {
    console.log('🔍 Testing different time off endpoints...\n');

    const floatApi = new FloatApi();

    // Try various endpoint formats to see which one works
    const endpointsToTry = ['/timeoff', '/timeoffs', '/time-off', '/time_off'];

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`📋 Testing GET ${endpoint}...`);
        const result = await floatApi.get(endpoint);
        console.log(`✅ SUCCESS with ${endpoint}! Got ${result.length || 'unknown'} records`);
        console.log('Sample result:', JSON.stringify(result.slice(0, 1), null, 2));
        break; // Found working endpoint
      } catch (error) {
        console.log(`❌ Failed ${endpoint}: ${error.message}`);
      }
    }

    // Also try with a simple direct HTTP call to see raw response
    console.log('\n🌐 Making direct HTTP request to check raw response...');

    try {
      const response = await fetch('https://api.float.com/v3/timeoff', {
        headers: {
          Authorization: `Bearer ${process.env.FLOAT_API_KEY}`,
          Accept: 'application/json',
          'User-Agent': 'Float MCP Server v0.3.2 (github.com/asachs01/float-mcp)',
        },
      });

      console.log(`HTTP Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw HTTP request successful!');
        console.log('Sample data:', JSON.stringify(data.slice(0, 1), null, 2));
      } else {
        const errorText = await response.text();
        console.log('❌ Raw HTTP request failed:');
        console.log('Error response:', errorText);
      }
    } catch (fetchError) {
      console.log('❌ HTTP fetch error:', fetchError.message);
    }
  } catch (error) {
    console.log('❌ DEBUG ERROR:', error.message);
  }
}

debugEndpoints().catch(console.error);
