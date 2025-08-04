import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import {
  loggedTimeResponseSchema,
  projectsResponseSchema,
  peopleResponseSchema,
  allocationsResponseSchema,
  timeOffResponseSchema,
  milestonesResponseSchema,
  phasesResponseSchema,
} from '../../types/float.js';

// Report types enum for decision tree routing
const reportTypeSchema = z.enum([
  'time-report',
  'project-report',
  'people-utilization-report',
  'capacity-report',
  'budget-report',
  'milestone-report',
  'timeoff-report',
  'team-performance-report',
  'resource-allocation-report',
  'project-timeline-report',
  'billable-analysis-report',
]);

// Report format enum
const reportFormatSchema = z.enum(['json', 'csv', 'xml']);

// Base parameters for report generation
const reportBaseParamsSchema = z.object({
  report_type: reportTypeSchema.describe('The type of report to generate'),
  report_format: reportFormatSchema
    .optional()
    .default('json')
    .describe('Output format for the report (json, csv, xml)'),
});

// Common filter parameters for reports
const reportFilterParamsSchema = z
  .object({
    start_date: z.string().optional().describe('Start date for report data (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date for report data (YYYY-MM-DD)'),
    people_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by specific person ID'),
    project_id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Filter by specific project ID'),
    client_id: z.number().optional().describe('Filter by specific client ID'),
    department_id: z.number().optional().describe('Filter by specific department ID'),
    status: z.union([z.string(), z.number()]).optional().describe('Filter by status'),
    billable: z
      .number()
      .optional()
      .describe('Filter by billable status (0=non-billable, 1=billable)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
  })
  .partial();

// Report-specific configuration parameters
const reportConfigParamsSchema = z
  .object({
    // Grouping options
    group_by: z
      .enum(['person', 'project', 'client', 'department', 'date', 'week', 'month'])
      .optional()
      .describe('Group report data by specified field'),
    include_details: z
      .boolean()
      .optional()
      .default(false)
      .describe('Include detailed breakdown in report'),
    include_totals: z.boolean().optional().default(true).describe('Include totals and summaries'),
    include_percentages: z
      .boolean()
      .optional()
      .default(true)
      .describe('Include percentage calculations'),

    // Time-specific options
    time_period: z
      .enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
      .optional()
      .describe('Time period aggregation'),
    compare_previous_period: z
      .boolean()
      .optional()
      .default(false)
      .describe('Include comparison with previous period'),

    // Utilization report options
    target_hours_per_day: z
      .number()
      .optional()
      .default(8)
      .describe('Target hours per day for utilization calculations'),
    exclude_weekends: z
      .boolean()
      .optional()
      .default(true)
      .describe('Exclude weekends from utilization calculations'),
    exclude_holidays: z
      .boolean()
      .optional()
      .default(true)
      .describe('Exclude holidays from utilization calculations'),

    // Budget report options
    include_budget_variance: z
      .boolean()
      .optional()
      .default(true)
      .describe('Include budget variance analysis'),
    budget_warning_threshold: z
      .number()
      .optional()
      .default(80)
      .describe('Budget warning threshold percentage'),

    // Capacity report options
    forecast_weeks: z
      .number()
      .optional()
      .default(4)
      .describe('Number of weeks to forecast capacity'),
    capacity_threshold: z
      .number()
      .optional()
      .default(100)
      .describe('Capacity threshold percentage'),
  })
  .partial();

// Main schema combining all parameters
const generateReportSchema = withFormatParam(
  reportBaseParamsSchema.extend({
    ...reportFilterParamsSchema.shape,
    ...reportConfigParamsSchema.shape,
  })
);

export const generateReport = createTool(
  'generate-report',
  'Consolidated tool for generating comprehensive reports and analytics from Float data. Supports various report types including time tracking, project performance, resource utilization, budget analysis, and team metrics with flexible filtering and formatting options.',
  generateReportSchema,
  async (params) => {
    const { format, report_type, ...restParams } = params;

    // Route based on report type
    switch (report_type) {
      case 'time-report':
        return generateTimeReport(restParams, format);
      case 'project-report':
        return generateProjectReport(restParams, format);
      case 'people-utilization-report':
        return generatePeopleUtilizationReport(restParams, format);
      case 'capacity-report':
        return generateCapacityReport(restParams, format);
      case 'budget-report':
        return generateBudgetReport(restParams, format);
      case 'milestone-report':
        return generateMilestoneReport(restParams, format);
      case 'timeoff-report':
        return generateTimeOffReport(restParams, format);
      case 'team-performance-report':
        return generateTeamPerformanceReport(restParams, format);
      case 'resource-allocation-report':
        return generateResourceAllocationReport(restParams, format);
      case 'project-timeline-report':
        return generateProjectTimelineReport(restParams, format);
      case 'billable-analysis-report':
        return generateBillableAnalysisReport(restParams, format);
      default:
        throw new Error(`Unsupported report type: ${report_type}`);
    }
  }
);

// Time report generator
async function generateTimeReport(params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
  );

  const report = {
    report_type: 'time-report',
    generated_at: new Date().toISOString(),
    date_range: {
      start_date: params.start_date,
      end_date: params.end_date,
    },
    filters: params,
    summary: {
      total_entries: loggedTimeData.length,
      total_hours: 0,
      billable_hours: 0,
      non_billable_hours: 0,
      unique_people: new Set<number>(),
      unique_projects: new Set<number>(),
    },
    data: [] as any[],
    breakdown: {
      by_person: {} as Record<string, any>,
      by_project: {} as Record<string, any>,
      by_date: {} as Record<string, any>,
    },
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

    if (entry.people_id) report.summary.unique_people.add(entry.people_id);
    if (entry.project_id) report.summary.unique_projects.add(entry.project_id);

    // Group by logic
    if (params.group_by) {
      switch (params.group_by) {
        case 'person':
          if (entry.people_id) {
            const key = entry.people_id.toString();
            if (!report.breakdown.by_person[key]) {
              report.breakdown.by_person[key] = {
                total_hours: 0,
                billable_hours: 0,
                non_billable_hours: 0,
                entries: [],
              };
            }
            report.breakdown.by_person[key].total_hours += hours;
            if (isBillable) {
              report.breakdown.by_person[key].billable_hours += hours;
            } else {
              report.breakdown.by_person[key].non_billable_hours += hours;
            }
            if (params.include_details) {
              report.breakdown.by_person[key].entries.push(entry);
            }
          }
          break;
        case 'project':
          if (entry.project_id) {
            const key = entry.project_id.toString();
            if (!report.breakdown.by_project[key]) {
              report.breakdown.by_project[key] = {
                total_hours: 0,
                billable_hours: 0,
                non_billable_hours: 0,
                entries: [],
              };
            }
            report.breakdown.by_project[key].total_hours += hours;
            if (isBillable) {
              report.breakdown.by_project[key].billable_hours += hours;
            } else {
              report.breakdown.by_project[key].non_billable_hours += hours;
            }
            if (params.include_details) {
              report.breakdown.by_project[key].entries.push(entry);
            }
          }
          break;
        case 'date':
          if (entry.date) {
            if (!report.breakdown.by_date[entry.date]) {
              report.breakdown.by_date[entry.date] = {
                total_hours: 0,
                billable_hours: 0,
                non_billable_hours: 0,
                entries: [],
              };
            }
            report.breakdown.by_date[entry.date].total_hours += hours;
            if (isBillable) {
              report.breakdown.by_date[entry.date].billable_hours += hours;
            } else {
              report.breakdown.by_date[entry.date].non_billable_hours += hours;
            }
            if (params.include_details) {
              report.breakdown.by_date[entry.date].entries.push(entry);
            }
          }
          break;
      }
    }
  });

  // Convert sets to counts
  (report.summary as any).unique_people = report.summary.unique_people.size;
  (report.summary as any).unique_projects = report.summary.unique_projects.size;

  // Add percentages if requested
  if (params.include_percentages && report.summary.total_hours > 0) {
    (report as any).percentages = {
      billable_percentage: (report.summary.billable_hours / report.summary.total_hours) * 100,
      non_billable_percentage:
        (report.summary.non_billable_hours / report.summary.total_hours) * 100,
    };
  }

  // Include raw data if requested
  if (params.include_details) {
    report.data = loggedTimeData;
  }

  return report;
}

