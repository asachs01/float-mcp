import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import {
  timeOffSchema,
  timeOffResponseSchema,
  timeOffTypesResponseSchema,
  type TimeOff,
} from '../../types/float.js';

// List time off with filtering capabilities
export const listTimeOff = createTool(
  'list-timeoff',
  'List all time off entries with optional filtering by person, project, status, and date range',
  z.object({
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by time off type ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD) - inclusive'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD) - inclusive'),
    status: z.string().optional().describe('Filter by status (pending, approved, rejected)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/timeoffs', params, timeOffResponseSchema);
    return response;
  }
);

// Get specific time off entry
export const getTimeOff = createTool(
  'get-timeoff',
  'Get detailed information about a specific time off entry',
  z.object({
    timeoff_id: z.union([z.string(), z.number()]).describe('The time off ID'),
  }),
  async (params) => {
    const timeOff = await floatApi.get(`/timeoffs/${params.timeoff_id}`, timeOffSchema);
    return timeOff;
  }
);

// Create new time off request
export const createTimeOff = createTool(
  'create-timeoff',
  'Create a new time off request',
  z.object({
    people_ids: z
      .array(z.union([z.string(), z.number()]))
      .describe('Array of person IDs (people_ids) - Float API expects plural field'),
    timeoff_type_id: z.union([z.string(), z.number()]).describe('The time off type ID'),
    start_date: z.string().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().describe('End date (YYYY-MM-DD)'),
    hours: z.number().optional().describe('Hours of time off (omit for full day)'),
    full_day: z.number().optional().describe('1 for full day, 0 for partial day'),
    notes: z.string().optional().describe('Optional notes'),
    status: z
      .number()
      .optional()
      .describe(
        'Status (1 for pending, 2 for approved, 3 for rejected - Float API uses numeric status codes)'
      ),
    repeat_state: z.number().optional().describe('Repeat configuration'),
    repeat_end: z.string().optional().describe('End date for repeating time off (YYYY-MM-DD)'),
  }),
  async (params) => {
    const timeOff = await floatApi.post('/timeoffs', params, timeOffSchema);
    return timeOff;
  }
);

