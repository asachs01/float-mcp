import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import {
  loggedTimeSchema,
  loggedTimeResponseSchema,
  timeOffSchema,
  timeOffResponseSchema,
  timeOffTypeSchema,
  timeOffTypesResponseSchema,
  publicHolidaySchema,
  publicHolidaysResponseSchema,
  teamHolidaySchema,
  teamHolidaysResponseSchema,
  type LoggedTime,
} from '../../types/float.js';

// Time tracking entity types enum for decision tree routing
const timeTrackingEntityTypeSchema = z.enum([
  'logged-time',
  'timeoff',
  'timeoff-types',
  'public-holidays',
  'team-holidays',
]);

// Time tracking operation types enum for decision tree routing
const timeTrackingOperationTypeSchema = z.enum([
  'list',
  'get',
  'create',
  'update',
  'delete',
  // Logged time specific operations
  'bulk-create-logged-time',
  'get-person-logged-time-summary',
  'get-project-logged-time-summary',
  'get-logged-time-timesheet',
  'get-billable-time-report',
  // Time off specific operations
  'bulk-create-timeoff',
  'approve-timeoff',
  'reject-timeoff',
  'get-timeoff-calendar',
  'get-person-timeoff-summary',
  // Team holiday specific operations
  'list-team-holidays-by-department',
  'list-team-holidays-by-date-range',
  'list-recurring-team-holidays',
  'get-upcoming-team-holidays',
]);

// Base parameters for time tracking operations
const timeTrackingBaseParamsSchema = z.object({
  entity_type: timeTrackingEntityTypeSchema.describe(
    'The type of time tracking entity (logged-time, timeoff, timeoff-types, public-holidays, team-holidays)'
  ),
  operation: timeTrackingOperationTypeSchema.describe('The time tracking operation to perform'),
});

