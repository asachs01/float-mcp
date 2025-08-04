#!/usr/bin/env node

// Quick test script to verify time off creation works with corrected endpoint
const { config } = require('dotenv');
const { FloatApi } = require('./dist/services/float-api.js');

// Load environment variables
config();

async function testTimeOffCreation() {
  try {
    console.log('🔍 Testing Float API time off creation...\n');
    
    const floatApi = new FloatApi();
    
    // First, let's check what time off types are available
    console.log('📋 Fetching available time off types...');
    const timeOffTypes = await floatApi.get('/timeoff-types');
    console.log('Available time off types:', JSON.stringify(timeOffTypes, null, 2));
    
    // And check people to get a valid person ID
    console.log('\n👥 Fetching people...');
    const people = await floatApi.get('/people');
    console.log('Available people (first 3):', JSON.stringify(people.slice(0, 3), null, 2));
    
    if (timeOffTypes.length === 0) {
      console.log('❌ No time off types found - cannot test creation');
      return;
    }
    
    if (people.length === 0) {
      console.log('❌ No people found - cannot test creation');
      return;
    }
    
    // Test creating a time off entry with corrected endpoint
    const testTimeOff = {
      people_ids: [people[0].people_id], // Use first person
      timeoff_type_id: timeOffTypes[0].timeoff_type_id, // Use first type
      start_date: '2025-12-25', // Future date to avoid conflicts
      end_date: '2025-12-25',
      full_day: 1,
      notes: 'Test time off creation - API endpoint validation'
    };
    
    console.log('\n🚀 Testing time off creation with data:', JSON.stringify(testTimeOff, null, 2));
    
    const result = await floatApi.post('/timeoffs', testTimeOff);
    
    console.log('✅ SUCCESS! Time off created successfully:');
    console.log(JSON.stringify(result, null, 2));
    
    // Clean up - delete the test entry
    if (result.timeoff_id) {
      console.log(`\n🧹 Cleaning up test entry (ID: ${result.timeoff_id})...`);
      try {
        await floatApi.delete(`/timeoffs/${result.timeoff_id}`);
        console.log('✅ Test entry cleaned up successfully');
      } catch (cleanupError) {
        console.log('⚠️  Could not clean up test entry:', cleanupError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ ERROR testing time off creation:');
    console.log('Error message:', error.message);
    console.log('Error details:', JSON.stringify(error, null, 2));
    
    if (error.message.includes('Page not found') || error.message.includes('Resource not found')) {
      console.log('\n🔍 This suggests the endpoint URL is still incorrect.');
    }
  }
}

testTimeOffCreation().catch(console.error);