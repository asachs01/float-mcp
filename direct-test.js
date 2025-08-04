#!/usr/bin/env node

// Simple direct test of the optimized tools
require('dotenv').config();

async function testOptimizedTools() {
  console.log('🚀 Testing Float MCP Optimized Tools directly...\n');

  try {
    // Import the optimized tools
    const { tools } = await import('./dist/tools/index.js');
    
    console.log(`📋 Found ${tools.length} optimized tools:`);
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description.substring(0, 80)}...`);
    });
    console.log();

    // Test 1: List projects using manage-entity
    console.log('🏢 Test 1: Listing projects with manage-entity...');
    const manageEntityTool = tools.find(t => t.name === 'manage-entity');
    if (manageEntityTool) {
      try {
        const result = await manageEntityTool.handler({
          entity_type: 'projects',
          operation: 'list',
          active: 1,
          'per-page': 5
        });
        
        console.log('✅ Projects retrieved!');
        console.log('Result type:', typeof result);
        if (result && result.data && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} projects:`);
          result.data.forEach(project => {
            console.log(`  - ${project.name || project.project_name || 'Unnamed'} (ID: ${project.project_id})`);
          });
        } else {
          console.log('Result:', JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('❌ manage-entity tool not found');
    }
    console.log();

    // Test 2: List people using manage-entity
    console.log('👥 Test 2: Listing people with manage-entity...');
    if (manageEntityTool) {
      try {
        const result = await manageEntityTool.handler({
          entity_type: 'people',
          operation: 'list',
          active: 1,
          'per-page': 3
        });
        
        console.log('✅ People retrieved!');
        if (result && result.data && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} people:`);
          result.data.forEach(person => {
            console.log(`  - ${person.name} (ID: ${person.people_id})`);
          });
        } else {
          console.log('Result:', JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }
    console.log();

    // Test 3: Generate a report
    console.log('📊 Test 3: Generating time report...');
    const generateReportTool = tools.find(t => t.name === 'generate-report');
    if (generateReportTool) {
      try {
        const result = await generateReportTool.handler({
          report_type: 'time-report',
          start_date: '2024-01-01',  
          end_date: '2024-01-31',
          include_details: false,
          include_totals: true
        });
        
        console.log('✅ Time report generated!');
        if (result && result.summary) {
          console.log(`Report Summary:`);
          console.log(`  - Total entries: ${result.summary.total_entries}`);
          console.log(`  - Total hours: ${result.summary.total_hours}`);
          console.log(`  - Billable hours: ${result.summary.billable_hours}`);
        } else {
          console.log('Result:', JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('❌ generate-report tool not found');
    }
    console.log();

    // Test 4: Test project workflow
    console.log('🔄 Test 4: Testing project workflow...');
    const workflowTool = tools.find(t => t.name === 'manage-project-workflow');
    if (workflowTool) {
      try {
        const result = await workflowTool.handler({
          workflow_type: 'phases',
          operation: 'list',
          'per-page': 3
        });
        
        console.log('✅ Project phases retrieved!');
        if (result && result.data && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} phases:`);
          result.data.forEach(phase => {
            console.log(`  - ${phase.name} (Project ID: ${phase.project_id})`);
          });
        } else {
          console.log('Result:', JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('❌ manage-project-workflow tool not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n✅ Direct test completed!');
}

testOptimizedTools().catch(console.error);