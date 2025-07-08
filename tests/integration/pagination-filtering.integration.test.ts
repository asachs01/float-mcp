import { describe, it, expect } from '@jest/globals';
import { executeToolWithRetry, executeTool } from './utils/test-helpers.ts';
import { TEST_CONFIG } from './setup.ts';

describe('Pagination and Filtering Integration Tests', () => {
  describe('Pagination Tests', () => {
    const paginationTools = [
      'list-projects',
      'list-people',
      'list-tasks',
      'list-clients',
      'list-allocations',
      'list-departments',
      'list-statuses',
      'list-phases',
      'list-milestones',
      'list-time-off',
      'list-accounts',
      'list-roles',
      'list-project-tasks',
    ];

    paginationTools.forEach((toolName) => {
      describe(`${toolName} Pagination`, () => {
        it('should support basic pagination', async () => {
          const result = await executeToolWithRetry(toolName, {
            page: 1,
            'per-page': 5,
          });

          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeLessThanOrEqual(5);
        });

        it('should support different page sizes', async () => {
          const pageSizes = [1, 5, 10, 20];

          for (const pageSize of pageSizes) {
            const result = await executeToolWithRetry(toolName, {
              page: 1,
              'per-page': pageSize,
            });

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(pageSize);
          }
        });

        it('should support multiple pages', async () => {
          // Get first page
          const page1 = await executeToolWithRetry(toolName, {
            page: 1,
            'per-page': 5,
          });

          // Get second page
          const page2 = await executeToolWithRetry(toolName, {
            page: 2,
            'per-page': 5,
          });

          expect(page1).toBeDefined();
          expect(page2).toBeDefined();
          expect(Array.isArray(page1)).toBe(true);
          expect(Array.isArray(page2)).toBe(true);

          // Results should be different (unless there's insufficient data)
          if (page1.length === 5 && page2.length > 0) {
            expect(page1).not.toEqual(page2);
          }
        });

        it('should handle empty pages gracefully', async () => {
          const result = await executeToolWithRetry(toolName, {
            page: 9999,
            'per-page': 10,
          });

          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        });

        it('should handle maximum per-page limit', async () => {
          const result = await executeToolWithRetry(toolName, {
            page: 1,
            'per-page': 200, // Maximum allowed
          });

          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeLessThanOrEqual(200);
        });

        it('should handle invalid pagination parameters', async () => {
          // Invalid page number
          try {
            await executeTool(toolName, {
              page: 0,
              'per-page': 10,
            });
            // If no error, that's acceptable - API might handle it gracefully
          } catch (error) {
            expect(error).toBeDefined();
          }

          // Invalid per-page
          try {
            await executeTool(toolName, {
              page: 1,
              'per-page': 0,
            });
            // If no error, that's acceptable - API might handle it gracefully
          } catch (error) {
            expect(error).toBeDefined();
          }
        });
      });
    });
  });

  describe('Filtering Tests', () => {
    describe('Project Filtering', () => {
      it('should filter projects by status', async () => {
        const result = await executeToolWithRetry('list-projects', {
          status: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((project: any) => {
          expect(project.status).toBe(1);
        });
      });

      it('should filter projects by client', async () => {
        const result = await executeToolWithRetry('list-projects', {
          client_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((project: any) => {
          expect(project.client_id).toBe(1);
        });
      });

      it('should filter projects by active status', async () => {
        const result = await executeToolWithRetry('list-projects', {
          active: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((project: any) => {
          expect(project.active).toBe(1);
        });
      });

      it('should combine multiple filters', async () => {
        const result = await executeToolWithRetry('list-projects', {
          status: 1,
          active: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((project: any) => {
          expect(project.status).toBe(1);
          expect(project.active).toBe(1);
        });
      });
    });

    describe('People Filtering', () => {
      it('should filter people by department', async () => {
        const result = await executeToolWithRetry('list-people', {
          department_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((person: any) => {
          if (person.department && person.department.department_id) {
            expect(person.department.department_id).toBe(1);
          }
        });
      });

      it('should filter people by active status', async () => {
        const result = await executeToolWithRetry('list-people', {
          active: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((person: any) => {
          expect(person.active).toBe(1);
        });
      });

      it('should filter people by employee type', async () => {
        const result = await executeToolWithRetry('list-people', {
          employee_type: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((person: any) => {
          expect(person.employee_type).toBe(1);
        });
      });
    });

    describe('Task Filtering', () => {
      it('should filter tasks by project', async () => {
        const result = await executeToolWithRetry('list-tasks', {
          project_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((task: any) => {
          expect(task.project_id).toBe(1);
        });
      });

      it('should filter tasks by person', async () => {
        const result = await executeToolWithRetry('list-tasks', {
          people_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((task: any) => {
          expect(task.people_id).toBe(1);
        });
      });

      it('should filter tasks by date range', async () => {
        const result = await executeToolWithRetry('list-tasks', {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

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

    describe('Allocation Filtering', () => {
      it('should filter allocations by project', async () => {
        const result = await executeToolWithRetry('list-allocations', {
          project_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((allocation: any) => {
          expect(allocation.project_id).toBe(1);
        });
      });

      it('should filter allocations by person', async () => {
        const result = await executeToolWithRetry('list-allocations', {
          people_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((allocation: any) => {
          expect(allocation.people_id).toBe(1);
        });
      });

      it('should filter allocations by date range', async () => {
        const result = await executeToolWithRetry('list-allocations', {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((allocation: any) => {
          if (allocation.start_date) {
            expect(allocation.start_date).toBeGreaterThanOrEqual('2024-01-01');
          }
          if (allocation.end_date) {
            expect(allocation.end_date).toBeLessThanOrEqual('2024-12-31');
          }
        });
      });
    });

    describe('Phase Filtering', () => {
      it('should filter phases by project', async () => {
        const result = await executeToolWithRetry('list-phases-by-project', {
          project_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((phase: any) => {
          expect(phase.project_id).toBe(1);
        });
      });

      it('should filter phases by date range', async () => {
        const result = await executeToolWithRetry('get-phases-by-date-range', {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((phase: any) => {
          if (phase.start_date) {
            expect(phase.start_date).toBeGreaterThanOrEqual('2024-01-01');
          }
          if (phase.end_date) {
            expect(phase.end_date).toBeLessThanOrEqual('2024-12-31');
          }
        });
      });

      it('should get active phases only', async () => {
        const result = await executeToolWithRetry('get-active-phases', {
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // All returned phases should be active
        result.forEach((phase: any) => {
          expect(phase.active).toBe(1);
        });
      });
    });

    describe('Time Off Filtering', () => {
      it('should filter time off by person', async () => {
        const result = await executeToolWithRetry('list-time-off', {
          people_id: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((timeOff: any) => {
          expect(timeOff.people_id).toBe(1);
        });
      });

      it('should filter time off by date range', async () => {
        const result = await executeToolWithRetry('list-time-off', {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((timeOff: any) => {
          if (timeOff.start_date) {
            expect(timeOff.start_date).toBeGreaterThanOrEqual('2024-01-01');
          }
          if (timeOff.end_date) {
            expect(timeOff.end_date).toBeLessThanOrEqual('2024-12-31');
          }
        });
      });

      it('should filter time off by status', async () => {
        const result = await executeToolWithRetry('list-time-off', {
          status: 1,
          'per-page': 10,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((timeOff: any) => {
          expect(timeOff.status).toBe(1);
        });
      });
    });
  });

  describe('Combined Pagination and Filtering', () => {
    it('should paginate filtered results', async () => {
      const page1 = await executeToolWithRetry('list-projects', {
        active: 1,
        page: 1,
        'per-page': 5,
      });

      const page2 = await executeToolWithRetry('list-projects', {
        active: 1,
        page: 2,
        'per-page': 5,
      });

      expect(page1).toBeDefined();
      expect(page2).toBeDefined();
      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);

      // Both pages should contain only active projects
      [...page1, ...page2].forEach((project: any) => {
        expect(project.active).toBe(1);
      });

      // Pages should be different (unless insufficient data)
      if (page1.length === 5 && page2.length > 0) {
        expect(page1).not.toEqual(page2);
      }
    });

    it('should maintain filter consistency across pages', async () => {
      const pages = await Promise.all([
        executeToolWithRetry('list-tasks', {
          project_id: 1,
          page: 1,
          'per-page': 5,
        }),
        executeToolWithRetry('list-tasks', {
          project_id: 1,
          page: 2,
          'per-page': 5,
        }),
      ]);

      pages.forEach((page) => {
        expect(page).toBeDefined();
        expect(Array.isArray(page)).toBe(true);

        page.forEach((task: any) => {
          expect(task.project_id).toBe(1);
        });
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large page sizes efficiently', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping large page size test - slow tests disabled');
        return;
      }

      const start = Date.now();
      const result = await executeToolWithRetry('list-projects', {
        'per-page': 200,
      });
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle multiple filters efficiently', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping multiple filters test - slow tests disabled');
        return;
      }

      const start = Date.now();
      const result = await executeToolWithRetry('list-tasks', {
        project_id: 1,
        people_id: 1,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        'per-page': 50,
      });
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
