import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { loggedTimeSchema, loggedTimeResponseSchema, type LoggedTime } from '../../types/float.js';

// List logged time entries with comprehensive filtering
export const listLoggedTime = createTool(
  'list-logged-time',
  'List all logged time entries with optional filtering by person, project, date range, and billable status',
  z.object({
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    task_id: z.string().optional().describe('Filter by task ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD) - inclusive'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD) - inclusive'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by billable status (1 = billable, 0 = non-billable)'),
    locked: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by locked status (1 = locked, 0 = unlocked)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/logged-time', params, loggedTimeResponseSchema);
    return response;
  }
);

// Get specific logged time entry
export const getLoggedTime = createTool(
  'get-logged-time',
  'Get detailed information about a specific logged time entry',
  z.object({
    logged_time_id: z.string().describe('The logged time ID (hexadecimal)'),
  }),
  async (params) => {
    const loggedTime = await floatApi.get(
      `/logged-time/${params.logged_time_id}`,
      loggedTimeSchema
    );
    return loggedTime;
  }
);

// Create new logged time entry
export const createLoggedTime = createTool(
  'create-logged-time',
  'Create a new logged time entry for tracking work hours',
  z.object({
    people_id: z.union([z.string(), z.number()]).describe('The person ID who logged the time'),
    project_id: z.union([z.string(), z.number()]).describe('The project ID for the logged time'),
    task_id: z.string().optional().describe('The task ID for the logged time'),
    date: z.string().describe('The date for the logged time (YYYY-MM-DD)'),
    hours: z.number().describe('The number of hours logged'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Whether the time is billable (1 = billable, 0 = non-billable)'),
    note: z.string().optional().describe('Optional note describing the work done'),
    reference_date: z.string().optional().describe('Reference date for UI suggestions'),
  }),
  async (params) => {
    const loggedTime = await floatApi.post('/logged-time', params, loggedTimeSchema);
    return loggedTime;
  }
);

// Update existing logged time entry
export const updateLoggedTime = createTool(
  'update-logged-time',
  'Update an existing logged time entry',
  z.object({
    logged_time_id: z.string().describe('The logged time ID (hexadecimal)'),
    people_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('The person ID who logged the time'),
    project_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('The project ID for the logged time'),
    task_id: z.string().optional().describe('The task ID for the logged time'),
    date: z.string().optional().describe('The date for the logged time (YYYY-MM-DD)'),
    hours: z.number().optional().describe('The number of hours logged'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Whether the time is billable (1 = billable, 0 = non-billable)'),
    note: z.string().optional().describe('Optional note describing the work done'),
    reference_date: z.string().optional().describe('Reference date for UI suggestions'),
  }),
  async (params) => {
    const { logged_time_id, ...updateData } = params;
    const loggedTime = await floatApi.patch(
      `/logged-time/${logged_time_id}`,
      updateData,
      loggedTimeSchema
    );
    return loggedTime;
  }
);

// Delete logged time entry
export const deleteLoggedTime = createTool(
  'delete-logged-time',
  'Delete a logged time entry',
  z.object({
    logged_time_id: z.string().describe('The logged time ID (hexadecimal)'),
  }),
  async (params) => {
    await floatApi.delete(`/logged-time/${params.logged_time_id}`);
    return { success: true, message: 'Logged time entry deleted successfully' };
  }
);

// Bulk create logged time entries
export const bulkCreateLoggedTime = createTool(
  'bulk-create-logged-time',
  'Create multiple logged time entries at once for batch time logging',
  z.object({
    logged_time_entries: z
      .array(
        z.object({
          people_id: z
            .union([z.string(), z.number()])
            .describe('The person ID who logged the time'),
          project_id: z
            .union([z.string(), z.number()])
            .describe('The project ID for the logged time'),
          task_id: z.string().optional().describe('The task ID for the logged time'),
          date: z.string().describe('The date for the logged time (YYYY-MM-DD)'),
          hours: z.number().describe('The number of hours logged'),
          billable: z
            .union([z.string(), z.number()])
            .optional()
            .describe('Whether the time is billable (1 = billable, 0 = non-billable)'),
          note: z.string().optional().describe('Optional note describing the work done'),
          reference_date: z.string().optional().describe('Reference date for UI suggestions'),
        })
      )
      .describe('Array of logged time entries to create'),
  }),
  async (params) => {
    const results = [];
    const errors = [];

    for (let index = 0; index < params.logged_time_entries.length; index++) {
      const entry = params.logged_time_entries[index];
      try {
        const loggedTime = await floatApi.post('/logged-time', entry, loggedTimeSchema);
        results.push({ index, success: true, data: loggedTime });
      } catch (error) {
        errors.push({
          index,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          entry,
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: params.logged_time_entries.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }
);

// Get logged time summary by person
export const getPersonLoggedTimeSummary = createTool(
  'get-person-logged-time-summary',
  'Get logged time summary for a specific person including billable/non-billable hours',
  z.object({
    people_id: z.union([z.string(), z.number()]).describe('The person ID'),
    start_date: z.string().optional().describe('Start date for summary (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date for summary (YYYY-MM-DD)'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by billable status (1 = billable, 0 = non-billable)'),
  }),
  async (params) => {
    const loggedTimeData = await floatApi.getPaginated(
      '/logged-time',
      {
        people_id: params.people_id,
        start_date: params.start_date,
        end_date: params.end_date,
        project_id: params.project_id,
        billable: params.billable,
      },
      loggedTimeResponseSchema
    );

    const summary = {
      people_id: params.people_id,
      date_range: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
      total_hours: 0,
      billable_hours: 0,
      non_billable_hours: 0,
      by_project: {} as Record<
        string,
        { total_hours: number; billable_hours: number; non_billable_hours: number }
      >,
      by_date: {} as Record<
        string,
        { total_hours: number; billable_hours: number; non_billable_hours: number }
      >,
      entries: loggedTimeData,
    };

    loggedTimeData.forEach((entry) => {
      const hours = entry.hours || 0;
      const isBillable = entry.billable === 1;

      // Total hours
      summary.total_hours += hours;

      // Billable vs non-billable
      if (isBillable) {
        summary.billable_hours += hours;
      } else {
        summary.non_billable_hours += hours;
      }

      // By project
      if (entry.project_id) {
        const projectId = entry.project_id.toString();
        if (!summary.by_project[projectId]) {
          summary.by_project[projectId] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
          };
        }
        summary.by_project[projectId].total_hours += hours;
        if (isBillable) {
          summary.by_project[projectId].billable_hours += hours;
        } else {
          summary.by_project[projectId].non_billable_hours += hours;
        }
      }

      // By date
      if (entry.date) {
        if (!summary.by_date[entry.date]) {
          summary.by_date[entry.date] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
          };
        }
        summary.by_date[entry.date].total_hours += hours;
        if (isBillable) {
          summary.by_date[entry.date].billable_hours += hours;
        } else {
          summary.by_date[entry.date].non_billable_hours += hours;
        }
      }
    });

    return summary;
  }
);

// Get logged time summary by project
export const getProjectLoggedTimeSummary = createTool(
  'get-project-logged-time-summary',
  'Get logged time summary for a specific project including team member contributions',
  z.object({
    project_id: z.union([z.string(), z.number()]).describe('The project ID'),
    start_date: z.string().optional().describe('Start date for summary (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date for summary (YYYY-MM-DD)'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by billable status (1 = billable, 0 = non-billable)'),
  }),
  async (params) => {
    const loggedTimeData = await floatApi.getPaginated(
      '/logged-time',
      {
        project_id: params.project_id,
        start_date: params.start_date,
        end_date: params.end_date,
        people_id: params.people_id,
        billable: params.billable,
      },
      loggedTimeResponseSchema
    );

    const summary = {
      project_id: params.project_id,
      date_range: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
      total_hours: 0,
      billable_hours: 0,
      non_billable_hours: 0,
      by_person: {} as Record<
        string,
        { total_hours: number; billable_hours: number; non_billable_hours: number }
      >,
      by_date: {} as Record<
        string,
        { total_hours: number; billable_hours: number; non_billable_hours: number }
      >,
      entries: loggedTimeData,
    };

    loggedTimeData.forEach((entry) => {
      const hours = entry.hours || 0;
      const isBillable = entry.billable === 1;

      // Total hours
      summary.total_hours += hours;

      // Billable vs non-billable
      if (isBillable) {
        summary.billable_hours += hours;
      } else {
        summary.non_billable_hours += hours;
      }

      // By person
      if (entry.people_id) {
        const peopleId = entry.people_id.toString();
        if (!summary.by_person[peopleId]) {
          summary.by_person[peopleId] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
          };
        }
        summary.by_person[peopleId].total_hours += hours;
        if (isBillable) {
          summary.by_person[peopleId].billable_hours += hours;
        } else {
          summary.by_person[peopleId].non_billable_hours += hours;
        }
      }

      // By date
      if (entry.date) {
        if (!summary.by_date[entry.date]) {
          summary.by_date[entry.date] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
          };
        }
        summary.by_date[entry.date].total_hours += hours;
        if (isBillable) {
          summary.by_date[entry.date].billable_hours += hours;
        } else {
          summary.by_date[entry.date].non_billable_hours += hours;
        }
      }
    });

    return summary;
  }
);

// Get logged time timesheet view
export const getLoggedTimeTimesheet = createTool(
  'get-logged-time-timesheet',
  'Get logged time in timesheet format for a specific date range, organized by person and date',
  z.object({
    start_date: z.string().describe('Start date for timesheet (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for timesheet (YYYY-MM-DD)'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by billable status (1 = billable, 0 = non-billable)'),
  }),
  async (params) => {
    const loggedTimeData = await floatApi.getPaginated(
      '/logged-time',
      {
        start_date: params.start_date,
        end_date: params.end_date,
        people_id: params.people_id,
        project_id: params.project_id,
        billable: params.billable,
      },
      loggedTimeResponseSchema
    );

    // Group by person and date for timesheet view
    const timesheet: Record<string, Record<string, LoggedTime[]>> = {};
    const totals = {
      total_hours: 0,
      billable_hours: 0,
      non_billable_hours: 0,
    };

    loggedTimeData.forEach((entry) => {
      const peopleId = entry.people_id?.toString() || 'unknown';
      const date = entry.date || 'unknown';
      const hours = entry.hours || 0;
      const isBillable = entry.billable === 1;

      // Initialize structure
      if (!timesheet[peopleId]) {
        timesheet[peopleId] = {};
      }
      if (!timesheet[peopleId][date]) {
        timesheet[peopleId][date] = [];
      }

      // Add entry
      timesheet[peopleId][date].push(entry);

      // Calculate totals
      totals.total_hours += hours;
      if (isBillable) {
        totals.billable_hours += hours;
      } else {
        totals.non_billable_hours += hours;
      }
    });

    return {
      timesheet,
      totals,
      date_range: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
      total_entries: loggedTimeData.length,
    };
  }
);

// Get billable time report
export const getBillableTimeReport = createTool(
  'get-billable-time-report',
  'Get a detailed report of billable vs non-billable logged time with breakdown by person and project',
  z.object({
    start_date: z.string().describe('Start date for report (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for report (YYYY-MM-DD)'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
  }),
  async (params) => {
    const loggedTimeData = await floatApi.getPaginated(
      '/logged-time',
      {
        start_date: params.start_date,
        end_date: params.end_date,
        people_id: params.people_id,
        project_id: params.project_id,
      },
      loggedTimeResponseSchema
    );

    const report = {
      date_range: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
      summary: {
        total_hours: 0,
        billable_hours: 0,
        non_billable_hours: 0,
        billable_percentage: 0,
        total_entries: loggedTimeData.length,
      },
      by_person: {} as Record<
        string,
        {
          total_hours: number;
          billable_hours: number;
          non_billable_hours: number;
          billable_percentage: number;
        }
      >,
      by_project: {} as Record<
        string,
        {
          total_hours: number;
          billable_hours: number;
          non_billable_hours: number;
          billable_percentage: number;
        }
      >,
    };

    loggedTimeData.forEach((entry) => {
      const hours = entry.hours || 0;
      const isBillable = entry.billable === 1;

      // Summary totals
      report.summary.total_hours += hours;
      if (isBillable) {
        report.summary.billable_hours += hours;
      } else {
        report.summary.non_billable_hours += hours;
      }

      // By person
      if (entry.people_id) {
        const peopleId = entry.people_id.toString();
        if (!report.by_person[peopleId]) {
          report.by_person[peopleId] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
            billable_percentage: 0,
          };
        }
        report.by_person[peopleId].total_hours += hours;
        if (isBillable) {
          report.by_person[peopleId].billable_hours += hours;
        } else {
          report.by_person[peopleId].non_billable_hours += hours;
        }
      }

      // By project
      if (entry.project_id) {
        const projectId = entry.project_id.toString();
        if (!report.by_project[projectId]) {
          report.by_project[projectId] = {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
            billable_percentage: 0,
          };
        }
        report.by_project[projectId].total_hours += hours;
        if (isBillable) {
          report.by_project[projectId].billable_hours += hours;
        } else {
          report.by_project[projectId].non_billable_hours += hours;
        }
      }
    });

    // Calculate percentages
    if (report.summary.total_hours > 0) {
      report.summary.billable_percentage =
        (report.summary.billable_hours / report.summary.total_hours) * 100;
    }

    Object.values(report.by_person).forEach((person) => {
      if (person.total_hours > 0) {
        person.billable_percentage = (person.billable_hours / person.total_hours) * 100;
      }
    });

    Object.values(report.by_project).forEach((project) => {
      if (project.total_hours > 0) {
        project.billable_percentage = (project.billable_hours / project.total_hours) * 100;
      }
    });

    return report;
  }
);
