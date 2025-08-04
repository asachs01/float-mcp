#!/usr/bin/env node

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

async function testMCPServer() {
  console.log('🚀 Starting Float MCP Server test...\n');

  // Start the MCP server process
  console.log('Starting MCP server...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: '/home/asachs/Documents/projects/float-mcp',
    env: {
      ...process.env,
      FLOAT_API_KEY: process.env.FLOAT_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJhcHAuZmxvYXQuY29tIiwiZXhwIjoxNzQzNTMxMTA1LCJjbGllbnRfaWQiOiJ3ZWItYXBwIiwidmVyc2lvbiI6NiwiY29tcGFueSI6eyJpZCI6MTk0MDk1LCJ1dWlkIjoiOTQ2ODU2Nzk5OTkwNTUzMDg2NCIsIm5hbWUiOiJXWVJFIiwidGltZV90cmFja2luZyI6MSwicGx1c19wYWNrIjoxfSwiYWNjb3VudCI6eyJpZCI6MTA1MjE1NywibmFtZSI6IkFhcm9uIFNhY2hzIiwiYWNjb3VudF90eXBlX2lkIjoyLCJhY2Nlc3MiOjAsImRlcGFydG1lbnRfZmlsdGVyIjpudWxsLCJkZXBhcnRtZW50X2ZpbHRlcl9pZCI6MCwicGVvcGxlX2lkIjoxODM0MTExOCwidmlld19yaWdodHMiOjEsImJ1ZGdldF9yaWdodHMiOjEsImF2YXRhciI6bnVsbCwibG9naW5fbWV0aG9kIjoxfX0.SEpzf9YuEt09qZcXYau4bdAqiELJbZ3qDEAQipTPqpADlSZU50rJdyYI8fSYAUOGqI720kwPlpuyiliXlkrDMSUjbUgvEfreEV8_G-9Cy0kIP-BDydANu442slC_SecBtueTm28slOj5Ol04YmtotmoAASipj-UkX7GTj8PkjSTdW0Rzpme6altR1M_wvjuZfVQSUosdTCHFP6hZJuqYVdm0USrVS5muDHGapr5WvhTfLgqsYpPKhkjIWE7dRwGeHJZde4cBqVpoj1wyAAYIMkLHNGOhZeFm5-msM0hkoxxXlzO5iH4bMyUmfvq6eZ_lNJW-_jYjeWlgYyh9_D2co7ip4xANATiTyuku9L615cuuXMZcCseHjhGaNfgbNNZ3PjFbUS4tMzTiSSezNAOhM0DcQhnRan6wGK5GlI7u6cG7W_zx2idw1-IHGH0I_Uhty9YnduyV2qlp77odBnqY_n4A3Y01nqB6la_bKcy3MqgBT3wpprusHTLVfMTKqbY_eb9bw-yZba3KBF5gR1UTyYoPc6SeQVaHAQ_98PW1AK5Ca7_2Q1tDhFGduY1WYcgTnM7ArslHVHCqdxiYCd2R_7bkDrXqlzsRQLT3Pqp1j46iE6aUra78SnAgCD4iNnWcJB0mnCd-zstyXRQEZqVVRgcu6K_tL9_anG23buKnvSU'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create client with stdio transport
  const transport = new StdioClientTransport({
    readable: serverProcess.stdout,
    writable: serverProcess.stdin
  });

  const client = new Client(
    {
      name: 'float-mcp-test-client',
      version: '1.0.0'
    },
    {
      capabilities: {}
    }
  );

  try {
    // Connect to server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected to MCP server!\n');

    // List available tools
    console.log('📋 Listing available tools...');
    const toolsResult = await client.listTools();
    console.log(`Found ${toolsResult.tools.length} tools:`);
    toolsResult.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description.substring(0, 100)}...`);
    });
    console.log();

    // Test 1: List projects using the optimized manage-entity tool
    console.log('🏢 Test 1: Listing projects with manage-entity tool...');
    try {
      const projectsResult = await client.callTool({
        name: 'manage-entity',
        arguments: {
          entity_type: 'projects',
          operation: 'list',
          active: 1,
          'per-page': 5
        }
      });
      
      console.log('✅ Projects retrieved successfully!');
      console.log('Response:', JSON.stringify(projectsResult, null, 2));
    } catch (error) {
      console.log('❌ Error getting projects:', error.message);
    }
    console.log();

    // Test 2: List people using manage-entity
    console.log('👥 Test 2: Listing people with manage-entity tool...');
    try {
      const peopleResult = await client.callTool({
        name: 'manage-entity',
        arguments: {
          entity_type: 'people',
          operation: 'list',
          active: 1,
          'per-page': 3
        }
      });
      
      console.log('✅ People retrieved successfully!');
      console.log('Response:', JSON.stringify(peopleResult, null, 2));
    } catch (error) {
      console.log('❌ Error getting people:', error.message);
    }
    console.log();

    // Test 3: Generate a time report
    console.log('📊 Test 3: Generating time report...');
    try {
      const reportResult = await client.callTool({
        name: 'generate-report',
        arguments: {
          report_type: 'time-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          include_details: false,
          include_totals: true
        }
      });
      
      console.log('✅ Time report generated successfully!');
      console.log('Response:', JSON.stringify(reportResult, null, 2));
    } catch (error) {
      console.log('❌ Error generating time report:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up
    console.log('\n🧹 Cleaning up...');
    await client.close();
    serverProcess.kill();
    console.log('✅ Test completed!');
  }
}

// Run the test
testMCPServer().catch(console.error);