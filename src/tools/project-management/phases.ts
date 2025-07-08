import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { phaseSchema, phasesResponseSchema } from '../../types/float.js';

// List phases with optional filtering
export const listPhases = createTool(
  'list-phases',
  'List all phases with optional filtering by project, status, or date range',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z
      .number()
      .optional()
      .describe('Filter by phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/phases', params, phasesResponseSchema);
    return response;
  }
);

// Get phase details
export const getPhase = createTool(
  'get-phase',
  'Get detailed information about a specific phase',
  z.object({
    phase_id: z.union([z.string(), z.number()]).describe('The phase ID (phase_id)'),
  }),
  async (params) => {
    const phase = await floatApi.get(`/phases/${params.phase_id}`, phaseSchema);
    return phase;
  }
);

// Create phase
export const createPhase = createTool(
  'create-phase',
  'Create a new phase within a project',
  z.object({
    project_id: z.number().describe('The ID of the project this phase belongs to'),
    name: z.string().describe('Phase name'),
    start_date: z.string().describe('Phase start date (YYYY-MM-DD)'),
    end_date: z.string().describe('Phase end date (YYYY-MM-DD)'),
    status: z.number().optional().describe('Phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
    notes: z.string().optional().describe('Phase notes and description'),
    non_billable: z.number().optional().describe('Non-billable flag (0=billable, 1=non-billable)'),
    color: z.string().optional().describe('Phase color (hex code)'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate for this phase'),
    budget_total: z.number().optional().describe('Total budget for this phase'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const phase = await floatApi.post('/phases', params, phaseSchema);
    return phase;
  }
);

// Update phase
export const updatePhase = createTool(
  'update-phase',
  'Update an existing phase',
  z.object({
    phase_id: z.union([z.string(), z.number()]).describe('The phase ID (phase_id)'),
    project_id: z.number().optional().describe('The ID of the project this phase belongs to'),
    name: z.string().optional().describe('Phase name'),
    start_date: z.string().optional().describe('Phase start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Phase end date (YYYY-MM-DD)'),
    status: z.number().optional().describe('Phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
    notes: z.string().optional().describe('Phase notes and description'),
    non_billable: z.number().optional().describe('Non-billable flag (0=billable, 1=non-billable)'),
    color: z.string().optional().describe('Phase color (hex code)'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate for this phase'),
    budget_total: z.number().optional().describe('Total budget for this phase'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const { phase_id, ...updateData } = params;
    const phase = await floatApi.patch(`/phases/${phase_id}`, updateData, phaseSchema);
    return phase;
  }
);

// Delete phase
export const deletePhase = createTool(
  'delete-phase',
  'Delete a phase (archives it in Float)',
  z.object({
    phase_id: z.union([z.string(), z.number()]).describe('The phase ID (phase_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/phases/${params.phase_id}`);
    return { success: true, message: 'Phase archived successfully' };
  }
);

// Additional helper tools for phase management

// List phases by project
export const listPhasesByProject = createTool(
  'list-phases-by-project',
  'List all phases for a specific project',
  z.object({
    project_id: z.number().describe('The project ID to get phases for'),
    status: z
      .number()
      .optional()
      .describe('Filter by phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/phases', params, phasesResponseSchema);
    return response;
  }
);

// Get phases within date range
export const getPhasesByDateRange = createTool(
  'get-phases-by-date-range',
  'Get phases that fall within a specific date range',
  z.object({
    start_date: z.string().describe('Start date for the range (YYYY-MM-DD)'),
    end_date: z.string().describe('End date for the range (YYYY-MM-DD)'),
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z
      .number()
      .optional()
      .describe('Filter by phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/phases', params, phasesResponseSchema);
    return response;
  }
);

// Get active phases
export const getActivePhases = createTool(
  'get-active-phases',
  'Get all active phases, optionally filtered by project',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z
      .number()
      .optional()
      .describe('Filter by phase status (0=Draft, 1=Tentative, 2=Confirmed)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/phases',
      { ...params, active: 1 },
      phasesResponseSchema
    );
    return response;
  }
);

// Get phase dependencies (phases that depend on this phase)
export const getPhaseSchedule = createTool(
  'get-phase-schedule',
  'Get scheduling information for phases including dependencies and timeline',
  z.object({
    project_id: z.number().describe('The project ID to get phase schedule for'),
    include_tasks: z.boolean().optional().describe('Include tasks within phases'),
  }),
  async (params) => {
    // Get all phases for the project
    const phases = await floatApi.getPaginated(
      '/phases',
      { project_id: params.project_id, active: 1 },
      phasesResponseSchema
    );

    // Sort phases by start date
    const sortedPhases = phases.sort((a, b) => {
      const dateA = new Date(a.start_date || '1970-01-01');
      const dateB = new Date(b.start_date || '1970-01-01');
      return dateA.getTime() - dateB.getTime();
    });

    // If tasks are requested, we would need to fetch tasks for each phase
    // This would require additional API calls to /tasks?phase_id=X
    if (params.include_tasks) {
      // Note: This would require the tasks endpoint to support phase_id filtering
      // For now, we'll return phases only with a note about tasks
      return {
        phases: sortedPhases,
        note: 'To include tasks, use the list-tasks tool with phase_id parameter for each phase',
      };
    }

    return {
      phases: sortedPhases,
      total_phases: sortedPhases.length,
      project_timeline: {
        earliest_start: sortedPhases.length > 0 ? sortedPhases[0]?.start_date : null,
        latest_end:
          sortedPhases.length > 0 ? sortedPhases[sortedPhases.length - 1]?.end_date : null,
      },
    };
  }
);
