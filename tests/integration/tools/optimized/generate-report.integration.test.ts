import { describe, it, expect } from '@jest/globals';
import {
  executeToolWithRetry,
  generateReportParams,
} from '../../utils/test-helpers.ts';
import { ErrorTestUtils, createErrorTestCases } from '../../utils/error-handling.ts';
import { TEST_CONFIG } from '../../setup.ts';

describe('Generate Report Tool Integration Tests', () => {
  describe('Time Reports', () => {
    describe('basic time report', () => {
      it('should generate a basic time report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'time-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.start_date).toBe('2024-01-01');
        expect(result.end_date).toBe('2024-01-31');
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      it('should generate time report filtered by person', async () => {
        const params = generateReportParams('time-report', {
          person_id: 1,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.filters.person_id).toBe(1);
        expect(result.data).toBeDefined();

        // Validate that all entries belong to the specified person
        if (result.data.length > 0) {
          result.data.forEach((entry: any) => {
            expect(entry.person_id).toBe(1);
          });
        }
      });

      it('should generate time report filtered by project', async () => {
        const params = generateReportParams('time-report', {
          project_id: 1,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.filters.project_id).toBe(1);
        expect(result.data).toBeDefined();

        // Validate that all entries belong to the specified project
        if (result.data.length > 0) {
          result.data.forEach((entry: any) => {
            expect(entry.project_id).toBe(1);
          });
        }
      });

      it('should generate time report with grouping by person', async () => {
        const params = generateReportParams('time-report', {
          group_by: 'person',
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.grouping).toBe('person');
        expect(result.summary).toBeDefined();

        // Validate grouped structure
        if (result.data.length > 0) {
          expect(result.summary.total_hours).toBeDefined();
          expect(typeof result.summary.total_hours).toBe('number');
          expect(result.summary.entries_count).toBeDefined();
          expect(typeof result.summary.entries_count).toBe('number');
        }
      });

      it('should generate time report with grouping by project', async () => {
        const params = generateReportParams('time-report', {
          group_by: 'project',
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.grouping).toBe('project');
        expect(result.summary).toBeDefined();
      });

      it('should generate time report with billable filter', async () => {
        const params = generateReportParams('time-report', {
          include_billable: true,
          include_non_billable: false,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.include_billable).toBe(true);
        expect(result.filters.include_non_billable).toBe(false);

        // Validate billable entries only
        if (result.data.length > 0) {
          result.data.forEach((entry: any) => {
            expect(entry.billable).toBe(1);
          });
        }
      });

      it('should generate time report with task breakdown', async () => {
        const params = generateReportParams('time-report', {
          include_tasks: true,
          group_by: 'task',
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('time-report');
        expect(result.grouping).toBe('task');
        expect(result.filters.include_tasks).toBe(true);
      });
    });

    describe('advanced time report features', () => {
      it('should generate time report with custom date ranges', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'time-report',
          start_date: '2024-01-15',
          end_date: '2024-01-20',
          group_by: 'date',
        });

        expect(result).toBeDefined();
        expect(result.start_date).toBe('2024-01-15');
        expect(result.end_date).toBe('2024-01-20');
        expect(result.grouping).toBe('date');
      });

      it('should generate time report with department filter', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'time-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          department_id: 1,
          group_by: 'person',
        });

        expect(result).toBeDefined();
        expect(result.filters.department_id).toBe(1);
      });

      it('should generate time report with export format', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'time-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          format: 'csv',
        });

        expect(result).toBeDefined();
        expect(result.format).toBe('csv');
        expect(result.export_url).toBeDefined();
      });
    });
  });

  describe('Project Reports', () => {
    describe('basic project report', () => {
      it('should generate a basic project report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'project-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('project-report');
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            expect(project.project_id).toBeDefined();
            expect(project.name).toBeDefined();
            expect(project.status).toBeDefined();
          });
        }
      });

      it('should generate project report for specific project', async () => {
        const params = generateReportParams('project-report', {
          project_id: 1,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.report_type).toBe('project-report');
        expect(result.filters.project_id).toBe(1);

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            expect(project.project_id).toBe(1);
          });
        }
      });

      it('should generate project report with allocations', async () => {
        const params = generateReportParams('project-report', {
          include_allocations: true,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.include_allocations).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            if (project.allocations) {
              expect(Array.isArray(project.allocations)).toBe(true);
            }
          });
        }
      });

      it('should generate project report with time entries', async () => {
        const params = generateReportParams('project-report', {
          include_time_entries: true,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.include_time_entries).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            if (project.time_entries) {
              expect(Array.isArray(project.time_entries)).toBe(true);
            }
          });
        }
      });

      it('should generate project report with budget analysis', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'project-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          include_budget_analysis: true,
        });

        expect(result).toBeDefined();
        expect(result.filters.include_budget_analysis).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            if (project.budget_analysis) {
              expect(project.budget_analysis.budgeted_hours).toBeDefined();
              expect(project.budget_analysis.actual_hours).toBeDefined();
              expect(project.budget_analysis.budget_utilization).toBeDefined();
            }
          });
        }
      });
    });

    describe('project status reports', () => {
      it('should generate report for active projects only', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'project-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          status: 'active',
        });

        expect(result).toBeDefined();
        expect(result.filters.status).toBe('active');

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            expect(project.active).toBe(1);
          });
        }
      });

      it('should generate report for completed projects', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'project-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          status: 'completed',
        });

        expect(result).toBeDefined();
        expect(result.filters.status).toBe('completed');
      });
    });
  });

  describe('People Utilization Reports', () => {
    describe('basic utilization report', () => {
      it('should generate a basic people utilization report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'people-utilization-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('people-utilization-report');
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((person: any) => {
            expect(person.person_id).toBeDefined();
            expect(person.name).toBeDefined();
            expect(person.utilization_percentage).toBeDefined();
            expect(typeof person.utilization_percentage).toBe('number');
          });
        }
      });

      it('should generate utilization report filtered by department', async () => {
        const params = generateReportParams('people-utilization-report', {
          department_id: 1,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.department_id).toBe(1);

        if (result.data.length > 0) {
          result.data.forEach((person: any) => {
            if (person.department) {
              expect(person.department.department_id).toBe(1);
            }
          });
        }
      });

      it('should generate utilization report with threshold filter', async () => {
        const params = generateReportParams('people-utilization-report', {
          utilization_threshold: 80,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.utilization_threshold).toBe(80);

        if (result.data.length > 0) {
          result.data.forEach((person: any) => {
            expect(person.utilization_percentage).toBeGreaterThanOrEqual(80);
          });
        }
      });

      it('should generate utilization report including contractors', async () => {
        const params = generateReportParams('people-utilization-report', {
          include_contractors: true,
        });

        const result = await executeToolWithRetry('generate-report', params);

        expect(result).toBeDefined();
        expect(result.filters.include_contractors).toBe(true);
      });

      it('should generate utilization report with capacity analysis', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'people-utilization-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          include_capacity_analysis: true,
        });

        expect(result).toBeDefined();
        expect(result.filters.include_capacity_analysis).toBe(true);

        if (result.data.length > 0) {
          result.data.forEach((person: any) => {
            if (person.capacity_analysis) {
              expect(person.capacity_analysis.total_capacity).toBeDefined();
              expect(person.capacity_analysis.allocated_hours).toBeDefined();
              expect(person.capacity_analysis.available_hours).toBeDefined();
            }
          });
        }
      });
    });

    describe('utilization trends', () => {
      it('should generate utilization report with trend analysis', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'people-utilization-report',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          include_trends: true,
          group_by: 'month',
        });

        expect(result).toBeDefined();
        expect(result.filters.include_trends).toBe(true);
        expect(result.grouping).toBe('month');

        if (result.trend_data) {
          expect(Array.isArray(result.trend_data)).toBe(true);
        }
      });
    });
  });

  describe('Financial Reports', () => {
    describe('revenue reports', () => {
      it('should generate revenue report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'revenue-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('revenue-report');
        expect(result.summary).toBeDefined();
        expect(result.summary.total_revenue).toBeDefined();
        expect(typeof result.summary.total_revenue).toBe('number');
      });

      it('should generate revenue report by project', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'revenue-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          group_by: 'project',
        });

        expect(result).toBeDefined();
        expect(result.grouping).toBe('project');

        if (result.data.length > 0) {
          result.data.forEach((item: any) => {
            expect(item.project_id).toBeDefined();
            expect(item.revenue).toBeDefined();
            expect(typeof item.revenue).toBe('number');
          });
        }
      });

      it('should generate revenue report by client', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'revenue-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          group_by: 'client',
        });

        expect(result).toBeDefined();
        expect(result.grouping).toBe('client');

        if (result.data.length > 0) {
          result.data.forEach((item: any) => {
            expect(item.client_id).toBeDefined();
            expect(item.revenue).toBeDefined();
            expect(typeof item.revenue).toBe('number');
          });
        }
      });
    });

    describe('profitability reports', () => {
      it('should generate profitability report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'profitability-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('profitability-report');
        expect(result.summary).toBeDefined();
        expect(result.summary.total_revenue).toBeDefined();
        expect(result.summary.total_costs).toBeDefined();
        expect(result.summary.profit_margin).toBeDefined();
      });

      it('should generate profitability report by project', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'profitability-report',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          group_by: 'project',
        });

        expect(result).toBeDefined();
        expect(result.grouping).toBe('project');

        if (result.data.length > 0) {
          result.data.forEach((project: any) => {
            expect(project.project_id).toBeDefined();
            expect(project.revenue).toBeDefined();
            expect(project.costs).toBeDefined();
            expect(project.profit_margin).toBeDefined();
          });
        }
      });
    });
  });

  describe('Custom Reports', () => {
    describe('dashboard reports', () => {
      it('should generate dashboard summary report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'dashboard-summary',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('dashboard-summary');
        expect(result.summary).toBeDefined();
        expect(result.summary.active_projects).toBeDefined();
        expect(result.summary.active_people).toBeDefined();
        expect(result.summary.total_hours_logged).toBeDefined();
        expect(result.summary.utilization_average).toBeDefined();
      });
    });

    describe('forecast reports', () => {
      it('should generate capacity forecast report', async () => {
        const result = await executeToolWithRetry('generate-report', {
          report_type: 'capacity-forecast',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe('capacity-forecast');
        expect(result.forecast_data).toBeDefined();
        expect(Array.isArray(result.forecast_data)).toBe(true);

        if (result.forecast_data.length > 0) {
          result.forecast_data.forEach((period: any) => {
            expect(period.period).toBeDefined();
            expect(period.available_capacity).toBeDefined();
            expect(period.allocated_capacity).toBeDefined();
            expect(period.utilization_forecast).toBeDefined();
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = createErrorTestCases('report');

    errorTestCases.forEach(({ name, test }) => {
      it(name, async () => {
        const validParams = generateReportParams('time-report');
        await test('generate-report', validParams);
      });
    });

    it('should handle invalid report_type', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'invalid_report_type',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });
    });

    it('should handle missing required dates', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        // Missing start_date and end_date
      });
    });

    it('should handle invalid date format', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        start_date: 'invalid-date',
        end_date: '2024-01-31',
      });
    });

    it('should handle end date before start date', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        start_date: '2024-12-31',
        end_date: '2024-01-01',
      });
    });

    it('should handle date range too large', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        start_date: '2020-01-01',
        end_date: '2024-12-31', // 5 year range might be too large
      });
    });

    it('should handle invalid person_id', async () => {
      await ErrorTestUtils.testNotFoundError('generate-report', {
        report_type: 'time-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        person_id: 999999999,
      });
    });

    it('should handle invalid project_id', async () => {
      await ErrorTestUtils.testNotFoundError('generate-report', {
        report_type: 'project-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        project_id: 999999999,
      });
    });

    it('should handle invalid department_id', async () => {
      await ErrorTestUtils.testNotFoundError('generate-report', {
        report_type: 'people-utilization-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        department_id: 999999999,
      });
    });

    it('should handle invalid group_by parameter', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        group_by: 'invalid_grouping',
      });
    });

    it('should handle invalid format parameter', async () => {
      await ErrorTestUtils.testValidationError('generate-report', {
        report_type: 'time-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        format: 'invalid_format',
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent report generation', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const reportTypes = ['time-report', 'project-report', 'people-utilization-report'];
      const requests = reportTypes.map((reportType) =>
        executeToolWithRetry('generate-report', {
          report_type: reportType,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.report_type).toBe(reportTypes[index]);
        expect(result.data).toBeDefined();
      });
    });

    it('should handle large date range reports efficiently', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const startTime = Date.now();

      const result = await executeToolWithRetry('generate-report', {
        report_type: 'time-report',
        start_date: '2024-01-01',
        end_date: '2024-12-31', // Full year
        group_by: 'month',
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle complex report generation with multiple filters', async () => {
      if (TEST_CONFIG.skipSlowTests) {
        console.warn('Skipping performance test - slow tests disabled');
        return;
      }

      const result = await executeToolWithRetry('generate-report', {
        report_type: 'people-utilization-report',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        department_id: 1,
        include_contractors: true,
        include_capacity_analysis: true,
        include_trends: true,
        utilization_threshold: 70,
        group_by: 'month',
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.filters).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate report response structure', async () => {
      const reportTypes = ['time-report', 'project-report', 'people-utilization-report'];

      for (const reportType of reportTypes) {
        const result = await executeToolWithRetry('generate-report', {
          report_type: reportType,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        });

        expect(result).toBeDefined();
        expect(result.report_type).toBe(reportType);
        expect(result.start_date).toBe('2024-01-01');
        expect(result.end_date).toBe('2024-01-31');
        expect(result.generated_at).toBeDefined();
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);

        // Check for summary section
        if (result.summary) {
          expect(typeof result.summary).toBe('object');
        }

        // Check for filters section
        if (result.filters) {
          expect(typeof result.filters).toBe('object');
        }
      }
    });

    it('should validate numeric fields in report data', async () => {
      const result = await executeToolWithRetry('generate-report', {
        report_type: 'time-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        group_by: 'person',
      });

      if (result.data.length > 0) {
        result.data.forEach((entry: any) => {
          if (entry.hours !== null && entry.hours !== undefined) {
            expect(typeof entry.hours).toBe('number');
            expect(entry.hours).toBeGreaterThanOrEqual(0);
          }

          if (entry.person_id) {
            expect(typeof entry.person_id).toBe('number');
          }

          if (entry.project_id) {
            expect(typeof entry.project_id).toBe('number');
          }
        });
      }

      if (result.summary) {
        if (result.summary.total_hours !== undefined) {
          expect(typeof result.summary.total_hours).toBe('number');
        }
      }
    });

    it('should validate date fields in report data', async () => {
      const result = await executeToolWithRetry('generate-report', {
        report_type: 'project-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(result.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      if (result.data.length > 0) {
        result.data.forEach((project: any) => {
          if (project.start_date) {
            expect(project.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }
          if (project.end_date) {
            expect(project.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }
          if (project.created_at) {
            expect(project.created_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
          }
        });
      }
    });

    it('should validate utilization percentages', async () => {
      const result = await executeToolWithRetry('generate-report', {
        report_type: 'people-utilization-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      if (result.data.length > 0) {
        result.data.forEach((person: any) => {
          if (person.utilization_percentage !== null && person.utilization_percentage !== undefined) {
            expect(typeof person.utilization_percentage).toBe('number');
            expect(person.utilization_percentage).toBeGreaterThanOrEqual(0);
            expect(person.utilization_percentage).toBeLessThanOrEqual(200); // Allow for overtime
          }
        });
      }

      if (result.summary && result.summary.average_utilization !== undefined) {
        expect(typeof result.summary.average_utilization).toBe('number');
        expect(result.summary.average_utilization).toBeGreaterThanOrEqual(0);
      }
    });

    it('should validate financial data in revenue reports', async () => {
      const result = await executeToolWithRetry('generate-report', {
        report_type: 'revenue-report',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      if (result.summary) {
        if (result.summary.total_revenue !== undefined) {
          expect(typeof result.summary.total_revenue).toBe('number');
          expect(result.summary.total_revenue).toBeGreaterThanOrEqual(0);
        }
      }

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          if (item.revenue !== null && item.revenue !== undefined) {
            expect(typeof item.revenue).toBe('number');
            expect(item.revenue).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });
  });
});