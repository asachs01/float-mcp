import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { milestoneSchema, milestonesResponseSchema } from '../../types/float.js';

// List milestones
export const listMilestones = createTool(
  'list-milestones',
  'List all milestones with optional filtering by project, phase, status, or date range',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    phase_id: z.number().optional().describe('Filter by phase ID'),
    status: z.number().optional().describe('Filter by milestone status (numeric)'),
    completed: z
      .number()
      .optional()
      .describe('Filter by completion status (0=not completed, 1=completed)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD format)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD format)'),
    date_from: z
      .string()
      .optional()
      .describe('Filter milestones from this date (YYYY-MM-DD format)'),
    date_to: z.string().optional().describe('Filter milestones to this date (YYYY-MM-DD format)'),
    priority: z.number().optional().describe('Filter by priority level (1-5)'),
    created_by: z.number().optional().describe('Filter by creator user ID'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/milestones', params, milestonesResponseSchema);
    return response;
  }
);

// Get milestone details
export const getMilestone = createTool(
  'get-milestone',
  'Get detailed information about a specific milestone',
  z.object({
    milestone_id: z.union([z.string(), z.number()]).describe('The milestone ID (milestone_id)'),
  }),
  async (params) => {
    const milestone = await floatApi.get(`/milestones/${params.milestone_id}`, milestoneSchema);
    return milestone;
  }
);

