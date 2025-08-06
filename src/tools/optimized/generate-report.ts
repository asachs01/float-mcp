import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi, ResponseFormat } from '../../services/float-api.js';
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

// Define proper parameter types based on our schemas
type ReportParams = z.infer<typeof reportFilterParamsSchema> &
  z.infer<typeof reportConfigParamsSchema>;
type ReportFormat = z.infer<typeof reportFormatSchema>;

// Define report structure interfaces
interface ReportSummary {
  total_entries: number;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  unique_people: Set<number> | number;
  unique_projects: Set<number> | number;
}

interface ProjectPerformance {
  [key: string]: unknown;
  budget_variance_percentage?: number;
  over_budget?: boolean;
  budget_warning?: boolean;
}

interface TimeReportWithPercentages {
  [key: string]: unknown;
  summary: ReportSummary;
  percentages?: {
    billable_percentage: number;
    non_billable_percentage: number;
  };
}

// Time report generator
async function generateTimeReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    apiFormat
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
    data: [] as Record<string, unknown>[],
    breakdown: {
      by_person: {} as Record<string, unknown>,
      by_project: {} as Record<string, unknown>,
      by_date: {} as Record<string, unknown>,
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
            (report.breakdown.by_person[key] as Record<string, unknown>).total_hours =
              ((report.breakdown.by_person[key] as Record<string, unknown>).total_hours as number) +
              hours;
            if (isBillable) {
              (report.breakdown.by_person[key] as Record<string, unknown>).billable_hours =
                ((report.breakdown.by_person[key] as Record<string, unknown>)
                  .billable_hours as number) + hours;
            } else {
              (report.breakdown.by_person[key] as Record<string, unknown>).non_billable_hours =
                ((report.breakdown.by_person[key] as Record<string, unknown>)
                  .non_billable_hours as number) + hours;
            }
            if (params.include_details) {
              (
                (report.breakdown.by_person[key] as Record<string, unknown>).entries as unknown[]
              ).push(entry);
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
            (report.breakdown.by_project[key] as Record<string, unknown>).total_hours =
              ((report.breakdown.by_project[key] as Record<string, unknown>)
                .total_hours as number) + hours;
            if (isBillable) {
              (report.breakdown.by_project[key] as Record<string, unknown>).billable_hours =
                ((report.breakdown.by_project[key] as Record<string, unknown>)
                  .billable_hours as number) + hours;
            } else {
              (report.breakdown.by_project[key] as Record<string, unknown>).non_billable_hours =
                ((report.breakdown.by_project[key] as Record<string, unknown>)
                  .non_billable_hours as number) + hours;
            }
            if (params.include_details) {
              (
                (report.breakdown.by_project[key] as Record<string, unknown>).entries as unknown[]
              ).push(entry);
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
            (report.breakdown.by_date[entry.date] as Record<string, unknown>).total_hours =
              ((report.breakdown.by_date[entry.date] as Record<string, unknown>)
                .total_hours as number) + hours;
            if (isBillable) {
              (report.breakdown.by_date[entry.date] as Record<string, unknown>).billable_hours =
                ((report.breakdown.by_date[entry.date] as Record<string, unknown>)
                  .billable_hours as number) + hours;
            } else {
              (report.breakdown.by_date[entry.date] as Record<string, unknown>).non_billable_hours =
                ((report.breakdown.by_date[entry.date] as Record<string, unknown>)
                  .non_billable_hours as number) + hours;
            }
            if (params.include_details) {
              (
                (report.breakdown.by_date[entry.date] as Record<string, unknown>)
                  .entries as unknown[]
              ).push(entry);
            }
          }
          break;
      }
    }
  });

  // Convert sets to counts
  (report.summary as ReportSummary).unique_people = (
    report.summary.unique_people as Set<number>
  ).size;
  (report.summary as ReportSummary).unique_projects = (
    report.summary.unique_projects as Set<number>
  ).size;

  // Add percentages if requested
  if (params.include_percentages && report.summary.total_hours > 0) {
    (report as TimeReportWithPercentages).percentages = {
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
async function generateProjectReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    apiFormat
  );
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    apiFormat
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
    projects: [] as Record<string, unknown>[],
  };

  // Create project performance map
  const projectPerformance: Record<string, unknown> = {};

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
      (projectPerformance[projectId] as Record<string, unknown>).total_hours =
        ((projectPerformance[projectId] as Record<string, unknown>).total_hours as number) + hours;
      if (entry.billable === 1) {
        (projectPerformance[projectId] as Record<string, unknown>).billable_hours =
          ((projectPerformance[projectId] as Record<string, unknown>).billable_hours as number) +
          hours;
      } else {
        (projectPerformance[projectId] as Record<string, unknown>).non_billable_hours =
          ((projectPerformance[projectId] as Record<string, unknown>)
            .non_billable_hours as number) + hours;
      }

      if (entry.people_id) {
        (
          (projectPerformance[projectId] as Record<string, unknown>).unique_people as Set<number>
        ).add(entry.people_id);
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
            total_hours: (performance as Record<string, unknown>).total_hours,
            billable_hours: (performance as Record<string, unknown>).billable_hours,
            non_billable_hours: (performance as Record<string, unknown>).non_billable_hours,
            team_size: ((performance as Record<string, unknown>).unique_people as Set<number>).size,
            budget_used:
              ((performance as Record<string, unknown>).billable_hours as number) *
              (project.hourly_rate || 0),
            budget_remaining:
              (project.budget || 0) -
              ((performance as Record<string, unknown>).billable_hours as number) *
                (project.hourly_rate || 0),
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
      (projectReport.performance as ProjectPerformance).budget_variance_percentage = budgetVariance;
      (projectReport.performance as ProjectPerformance).over_budget = budgetVariance > 0;
      (projectReport.performance as ProjectPerformance).budget_warning =
        budgetVariance > (params.budget_warning_threshold || 80);
    }

    report.projects.push(projectReport);

    // Update summary
    report.summary.total_budget += project.budget || 0;
    report.summary.total_logged_hours += (projectReport.performance.total_hours as number) || 0;
    report.summary.total_billable_hours +=
      (projectReport.performance.billable_hours as number) || 0;
  });

  return report;
}

