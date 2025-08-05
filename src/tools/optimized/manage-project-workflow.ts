import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import {
  phaseSchema,
  phasesResponseSchema,
  milestoneSchema,
  milestonesResponseSchema,
  projectTaskSchema,
  projectTasksResponseSchema,
  allocationSchema,
  allocationsResponseSchema,
} from '../../types/float.js';

// Workflow entity types enum for decision tree routing
const workflowEntityTypeSchema = z.enum(['phases', 'milestones', 'project-tasks', 'allocations']);

// Workflow operation types enum for decision tree routing
const workflowOperationTypeSchema = z.enum([
  'list',
  'get',
  'create',
  'update',
  'delete',
  // Phase-specific operations
  'list-phases-by-project',
  'get-phases-by-date-range',
  'get-active-phases',
  'get-phase-schedule',
  // Milestone-specific operations
  'get-project-milestones',
  'get-upcoming-milestones',
  'get-overdue-milestones',
  'complete-milestone',
  'get-milestone-reminders',
  // Project task-specific operations
  'get-project-tasks-by-project',
  'get-project-tasks-by-phase',
  'bulk-create-project-tasks',
  'reorder-project-tasks',
  'archive-project-task',
  'get-project-task-dependencies',
]);

// Base parameters for workflow operations
const workflowBaseParamsSchema = z.object({
  entity_type: workflowEntityTypeSchema.describe(
    'The type of workflow entity (phases, milestones, project-tasks, allocations)'
  ),
  operation: workflowOperationTypeSchema.describe('The workflow operation to perform'),
});

// Generic list/filter parameters
const workflowListParamsSchema = z
  .object({
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    phase_id: z.union([z.string(), z.number()]).optional().describe('Filter by phase ID'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    start_date: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    status: z.union([z.string(), z.number()]).optional().describe('Filter by status'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    billable: z
      .number()
      .optional()
      .describe('Filter by billable status (0=non-billable, 1=billable)'),
    priority: z.number().optional().describe('Filter by priority level'),
    completed: z
      .number()
      .optional()
      .describe('Filter by completion status (0=incomplete, 1=complete)'),
  })
  .partial();

// Generic get parameters
const workflowGetParamsSchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .describe(
        'The entity ID (phase_id, milestone_id, project_task_id, or task_id for allocations)'
      ),
  })
  .partial();

