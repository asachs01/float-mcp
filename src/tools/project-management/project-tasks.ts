import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { projectTaskSchema, projectTasksResponseSchema } from '../../types/float.js';

// List project tasks
export const listProjectTasks = createTool(
  'list-project-tasks',
  'List all project tasks with optional filtering by project, phase, or status',
  z.object({
    project_id: z.number().optional().describe('Filter by project ID'),
    phase_id: z.number().optional().describe('Filter by phase ID'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    billable: z
      .number()
      .optional()
      .describe('Filter by billable status (0=non-billable, 1=billable)'),
    status: z.number().optional().describe('Filter by task status (numeric)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/project_tasks',
      params,
      projectTasksResponseSchema
    );
    return response;
  }
);

// Get project task details
export const getProjectTask = createTool(
  'get-project-task',
  'Get detailed information about a specific project task',
  z.object({
    project_task_id: z.union([z.string(), z.number()]).describe('The project task ID'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  }),
  async (params) => {
    const url = params.fields
      ? `/project_tasks/${params.project_task_id}?fields=${params.fields}`
      : `/project_tasks/${params.project_task_id}`;
    const projectTask = await floatApi.get(url, projectTaskSchema);
    return projectTask;
  }
);

// Create project task
export const createProjectTask = createTool(
  'create-project-task',
  'Create a new project task',
  z.object({
    project_id: z.number().describe('Project ID'),
    task_names: z.string().describe('Task name/title'),
    phase_id: z.number().optional().describe('Phase ID (if assigning to a specific phase)'),
    notes: z.string().optional().describe('Task notes'),
    budget: z.number().optional().describe('Task budget (if setting budget at task level)'),
    budget_type: z.number().optional().describe('Budget type (1=hours, 2=amount, etc.)'),
    color: z.string().optional().describe('Task color (hex code)'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
    priority: z.number().optional().describe('Task priority (1=low, 2=medium, 3=high, etc.)'),
    sort_order: z.number().optional().describe('Sort order within project'),
    dependencies: z
      .array(z.number())
      .optional()
      .describe('Array of project task IDs this task depends on'),
    estimated_hours: z.number().optional().describe('Estimated hours for completion'),
    status: z.number().optional().describe('Task status (numeric)'),
  }),
  async (params) => {
    const projectTask = await floatApi.post('/project_tasks', params, projectTaskSchema);
    return projectTask;
  }
);

// Update project task
export const updateProjectTask = createTool(
  'update-project-task',
  'Update an existing project task',
  z.object({
    project_task_id: z.union([z.string(), z.number()]).describe('The project task ID'),
    task_names: z.string().optional().describe('Task name/title'),
    project_id: z.number().optional().describe('Project ID'),
    phase_id: z.number().optional().describe('Phase ID'),
    notes: z.string().optional().describe('Task notes'),
    budget: z.number().optional().describe('Task budget'),
    budget_type: z.number().optional().describe('Budget type'),
    color: z.string().optional().describe('Task color (hex code)'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
    priority: z.number().optional().describe('Task priority'),
    sort_order: z.number().optional().describe('Sort order within project'),
    dependencies: z
      .array(z.number())
      .optional()
      .describe('Array of project task IDs this task depends on'),
    estimated_hours: z.number().optional().describe('Estimated hours for completion'),
    status: z.number().optional().describe('Task status (numeric)'),
  }),
  async (params) => {
    const { project_task_id, ...updateData } = params;
    const projectTask = await floatApi.patch(
      `/project_tasks/${project_task_id}`,
      updateData,
      projectTaskSchema
    );
    return projectTask;
  }
);

// Delete project task
export const deleteProjectTask = createTool(
  'delete-project-task',
  'Delete a project task (archives it in Float)',
  z.object({
    project_task_id: z.union([z.string(), z.number()]).describe('The project task ID'),
  }),
  async (params) => {
    await floatApi.delete(`/project_tasks/${params.project_task_id}`);
    return { success: true, message: 'Project task deleted successfully' };
  }
);

// Additional utility tools for project task management

// Get project tasks by project
export const getProjectTasksByProject = createTool(
  'get-project-tasks-by-project',
  'Get all project tasks for a specific project',
  z.object({
    project_id: z.number().describe('Project ID'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    include_phases: z.boolean().optional().describe('Include phase information'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  }),
  async (params) => {
    const queryParams = {
      project_id: params.project_id,
      ...(params.active !== undefined && { active: params.active }),
      ...(params.fields && { fields: params.fields }),
    };

    const response = await floatApi.getPaginated(
      '/project_tasks',
      queryParams,
      projectTasksResponseSchema
    );
    return response;
  }
);

// Get project tasks by phase
export const getProjectTasksByPhase = createTool(
  'get-project-tasks-by-phase',
  'Get all project tasks for a specific project phase',
  z.object({
    phase_id: z.number().describe('Phase ID'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
  }),
  async (params) => {
    const queryParams = {
      phase_id: params.phase_id,
      ...(params.active !== undefined && { active: params.active }),
      ...(params.fields && { fields: params.fields }),
    };

    const response = await floatApi.getPaginated(
      '/project_tasks',
      queryParams,
      projectTasksResponseSchema
    );
    return response;
  }
);

// Bulk create project tasks
export const bulkCreateProjectTasks = createTool(
  'bulk-create-project-tasks',
  'Create multiple project tasks at once',
  z.object({
    project_id: z.number().describe('Project ID'),
    tasks: z
      .array(
        z.object({
          task_names: z.string().describe('Task name/title'),
          phase_id: z.number().optional().describe('Phase ID (if assigning to a specific phase)'),
          notes: z.string().optional().describe('Task notes'),
          budget: z.number().optional().describe('Task budget'),
          color: z.string().optional().describe('Task color (hex code)'),
          billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
          priority: z.number().optional().describe('Task priority'),
          sort_order: z.number().optional().describe('Sort order within project'),
          estimated_hours: z.number().optional().describe('Estimated hours for completion'),
        })
      )
      .describe('Array of tasks to create'),
  }),
  async (params) => {
    const results = [];
    for (const task of params.tasks) {
      try {
        const projectTask = await floatApi.post(
          '/project_tasks',
          {
            project_id: params.project_id,
            ...task,
          },
          projectTaskSchema
        );
        results.push({ success: true, data: projectTask });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          task: task.task_names,
        });
      }
    }
    return {
      results,
      summary: { total: params.tasks.length, successful: results.filter((r) => r.success).length },
    };
  }
);

// Reorder project tasks
export const reorderProjectTasks = createTool(
  'reorder-project-tasks',
  'Reorder project tasks by updating their sort_order',
  z.object({
    project_id: z.number().describe('Project ID'),
    task_order: z
      .array(
        z.object({
          project_task_id: z.number().describe('Project task ID'),
          sort_order: z.number().describe('New sort order'),
        })
      )
      .describe('Array of task IDs with their new sort order'),
  }),
  async (params) => {
    const results = [];
    for (const taskOrder of params.task_order) {
      try {
        const projectTask = await floatApi.patch(
          `/project_tasks/${taskOrder.project_task_id}`,
          { sort_order: taskOrder.sort_order },
          projectTaskSchema
        );
        results.push({ success: true, data: projectTask });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          project_task_id: taskOrder.project_task_id,
        });
      }
    }
    return {
      results,
      summary: {
        total: params.task_order.length,
        successful: results.filter((r) => r.success).length,
      },
    };
  }
);

// Archive/Unarchive project task
export const archiveProjectTask = createTool(
  'archive-project-task',
  'Archive or unarchive a project task',
  z.object({
    project_task_id: z.union([z.string(), z.number()]).describe('The project task ID'),
    archive: z.boolean().describe('True to archive, false to unarchive'),
  }),
  async (params) => {
    const projectTask = await floatApi.patch(
      `/project_tasks/${params.project_task_id}`,
      { active: params.archive ? 0 : 1 },
      projectTaskSchema
    );
    return {
      success: true,
      data: projectTask,
      message: `Project task ${params.archive ? 'archived' : 'unarchived'} successfully`,
    };
  }
);

// Get project task dependencies
export const getProjectTaskDependencies = createTool(
  'get-project-task-dependencies',
  'Get dependency information for project tasks',
  z.object({
    project_id: z.number().describe('Project ID'),
    project_task_id: z
      .number()
      .optional()
      .describe('Specific project task ID (if checking dependencies for one task)'),
  }),
  async (params) => {
    const queryParams = {
      project_id: params.project_id,
      fields: 'project_task_id,task_names,dependencies',
    };

    const response = await floatApi.getPaginated(
      '/project_tasks',
      queryParams,
      projectTasksResponseSchema
    );

    if (params.project_task_id) {
      const specificTask = response.find(
        (task: any) => task.project_task_id === params.project_task_id
      );
      return {
        task: specificTask,
        dependencies: specificTask?.dependencies || [],
        dependents: response.filter((task: any) =>
          task.dependencies?.includes(params.project_task_id)
        ),
      };
    }

    return {
      tasks: response,
      dependency_map: response.reduce((acc: any, task: any) => {
        acc[task.project_task_id] = task.dependencies || [];
        return acc;
      }, {}),
    };
  }
);