// Generic list/filter parameters for time tracking
const timeTrackingListParamsSchema = z
  .object({
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    task_id: z.string().optional().describe('Filter by task ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    date: z.string().optional().describe('Filter by specific date (YYYY-MM-DD)'),
    billable: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by billable status (1=billable, 0=non-billable)'),
    locked: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by locked status (1=locked, 0=unlocked)'),
    status: z.string().optional().describe('Filter by status (pending, approved, rejected)'),
    timeoff_type_id: z.number().optional().describe('Filter by time off type ID'),
    department_id: z.number().optional().describe('Filter by department ID'),
    region_id: z.number().optional().describe('Filter by region ID'),
    recurring: z
      .number()
      .optional()
      .describe('Filter by recurring status (0=one-time, 1=recurring)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  })
  .partial();

// Generic get parameters
const timeTrackingGetParamsSchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .describe('The entity ID (logged_time_id, timeoff_id, timeoff_type_id, holiday_id)'),
  })
  .partial();

// Create/update data schema for time tracking entities
const timeTrackingCreateUpdateDataSchema = z
  .object({
    // Logged time fields
    hours: z.number().optional().describe('Hours logged or time off hours'),
    note: z.string().optional().describe('Note or description'),
    reference_date: z.string().optional().describe('Reference date for UI suggestions'),

    // Time off fields
    full_day: z.number().optional().describe('Full day flag (1=full day, 0=partial day)'),
    approved_by: z.number().optional().describe('User ID who approved'),
    approved_at: z.string().optional().describe('Approval timestamp'),
    rejected_by: z.number().optional().describe('User ID who rejected'),
    rejected_at: z.string().optional().describe('Rejection timestamp'),
    repeat_state: z.number().optional().describe('Repeat state'),
    repeat_end: z.string().optional().describe('Repeat end date'),

    // Time off type fields
    name: z.string().optional().describe('Name of the time off type or holiday'),
    is_default: z.number().optional().describe('Default flag (0=not default, 1=default)'),
    color: z.string().optional().describe('Color (hex code)'),

    // Holiday fields (public and team)
    description: z.string().optional().describe('Holiday description'),
    region: z.string().optional().describe('Region or country code'),
    country: z.string().optional().describe('Country name'),
    type: z.string().optional().describe('Holiday type'),
    moveable: z.number().optional().describe('Moveable flag (0=fixed, 1=moveable)'),
    year: z.number().optional().describe('Year for the holiday'),
    notes: z.string().optional().describe('Additional notes'),
    holiday_type: z.number().optional().describe('Holiday type (0=full day, 1=partial day)'),
    recurrence_pattern: z.string().optional().describe('Recurrence pattern'),
    created_by: z.number().optional().describe('User ID who created'),
    all_day: z.number().optional().describe('All day flag (0=not all day, 1=all day)'),
    timezone: z.string().optional().describe('Timezone'),

    // Bulk operations
    logged_time_entries: z
      .array(
        z.object({
          people_id: z.union([z.string(), z.number()]),
          project_id: z.union([z.string(), z.number()]),
          task_id: z.string().optional(),
          date: z.string(),
          hours: z.number(),
          billable: z.union([z.string(), z.number()]).optional(),
          note: z.string().optional(),
          reference_date: z.string().optional(),
        })
      )
      .optional()
      .describe('Array of logged time entries for bulk creation'),

    timeoff_entries: z
      .array(
        z.object({
          people_id: z.number(),
          timeoff_type_id: z.number(),
          start_date: z.string(),
          end_date: z.string(),
          hours: z.number().optional(),
          full_day: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .optional()
      .describe('Array of time off entries for bulk creation'),
  })
  .partial();

// Main schema combining all parameters
const manageTimeTrackingSchema = withFormatParam(
  timeTrackingBaseParamsSchema.extend({
    ...timeTrackingListParamsSchema.shape,
    ...timeTrackingGetParamsSchema.shape,
    ...timeTrackingCreateUpdateDataSchema.shape,
  })
);

export const manageTimeTracking = createTool(
  'manage-time-tracking',
  'Consolidated tool for managing all time tracking entities (logged-time, timeoff, timeoff-types, public-holidays, team-holidays). Handles time logging, leave management, and holiday tracking through a decision-tree approach with comprehensive reporting capabilities.',
  manageTimeTrackingSchema,
  async (params) => {
    const { format, entity_type, operation, id, ...restParams } = params;

    // Route based on entity type and operation
    switch (entity_type) {
      case 'logged-time':
        return handleLoggedTimeOperations(operation, { id, ...restParams }, format);
      case 'timeoff':
        return handleTimeOffOperations(operation, { id, ...restParams }, format);
      case 'timeoff-types':
        return handleTimeOffTypeOperations(operation, { id, ...restParams }, format);
      case 'public-holidays':
        return handlePublicHolidayOperations(operation, { id, ...restParams }, format);
      case 'team-holidays':
        return handleTeamHolidayOperations(operation, { id, ...restParams }, format);
      default:
        throw new Error(`Unsupported time tracking entity type: ${entity_type}`);
    }
  }
);

// Logged time operations handler
async function handleLoggedTimeOperations(operation: string, params: any, format: any) {
  const { id, logged_time_entries, people_id, project_id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/logged-time', otherParams, loggedTimeResponseSchema, format);
    case 'get':
      return floatApi.get(`/logged-time/${id}`, loggedTimeSchema, format);
    case 'create':
      return floatApi.post('/logged-time', otherParams, loggedTimeSchema, format);
    case 'update':
      return floatApi.patch(`/logged-time/${id}`, otherParams, loggedTimeSchema, format);
    case 'delete':
      await floatApi.delete(`/logged-time/${id}`, undefined, format);
      return { success: true, message: 'Logged time entry deleted successfully' };
    case 'bulk-create-logged-time':
      const results = [];
      const errors = [];
      const entries = logged_time_entries || [];

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        try {
          const loggedTime = await floatApi.post('/logged-time', entry, loggedTimeSchema, format);
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
          total: entries.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    case 'get-person-logged-time-summary':
      return generatePersonLoggedTimeSummary(people_id, otherParams, format);
    case 'get-project-logged-time-summary':
      return generateProjectLoggedTimeSummary(project_id, otherParams, format);
    case 'get-logged-time-timesheet':
      return generateLoggedTimeTimesheet(otherParams, format);
    case 'get-billable-time-report':
      return generateBillableTimeReport(otherParams, format);
    default:
      throw new Error(`Unsupported logged time operation: ${operation}`);
  }
}

// Time off operations handler
async function handleTimeOffOperations(operation: string, params: any, format: any) {
  const { id, timeoff_entries, people_id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/timeoff', otherParams, timeOffResponseSchema, format);
    case 'get':
      return floatApi.get(`/timeoff/${id}`, timeOffSchema, format);
    case 'create':
      return floatApi.post('/timeoff', otherParams, timeOffSchema, format);
    case 'update':
      return floatApi.patch(`/timeoff/${id}`, otherParams, timeOffSchema, format);
    case 'delete':
      await floatApi.delete(`/timeoff/${id}`, undefined, format);
      return { success: true, message: 'Time off entry deleted successfully' };
    case 'bulk-create-timeoff':
      const results = [];
      const errors = [];
      const entries = timeoff_entries || [];

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        try {
          const timeOff = await floatApi.post('/timeoff', entry, timeOffSchema, format);
          results.push({ index, success: true, data: timeOff });
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
          total: entries.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    case 'approve-timeoff':
      const approver_id = otherParams.approved_by || 1; // Default to system user
      return floatApi.patch(
        `/timeoff/${id}`,
        {
          status: 'approved',
          approved_by: approver_id,
          approved_at: new Date().toISOString(),
        },
        timeOffSchema,
        format
      );
    case 'reject-timeoff':
      const rejector_id = otherParams.rejected_by || 1; // Default to system user
      return floatApi.patch(
        `/timeoff/${id}`,
        {
          status: 'rejected',
          rejected_by: rejector_id,
          rejected_at: new Date().toISOString(),
        },
        timeOffSchema,
        format
      );
    case 'get-timeoff-calendar':
      return generateTimeOffCalendar(otherParams, format);
    case 'get-person-timeoff-summary':
      return generatePersonTimeOffSummary(people_id, otherParams, format);
    default:
      throw new Error(`Unsupported time off operation: ${operation}`);
  }
}

// Time off type operations handler
async function handleTimeOffTypeOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated(
        '/timeoff-types',
        otherParams,
        timeOffTypesResponseSchema,
        format
      );
    case 'get':
      return floatApi.get(`/timeoff-types/${id}`, timeOffTypeSchema, format);
    case 'create':
      return floatApi.post('/timeoff-types', otherParams, timeOffTypeSchema, format);
    case 'update':
      return floatApi.patch(`/timeoff-types/${id}`, otherParams, timeOffTypeSchema, format);
    case 'delete':
      await floatApi.delete(`/timeoff-types/${id}`, undefined, format);
      return { success: true, message: 'Time off type deleted successfully' };
    default:
      throw new Error(`Unsupported time off type operation: ${operation}`);
  }
}

// Public holiday operations handler
async function handlePublicHolidayOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated(
        '/public-holidays',
        otherParams,
        publicHolidaysResponseSchema,
        format
      );
    case 'get':
      return floatApi.get(`/public-holidays/${id}`, publicHolidaySchema, format);
    case 'create':
      return floatApi.post('/public-holidays', otherParams, publicHolidaySchema, format);
    case 'update':
      return floatApi.patch(`/public-holidays/${id}`, otherParams, publicHolidaySchema, format);
    case 'delete':
      await floatApi.delete(`/public-holidays/${id}`, undefined, format);
      return { success: true, message: 'Public holiday deleted successfully' };
    default:
      throw new Error(`Unsupported public holiday operation: ${operation}`);
  }
}

// Team holiday operations handler
async function handleTeamHolidayOperations(operation: string, params: any, format: any) {
  const { id, department_id, start_date, end_date, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated(
        '/team-holidays',
        otherParams,
        teamHolidaysResponseSchema,
        format
      );
    case 'get':
      return floatApi.get(`/team-holidays/${id}`, teamHolidaySchema, format);
    case 'create':
      return floatApi.post('/team-holidays', otherParams, teamHolidaySchema, format);
    case 'update':
      return floatApi.patch(`/team-holidays/${id}`, otherParams, teamHolidaySchema, format);
    case 'delete':
      await floatApi.delete(`/team-holidays/${id}`, undefined, format);
      return { success: true, message: 'Team holiday deleted successfully' };
    case 'list-team-holidays-by-department':
      return floatApi.getPaginated(
        '/team-holidays',
        { department_id },
        teamHolidaysResponseSchema,
        format
      );
    case 'list-team-holidays-by-date-range':
      return floatApi.getPaginated(
        '/team-holidays',
        { start_date, end_date },
        teamHolidaysResponseSchema,
        format
      );
    case 'list-recurring-team-holidays':
      return floatApi.getPaginated(
        '/team-holidays',
        { recurring: 1 },
        teamHolidaysResponseSchema,
        format
      );
    case 'get-upcoming-team-holidays':
      const today = new Date().toISOString().split('T')[0];
      const upcomingHolidays = await floatApi.getPaginated(
        '/team-holidays',
        {
          start_date: today,
          active: 1,
        },
        teamHolidaysResponseSchema,
        format
      );
      return upcomingHolidays.sort((a, b) => {
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        return dateA - dateB;
      });
    default:
      throw new Error(`Unsupported team holiday operation: ${operation}`);
  }
}

// Helper functions for complex operations

async function generatePersonLoggedTimeSummary(people_id: any, params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    {
      people_id,
      ...params,
    },
    loggedTimeResponseSchema,
    format
  );

  const summary = {
    people_id,
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

    summary.total_hours += hours;
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
        summary.by_date[entry.date] = { total_hours: 0, billable_hours: 0, non_billable_hours: 0 };
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

async function generateProjectLoggedTimeSummary(project_id: any, params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    {
      project_id,
      ...params,
    },
    loggedTimeResponseSchema,
    format
  );

  const summary = {
    project_id,
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

    summary.total_hours += hours;
    if (isBillable) {
      summary.billable_hours += hours;
    } else {
      summary.non_billable_hours += hours;
    }

    // By person
    if (entry.people_id) {
      const peopleId = entry.people_id.toString();
      if (!summary.by_person[peopleId]) {
        summary.by_person[peopleId] = { total_hours: 0, billable_hours: 0, non_billable_hours: 0 };
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
        summary.by_date[entry.date] = { total_hours: 0, billable_hours: 0, non_billable_hours: 0 };
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

async function generateLoggedTimeTimesheet(params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
  );

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

    if (!timesheet[peopleId]) {
      timesheet[peopleId] = {};
    }
    if (!timesheet[peopleId][date]) {
      timesheet[peopleId][date] = [];
    }

    timesheet[peopleId][date].push(entry);

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

async function generateBillableTimeReport(params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
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
    by_person: {} as Record<string, any>,
    by_project: {} as Record<string, any>,
  };

  loggedTimeData.forEach((entry) => {
    const hours = entry.hours || 0;
    const isBillable = entry.billable === 1;

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

  Object.values(report.by_person).forEach((person: any) => {
    if (person.total_hours > 0) {
      person.billable_percentage = (person.billable_hours / person.total_hours) * 100;
    }
  });

  Object.values(report.by_project).forEach((project: any) => {
    if (project.total_hours > 0) {
      project.billable_percentage = (project.billable_hours / project.total_hours) * 100;
    }
  });

  return report;
}

async function generateTimeOffCalendar(params: any, format: any) {
  const timeOffData = await floatApi.getPaginated(
    '/timeoff',
    params,
    timeOffResponseSchema,
    format
  );

  const calendar: Record<string, any[]> = {};
  const summary = {
    total_entries: timeOffData.length,
    by_status: { pending: 0, approved: 0, rejected: 0 },
    by_type: {} as Record<string, number>,
  };

  timeOffData.forEach((entry) => {
    const startDate = entry.start_date || 'unknown';

    if (!calendar[startDate]) {
      calendar[startDate] = [];
    }
    calendar[startDate].push(entry);

    // Status summary
    if (entry.status) {
      summary.by_status[entry.status as keyof typeof summary.by_status] =
        (summary.by_status[entry.status as keyof typeof summary.by_status] || 0) + 1;
    }

    // Type summary
    const typeId = entry.timeoff_type_id?.toString() || 'unknown';
    summary.by_type[typeId] = (summary.by_type[typeId] || 0) + 1;
  });

  return {
    calendar,
    summary,
    date_range: {
      start_date: params.start_date,
      end_date: params.end_date,
    },
  };
}

async function generatePersonTimeOffSummary(people_id: any, params: any, format: any) {
  const timeOffData = await floatApi.getPaginated(
    '/timeoff',
    {
      people_id,
      ...params,
    },
    timeOffResponseSchema,
    format
  );

  const summary = {
    people_id,
    date_range: {
      start_date: params.start_date,
      end_date: params.end_date,
    },
    total_days: 0,
    total_hours: 0,
    by_type: {} as Record<string, { days: number; hours: number }>,
    by_status: { pending: 0, approved: 0, rejected: 0 },
    entries: timeOffData,
  };

  timeOffData.forEach((entry) => {
    const hours = entry.hours || (entry.full_day ? 8 : 0); // Assume 8 hours for full day
    const days = entry.full_day ? 1 : hours / 8;

    summary.total_hours += hours;
    summary.total_days += days;

    // By type
    const typeId = entry.timeoff_type_id?.toString() || 'unknown';
    if (!summary.by_type[typeId]) {
      summary.by_type[typeId] = { days: 0, hours: 0 };
    }
    summary.by_type[typeId].days += days;
    summary.by_type[typeId].hours += hours;

    // By status
    if (entry.status) {
      summary.by_status[entry.status as keyof typeof summary.by_status] =
        (summary.by_status[entry.status as keyof typeof summary.by_status] || 0) + 1;
    }
  });

  return summary;
}
