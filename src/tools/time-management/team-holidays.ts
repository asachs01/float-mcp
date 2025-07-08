import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { teamHolidaySchema, teamHolidaysResponseSchema } from '../../types/float.js';

// List team holidays
export const listTeamHolidays = createTool(
  'list-team-holidays',
  'List all team holidays with optional filtering by department, date range, or active status',
  z.object({
    department_id: z.number().optional().describe('Filter by department ID'),
    region_id: z.number().optional().describe('Filter by region ID'),
    start_date: z
      .string()
      .optional()
      .describe('Filter holidays starting from this date (YYYY-MM-DD)'),
    end_date: z
      .string()
      .optional()
      .describe('Filter holidays ending before this date (YYYY-MM-DD)'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    recurring: z
      .number()
      .optional()
      .describe('Filter by recurring status (0=one-time, 1=recurring)'),
    holiday_type: z
      .number()
      .optional()
      .describe('Filter by holiday type (0=full day, 1=partial day)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/team-holidays',
      params,
      teamHolidaysResponseSchema
    );
    return response;
  }
);

// Get team holiday details
export const getTeamHoliday = createTool(
  'get-team-holiday',
  'Get detailed information about a specific team holiday',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The team holiday ID (holiday_id)'),
  }),
  async (params) => {
    const holiday = await floatApi.get(`/team-holidays/${params.holiday_id}`, teamHolidaySchema);
    return holiday;
  }
);

// Create team holiday
export const createTeamHoliday = createTool(
  'create-team-holiday',
  'Create a new team holiday',
  z.object({
    name: z.string().describe('Holiday name'),
    description: z.string().optional().describe('Holiday description'),
    start_date: z.string().describe('Holiday start date (YYYY-MM-DD)'),
    end_date: z.string().describe('Holiday end date (YYYY-MM-DD)'),
    holiday_type: z.number().optional().describe('Holiday type (0=full day, 1=partial day)'),
    department_id: z.number().optional().describe('Department ID for department-specific holiday'),
    region_id: z.number().optional().describe('Region ID for region-specific holiday'),
    recurring: z.number().optional().describe('Recurring status (0=one-time, 1=recurring)'),
    recurrence_pattern: z.string().optional().describe('Recurrence pattern for recurring holidays'),
    active: z.number().optional().describe('Active status (0=inactive, 1=active)'),
    notes: z.string().optional().describe('Additional notes'),
    color: z.string().optional().describe('Hex color code for calendar display'),
    all_day: z.number().optional().describe('All day status (0=not all day, 1=all day)'),
    timezone: z.string().optional().describe('Timezone for the holiday'),
  }),
  async (params) => {
    const holiday = await floatApi.post('/team-holidays', params, teamHolidaySchema);
    return holiday;
  }
);

// Update team holiday
export const updateTeamHoliday = createTool(
  'update-team-holiday',
  'Update an existing team holiday',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The team holiday ID (holiday_id)'),
    name: z.string().optional().describe('Holiday name'),
    description: z.string().optional().describe('Holiday description'),
    start_date: z.string().optional().describe('Holiday start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Holiday end date (YYYY-MM-DD)'),
    holiday_type: z.number().optional().describe('Holiday type (0=full day, 1=partial day)'),
    department_id: z.number().optional().describe('Department ID for department-specific holiday'),
    region_id: z.number().optional().describe('Region ID for region-specific holiday'),
    recurring: z.number().optional().describe('Recurring status (0=one-time, 1=recurring)'),
    recurrence_pattern: z.string().optional().describe('Recurrence pattern for recurring holidays'),
    active: z.number().optional().describe('Active status (0=inactive, 1=active)'),
    notes: z.string().optional().describe('Additional notes'),
    color: z.string().optional().describe('Hex color code for calendar display'),
    all_day: z.number().optional().describe('All day status (0=not all day, 1=all day)'),
    timezone: z.string().optional().describe('Timezone for the holiday'),
  }),
  async (params) => {
    const { holiday_id, ...updateData } = params;
    const holiday = await floatApi.patch(
      `/team-holidays/${holiday_id}`,
      updateData,
      teamHolidaySchema
    );
    return holiday;
  }
);

// Delete team holiday
export const deleteTeamHoliday = createTool(
  'delete-team-holiday',
  'Delete a team holiday',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The team holiday ID (holiday_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/team-holidays/${params.holiday_id}`);
    return { success: true, message: 'Team holiday deleted successfully' };
  }
);

// Additional utility tools for team holidays

// List team holidays by department
export const listTeamHolidaysByDepartment = createTool(
  'list-team-holidays-by-department',
  'List team holidays filtered by specific department',
  z.object({
    department_id: z.number().describe('Department ID to filter holidays'),
    start_date: z
      .string()
      .optional()
      .describe('Filter holidays starting from this date (YYYY-MM-DD)'),
    end_date: z
      .string()
      .optional()
      .describe('Filter holidays ending before this date (YYYY-MM-DD)'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/team-holidays',
      params,
      teamHolidaysResponseSchema
    );
    return response;
  }
);

// List team holidays by date range
export const listTeamHolidaysByDateRange = createTool(
  'list-team-holidays-by-date-range',
  'List team holidays within a specific date range',
  z.object({
    start_date: z.string().describe('Start date for the range (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for the range (YYYY-MM-DD)'),
    department_id: z.number().optional().describe('Filter by department ID'),
    region_id: z.number().optional().describe('Filter by region ID'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/team-holidays',
      params,
      teamHolidaysResponseSchema
    );
    return response;
  }
);

// List recurring team holidays
export const listRecurringTeamHolidays = createTool(
  'list-recurring-team-holidays',
  'List all recurring team holidays',
  z.object({
    department_id: z.number().optional().describe('Filter by department ID'),
    region_id: z.number().optional().describe('Filter by region ID'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const queryParams = {
      ...params,
      recurring: 1, // Filter for recurring holidays only
    };
    const response = await floatApi.getPaginated(
      '/team-holidays',
      queryParams,
      teamHolidaysResponseSchema
    );
    return response;
  }
);

// Get upcoming team holidays
export const getUpcomingTeamHolidays = createTool(
  'get-upcoming-team-holidays',
  'Get team holidays occurring from today onwards',
  z.object({
    days_ahead: z
      .number()
      .optional()
      .describe('Number of days ahead to look for holidays (default: 30)'),
    department_id: z.number().optional().describe('Filter by department ID'),
    region_id: z.number().optional().describe('Filter by region ID'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const today = new Date().toISOString().split('T')[0];
    const daysAhead = params.days_ahead || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const endDate = futureDate.toISOString().split('T')[0];

    const queryParams = {
      ...params,
      start_date: today,
      end_date: endDate,
    };
    delete queryParams.days_ahead;

    const response = await floatApi.getPaginated(
      '/team-holidays',
      queryParams,
      teamHolidaysResponseSchema
    );
    return response;
  }
);