// Create/update data schema for workflow entities
const workflowCreateUpdateDataSchema = z
  .object({
    // Common fields
    name: z.string().optional().describe('Name/title of the entity'),
    notes: z.string().optional().describe('Notes or description'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    status: z.number().optional().describe('Status code'),
    active: z.number().optional().describe('Active status (0=archived, 1=active)'),

    // Phase-specific fields
    non_billable: z.number().optional().describe('Non-billable flag (0=billable, 1=non-billable)'),
    color: z.string().optional().describe('Color (hex code)'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate'),
    budget_total: z.number().optional().describe('Total budget'),

    // Milestone-specific fields
    description: z.string().optional().describe('Milestone description'),
    date: z.string().optional().describe('Milestone date (YYYY-MM-DD)'),
    priority: z.number().optional().describe('Priority level (1-5)'),
    completed: z.number().optional().describe('Completion status (0=incomplete, 1=complete)'),
    completed_date: z.string().optional().describe('Completion date'),
    reminder_date: z.string().optional().describe('Reminder date'),
    reminder_sent: z.number().optional().describe('Reminder sent flag (0=not sent, 1=sent)'),
    created_by: z.number().optional().describe('User ID who created the milestone'),
    modified_by: z.number().optional().describe('User ID who last modified'),

    // Project task-specific fields
    task_names: z.string().optional().describe('Task name/title'),
    budget: z.number().optional().describe('Task budget'),
    budget_type: z.number().optional().describe('Budget type'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    sort_order: z.number().optional().describe('Sort order'),
    dependencies: z.array(z.number()).optional().describe('Task dependencies'),
    estimated_hours: z.number().optional().describe('Estimated hours'),

    // Allocation-specific fields
    hours: z.number().optional().describe('Allocated hours'),
    task_type: z.number().optional().describe('Task type'),
    repeat_state: z.number().optional().describe('Repeat state'),
    repeat_end: z.string().optional().describe('Repeat end date'),

    // Bulk operations
    project_tasks: z
      .array(
        z.object({
          task_names: z.string(),
          phase_id: z.number().optional(),
          notes: z.string().optional(),
          budget: z.number().optional(),
          budget_type: z.number().optional(),
          color: z.string().optional(),
          billable: z.number().optional(),
          priority: z.number().optional(),
          estimated_hours: z.number().optional(),
        })
      )
      .optional()
      .describe('Array of project tasks for bulk creation'),

    // Reorder operations
    task_order: z
      .array(
        z.object({
          project_task_id: z.number(),
          sort_order: z.number(),
        })
      )
      .optional()
      .describe('Array of task IDs with new sort orders'),
  })
  .partial();

// Main schema combining all parameters
const manageProjectWorkflowSchema = withFormatParam(
  workflowBaseParamsSchema.extend({
    ...workflowListParamsSchema.shape,
    ...workflowGetParamsSchema.shape,
    ...workflowCreateUpdateDataSchema.shape,
  })
);

export const manageProjectWorkflow = createTool(
  'manage-project-workflow',
  'Consolidated tool for managing project workflow entities (phases, milestones, project-tasks, allocations). Handles all project-specific operations including scheduling, task management, and resource allocation through a decision-tree approach.',
  manageProjectWorkflowSchema,
  async (params) => {
    const { format, entity_type, operation, id, ...restParams } = params;

    // Route based on entity type and operation
    switch (entity_type) {
      case 'phases':
        return handlePhaseOperations(operation, { id, ...restParams }, format);
      case 'milestones':
        return handleMilestoneOperations(operation, { id, ...restParams }, format);
      case 'project-tasks':
        return handleProjectTaskOperations(operation, { id, ...restParams }, format);
      case 'allocations':
        return handleAllocationOperations(operation, { id, ...restParams }, format);
      default:
        throw new Error(`Unsupported workflow entity type: ${entity_type}`);
    }
  }
);

// Define proper parameter types based on our schemas
type WorkflowParams = z.infer<typeof workflowListParamsSchema> &
  z.infer<typeof workflowGetParamsSchema> &
  z.infer<typeof workflowCreateUpdateDataSchema>;
type WorkflowFormat = 'json' | 'xml';

// Phase operations handler
async function handlePhaseOperations(
  operation: string,
  params: WorkflowParams,
  format: WorkflowFormat
): Promise<unknown> {
  const { id, project_id, start_date, end_date, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/phases', otherParams, phasesResponseSchema, format);
    case 'get':
      return floatApi.get(`/phases/${id}`, phaseSchema, format);
    case 'create':
      return floatApi.post('/phases', otherParams, phaseSchema, format);
    case 'update':
      return floatApi.patch(`/phases/${id}`, otherParams, phaseSchema, format);
    case 'delete':
      await floatApi.delete(`/phases/${id}`, undefined, format);
      return { success: true, message: 'Phase deleted successfully' };
    case 'list-phases-by-project':
      return floatApi.getPaginated('/phases', { project_id }, phasesResponseSchema, format);
    case 'get-phases-by-date-range':
      return floatApi.getPaginated(
        '/phases',
        { start_date, end_date },
        phasesResponseSchema,
        format
      );
    case 'get-active-phases':
      return floatApi.getPaginated('/phases', { active: 1 }, phasesResponseSchema, format);
    case 'get-phase-schedule': {
      const phases = await floatApi.getPaginated(
        '/phases',
        { project_id },
        phasesResponseSchema,
        format
      );
      // Sort by start date to create schedule view
      return phases.sort((a, b) => {
        const dateA = new Date(a.start_date || '').getTime();
        const dateB = new Date(b.start_date || '').getTime();
        return dateA - dateB;
      });
    }
    default:
      throw new Error(`Unsupported phase operation: ${operation}`);
  }
}

// Milestone operations handler
async function handleMilestoneOperations(
  operation: string,
  params: WorkflowParams,
  format: WorkflowFormat
): Promise<unknown> {
  const { id, project_id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/milestones', otherParams, milestonesResponseSchema, format);
    case 'get':
      return floatApi.get(`/milestones/${id}`, milestoneSchema, format);
    case 'create':
      return floatApi.post('/milestones', otherParams, milestoneSchema, format);
    case 'update':
      return floatApi.patch(`/milestones/${id}`, otherParams, milestoneSchema, format);
    case 'delete':
      await floatApi.delete(`/milestones/${id}`, undefined, format);
      return { success: true, message: 'Milestone deleted successfully' };
    case 'get-project-milestones':
      return floatApi.getPaginated('/milestones', { project_id }, milestonesResponseSchema, format);
    case 'get-upcoming-milestones': {
      const today = new Date().toISOString().split('T')[0];
      const upcomingMilestones = await floatApi.getPaginated(
        '/milestones',
        {
          date_from: today,
          completed: 0,
        },
        milestonesResponseSchema,
        format
      );
      return upcomingMilestones.sort((a, b) => {
        const dateA = new Date(a.date || a.start_date || '').getTime();
        const dateB = new Date(b.date || b.start_date || '').getTime();
        return dateA - dateB;
      });
    }
    case 'get-overdue-milestones': {
      const currentDate = new Date().toISOString().split('T')[0];
      const overdueMilestones = await floatApi.getPaginated(
        '/milestones',
        {
          date_to: currentDate,
          completed: 0,
        },
        milestonesResponseSchema,
        format
      );
      return overdueMilestones.filter((m) => {
        const milestoneDate = new Date(m.date || m.end_date || '');
        return milestoneDate < new Date();
      });
    }
    case 'complete-milestone': {
      const completedDate = new Date().toISOString().split('T')[0];
      return floatApi.patch(
        `/milestones/${id}`,
        {
          completed: 1,
          completed_date: completedDate,
        },
        milestoneSchema,
        format
      );
    }
    case 'get-milestone-reminders':
      return floatApi.getPaginated(
        '/milestones',
        {
          reminder_sent: 0,
          ...otherParams,
        },
        milestonesResponseSchema,
        format
      );
    default:
      throw new Error(`Unsupported milestone operation: ${operation}`);
  }
}

// Project task operations handler
async function handleProjectTaskOperations(
  operation: string,
  params: WorkflowParams,
  format: WorkflowFormat
): Promise<unknown> {
  const { id, project_id, phase_id, project_tasks, task_order, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated(
        '/project_tasks',
        otherParams,
        projectTasksResponseSchema,
        format
      );
    case 'get':
      return floatApi.get(`/project_tasks/${id}`, projectTaskSchema, format);
    case 'create':
      return floatApi.post('/project_tasks', otherParams, projectTaskSchema, format);
    case 'update':
      return floatApi.patch(`/project_tasks/${id}`, otherParams, projectTaskSchema, format);
    case 'delete':
      await floatApi.delete(`/project_tasks/${id}`, undefined, format);
      return { success: true, message: 'Project task deleted successfully' };
    case 'get-project-tasks-by-project':
      return floatApi.getPaginated(
        '/project_tasks',
        { project_id },
        projectTasksResponseSchema,
        format
      );
    case 'get-project-tasks-by-phase':
      return floatApi.getPaginated(
        '/project_tasks',
        { phase_id },
        projectTasksResponseSchema,
        format
      );
    case 'bulk-create-project-tasks': {
      const results = [];
      const errors = [];
      const tasks = project_tasks || [];

      for (let index = 0; index < tasks.length; index++) {
        const taskData = { ...tasks[index], project_id };
        try {
          const result = await floatApi.post('/project_tasks', taskData, projectTaskSchema, format);
          results.push({ index, success: true, data: result });
        } catch (error) {
          errors.push({
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            task: taskData,
          });
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors,
        summary: {
          total: tasks.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    }
    case 'reorder-project-tasks': {
      const reorderResults = [];
      const reorderErrors = [];
      const orderUpdates = task_order || [];

      for (let index = 0; index < orderUpdates.length; index++) {
        const { project_task_id, sort_order } = orderUpdates[index];
        try {
          const result = await floatApi.patch(
            `/project_tasks/${project_task_id}`,
            { sort_order },
            projectTaskSchema,
            format
          );
          reorderResults.push({ index, success: true, data: result });
        } catch (error) {
          reorderErrors.push({
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            task_id: project_task_id,
          });
        }
      }

      return {
        success: reorderErrors.length === 0,
        results: reorderResults,
        errors: reorderErrors,
        summary: {
          total: orderUpdates.length,
          successful: reorderResults.length,
          failed: reorderErrors.length,
        },
      };
    }
    case 'archive-project-task':
      return floatApi.patch(`/project_tasks/${id}`, { active: 0 }, projectTaskSchema, format);
    case 'get-project-task-dependencies': {
      const task = await floatApi.get(`/project_tasks/${id}`, projectTaskSchema, format);
      const dependencies = task.dependencies || [];

      if (dependencies.length === 0) {
        return { dependencies: [], dependency_details: [] };
      }

      // Fetch details of dependency tasks
      const dependencyDetails = [];
      for (const depId of dependencies) {
        try {
          const depTask = await floatApi.get(`/project_tasks/${depId}`, projectTaskSchema, format);
          dependencyDetails.push(depTask);
        } catch (error) {
          // Skip if dependency task not found
          continue;
        }
      }

      return {
        dependencies,
        dependency_details: dependencyDetails,
      };
    }
    default:
      throw new Error(`Unsupported project task operation: ${operation}`);
  }
}

// Allocation operations handler
async function handleAllocationOperations(
  operation: string,
  params: WorkflowParams,
  format: WorkflowFormat
): Promise<unknown> {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/tasks', otherParams, allocationsResponseSchema, format);
    case 'get':
      return floatApi.get(`/tasks/${id}`, allocationSchema, format);
    case 'create':
      return floatApi.post('/tasks', otherParams, allocationSchema, format);
    case 'update':
      return floatApi.patch(`/tasks/${id}`, otherParams, allocationSchema, format);
    case 'delete':
      await floatApi.delete(`/tasks/${id}`, undefined, format);
      return { success: true, message: 'Allocation deleted successfully' };
    default:
      throw new Error(`Unsupported allocation operation: ${operation}`);
  }
}