// People utilization report generator
async function generatePeopleUtilizationReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const peopleData = await floatApi.getPaginated(
    '/people',
    params,
    peopleResponseSchema,
    apiFormat
  );
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    apiFormat
  );
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    apiFormat
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
    people: [] as Record<string, unknown>[],
  };

  const peoplePerformance: Record<string, unknown> = {};

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
      (peoplePerformance[peopleId] as Record<string, unknown>).logged_hours =
        ((peoplePerformance[peopleId] as Record<string, unknown>).logged_hours as number) + hours;
      if (entry.billable === 1) {
        (peoplePerformance[peopleId] as Record<string, unknown>).billable_hours =
          ((peoplePerformance[peopleId] as Record<string, unknown>).billable_hours as number) +
          hours;
      } else {
        (peoplePerformance[peopleId] as Record<string, unknown>).non_billable_hours =
          ((peoplePerformance[peopleId] as Record<string, unknown>).non_billable_hours as number) +
          hours;
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

      (peoplePerformance[peopleId] as Record<string, unknown>).scheduled_hours =
        ((peoplePerformance[peopleId] as Record<string, unknown>).scheduled_hours as number) +
        (allocation.hours || 0);
    }
  });

  let totalUtilization = 0;

  // Generate person reports
  peopleData.forEach((person) => {
    const peopleId = person.people_id?.toString();
    const performance = peopleId ? peoplePerformance[peopleId] : null;

    const loggedHours = ((performance as Record<string, unknown>)?.logged_hours as number) || 0;
    const scheduledHours =
      ((performance as Record<string, unknown>)?.scheduled_hours as number) || 0;
    const utilization = targetTotalHours > 0 ? (loggedHours / targetTotalHours) * 100 : 0;
    const scheduledUtilization =
      targetTotalHours > 0 ? (scheduledHours / targetTotalHours) * 100 : 0;

    const personReport = {
      ...person,
      utilization: {
        logged_hours: loggedHours,
        scheduled_hours: scheduledHours,
        billable_hours: ((performance as Record<string, unknown>)?.billable_hours as number) || 0,
        non_billable_hours:
          ((performance as Record<string, unknown>)?.non_billable_hours as number) || 0,
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
async function generateCapacityReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    apiFormat
  );

  // Implement capacity forecasting logic
  return {
    report_type: 'capacity-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Capacity report implementation' },
    data: allocationsData,
  };
}

async function generateBudgetReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    apiFormat
  );

  return {
    report_type: 'budget-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Budget report implementation' },
    data: projectsData,
  };
}

async function generateMilestoneReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const milestonesData = await floatApi.getPaginated(
    '/milestones',
    params,
    milestonesResponseSchema,
    apiFormat
  );

  return {
    report_type: 'milestone-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Milestone report implementation' },
    data: milestonesData,
  };
}

async function generateTimeOffReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const timeOffData = await floatApi.getPaginated(
    '/timeoffs',
    params,
    timeOffResponseSchema,
    apiFormat
  );

  return {
    report_type: 'timeoff-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Time off report implementation' },
    data: timeOffData,
  };
}

async function generateTeamPerformanceReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const peopleData = await floatApi.getPaginated(
    '/people',
    params,
    peopleResponseSchema,
    apiFormat
  );

  return {
    report_type: 'team-performance-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Team performance report implementation' },
    data: peopleData,
  };
}

async function generateResourceAllocationReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const allocationsData = await floatApi.getPaginated(
    '/tasks',
    params,
    allocationsResponseSchema,
    apiFormat
  );

  return {
    report_type: 'resource-allocation-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Resource allocation report implementation' },
    data: allocationsData,
  };
}

async function generateProjectTimelineReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const projectsData = await floatApi.getPaginated(
    '/projects',
    params,
    projectsResponseSchema,
    apiFormat
  );
  const phasesData = await floatApi.getPaginated(
    '/phases',
    params,
    phasesResponseSchema,
    apiFormat
  );

  return {
    report_type: 'project-timeline-report',
    generated_at: new Date().toISOString(),
    summary: { message: 'Project timeline report implementation' },
    data: { projects: projectsData, phases: phasesData },
  };
}

async function generateBillableAnalysisReport(
  params: ReportParams,
  format: ReportFormat
): Promise<Record<string, unknown>> {
  // API only supports json/xml, so use json for data fetching
  const apiFormat = (format === 'csv' ? 'json' : format) as ResponseFormat;
  const loggedTimeData = await floatApi.getPaginated(
    '/logged-time',
    params,
    loggedTimeResponseSchema,
    apiFormat
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
