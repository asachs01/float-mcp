import { describe, it, expect } from '@jest/globals';
import {
  executeToolWithRetry,
  generateTestPersonData,
  cleanupTestData,
} from '../utils/test-helpers.ts';
import { entitySchemaValidator } from '../utils/schema-validator.ts';
import { ErrorTestUtils, createErrorTestCases } from '../utils/error-handling.ts';
import { TEST_CONFIG } from '../setup.ts';

describe('People Tools Integration Tests', () => {
  const createdPeople: number[] = [];

  afterEach(async () => {
    // Clean up created people
    for (const personId of createdPeople) {
      await cleanupTestData('person', personId);
    }
    createdPeople.length = 0;
  });

  describe('list-people', () => {
    it('should list all people', async () => {
      const result = await executeToolWithRetry('list-people', {});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate schema for each person
      if (result.length > 0) {
        result.forEach((person: any) => {
          entitySchemaValidator.validatePerson(person);
        });
      }
    });

    it('should list people with pagination', async () => {
      const result = await executeToolWithRetry('list-people', {
        page: 1,
        'per-page': 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should filter people by department', async () => {
      const result = await executeToolWithRetry('list-people', {
        department_id: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned people have the expected department
      result.forEach((person: any) => {
        if (person.department && person.department.department_id) {
          expect(person.department.department_id).toBe(1);
        }
      });
    });

    it('should filter people by active status', async () => {
      const result = await executeToolWithRetry('list-people', {
        active: 1, // Active people
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned people are active
      result.forEach((person: any) => {
        expect(person.active).toBe(1);
      });
    });

    it('should filter people by employee type', async () => {
      const result = await executeToolWithRetry('list-people', {
        employee_type: 1, // Full-time employees
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned people have the expected employee type
      result.forEach((person: any) => {
        expect(person.employee_type).toBe(1);
      });
    });
  });

  describe('get-person', () => {
    it('should get a specific person by ID', async () => {
      // First, get a person ID from the list
      const people = await executeToolWithRetry('list-people', { 'per-page': 1 });

      if (people.length === 0) {
        console.warn('No people found to test get-person');
        return;
      }

      const personId = people[0].people_id;
      const result = await executeToolWithRetry('get-person', {
        people_id: personId,
      });

      expect(result).toBeDefined();
      expect(result.people_id).toBe(personId);

      // Validate schema
      entitySchemaValidator.validatePerson(result);
    });

    it('should handle string person ID', async () => {
      const people = await executeToolWithRetry('list-people', { 'per-page': 1 });

      if (people.length === 0) {
        console.warn('No people found to test get-person with string ID');
        return;
      }

      const personId = people[0].people_id.toString();
      const result = await executeToolWithRetry('get-person', {
        people_id: personId,
      });

      expect(result).toBeDefined();
      expect(result.people_id).toBe(parseInt(personId));
    });
  });

  describe('create-person', () => {
    it('should create a new person', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping create-person test - real API calls disabled');
        return;
      }

      const personData = generateTestPersonData();
      const result = await executeToolWithRetry('create-person', personData);

      expect(result).toBeDefined();
      expect(result.people_id).toBeDefined();
      expect(result.name).toBe(personData.name);
      expect(result.email).toBe(personData.email);

      // Track for cleanup
      createdPeople.push(result.people_id);

      // Validate schema
      entitySchemaValidator.validatePerson(result);
    });

    it('should create person with all optional fields', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping create-person with optional fields test - real API calls disabled');
        return;
      }

      const personData = generateTestPersonData({
        job_title: 'Senior Developer',
        department_id: 1,
        notes: 'Test person with all fields',
        auto_email: 1,
        employee_type: 1,
        start_date: '2024-01-01',
        default_hourly_rate: '75.00',
      });

      const result = await executeToolWithRetry('create-person', personData);

      expect(result).toBeDefined();
      expect(result.people_id).toBeDefined();
      expect(result.job_title).toBe(personData.job_title);
      expect(result.employee_type).toBe(personData.employee_type);

      // Track for cleanup
      createdPeople.push(result.people_id);

      // Validate schema
      entitySchemaValidator.validatePerson(result);
    });
  });

  describe('update-person', () => {
    it('should update an existing person', async () => {
      const personData = {
        name: 'Update Test Person',
        email: `update-test-${Date.now()}@example.com`,
        employee_type: 1,
        active: 1,
      };

      const created = await executeToolWithRetry('create-person', personData);
      expect(created.people_id).toBeDefined();

      const updatedName = `Updated ${personData.name}`;
      const result = await executeToolWithRetry('update-person', {
        people_id: created.people_id,
        name: updatedName,
        job_title: 'Updated Title',
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated person to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedPerson = await executeToolWithRetry('get-person', { people_id: created.people_id });
        expect(updatedPerson.people_id).toBe(created.people_id);
        expect(updatedPerson.name).toBe(updatedName);
        expect(updatedPerson.job_title).toBe('Updated Title');
      } else {
        expect(result.people_id).toBe(created.people_id);
        expect(result.name).toBe(updatedName);
        expect(result.job_title).toBe('Updated Title');
      }

      // Track for cleanup
      createdPeople.push(created.people_id);
    });

    it('should update person with partial data', async () => {
      const personData = {
        name: 'Partial Update Test Person',
        email: `partial-update-test-${Date.now()}@example.com`,
        employee_type: 1,
        active: 1,
      };

      const created = await executeToolWithRetry('create-person', personData);
      expect(created.people_id).toBeDefined();

      const result = await executeToolWithRetry('update-person', {
        people_id: created.people_id,
        job_title: 'Lead Developer',
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated person to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedPerson = await executeToolWithRetry('get-person', { people_id: created.people_id });
        expect(updatedPerson.people_id).toBe(created.people_id);
        expect(updatedPerson.job_title).toBe('Lead Developer');
        expect(updatedPerson.name).toBe(personData.name); // Should remain unchanged
      } else {
        expect(result.people_id).toBe(created.people_id);
        expect(result.job_title).toBe('Lead Developer');
        expect(result.name).toBe(personData.name); // Should remain unchanged
      }

      // Track for cleanup
      createdPeople.push(created.people_id);
    });
  });

  describe('delete-person', () => {
    it('should delete (archive) a person', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping delete-person test - real API calls disabled');
        return;
      }

      // First create a person
      const personData = generateTestPersonData();
      const created = await executeToolWithRetry('create-person', personData);

      // Delete the person
      const result = await executeToolWithRetry('delete-person', {
        people_id: created.people_id,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('archived');

      // Verify person is no longer accessible (or is archived)
      try {
        await executeToolWithRetry('get-person', {
          people_id: created.people_id,
        });
        // If we get here, the person still exists (might be archived)
        console.warn('Person still exists after deletion - may be archived instead');
      } catch (error) {
        // Expected if person is truly deleted
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('person');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateTestPersonData();
        await test('get-person', validParams);
      });
    });

    it('should handle invalid people_id in get-person', async () => {
      await ErrorTestUtils.testNotFoundError(
        'get-person',
        {
          people_id: 999999999,
        },
        'people'
      );
    });

    it('should handle invalid data in create-person', async () => {
      await ErrorTestUtils.testValidationError('create-person', {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
      });
    });

    it('should handle missing required fields in create-person', async () => {
      await ErrorTestUtils.testValidationError('create-person', {
        // Missing name
        email: 'test@example.com',
      });
    });

    it('should handle duplicate email in create-person', async () => {
      // Skip this test for real API as it may not enforce duplicate email validation
      if (process.env.TEST_REAL_API === 'true') {
        console.warn('Skipping duplicate email test - real API may not enforce this validation');
        return;
      }

      const personData = {
        name: 'Duplicate Email Test Person',
        email: 'duplicate@example.com',
        employee_type: 1,
        active: 1,
      };

      // Create first person
      const first = await executeToolWithRetry('create-person', personData);
      createdPeople.push(first.people_id);

      // Attempt to create second person with same email
      await ErrorTestUtils.testValidationError('create-person', personData, 'duplicate email');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const requests = Array.from({ length: 5 }, () =>
        executeToolWithRetry('list-people', { 'per-page': 5 })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate person data structure', async () => {
      const people = await executeToolWithRetry('list-people', { 'per-page': 5 });

      people.forEach((person: any) => {
        expect(person).toBeDefined();
        expect(person.people_id).toBeDefined();
        expect(person.name).toBeDefined();
        expect(typeof person.name).toBe('string');
        expect(person.name.length).toBeGreaterThan(0);

        // Validate schema
        const validation = entitySchemaValidator.validatePerson(person);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should handle null values in person data', async () => {
      const people = await executeToolWithRetry('list-people', { 'per-page': 5 });

      people.forEach((person: any) => {
        // These fields can be null according to the schema
        if (person.email !== null) {
          expect(typeof person.email).toBe('string');
        }
        if (person.job_title !== null) {
          expect(typeof person.job_title).toBe('string');
        }
        if (person.notes !== null) {
          expect(typeof person.notes).toBe('string');
        }
      });
    });
  });
});
