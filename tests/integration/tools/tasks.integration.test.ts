import { describe, it, expect } from '@jest/globals';
import {
  executeToolWithRetry,
  generateTestTaskData,
  cleanupTestData,
} from '../utils/test-helpers.ts';
import { entitySchemaValidator } from '../utils/schema-validator.ts';
import { ErrorTestUtils, createErrorTestCases } from '../utils/error-handling.ts';
import { TEST_CONFIG } from '../setup.ts';

describe('Task Tools Integration Tests', () => {
  const createdTasks: number[] = [];

  afterEach(async () => {
    // Clean up created tasks
    for (const taskId of createdTasks) {
      await cleanupTestData('task', taskId);
    }
    createdTasks.length = 0;
  });

  describe('list-tasks', () => {
    it('should list all tasks', async () => {
      const result = await executeToolWithRetry('list-tasks', {});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate schema for each task
      if (result.length > 0) {
        result.forEach((task: any) => {
          entitySchemaValidator.validateTask(task);
        });
      }
    });

    it('should list tasks with pagination', async () => {
      const result = await executeToolWithRetry('list-tasks', {
        page: 1,
        'per-page': 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should filter tasks by project', async () => {
      const result = await executeToolWithRetry('list-tasks', {
        project_id: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned tasks have the expected project_id
      result.forEach((task: any) => {
        expect(task.project_id).toBe(1);
      });
    });

    it('should filter tasks by person', async () => {
      const result = await executeToolWithRetry('list-tasks', {
        people_id: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned tasks have the expected people_id
      result.forEach((task: any) => {
        expect(task.people_id).toBe(1);
      });
    });

    it('should filter tasks by date range', async () => {
      const result = await executeToolWithRetry('list-tasks', {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Validate that all returned tasks fall within the date range
      result.forEach((task: any) => {
        if (task.start_date) {
          expect(task.start_date).toBeGreaterThanOrEqual('2024-01-01');
        }
        if (task.end_date) {
          expect(task.end_date).toBeLessThanOrEqual('2024-12-31');
        }
      });
    });
  });

  describe('get-task', () => {
    it('should get a specific task by ID', async () => {
      // First, get a task ID from the list
      const tasks = await executeToolWithRetry('list-tasks', { 'per-page': 1 });

      if (tasks.length === 0) {
        console.warn('No tasks found to test get-task');
        return;
      }

      const taskId = tasks[0].task_id;
      const result = await executeToolWithRetry('get-task', {
        task_id: taskId,
      });

      expect(result).toBeDefined();
      expect(result.task_id).toBe(taskId);

      // Validate schema
      entitySchemaValidator.validateTask(result);
    });

    it('should handle string task ID', async () => {
      const tasks = await executeToolWithRetry('list-tasks', { 'per-page': 1 });

      if (tasks.length === 0) {
        console.warn('No tasks found to test get-task with string ID');
        return;
      }

      const taskId = tasks[0].task_id.toString();
      const result = await executeToolWithRetry('get-task', {
        task_id: taskId,
      });

      expect(result).toBeDefined();
      expect(result.task_id).toBe(parseInt(taskId));
    });
  });

  describe('create-task', () => {
    it('should create a new task', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping create-task test - real API calls disabled');
        return;
      }

      const taskData = generateTestTaskData();
      const result = await executeToolWithRetry('create-task', taskData);

      expect(result).toBeDefined();
      expect(result.task_id).toBeDefined();
      expect(result.name).toBe(taskData.name);
      expect(result.project_id).toBe(taskData.project_id);

      // Track for cleanup
      createdTasks.push(result.task_id);

      // Validate schema
      entitySchemaValidator.validateTask(result);
    });

    it('should create task with all optional fields', async () => {
      const taskData = {
        project_id: 1,
        people_id: 1,
        name: 'Comprehensive Task',
        estimated_hours: 40,
        start_date: '2024-01-15',
        end_date: '2024-01-19',
        notes: 'Task with all fields',
      };

      const result = await executeToolWithRetry('create-task', taskData);

      expect(result).toBeDefined();
      expect(result.task_id).toBeDefined();
      expect(result.people_id).toBe(taskData.people_id);
      
      // For real API, some fields might not be returned in create response
      if (process.env.TEST_REAL_API === 'true') {
        // Just verify the task was created and has required fields
        expect(result.task_id).toBeDefined();
        expect(result.project_id).toBe(taskData.project_id);
      } else {
        expect(result.estimated_hours).toBe(taskData.estimated_hours);
      }

      // Track for cleanup
      createdTasks.push(result.task_id);
    });
  });

  describe('update-task', () => {
    it('should update an existing task', async () => {
      const taskData = generateTestTaskData({
        project_id: 1,
        people_id: 1,
        name: 'Update Test Task',
        estimated_hours: 10,
      });

      const created = await executeToolWithRetry('create-task', taskData);
      expect(created.task_id).toBeDefined();

      const updatedName = `Updated ${taskData.name}`;
      const result = await executeToolWithRetry('update-task', {
        task_id: created.task_id,
        name: updatedName,
        estimated_hours: 20,
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated task to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedTask = await executeToolWithRetry('get-task', { task_id: created.task_id });
        expect(updatedTask.task_id).toBe(created.task_id);
        expect(updatedTask.name).toBe(updatedName);
        expect(updatedTask.estimated_hours).toBe(20);
      } else {
        expect(result.task_id).toBe(created.task_id);
        expect(result.name).toBe(updatedName);
        expect(result.estimated_hours).toBe(20);
      }

      // Track for cleanup
      createdTasks.push(created.task_id);
    });

    it('should update task with partial data', async () => {
      const taskData = generateTestTaskData({
        project_id: 1,
        people_id: 1,
        name: 'Partial Update Test Task',
        estimated_hours: 15,
      });

      const created = await executeToolWithRetry('create-task', taskData);
      expect(created.task_id).toBeDefined();

      const result = await executeToolWithRetry('update-task', {
        task_id: created.task_id,
        estimated_hours: 30,
      });

      expect(result).toBeDefined();
      
      // For real API, we may need to fetch the updated task to verify changes
      if (process.env.TEST_REAL_API === 'true') {
        const updatedTask = await executeToolWithRetry('get-task', { task_id: created.task_id });
        expect(updatedTask.task_id).toBe(created.task_id);
        expect(updatedTask.estimated_hours).toBe(30);
        expect(updatedTask.name).toBe(taskData.name); // Should remain unchanged
      } else {
        expect(result.task_id).toBe(created.task_id);
        expect(result.estimated_hours).toBe(30);
        expect(result.name).toBe(taskData.name); // Should remain unchanged
      }

      // Track for cleanup
      createdTasks.push(created.task_id);
    });
  });

  describe('delete-task', () => {
    it('should delete a task', async () => {
      if (!TEST_CONFIG.enableRealApiCalls) {
        console.warn('Skipping delete-task test - real API calls disabled');
        return;
      }

      // First create a task
      const taskData = generateTestTaskData();
      const created = await executeToolWithRetry('create-task', taskData);

      // Delete the task
      const result = await executeToolWithRetry('delete-task', {
        task_id: created.task_id,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted');

      // Verify task is no longer accessible
      try {
        await executeToolWithRetry('get-task', {
          task_id: created.task_id,
        });
        throw new Error('Task should have been deleted');
      } catch (error) {
        // Expected - task should not be found
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('task');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateTestTaskData();
        await test('get-task', validParams);
      });
    });

    it('should handle invalid task_id in get-task', async () => {
      await ErrorTestUtils.testNotFoundError(
        'get-task',
        {
          task_id: 999999999,
        },
        'task'
      );
    });

    it('should handle invalid data in create-task', async () => {
      await ErrorTestUtils.testValidationError('create-task', {
        name: '', // Empty name
        project_id: 'invalid', // Invalid project ID
      });
    });

    it('should handle missing required fields in create-task', async () => {
      await ErrorTestUtils.testValidationError('create-task', {
        // Missing name and project_id
        hours: 8,
      });
    });

    it('should handle invalid date format in create-task', async () => {
      const invalidData = generateTestTaskData({
        start_date: 'invalid-date',
      });

      await ErrorTestUtils.testValidationError('create-task', invalidData, 'start_date');
    });

    it('should handle invalid project_id in create-task', async () => {
      const invalidData = generateTestTaskData({
        project_id: 999999999,
      });

      await ErrorTestUtils.testValidationError('create-task', invalidData, 'project_id');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const requests = Array.from({ length: 5 }, () =>
        executeToolWithRetry('list-tasks', { 'per-page': 5 })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate task data structure', async () => {
      const tasks = await executeToolWithRetry('list-tasks', { 'per-page': 5 });

      tasks.forEach((task: any) => {
        expect(task).toBeDefined();
        expect(task.task_id).toBeDefined();
        expect(task.name).toBeDefined();
        expect(typeof task.name).toBe('string');
        expect(task.name.length).toBeGreaterThan(0);

        // Validate schema
        const validation = entitySchemaValidator.validateTask(task);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should handle null values in task data', async () => {
      const tasks = await executeToolWithRetry('list-tasks', { 'per-page': 5 });

      tasks.forEach((task: any) => {
        // These fields can be null according to the schema
        if (task.notes !== null) {
          expect(typeof task.notes).toBe('string');
        }
        if (task.start_date !== null) {
          expect(typeof task.start_date).toBe('string');
        }
        if (task.end_date !== null) {
          expect(typeof task.end_date).toBe('string');
        }
      });
    });

    it('should validate task date ranges', async () => {
      const tasks = await executeToolWithRetry('list-tasks', { 'per-page': 10 });

      tasks.forEach((task: any) => {
        if (task.start_date && task.end_date) {
          const startDate = new Date(task.start_date);
          const endDate = new Date(task.end_date);
          expect(startDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
        }
      });
    });
  });
});