// Project report generator
async function generateProjectReport(params: any, format: any) {
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    format
  );
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
  );

  const report = {
    report_type: 'project-report',
    generated_at: new Date().toISOString(),
    date_range: {
      start_date: params.start_date,
      end_date: params.end_date,
    },
    filters: params,
    summary: {
      total_projects: projectsData.length,
      active_projects: projectsData.filter((p) => p.active === 1).length,
      total_budget: 0,
      total_logged_hours: 0,
      total_billable_hours: 0,
    },
    projects: [] as any[],
  };

  // Create project performance map
  const projectPerformance: Record<string, any> = {};

  loggedTimeData.forEach((entry) => {
    if (entry.project_id) {
      const projectId = entry.project_id.toString();
      if (!projectPerformance[projectId]) {
        projectPerformance[projectId] = {
          total_hours: 0,
          billable_hours: 0,
          non_billable_hours: 0,
          unique_people: new Set(),
        };
      }

      const hours = entry.hours || 0;
      projectPerformance[projectId].total_hours += hours;
      if (entry.billable === 1) {
        projectPerformance[projectId].billable_hours += hours;
      } else {
        projectPerformance[projectId].non_billable_hours += hours;
      }

      if (entry.people_id) {
        projectPerformance[projectId].unique_people.add(entry.people_id);
      }
    }
  });

  // Combine project data with performance metrics
  projectsData.forEach((project) => {
    const projectId = project.project_id?.toString();
    const performance = projectId ? projectPerformance[projectId] : null;

    const projectReport = {
      ...project,
      performance: performance
        ? {
            total_hours: performance.total_hours,
            billable_hours: performance.billable_hours,
            non_billable_hours: performance.non_billable_hours,
            team_size: performance.unique_people.size,
            budget_used: performance.billable_hours * (project.hourly_rate || 0),
            budget_remaining:
              (project.budget || 0) - performance.billable_hours * (project.hourly_rate || 0),
          }
        : {
            total_hours: 0,
            billable_hours: 0,
            non_billable_hours: 0,
            team_size: 0,
            budget_used: 0,
            budget_remaining: project.budget || 0,
          },
    };

    // Add budget variance if requested
    if (params.include_budget_variance && project.budget) {
      const budgetUsed = projectReport.performance.budget_used;
      const budgetVariance = ((budgetUsed - (project.budget || 0)) / (project.budget || 1)) * 100;
      (projectReport.performance as any).budget_variance_percentage = budgetVariance;
      (projectReport.performance as any).over_budget = budgetVariance > 0;
      (projectReport.performance as any).budget_warning =
        budgetVariance > (params.budget_warning_threshold || 80);
    }

    report.projects.push(projectReport);

    // Update summary
    report.summary.total_budget += project.budget || 0;
    report.summary.total_logged_hours += projectReport.performance.total_hours;
    report.summary.total_billable_hours += projectReport.performance.billable_hours;
  });

  return report;
}

