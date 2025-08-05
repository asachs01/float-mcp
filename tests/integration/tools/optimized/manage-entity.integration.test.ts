import { describe, it, expect, afterEach } from '@jest/globals';
import {
  executeToolWithRetry,
  generateManageEntityParams,
  cleanupTestDataOptimized,
} from '../../utils/test-helpers.ts';
import { entitySchemaValidator } from '../../utils/schema-validator.ts';
import { ErrorTestUtils, createErrorTestCases } from '../../utils/error-handling.ts';
import { TEST_CONFIG } from '../../setup.ts';

describe('Manage Entity Tool Integration Tests', () => {
  const createdEntities: { type: string; id: number }[] = [];

  afterEach(async () => {
    // Clean up created entities
    for (const entity of createdEntities) {
      await cleanupTestDataOptimized(entity.type, entity.id);
    }
    createdEntities.length = 0;
  });

  describe('People Entity Management', () => {
    describe('list operation', () => {
      it('should list all people', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
        });

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
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          page: 1,
          'per-page': 5,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(5);
      });

      it('should filter people by department', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          department_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // Validate department filter
        result.forEach((person: any) => {
          if (person.department && person.department.department_id) {
            expect(person.department.department_id).toBe(1);
          }
        });
      });

      it('should filter people by active status', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          active: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((person: any) => {
          expect(person.active).toBe(1);
        });
      });
    });

    describe('get operation', () => {
      it('should get a specific person by ID', async () => {
        // First, get a person ID from the list
        const people = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          'per-page': 1,
        });

        if (people.length === 0) {
          console.warn('No people found to test get operation');
          return;
        }

        const personId = people[0].people_id;
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'get',
          id: personId,
        });

        expect(result).toBeDefined();
        expect(result.people_id).toBe(personId);
        entitySchemaValidator.validatePerson(result);
      });

      it('should handle string person ID', async () => {
        const people = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          'per-page': 1,
        });

        if (people.length === 0) {
          console.warn('No people found to test get operation with string ID');
          return;
        }

        const personId = people[0].people_id.toString();
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'get',
          id: personId,
        });

        expect(result).toBeDefined();
        expect(result.people_id).toBe(parseInt(personId));
      });
    });

    describe('create operation', () => {
      it('should create a new person', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-person test - real API calls disabled');
          return;
        }

        const params = generateManageEntityParams('people', 'create');
        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.people_id).toBeDefined();
        expect(result.name).toBe(params.name);
        expect(result.email).toBe(params.email);

        // Track for cleanup
        createdEntities.push({ type: 'person', id: result.people_id });

        entitySchemaValidator.validatePerson(result);
      });

      it('should create person with all optional fields', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn(
            'Skipping create-person with optional fields test - real API calls disabled'
          );
          return;
        }

        const params = generateManageEntityParams('people', 'create', {
          job_title: 'Senior Developer',
          department_id: 1,
          notes: 'Test person with all fields',
          auto_email: 1,
          employee_type: 1,
          start_date: '2024-01-01',
          default_hourly_rate: '75.00',
        });

        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.people_id).toBeDefined();
        expect(result.job_title).toBe(params.job_title);
        expect(result.employee_type).toBe(params.employee_type);

        // Track for cleanup
        createdEntities.push({ type: 'person', id: result.people_id });

        entitySchemaValidator.validatePerson(result);
      });
    });

    describe('update operation', () => {
      it('should update an existing person', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping update-person test - real API calls disabled');
          return;
        }

        // Create a person first
        const createParams = generateManageEntityParams('people', 'create');
        const created = await executeToolWithRetry('manage-entity', createParams);
        expect(created.people_id).toBeDefined();

        const updatedName = `Updated ${createParams.name}`;
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'update',
          id: created.people_id,
          name: updatedName,
          job_title: 'Updated Title',
        });

        expect(result).toBeDefined();

        // Track for cleanup
        createdEntities.push({ type: 'person', id: created.people_id });
      });
    });

    describe('delete operation', () => {
      it('should delete (archive) a person', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping delete-person test - real API calls disabled');
          return;
        }

        // Create a person first
        const createParams = generateManageEntityParams('people', 'create');
        const created = await executeToolWithRetry('manage-entity', createParams);

        // Delete the person
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'delete',
          id: created.people_id,
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.message).toContain('archived');
      });
    });
  });

  describe('Projects Entity Management', () => {
    describe('list operation', () => {
      it('should list all projects', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'projects',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((project: any) => {
            expect(project.project_id).toBeDefined();
            expect(project.name).toBeDefined();
          });
        }
      });

      it('should filter projects by client', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'projects',
          operation: 'list',
          client_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((project: any) => {
          if (project.client && project.client.client_id) {
            expect(project.client.client_id).toBe(1);
          }
        });
      });

      it('should filter projects by status', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'projects',
          operation: 'list',
          status: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('get operation', () => {
      it('should get a specific project by ID', async () => {
        const projects = await executeToolWithRetry('manage-entity', {
          entity_type: 'projects',
          operation: 'list',
          'per-page': 1,
        });

        if (projects.length === 0) {
          console.warn('No projects found to test get operation');
          return;
        }

        const projectId = projects[0].project_id;
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'projects',
          operation: 'get',
          id: projectId,
        });

        expect(result).toBeDefined();
        expect(result.project_id).toBe(projectId);
      });
    });

    describe('create operation', () => {
      it('should create a new project', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-project test - real API calls disabled');
          return;
        }

        const params = generateManageEntityParams('projects', 'create');
        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.project_id).toBeDefined();
        expect(result.name).toBe(params.name);

        // Track for cleanup
        createdEntities.push({ type: 'project', id: result.project_id });
      });

      it('should create project with budget and hourly rate', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-project with budget test - real API calls disabled');
          return;
        }

        const params = generateManageEntityParams('projects', 'create', {
          budget: 10000,
          hourly_rate: 100,
          color: '#ff5733',
          non_billable: 0,
        });

        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.project_id).toBeDefined();
        expect(result.budget).toBe(params.budget);
        expect(result.hourly_rate).toBe(params.hourly_rate);

        // Track for cleanup
        createdEntities.push({ type: 'project', id: result.project_id });
      });
    });
  });

  describe('Tasks Entity Management', () => {
    describe('list operation', () => {
      it('should list all tasks', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'tasks',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((task: any) => {
            expect(task.task_id).toBeDefined();
            expect(task.name).toBeDefined();
          });
        }
      });

      it('should filter tasks by project', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'tasks',
          operation: 'list',
          project_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((task: any) => {
          if (task.project_id) {
            expect(task.project_id).toBe(1);
          }
        });
      });
    });

    describe('get operation', () => {
      it('should get a specific task by ID', async () => {
        const tasks = await executeToolWithRetry('manage-entity', {
          entity_type: 'tasks',
          operation: 'list',
          'per-page': 1,
        });

        if (tasks.length === 0) {
          console.warn('No tasks found to test get operation');
          return;
        }

        const taskId = tasks[0].task_id;
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'tasks',
          operation: 'get',
          id: taskId,
        });

        expect(result).toBeDefined();
        expect(result.task_id).toBe(taskId);
      });
    });

    describe('create operation', () => {
      it('should create a new task', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-task test - real API calls disabled');
          return;
        }

        const params = generateManageEntityParams('tasks', 'create');
        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.task_id).toBeDefined();
        expect(result.name).toBe(params.name);

        // Track for cleanup
        createdEntities.push({ type: 'task', id: result.task_id });
      });
    });
  });

  describe('Clients Entity Management', () => {
    describe('list operation', () => {
      it('should list all clients', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'clients',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((client: any) => {
            expect(client.client_id).toBeDefined();
            expect(client.name).toBeDefined();
          });
        }
      });
    });

    describe('create operation', () => {
      it('should create a new client', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-client test - real API calls disabled');
          return;
        }

        const params = generateManageEntityParams('clients', 'create');
        const result = await executeToolWithRetry('manage-entity', params);

        expect(result).toBeDefined();
        expect(result.client_id).toBeDefined();
        expect(result.name).toBe(params.name);

        // Track for cleanup
        createdEntities.push({ type: 'client', id: result.client_id });
      });
    });
  });

  describe('Departments Entity Management', () => {
    describe('list operation', () => {
      it('should list all departments', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'departments',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((department: any) => {
            expect(department.department_id).toBeDefined();
            expect(department.name).toBeDefined();
          });
        }
      });
    });

    describe('get operation', () => {
      it('should get a specific department by ID', async () => {
        const departments = await executeToolWithRetry('manage-entity', {
          entity_type: 'departments',
          operation: 'list',
          'per-page': 1,
        });

        if (departments.length === 0) {
          console.warn('No departments found to test get operation');
          return;
        }

        const departmentId = departments[0].department_id;
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'departments',
          operation: 'get',
          id: departmentId,
        });

        expect(result).toBeDefined();
        expect(result.department_id).toBe(departmentId);
      });
    });
  });

  describe('Roles Entity Management', () => {
    describe('list operation', () => {
      it('should list all roles', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'roles',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((role: any) => {
            expect(role.role_id).toBeDefined();
            expect(role.name).toBeDefined();
          });
        }
      });
    });

    describe('get-roles-by-permission operation', () => {
      it('should get roles by permission', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'roles',
          operation: 'get-roles-by-permission',
          permission: 'view_projects',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('get-role-hierarchy operation', () => {
      it('should get role hierarchy', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'roles',
          operation: 'get-role-hierarchy',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Accounts Entity Management', () => {
    describe('get-current-account operation', () => {
      it('should get current account information', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'accounts',
          operation: 'get-current-account',
        });

        expect(result).toBeDefined();
        expect(result.account_id).toBeDefined();
      });
    });

    describe('list operation', () => {
      it('should list all accounts', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'accounts',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((account: any) => {
            expect(account.account_id).toBeDefined();
          });
        }
      });
    });
  });

  describe('Statuses Entity Management', () => {
    describe('list operation', () => {
      it('should list all statuses', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'statuses',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((status: any) => {
            expect(status.status_id).toBeDefined();
            expect(status.name).toBeDefined();
          });
        }
      });
    });

    describe('get-statuses-by-type operation', () => {
      it('should get project statuses', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'statuses',
          operation: 'get-statuses-by-type',
          status_type: 'project',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((status: any) => {
          expect(status.status_type).toBe('project');
        });
      });

      it('should get task statuses', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'statuses',
          operation: 'get-statuses-by-type',
          status_type: 'task',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((status: any) => {
          expect(status.status_type).toBe('task');
        });
      });
    });

    describe('get-default-status operation', () => {
      it('should get default project status', async () => {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: 'statuses',
          operation: 'get-default-status',
          status_type: 'project',
        });

        expect(result).toBeDefined();
        expect(result.status_id).toBeDefined();
        expect(result.is_default).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('entity');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateManageEntityParams('people', 'get', { id: 1 });
        await test('manage-entity', validParams);
      });
    });

    it('should handle invalid entity_type', async () => {
      await ErrorTestUtils.testValidationError('manage-entity', {
        entity_type: 'invalid_entity',
        operation: 'list',
      });
    });

    it('should handle invalid operation', async () => {
      await ErrorTestUtils.testValidationError('manage-entity', {
        entity_type: 'people',
        operation: 'invalid_operation',
      });
    });

    it('should handle missing required parameters for create', async () => {
      await ErrorTestUtils.testValidationError('manage-entity', {
        entity_type: 'people',
        operation: 'create',
        // Missing name and email
      });
    });

    it('should handle invalid ID in get operation', async () => {
      await ErrorTestUtils.testNotFoundError(
        'manage-entity',
        {
          entity_type: 'people',
          operation: 'get',
          id: 999999999,
        },
        'people'
      );
    });

    it('should handle invalid email format', async () => {
      await ErrorTestUtils.testValidationError('manage-entity', {
        entity_type: 'people',
        operation: 'create',
        name: 'Test Person',
        email: 'invalid-email',
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const requests = Array.from({ length: 5 }, () =>
        executeToolWithRetry('manage-entity', {
          entity_type: 'people',
          operation: 'list',
          'per-page': 5,
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle different entity types in parallel', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const entityTypes = ['people', 'projects', 'tasks', 'clients'];
      const requests = entityTypes.map((entityType) =>
        executeToolWithRetry('manage-entity', {
          entity_type: entityType,
          operation: 'list',
          'per-page': 3,
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(4);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate response structure consistency', async () => {
      const entityTypes = ['people', 'projects', 'tasks', 'clients'];

      for (const entityType of entityTypes) {
        const result = await executeToolWithRetry('manage-entity', {
          entity_type: entityType,
          operation: 'list',
          'per-page': 2,
        });

        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((item: any) => {
            // Each item should have an ID field
            const expectedIdField = `${entityType.slice(0, -1)}_id`; // Remove 's' and add '_id'
            if (entityType === 'people') {
              expect(item.people_id).toBeDefined();
            } else {
              expect(item[expectedIdField]).toBeDefined();
            }

            // Each item should have a name field
            expect(item.name).toBeDefined();
            expect(typeof item.name).toBe('string');
            expect(item.name.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });
});
