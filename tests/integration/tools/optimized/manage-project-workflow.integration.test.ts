import { describe, it, expect, afterEach } from '@jest/globals';
import {
  executeToolWithRetry,
  generateManageProjectWorkflowParams,
  cleanupTestDataOptimized,
} from '../../utils/test-helpers.ts';
import { ErrorTestUtils, createErrorTestCases } from '../../utils/error-handling.ts';
import { TEST_CONFIG } from '../../setup.ts';

describe('Manage Project Workflow Tool Integration Tests', () => {
  const createdEntities: { type: string; id: number }[] = [];

  afterEach(async () => {
    // Clean up created entities
    for (const entity of createdEntities) {
      await cleanupTestDataOptimized(entity.type, entity.id);
    }
    createdEntities.length = 0;
  });

  describe('Phases Workflow Management', () => {
    describe('list operation', () => {
      it('should list all phases', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          entity_type: 'phases',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((phase: any) => {
            expect(phase.phase_id).toBeDefined();
            expect(phase.name).toBeDefined();
            expect(phase.project_id).toBeDefined();
          });
        }
      });

      it('should filter phases by project', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'list',
          project_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((phase: any) => {
          expect(phase.project_id).toBe(1);
        });
      });

      it('should filter phases by date range', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'get-by-date-range',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should get active phases', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'get-active',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('get operation', () => {
      it('should get a specific phase by ID', async () => {
        const phases = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'list',
          'per-page': 1,
        });

        if (phases.length === 0) {
          console.warn('No phases found to test get operation');
          return;
        }

        const phaseId = phases[0].phase_id;
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'get',
          id: phaseId,
        });

        expect(result).toBeDefined();
        expect(result.phase_id).toBe(phaseId);
      });
    });

    describe('create operation', () => {
      it('should create a new phase', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-phase test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('phases', 'create');
        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.phase_id).toBeDefined();
        expect(result.name).toBe(params.name);
        expect(result.project_id).toBe(params.project_id);

        // Track for cleanup
        createdEntities.push({ type: 'phase', id: result.phase_id });
      });

      it('should create phase with color and dates', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-phase with color test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('phases', 'create', {
          color: '#ff5733',
          start_date: '2024-02-01',
          end_date: '2024-02-28',
        });

        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.phase_id).toBeDefined();
        expect(result.color).toBe(params.color);

        // Track for cleanup
        createdEntities.push({ type: 'phase', id: result.phase_id });
      });
    });

    describe('update operation', () => {
      it('should update an existing phase', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping update-phase test - real API calls disabled');
          return;
        }

        // Create a phase first
        const createParams = generateManageProjectWorkflowParams('phases', 'create');
        const created = await executeToolWithRetry('manage-project-workflow', createParams);
        expect(created.phase_id).toBeDefined();

        const updatedName = `Updated ${createParams.name}`;
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'update',
          id: created.phase_id,
          name: updatedName,
          color: '#00ff00',
        });

        expect(result).toBeDefined();

        // Track for cleanup
        createdEntities.push({ type: 'phase', id: created.phase_id });
      });
    });
  });

  describe('Milestones Workflow Management', () => {
    describe('list operation', () => {
      it('should list all milestones', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((milestone: any) => {
            expect(milestone.milestone_id).toBeDefined();
            expect(milestone.name).toBeDefined();
            expect(milestone.project_id).toBeDefined();
          });
        }
      });

      it('should get project milestones', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'get-project-milestones',
          project_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((milestone: any) => {
          expect(milestone.project_id).toBe(1);
        });
      });

      it('should get upcoming milestones', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'get-upcoming',
          days_ahead: 30,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should get overdue milestones', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'get-overdue',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('create operation', () => {
      it('should create a new milestone', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-milestone test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('milestones', 'create');
        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.milestone_id).toBeDefined();
        expect(result.name).toBe(params.name);
        expect(result.project_id).toBe(params.project_id);

        // Track for cleanup
        createdEntities.push({ type: 'milestone', id: result.milestone_id });
      });
    });

    describe('complete operation', () => {
      it('should complete a milestone', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping complete-milestone test - real API calls disabled');
          return;
        }

        // Create a milestone first
        const createParams = generateManageProjectWorkflowParams('milestones', 'create');
        const created = await executeToolWithRetry('manage-project-workflow', createParams);
        expect(created.milestone_id).toBeDefined();

        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'complete',
          id: created.milestone_id,
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // Track for cleanup
        createdEntities.push({ type: 'milestone', id: created.milestone_id });
      });
    });
  });

  describe('Project Tasks Workflow Management', () => {
    describe('list operation', () => {
      it('should list all project tasks', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((task: any) => {
            expect(task.project_task_id).toBeDefined();
            expect(task.name).toBeDefined();
            expect(task.project_id).toBeDefined();
          });
        }
      });

      it('should get project tasks by project', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'get-by-project',
          project_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((task: any) => {
          expect(task.project_id).toBe(1);
        });
      });

      it('should get project tasks by phase', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'get-by-phase',
          phase_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((task: any) => {
          expect(task.phase_id).toBe(1);
        });
      });
    });

    describe('create operation', () => {
      it('should create a new project task', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-project-task test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('project-tasks', 'create');
        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.project_task_id).toBeDefined();
        expect(result.name).toBe(params.name);
        expect(result.project_id).toBe(params.project_id);

        // Track for cleanup
        createdEntities.push({ type: 'project-task', id: result.project_task_id });
      });

      it('should create project task with estimated hours', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-project-task with hours test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('project-tasks', 'create', {
          estimated_hours: 16,
          priority: 1,
          phase_id: 1,
        });

        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.project_task_id).toBeDefined();
        expect(result.estimated_hours).toBe(params.estimated_hours);

        // Track for cleanup
        createdEntities.push({ type: 'project-task', id: result.project_task_id });
      });
    });

    describe('bulk-create operation', () => {
      it('should bulk create project tasks', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping bulk-create-project-tasks test - real API calls disabled');
          return;
        }

        const tasks = [
          {
            name: 'Bulk Task 1',
            estimated_hours: 8,
            start_date: '2024-01-01',
            end_date: '2024-01-02',
          },
          {
            name: 'Bulk Task 2',
            estimated_hours: 16,
            start_date: '2024-01-03',
            end_date: '2024-01-05',
          },
        ];

        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'bulk-create',
          project_id: 1,
          tasks: tasks,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);

        // Track for cleanup
        result.forEach((task: any) => {
          createdEntities.push({ type: 'project-task', id: task.project_task_id });
        });
      });
    });

    describe('reorder operation', () => {
      it('should reorder project tasks', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping reorder-project-tasks test - real API calls disabled');
          return;
        }

        // Get existing tasks for a project
        const tasks = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'get-by-project',
          project_id: 1,
        });

        if (tasks.length < 2) {
          console.warn('Need at least 2 tasks to test reordering');
          return;
        }

        const taskIds = tasks.slice(0, 2).map((task: any) => task.project_task_id);

        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'reorder',
          project_id: 1,
          task_ids: taskIds.reverse(), // Reverse the order
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });
    });

    describe('archive operation', () => {
      it('should archive a project task', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping archive-project-task test - real API calls disabled');
          return;
        }

        // Create a task first
        const createParams = generateManageProjectWorkflowParams('project-tasks', 'create');
        const created = await executeToolWithRetry('manage-project-workflow', createParams);
        expect(created.project_task_id).toBeDefined();

        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'archive',
          id: created.project_task_id,
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // Track for cleanup (though archived)
        createdEntities.push({ type: 'project-task', id: created.project_task_id });
      });
    });

    describe('get-dependencies operation', () => {
      it('should get project task dependencies', async () => {
        const tasks = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'list',
          'per-page': 1,
        });

        if (tasks.length === 0) {
          console.warn('No project tasks found to test dependencies');
          return;
        }

        const taskId = tasks[0].project_task_id;
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'get-dependencies',
          id: taskId,
        });

        expect(result).toBeDefined();
        expect(result.dependencies).toBeDefined();
        expect(Array.isArray(result.dependencies)).toBe(true);
      });
    });
  });

  describe('Allocations Workflow Management', () => {
    describe('list operation', () => {
      it('should list all allocations', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'allocations',
          operation: 'list',
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((allocation: any) => {
            expect(allocation.allocation_id).toBeDefined();
            expect(allocation.person_id).toBeDefined();
            expect(allocation.project_id).toBeDefined();
          });
        }
      });

      it('should filter allocations by person', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'allocations',
          operation: 'list',
          person_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((allocation: any) => {
          expect(allocation.person_id).toBe(1);
        });
      });

      it('should filter allocations by project', async () => {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'allocations',
          operation: 'list',
          project_id: 1,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((allocation: any) => {
          expect(allocation.project_id).toBe(1);
        });
      });
    });

    describe('create operation', () => {
      it('should create a new allocation', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-allocation test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('allocations', 'create');
        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.allocation_id).toBeDefined();
        expect(result.person_id).toBe(params.person_id);
        expect(result.project_id).toBe(params.project_id);

        // Track for cleanup
        createdEntities.push({ type: 'allocation', id: result.allocation_id });
      });

      it('should create allocation with specific hours and notes', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping create-allocation with details test - real API calls disabled');
          return;
        }

        const params = generateManageProjectWorkflowParams('allocations', 'create', {
          hours: 4,
          notes: 'Part-time allocation for testing',
          billable: 1,
        });

        const result = await executeToolWithRetry('manage-project-workflow', params);

        expect(result).toBeDefined();
        expect(result.allocation_id).toBeDefined();
        expect(result.hours).toBe(params.hours);

        // Track for cleanup
        createdEntities.push({ type: 'allocation', id: result.allocation_id });
      });
    });

    describe('update operation', () => {
      it('should update an existing allocation', async () => {
        if (!TEST_CONFIG.enableRealApiCalls) {
          console.warn('Skipping update-allocation test - real API calls disabled');
          return;
        }

        // Create an allocation first
        const createParams = generateManageProjectWorkflowParams('allocations', 'create');
        const created = await executeToolWithRetry('manage-project-workflow', createParams);
        expect(created.allocation_id).toBeDefined();

        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'allocations',
          operation: 'update',
          id: created.allocation_id,
          hours: 6,
          notes: 'Updated allocation hours',
        });

        expect(result).toBeDefined();

        // Track for cleanup
        createdEntities.push({ type: 'allocation', id: created.allocation_id });
      });
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('workflow');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateManageProjectWorkflowParams('phases', 'get', { id: 1 });
        await test('manage-project-workflow', validParams);
      });
    });

    it('should handle invalid workflow_type', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'invalid_workflow',
        operation: 'list',
      });
    });

    it('should handle invalid operation', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'invalid_operation',
      });
    });

    it('should handle missing required parameters for create', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'create',
        // Missing name and project_id
      });
    });

    it('should handle invalid project_id', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'create',
        name: 'Test Phase',
        project_id: 'invalid',
      });
    });

    it('should handle non-existent project_id', async () => {
      await ErrorTestUtils.testNotFoundError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'create',
        name: 'Test Phase',
        project_id: 999999999,
      });
    });

    it('should handle invalid date format', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'create',
        name: 'Test Phase',
        project_id: 1,
        start_date: 'invalid-date',
      });
    });

    it('should handle end date before start date', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'create',
        name: 'Test Phase',
        project_id: 1,
        start_date: '2024-12-31',
        end_date: '2024-01-01',
      });
    });

    it('should handle invalid hours in allocation', async () => {
      await ErrorTestUtils.testValidationError('manage-project-workflow', {
        workflow_type: 'allocations',
        operation: 'create',
        person_id: 1,
        project_id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        hours: -1, // Invalid negative hours
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent workflow operations', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const workflowTypes = ['phases', 'milestones', 'project-tasks', 'allocations'];
      const requests = workflowTypes.map((workflowType) =>
        executeToolWithRetry('manage-project-workflow', {
          workflow_type: workflowType,
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

    it('should handle mixed operations efficiently', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const requests = [
        executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'phases',
          operation: 'list',
          'per-page': 5,
        }),
        executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'milestones',
          operation: 'get-upcoming',
          days_ahead: 30,
        }),
        executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'project-tasks',
          operation: 'get-by-project',
          project_id: 1,
        }),
        executeToolWithRetry('manage-project-workflow', {
          workflow_type: 'allocations',
          operation: 'list',
          person_id: 1,
        }),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(4);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate workflow response structures', async () => {
      const workflowTypes = ['phases', 'milestones', 'project-tasks', 'allocations'];

      for (const workflowType of workflowTypes) {
        const result = await executeToolWithRetry('manage-project-workflow', {
          workflow_type: workflowType,
          operation: 'list',
          'per-page': 2,
        });

        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          result.forEach((item: any) => {
            // Each item should have the appropriate ID field
            let expectedIdField = '';
            switch (workflowType) {
              case 'phases':
                expectedIdField = 'phase_id';
                break;
              case 'milestones':
                expectedIdField = 'milestone_id';
                break;
              case 'project-tasks':
                expectedIdField = 'project_task_id';
                break;
              case 'allocations':
                expectedIdField = 'allocation_id';
                break;
            }

            expect(item[expectedIdField]).toBeDefined();

            // Most workflow items should have names (except allocations)
            if (workflowType !== 'allocations') {
              expect(item.name).toBeDefined();
              expect(typeof item.name).toBe('string');
              expect(item.name.length).toBeGreaterThan(0);
            }

            // All workflow items should have project association
            expect(item.project_id).toBeDefined();
            expect(typeof item.project_id).toBe('number');
          });
        }
      }
    });

    it('should validate date fields in workflow items', async () => {
      const result = await executeToolWithRetry('manage-project-workflow', {
        workflow_type: 'phases',
        operation: 'list',
        'per-page': 5,
      });

      result.forEach((phase: any) => {
        if (phase.start_date) {
          expect(phase.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        if (phase.end_date) {
          expect(phase.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });

    it('should validate allocation hours and dates', async () => {
      const result = await executeToolWithRetry('manage-project-workflow', {
        workflow_type: 'allocations',
        operation: 'list',
        'per-page': 5,
      });

      result.forEach((allocation: any) => {
        if (allocation.hours !== null) {
          expect(typeof allocation.hours).toBe('number');
          expect(allocation.hours).toBeGreaterThanOrEqual(0);
        }

        if (allocation.start_date) {
          expect(allocation.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        if (allocation.end_date) {
          expect(allocation.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }

        expect(allocation.person_id).toBeDefined();
        expect(typeof allocation.person_id).toBe('number');
      });
    });
  });
});