// People utilization report generator
async function generatePeopleUtilizationReport(params: any, format: any) {
  const peopleData = await floatApi.getPaginated('/people', params, peopleResponseSchema, format);
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
  );
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    format
  );

  const targetHoursPerDay = params.target_hours_per_day || 8;
  const startDate = new Date(params.start_date || new Date().toISOString().split('T')[0]);
  const endDate = new Date(params.end_date || new Date().toISOString().split('T')[0]);
  const workingDays = calculateWorkingDays(
    startDate,
    endDate,
    params.exclude_weekends,
    params.exclude_holidays
  );
  const targetTotalHours = workingDays * targetHoursPerDay;

  const report = {
    report_type: 'people-utilization-report',
    generated_at: new Date().toISOString(),
    date_range: {
      start_date: params.start_date,
      end_date: params.end_date,
    },
    configuration: {
      target_hours_per_day: targetHoursPerDay,
      working_days: workingDays,
      target_total_hours: targetTotalHours,
      exclude_weekends: params.exclude_weekends,
      exclude_holidays: params.exclude_holidays,
    },
    summary: {
      total_people: peopleData.length,
      average_utilization: 0,
      over_utilized_count: 0,
      under_utilized_count: 0,
    },
    people: [] as any[],
  };

  const peoplePerformance: Record<string, any> = {};

  // Calculate logged time per person
  loggedTimeData.forEach((entry) => {
    if (entry.people_id) {
      const peopleId = entry.people_id.toString();
      if (!peoplePerformance[peopleId]) {
        peoplePerformance[peopleId] = {
          logged_hours: 0,
          billable_hours: 0,
          non_billable_hours: 0,
          scheduled_hours: 0,
        };
      }

      const hours = entry.hours || 0;
      peoplePerformance[peopleId].logged_hours += hours;
      if (entry.billable === 1) {
        peoplePerformance[peopleId].billable_hours += hours;
      } else {
        peoplePerformance[peopleId].non_billable_hours += hours;
      }
    }
  });

  // Calculate scheduled hours per person
  allocationsData.forEach((allocation) => {
    if (allocation.people_id) {
      const peopleId = allocation.people_id.toString();
      if (!peoplePerformance[peopleId]) {
        peoplePerformance[peopleId] = {
          logged_hours: 0,
          billable_hours: 0,
          non_billable_hours: 0,
          scheduled_hours: 0,
        };
      }

      peoplePerformance[peopleId].scheduled_hours += allocation.hours || 0;
    }
  });

  let totalUtilization = 0;

  // Generate person reports
  peopleData.forEach((person) => {
    const peopleId = person.people_id?.toString();
    const performance = peopleId ? peoplePerformance[peopleId] : null;

    const loggedHours = performance?.logged_hours || 0;
    const scheduledHours = performance?.scheduled_hours || 0;
    const utilization = targetTotalHours > 0 ? (loggedHours / targetTotalHours) * 100 : 0;
    const scheduledUtilization =
      targetTotalHours > 0 ? (scheduledHours / targetTotalHours) * 100 : 0;

    const personReport = {
      ...person,
      utilization: {
        logged_hours: loggedHours,
        scheduled_hours: scheduledHours,
        billable_hours: performance?.billable_hours || 0,
        non_billable_hours: performance?.non_billable_hours || 0,
        target_hours: targetTotalHours,
        utilization_percentage: utilization,
        scheduled_utilization_percentage: scheduledUtilization,
        variance_hours: loggedHours - scheduledHours,
        over_utilized: utilization > 100,
        under_utilized: utilization < 80,
      },
    };

    report.people.push(personReport);
    totalUtilization += utilization;

    if (utilization > 100) report.summary.over_utilized_count++;
    if (utilization < 80) report.summary.under_utilized_count++;
  });

  report.summary.average_utilization =
    peopleData.length > 0 ? totalUtilization / peopleData.length : 0;

  return report;
}