// Create milestone
export const createMilestone = createTool(
  'create-milestone',
  'Create a new milestone for a project or phase',
  z.object({
    name: z.string().describe('Milestone name'),
    project_id: z.number().describe('Project ID'),
    phase_id: z.number().optional().describe('Phase ID (optional)'),
    description: z.string().optional().describe('Milestone description'),
    date: z.string().optional().describe('Milestone date (YYYY-MM-DD format)'),
    start_date: z.string().optional().describe('Milestone start date (YYYY-MM-DD format)'),
    end_date: z.string().optional().describe('Milestone end date (YYYY-MM-DD format)'),
    status: z.number().optional().describe('Milestone status (numeric)'),
    priority: z.number().optional().describe('Priority level (1-5, where 1 is highest)'),
    completed: z.number().optional().describe('Completion status (0=not completed, 1=completed)'),
    completed_date: z.string().optional().describe('Completion date (YYYY-MM-DD format)'),
    notes: z.string().optional().describe('Additional notes'),
    color: z.string().optional().describe('Milestone color (hex color code)'),
    reminder_date: z.string().optional().describe('Reminder date (YYYY-MM-DD format)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const milestone = await floatApi.post('/milestones', params, milestoneSchema);
    return milestone;
  }
);

// Update milestone
export const updateMilestone = createTool(
  'update-milestone',
  'Update an existing milestone',
  z.object({
    milestone_id: z.union([z.string(), z.number()]).describe('The milestone ID (milestone_id)'),
    name: z.string().optional().describe('Milestone name'),
    project_id: z.number().optional().describe('Project ID'),
    phase_id: z.number().optional().describe('Phase ID'),
    description: z.string().optional().describe('Milestone description'),
    date: z.string().optional().describe('Milestone date (YYYY-MM-DD format)'),
    start_date: z.string().optional().describe('Milestone start date (YYYY-MM-DD format)'),
    end_date: z.string().optional().describe('Milestone end date (YYYY-MM-DD format)'),
    status: z.number().optional().describe('Milestone status (numeric)'),
    priority: z.number().optional().describe('Priority level (1-5, where 1 is highest)'),
    completed: z.number().optional().describe('Completion status (0=not completed, 1=completed)'),
    completed_date: z.string().optional().describe('Completion date (YYYY-MM-DD format)'),
    notes: z.string().optional().describe('Additional notes'),
    color: z.string().optional().describe('Milestone color (hex color code)'),
    reminder_date: z.string().optional().describe('Reminder date (YYYY-MM-DD format)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const { milestone_id, ...updateData } = params;
    const milestone = await floatApi.patch(
      `/milestones/${milestone_id}`,
      updateData,
      milestoneSchema
    );
    return milestone;
  }
);

// Delete milestone
export const deleteMilestone = createTool(
  'delete-milestone',
  'Delete a milestone (archives it in Float)',
  z.object({
    milestone_id: z.union([z.string(), z.number()]).describe('The milestone ID (milestone_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/milestones/${params.milestone_id}`);
    return { success: true, message: 'Milestone deleted successfully' };
  }
);

// Get milestones by project
export const getProjectMilestones = createTool(
  'get-project-milestones',
  'Get all milestones for a specific project with optional filtering',
  z.object({
    project_id: z.number().describe('Project ID to get milestones for'),
    status: z.number().optional().describe('Filter by milestone status (numeric)'),
    completed: z
      .number()
      .optional()
      .describe('Filter by completion status (0=not completed, 1=completed)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    priority: z.number().optional().describe('Filter by priority level (1-5)'),
    date_from: z
      .string()
      .optional()
      .describe('Filter milestones from this date (YYYY-MM-DD format)'),
    date_to: z.string().optional().describe('Filter milestones to this date (YYYY-MM-DD format)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/milestones', params, milestonesResponseSchema);
    return response;
  }
);

// Get upcoming milestones
export const getUpcomingMilestones = createTool(
  'get-upcoming-milestones',
  'Get milestones that are upcoming within a specified date range',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    phase_id: z.number().optional().describe('Filter by phase ID'),
    days_ahead: z
      .number()
      .optional()
      .describe('Number of days ahead to look for milestones (default: 30)'),
    priority: z.number().optional().describe('Filter by priority level (1-5)'),
    completed: z
      .number()
      .optional()
      .describe('Filter by completion status (0=not completed, 1=completed)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const daysAhead = params.days_ahead || 30;
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const queryParams = {
      ...params,
      date_from: today.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      date_to: futureDate.toISOString().split('T')[0], // Future date in YYYY-MM-DD format
      completed: params.completed !== undefined ? params.completed : 0, // Default to not completed
    };

    // Remove days_ahead from query params as it's not an API parameter
    const { days_ahead: _daysAhead, ...apiParams } = queryParams; // eslint-disable-line @typescript-eslint/no-unused-vars

    const response = await floatApi.getPaginated(
      '/milestones',
      apiParams,
      milestonesResponseSchema
    );
    return response;
  }
);

// Get overdue milestones
export const getOverdueMilestones = createTool(
  'get-overdue-milestones',
  'Get milestones that are overdue (past their due date and not completed)',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    phase_id: z.number().optional().describe('Filter by phase ID'),
    priority: z.number().optional().describe('Filter by priority level (1-5)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

    const queryParams = {
      ...params,
      date_to: todayString, // Milestones due up to today
      completed: 0, // Only not completed milestones
      active: params.active !== undefined ? params.active : 1, // Default to active
    };

    const response = await floatApi.getPaginated(
      '/milestones',
      queryParams,
      milestonesResponseSchema
    );
    return response;
  }
);

// Mark milestone as completed
export const completeMilestone = createTool(
  'complete-milestone',
  'Mark a milestone as completed with optional completion date',
  z.object({
    milestone_id: z.union([z.string(), z.number()]).describe('The milestone ID (milestone_id)'),
    completed_date: z
      .string()
      .optional()
      .describe('Completion date (YYYY-MM-DD format). If not provided, uses current date'),
    notes: z.string().optional().describe('Additional notes about the completion'),
  }),
  async (params) => {
    const completedDate = params.completed_date || new Date().toISOString().split('T')[0];

    const updateData = {
      completed: 1,
      completed_date: completedDate,
      ...(params.notes && { notes: params.notes }),
    };

    const milestone = await floatApi.patch(
      `/milestones/${params.milestone_id}`,
      updateData,
      milestoneSchema
    );
    return milestone;
  }
);

// Get milestone notifications/reminders
export const getMilestoneReminders = createTool(
  'get-milestone-reminders',
  'Get milestones that have reminders set within a specified date range',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    phase_id: z.number().optional().describe('Filter by phase ID'),
    reminder_date_from: z
      .string()
      .optional()
      .describe('Filter reminders from this date (YYYY-MM-DD format)'),
    reminder_date_to: z
      .string()
      .optional()
      .describe('Filter reminders to this date (YYYY-MM-DD format)'),
    reminder_sent: z
      .number()
      .optional()
      .describe('Filter by reminder sent status (0=not sent, 1=sent)'),
    days_ahead: z
      .number()
      .optional()
      .describe('Number of days ahead to look for reminders (default: 7)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    let queryParams = { ...params };

    // If no specific reminder date range is provided, use days_ahead
    if (!params.reminder_date_from && !params.reminder_date_to) {
      const daysAhead = params.days_ahead || 7;
      const today = new Date();
      const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      queryParams = {
        ...params,
        reminder_date_from: today.toISOString().split('T')[0],
        reminder_date_to: futureDate.toISOString().split('T')[0],
      };
    }

    // Remove days_ahead from query params as it's not an API parameter
    const { days_ahead: _daysAhead, ...apiParams } = queryParams; // eslint-disable-line @typescript-eslint/no-unused-vars

    const response = await floatApi.getPaginated(
      '/milestones',
      apiParams,
      milestonesResponseSchema
    );

    // Filter results to only include milestones that have reminder_date set
    const milestonesWithReminders = response.filter((milestone) => milestone.reminder_date);

    return milestonesWithReminders;
  }
);