// Update existing time off request
export const updateTimeOff = createTool(
  'update-timeoff',
  'Update an existing time off request (including approval/rejection)',
  z.object({
    timeoff_id: z.union([z.string(), z.number()]).describe('The time off ID'),
    people_ids: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .describe('Array of person IDs (people_ids) - Float API expects plural field'),
    timeoff_type_id: z.union([z.string(), z.number()]).optional().describe('The time off type ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    hours: z.number().optional().describe('Hours of time off (omit for full day)'),
    full_day: z.number().optional().describe('1 for full day, 0 for partial day'),
    notes: z.string().optional().describe('Optional notes'),
    status: z
      .number()
      .optional()
      .describe(
        'Status (1 for pending, 2 for approved, 3 for rejected - Float API uses numeric status codes)'
      ),
    approved_by: z.number().optional().describe('User ID who approved'),
    approved_at: z.string().optional().describe('Approval timestamp'),
    rejected_by: z.number().optional().describe('User ID who rejected'),
    rejected_at: z.string().optional().describe('Rejection timestamp'),
    repeat_state: z.number().optional().describe('Repeat configuration'),
    repeat_end: z.string().optional().describe('End date for repeating time off (YYYY-MM-DD)'),
  }),
  async (params) => {
    const { timeoff_id, ...updateData } = params;
    const timeOff = await floatApi.patch(`/timeoffs/${timeoff_id}`, updateData, timeOffSchema);
    return timeOff;
  }
);

// Delete time off entry
export const deleteTimeOff = createTool(
  'delete-timeoff',
  'Delete a time off entry',
  z.object({
    timeoff_id: z.union([z.string(), z.number()]).describe('The time off ID'),
  }),
  async (params) => {
    await floatApi.delete(`/timeoffs/${params.timeoff_id}`);
    return { success: true, message: 'Time off entry deleted successfully' };
  }
);

// Bulk create time off requests
export const bulkCreateTimeOff = createTool(
  'bulk-create-timeoff',
  'Create multiple time off requests at once',
  z.object({
    timeoff_requests: z
      .array(
        z.object({
          people_ids: z
            .array(z.union([z.string(), z.number()]))
            .describe('Array of person IDs (people_ids) - Float API expects plural field'),
          timeoff_type_id: z.union([z.string(), z.number()]).describe('The time off type ID'),
          start_date: z.string().describe('Start date (YYYY-MM-DD)'),
          end_date: z.string().describe('End date (YYYY-MM-DD)'),
          hours: z.number().optional().describe('Hours of time off (omit for full day)'),
          full_day: z.number().optional().describe('1 for full day, 0 for partial day'),
          notes: z.string().optional().describe('Optional notes'),
          status: z
            .number()
            .optional()
            .describe(
              'Status (1 for pending, 2 for approved, 3 for rejected - Float API uses numeric status codes)'
            ),
          repeat_state: z.number().optional().describe('Repeat configuration'),
          repeat_end: z
            .string()
            .optional()
            .describe('End date for repeating time off (YYYY-MM-DD)'),
        })
      )
      .describe('Array of time off requests to create'),
  }),
  async (params) => {
    const results = [];
    const errors = [];

    for (let index = 0; index < params.timeoff_requests.length; index++) {
      const request = params.timeoff_requests[index];
      try {
        const timeOff = await floatApi.post('/timeoffs', request, timeOffSchema);
        results.push({ index, success: true, data: timeOff });
      } catch (error) {
        errors.push({
          index,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          request,
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: params.timeoff_requests.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }
);

// Approve time off request
export const approveTimeOff = createTool(
  'approve-timeoff',
  'Approve a pending time off request',
  z.object({
    timeoff_id: z.union([z.string(), z.number()]).describe('The time off ID'),
    approved_by: z.number().optional().describe('User ID who is approving'),
    notes: z.string().optional().describe('Optional approval notes'),
  }),
  async (params) => {
    const { timeoff_id, approved_by, notes } = params;
    const updateData = {
      status: 2, // 2 = approved in Float API
      approved_by,
      approved_at: new Date().toISOString(),
      notes,
    };

    const timeOff = await floatApi.patch(`/timeoffs/${timeoff_id}`, updateData, timeOffSchema);
    return timeOff;
  }
);

// Reject time off request
export const rejectTimeOff = createTool(
  'reject-timeoff',
  'Reject a pending time off request',
  z.object({
    timeoff_id: z.union([z.string(), z.number()]).describe('The time off ID'),
    rejected_by: z.number().optional().describe('User ID who is rejecting'),
    notes: z.string().optional().describe('Optional rejection notes'),
  }),
  async (params) => {
    const { timeoff_id, rejected_by, notes } = params;
    const updateData = {
      status: 3, // 3 = rejected in Float API
      rejected_by,
      rejected_at: new Date().toISOString(),
      notes,
    };

    const timeOff = await floatApi.patch(`/timeoffs/${timeoff_id}`, updateData, timeOffSchema);
    return timeOff;
  }
);

// List time off types
export const listTimeOffTypes = createTool(
  'list-timeoff-types',
  'List all available time off types',
  z.object({
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/timeoff-types',
      params,
      timeOffTypesResponseSchema
    );
    return response;
  }
);

// Get time off calendar for date range
export const getTimeOffCalendar = createTool(
  'get-timeoff-calendar',
  'Get time off calendar view for a specific date range',
  z.object({
    start_date: z.string().describe('Start date (YYYY-MM-DD) - inclusive'),
    end_date: z.string().describe('End date (YYYY-MM-DD) - inclusive'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    department_id: z.union([z.string(), z.number()]).optional().describe('Filter by department ID'),
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by time off type ID'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/timeoffs', params, timeOffResponseSchema);

    // Group by date for calendar view
    const calendar: Record<string, TimeOff[]> = {};
    response.forEach((timeOff) => {
      if (timeOff.start_date) {
        const date = timeOff.start_date;
        if (!calendar[date]) {
          calendar[date] = [];
        }
        calendar[date].push(timeOff);
      }
    });

    return {
      calendar,
      total_entries: response.length,
      date_range: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
    };
  }
);

// Get time off summary for a person
export const getPersonTimeOffSummary = createTool(
  'get-person-timeoff-summary',
  'Get time off summary for a specific person including balance and usage',
  z.object({
    people_id: z.union([z.string(), z.number()]).describe('The person ID (people_id)'),
    year: z.number().optional().describe('Year for the summary (defaults to current year)'),
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by time off type ID'),
  }),
  async (params) => {
    const year = params.year || new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const timeOffData = await floatApi.getPaginated(
      '/timeoffs',
      {
        people_id: params.people_id,
        timeoff_type_id: params.timeoff_type_id,
        start_date: startDate,
        end_date: endDate,
      },
      timeOffResponseSchema
    );

    const summary = {
      people_id: params.people_id,
      year,
      total_days: 0,
      total_hours: 0,
      by_status: {
        pending: 0,
        approved: 0,
        rejected: 0,
      } as Record<string, number>,
      by_type: {} as Record<string, number>,
      entries: timeOffData,
    };

    timeOffData.forEach((timeOff) => {
      // Calculate days/hours
      if (timeOff.full_day === 1) {
        summary.total_days += 1;
      } else if (timeOff.hours) {
        summary.total_hours += timeOff.hours;
      }

      // Count by status
      if (timeOff.status) {
        if (summary.by_status[timeOff.status] === undefined) {
          summary.by_status[timeOff.status] = 0;
        }
        summary.by_status[timeOff.status] += 1;
      }

      // Count by type
      if (timeOff.timeoff_type_id) {
        const typeId = timeOff.timeoff_type_id.toString();
        if (summary.by_type[typeId] === undefined) {
          summary.by_type[typeId] = 0;
        }
        summary.by_type[typeId] += 1;
      }
    });

    return summary;
  }
);
