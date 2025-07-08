import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';

// Get time report
export const getTimeReport = createTool(
  'get-time-report',
  'Get time tracking report with various filters',
  z.object({
    start_date: z.string().describe('Start date for report (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for report (YYYY-MM-DD)'),
    people_id: z.number().optional().describe('Filter by person ID'),
    project_id: z.number().optional().describe('Filter by project ID'),
    client_id: z.number().optional().describe('Filter by client ID'),
    department_id: z.number().optional().describe('Filter by department ID'),
    billable: z
      .number()
      .optional()
      .describe('Filter by billable status (0=non-billable, 1=billable)'),
    format: z.enum(['json', 'csv']).optional().describe('Report format (default: json)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/reports/time',
      params,
      z.array(
        z.object({
          people_id: z.number().optional(),
          project_id: z.number().optional(),
          task_id: z.number().optional(),
          date: z.string().optional(),
          hours: z.number().optional(),
          billable: z.number().optional(),
          notes: z.string().nullable().optional(),
        })
      )
    );
    return response;
  }
);

// Get project report
export const getProjectReport = createTool(
  'get-project-report',
  'Get project summary report',
  z.object({
    start_date: z.string().optional().describe('Start date for report (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date for report (YYYY-MM-DD)'),
    project_id: z.number().optional().describe('Filter by project ID'),
    client_id: z.number().optional().describe('Filter by client ID'),
    status: z.number().optional().describe('Filter by project status'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/reports/projects',
      params,
      z.array(
        z.object({
          project_id: z.number().optional(),
          name: z.string().optional(),
          client_id: z.number().optional(),
          status: z.number().optional(),
          total_hours: z.number().optional(),
          billable_hours: z.number().optional(),
          budget: z.number().optional(),
          budget_used: z.number().optional(),
        })
      )
    );
    return response;
  }
);

// Get people utilization report
export const getPeopleUtilizationReport = createTool(
  'get-people-utilization-report',
  'Get people utilization report',
  z.object({
    start_date: z.string().describe('Start date for report (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for report (YYYY-MM-DD)'),
    people_id: z.number().optional().describe('Filter by person ID'),
    department_id: z.number().optional().describe('Filter by department ID'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/reports/people',
      params,
      z.array(
        z.object({
          people_id: z.number().optional(),
          name: z.string().optional(),
          department_id: z.number().optional(),
          scheduled_hours: z.number().optional(),
          logged_hours: z.number().optional(),
          utilization: z.number().optional(),
        })
      )
    );
    return response;
  }
);