// Placeholder implementations for other report types
async function generateCapacityReport(params: any, format: any) {
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    format
  );

  // Implement capacity forecasting logic
  return {
    report_type: 'capacity-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Capacity report implementation' },
    data: allocationsData,
  };
}

async function generateBudgetReport(params: any, format: any) {
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    format
  );

  return {
    report_type: 'budget-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Budget report implementation' },
    data: projectsData,
  };
}

async function generateMilestoneReport(params: any, format: any) {
  const milestonesData = await floatApi.getPaginated(
    '/milestones',
    params,
    milestonesResponseSchema,
    format
  );

  return {
    report_type: 'milestone-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Milestone report implementation' },
    data: milestonesData,
  };
}

async function generateTimeOffReport(params: any, format: any) {
  const timeOffData = await floatApi.getPaginated(
    '/timeoffs',
    params,
    timeOffResponseSchema,
    format
  );

  return {
    report_type: 'timeoff-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Time off report implementation' },
    data: timeOffData,
  };
}

async function generateTeamPerformanceReport(params: any, format: any) {
  const peopleData = await floatApi.getPaginated('/people', params, peopleResponseSchema, format);

  return {
    report_type: 'team-performance-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Team performance report implementation' },
    data: peopleData,
  };
}

async function generateResourceAllocationReport(params: any, format: any) {
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    format
  );

  return {
    report_type: 'resource-allocation-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Resource allocation report implementation' },
    data: allocationsData,
  };
}

async function generateProjectTimelineReport(params: any, format: any) {
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    format
  );
  const phasesData = await floatApi.getPaginated('/phases', params, phasesResponseSchema, format);

  return {
    report_type: 'project-timeline-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Project timeline report implementation' },
    data: { projects: projectsData, phases: phasesData },
  };
}

async function generateBillableAnalysisReport(params: any, format: any) {
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    format
  );

  return {
    report_type: 'billable-analysis-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Billable analysis report implementation' },
    data: loggedTimeData,
  };
}

// Helper function to calculate working days
function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  excludeWeekends: boolean = true,
  _excludeHolidays: boolean = true
): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6

    if (!excludeWeekends || !isWeekend) {
      workingDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Note: Holiday exclusion would require holiday data lookup
  // This is a simplified implementation

  return workingDays;
}
