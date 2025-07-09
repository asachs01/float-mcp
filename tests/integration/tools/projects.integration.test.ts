import { describe, it, expect } from '@jest/globals';
import {
  executeToolWithRetry,
  generateTestProjectData,
  cleanupTestData,
} from '../utils/test-helpers.ts';
import { entitySchemaValidator } from '../utils/schema-validator.ts';
import { ErrorTestUtils, createErrorTestCases } from '../utils/error-handling.ts';
import { TEST_CONFIG } from '../setup.ts';

describe('Project Tools Integration Tests', () => {
  const createdProjects: number[] = [];

  afterEach(async () => {
    // Clean up created projects
    for (const projectId of createdProjects) {
      await cleanupTestData('project', projectId);
    }
    createdProjects.length = 0;
  });

  describe('list-projects', () => {
    it('should list all projects', async () => {
      const result = await executeToolWithRetry('list-projects', {});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate schema for each project
      if (result.length > 0) {
        result.forEach((project: any) => {
          entitySchemaValidator.validateProject(project);
        });
      }
    });

    it('should list projects with pagination', async () => {
      const result = await executeToolWithRetry('list-projects', {
        page: 1,
        'per-page': 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should filter projects by status', async () => {
      const result = await executeToolWithRetry('list-projects', {
        status: 1, // Active status
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned projects have the expected status
      result.forEach((project: any) => {
        expect(project.status).toBe(1);
      });
    });

    it('should filter projects by client', async () => {
      const result = await executeToolWithRetry('list-projects', {
        client_id: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned projects have the expected client_id
      result.forEach((project: any) => {
        expect(project.client_id).toBe(1);
      });
    });

    it('should filter projects by active status', async () => {
      const result = await executeToolWithRetry('list-projects', {
        active: 1, // Active projects
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned projects are active
      result.forEach((project: any) => {
        expect(project.active).toBe(1);
      });
    });
  });

  describe('get-project', () => {
    it('should get a specific project by ID', async () => {
      // First, get a project ID from the list
      const projects = await executeToolWithRetry('list-projects', { 'per-page': 1 });

      if (projects.length === 0) {
        console.warn('No projects found to test get-project');
        return;
      }

      const projectId = projects[0].project_id;
      const result = await executeToolWithRetry('get-project', {
        project_id: projectId,
      });

      expect(result).toBeDefined();
      expect(result.project_id).toBe(projectId);

      // Validate schema
      entitySchemaValidator.validateProject(result);
    });

    it('should handle string project ID', async () => {
      const projects = await executeToolWithRetry('list-projects', { 'per-page': 1 });

      if (projects.length === 0) {
        console.warn('No projects found to test get-project with string ID');
        return;
      }

      const projectId = projects[0].project_id.toString();
      const result = await executeToolWithRetry('get-project', {
        project_id: projectId,
      });

      expect(result).toBeDefined();
      expect(result.project_id).toBe(parseInt(projectId));
    });
  });

  describe('create-project', () => {
    it('should create a new project', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping create-project test - real API calls disabled');
        return;
      }

      const projectData = generateTestProjectData();
      const result = await executeToolWithRetry('create-project', projectData);

      expect(result).toBeDefined();
      expect(result.project_id).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.client_id).toBe(projectData.client_id);

      // Track for cleanup
      createdProjects.push(result.project_id);

      // Validate schema
      entitySchemaValidator.validateProject(result);
    });

    it('should create project with all optional fields', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping create-project with optional fields test - real API calls disabled');
        return;
      }

      const projectData = generateTestProjectData({
        budget: 10000,
        hourly_rate: 100,
        color: '#FF5733',
        non_billable: 0,
        tentative: 0,
        notes: 'Test project with all fields',
      });

      const result = await executeToolWithRetry('create-project', projectData);

      expect(result).toBeDefined();
      expect(result.project_id).toBeDefined();
      expect(result.budget).toBe(projectData.budget);
      expect(result.hourly_rate).toBe(projectData.hourly_rate);
      expect(result.color).toBe(projectData.color);

      // Track for cleanup
      createdProjects.push(result.project_id);

      // Validate schema
      entitySchemaValidator.validateProject(result);
    });
  });

  describe('update-project', () => {
    it('should update an existing project', async () => {
      const projectData = generateTestProjectData({
        name: 'Update Test Project',
        client_id: 1,
        project_manager: 1,
        color: '#FF0000',
        active: 1,
      });

      const created = await executeToolWithRetry('create-project', projectData);
      expect(created.project_id).toBeDefined();

      const updatedName = `Updated ${projectData.name}`;
      const result = await executeToolWithRetry('update-project', {
        project_id: created.project_id,
        name: updatedName,
        color: '#00FF00',
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated project to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedProject = await executeToolWithRetry('get-project', { project_id: created.project_id });
        expect(updatedProject.project_id).toBe(created.project_id);
        expect(updatedProject.name).toBe(updatedName);
        expect(updatedProject.color).toBe('#00FF00');
      } else {
        expect(result.project_id).toBe(created.project_id);
        expect(result.name).toBe(updatedName);
        expect(result.color).toBe('#00FF00');
      }

      // Track for cleanup
      createdProjects.push(created.project_id);
    });

    it('should update project with partial data', async () => {
      const projectData = generateTestProjectData({
        name: 'Partial Update Test Project',
        client_id: 1,
        project_manager: 1,
        color: '#0000FF',
        active: 1,
      });

      const created = await executeToolWithRetry('create-project', projectData);
      expect(created.project_id).toBeDefined();

      const result = await executeToolWithRetry('update-project', {
        project_id: created.project_id,
        color: '#FFFF00',
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated project to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedProject = await executeToolWithRetry('get-project', { project_id: created.project_id });
        expect(updatedProject.project_id).toBe(created.project_id);
        expect(updatedProject.color).toBe('#FFFF00');
        expect(updatedProject.name).toBe(projectData.name); // Should remain unchanged
      } else {
        expect(result.project_id).toBe(created.project_id);
        expect(result.color).toBe('#FFFF00');
        expect(result.name).toBe(projectData.name); // Should remain unchanged
      }

      // Track for cleanup
      createdProjects.push(created.project_id);
    });
  });

  describe('delete-project', () => {
    it('should delete (archive) a project', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping delete-project test - real API calls disabled');
        return;
      }

      // First create a project
      const projectData = generateTestProjectData();
      const created = await executeToolWithRetry('create-project', projectData);

      // Delete the project
      const result = await executeToolWithRetry('delete-project', {
        project_id: created.project_id,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('archived');

      // Verify project is no longer accessible (or is archived)
      try {
        await executeToolWithRetry('get-project', {
          project_id: created.project_id,
        });
        // If we get here, the project still exists (might be archived)
        console.warn('Project still exists after deletion - may be archived instead');
      } catch (error) {
        // Expected if project is truly deleted
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('project');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateTestProjectData();
        await test('get-project', validParams);
      });
    });

    it('should handle invalid project_id in get-project', async () => {
      await ErrorTestUtils.testNotFoundError(
        'get-project',
        {
          project_id: 999999999,
        },
        'project'
      );
    });

    it('should handle invalid data in create-project', async () => {
      await ErrorTestUtils.testValidationError('create-project', {
        name: '', // Empty name
        client_id: 'invalid', // Invalid client ID
      });
    });

    it('should handle missing required fields in create-project', async () => {
      await ErrorTestUtils.testValidationError('create-project', {
        // Missing name and client_id
      });
    });

    it('should handle invalid date format in create-project', async () => {
      const invalidData = generateTestProjectData({
        start_date: 'invalid-date',
      });

      await ErrorTestUtils.testValidationError('create-project', invalidData, 'start_date');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const requests = Array.from({ length: 5 }, () =>
        executeToolWithRetry('list-projects', { 'per-page': 5 })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
