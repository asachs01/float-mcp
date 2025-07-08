import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { projectSchema, projectsResponseSchema } from '../../types/float.js';

// List projects
export const listProjects = createTool(
  'list-projects',
  'Retrieve a paginated list of all projects with advanced filtering options. Use this for project overview, status tracking, and finding specific projects by client or status. Supports pagination for large project datasets.',
  withFormatParam(
    z.object({
      status: z
        .number()
        .optional()
        .describe('Filter by project status (numeric status ID from status management)'),
      client_id: z
        .number()
        .optional()
        .describe('Filter by client ID to show only projects for a specific client'),
      active: z
        .number()
        .optional()
        .describe('Filter by active status (0=archived/inactive, 1=active)'),
      page: z.number().optional().describe('Page number for pagination (starts from 1)'),
      'per-page': z
        .number()
        .optional()
        .describe('Number of items per page (max 200, default varies by API)'),
    })
  ),
  async (params) => {
    const { format, ...apiParams } = params;
    const response = await floatApi.getPaginated(
      '/projects',
      apiParams,
      projectsResponseSchema,
      format
    );
    return response;
  }
);

// Get project details
export const getProject = createTool(
  'get-project',
  'Get comprehensive details about a specific project including budget, timeline, client information, and project settings. Use this to retrieve complete project information for planning and analysis.',
  withFormatParam(
    z.object({
      project_id: z.union([z.string(), z.number()]).describe('The project ID (project_id)'),
    })
  ),
  async (params) => {
    const { format, project_id } = params;
    const project = await floatApi.get(`/projects/${project_id}`, projectSchema, format);
    return project;
  }
);

// Create project
export const createProject = createTool(
  'create-project',
  'Create a new project with comprehensive settings including budget, timeline, client association, and project configuration. Essential for project initialization and setup.',
  withFormatParam(
    z.object({
      name: z.string().describe('Project name - clear, descriptive project title'),
      client_id: z
        .number()
        .describe('Client ID - must reference existing client from client management'),
      start_date: z.string().describe('Project start date in YYYY-MM-DD format (ISO 8601)'),
      end_date: z
        .string()
        .optional()
        .describe(
          'Project end date in YYYY-MM-DD format (ISO 8601) - optional for ongoing projects'
        ),
      notes: z
        .string()
        .optional()
        .describe('Project notes - detailed description, requirements, or additional context'),
      budget: z
        .number()
        .optional()
        .describe('Project budget - total budget amount in your currency'),
      hourly_rate: z
        .number()
        .optional()
        .describe('Hourly rate - default billing rate for this project'),
      color: z
        .string()
        .optional()
        .describe('Project color - hex color code for visual identification (e.g., #FF5733)'),
      non_billable: z
        .number()
        .optional()
        .describe('Non-billable flag (0=billable project, 1=non-billable/internal project)'),
      tentative: z
        .number()
        .optional()
        .describe('Tentative flag (0=confirmed project, 1=tentative/proposed project)'),
      active: z
        .number()
        .optional()
        .describe('Active status (1=active project, 0=archived project)'),
    })
  ),
  async (params) => {
    const { format, ...projectData } = params;
    const project = await floatApi.post('/projects', projectData, projectSchema, format);
    return project;
  }
);

// Update project
export const updateProject = createTool(
  'update-project',
  'Update an existing project with new information including timeline changes, budget updates, status modifications, and project configuration adjustments.',
  withFormatParam(
    z.object({
      project_id: z.union([z.string(), z.number()]).describe('The project ID (project_id)'),
      name: z.string().optional().describe('Project name'),
      client_id: z.number().optional().describe('Client ID'),
      start_date: z.string().optional().describe('Project start date (YYYY-MM-DD)'),
      end_date: z.string().optional().describe('Project end date (YYYY-MM-DD)'),
      notes: z.string().optional().describe('Project notes'),
      budget: z.number().optional().describe('Project budget'),
      hourly_rate: z.number().optional().describe('Hourly rate'),
      color: z.string().optional().describe('Project color'),
      non_billable: z
        .number()
        .optional()
        .describe('Non-billable flag (0=billable, 1=non-billable)'),
      tentative: z.number().optional().describe('Tentative flag (0=confirmed, 1=tentative)'),
      active: z.number().optional().describe('Active status (1=active, 0=archived)'),
      status: z.number().optional().describe('Project status (numeric)'),
    })
  ),
  async (params) => {
    const { format, project_id, ...updateData } = params;
    const project = await floatApi.patch(
      `/projects/${project_id}`,
      updateData,
      projectSchema,
      format
    );
    return project;
  }
);

// Delete project
export const deleteProject = createTool(
  'delete-project',
  'Delete a project (archives it in Float). This action sets the project status to archived rather than permanently deleting it, preserving historical data and references.',
  withFormatParam(
    z.object({
      project_id: z.union([z.string(), z.number()]).describe('The project ID (project_id)'),
    })
  ),
  async (params) => {
    const { format, project_id } = params;
    await floatApi.delete(`/projects/${project_id}`, undefined, format);
    return { success: true, message: 'Project archived successfully' };
  }
);
