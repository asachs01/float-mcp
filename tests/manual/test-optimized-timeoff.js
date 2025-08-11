#!/usr/bin/env node

// Test the optimized time off tool to see if it works
const { config } = require('dotenv');
const { manageTimeTracking } = require('../../dist/tools/optimized/manage-time-tracking.js');

// Load environment variables
config();

async function testOptimizedTimeOff() {
  try {
    console.log('🔍 Testing optimized time off creation...\n');

    // Test creating a time off entry using the optimized tool
    const result = await manageTimeTracking({
      tracking_type: 'timeoff',
      operation: 'create',
      people_id: 18341118, // Aaron Sachs from the API response
      timeoff_type_id: 731192, // Paid Time Off from the API response
      start_date: '2025-12-26',
      end_date: '2025-12-26',
      full_day: 1,
      notes: 'Test optimized time off creation',
    });

    console.log('✅ SUCCESS! Optimized time off created:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ ERROR with optimized time off creation:');
    console.log('Error message:', error.message);
    console.log('Error details:', JSON.stringify(error, null, 2));
  }
}

testOptimizedTimeOff().catch(console.error);
