import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { statusSchema, statusesResponseSchema } from '../../types/float.js';

// List statuses
export const listStatuses = createTool(
  'list-statuses',
  'List all statuses with optional filtering by status type (project or task)',
  z.object({
    status_type: z
      .enum(['project', 'task'])
      .optional()
      .describe('Filter by status type (project or task)'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/statuses', params, statusesResponseSchema);
    return response;
  }
);

// Get status details
export const getStatus = createTool(
  'get-status',
  'Get detailed information about a specific status',
  z.object({
    status_id: z.union([z.string(), z.number()]).describe('The status ID (status_id)'),
  }),
  async (params) => {
    const status = await floatApi.get(`/statuses/${params.status_id}`, statusSchema);
    return status;
  }
);

// Create status
export const createStatus = createTool(
  'create-status',
  'Create a new status for projects or tasks',
  z.object({
    name: z.string().describe('Status name'),
    status_type: z.enum(['project', 'task']).describe('Type of status (project or task)'),
    color: z.string().optional().describe('Color for status visualization (hex code)'),
    position: z.number().optional().describe('Position for ordering statuses'),
    is_default: z.boolean().optional().describe('Whether this should be the default status'),
    active: z.number().optional().describe('Active status (1=active, 0=inactive)'),
  }),
  async (params) => {
    const status = await floatApi.post('/statuses', params, statusSchema);
    return status;
  }
);

// Update status
export const updateStatus = createTool(
  'update-status',
  'Update an existing status',
  z.object({
    status_id: z.union([z.string(), z.number()]).describe('The status ID (status_id)'),
    name: z.string().optional().describe('Status name'),
    status_type: z
      .enum(['project', 'task'])
      .optional()
      .describe('Type of status (project or task)'),
    color: z.string().optional().describe('Color for status visualization (hex code)'),
    position: z.number().optional().describe('Position for ordering statuses'),
    is_default: z.boolean().optional().describe('Whether this should be the default status'),
    active: z.number().optional().describe('Active status (1=active, 0=inactive)'),
  }),
  async (params) => {
    const { status_id, ...updateData } = params;
    const status = await floatApi.patch(`/statuses/${status_id}`, updateData, statusSchema);
    return status;
  }
);

// Delete status
export const deleteStatus = createTool(
  'delete-status',
  'Delete a status (archives it in Float)',
  z.object({
    status_id: z.union([z.string(), z.number()]).describe('The status ID (status_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/statuses/${params.status_id}`);
    return { success: true, message: 'Status deleted successfully' };
  }
);

// Get default status for a specific type
export const getDefaultStatus = createTool(
  'get-default-status',
  'Get the default status for a specific type (project or task)',
  z.object({
    status_type: z.enum(['project', 'task']).describe('Type of status (project or task)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/statuses',
      {
        status_type: params.status_type,
        is_default: true,
        active: 1,
      },
      statusesResponseSchema
    );

    if (response.length === 0) {
      throw new Error(`No default status found for type: ${params.status_type}`);
    }

    return response[0];
  }
);

// Set default status for a specific type
export const setDefaultStatus = createTool(
  'set-default-status',
  'Set a status as the default for its type',
  z.object({
    status_id: z.union([z.string(), z.number()]).describe('The status ID to set as default'),
    status_type: z.enum(['project', 'task']).describe('Type of status (project or task)'),
  }),
  async (params) => {
    // First, get the current default status to unset it
    try {
      const currentDefault = await getDefaultStatus.handler({
        status_type: params.status_type,
      });

      if (currentDefault.success && currentDefault.data && currentDefault.data.status_id) {
        // Unset the current default
        await floatApi.patch(
          `/statuses/${currentDefault.data.status_id}`,
          {
            is_default: false,
          },
          statusSchema
        );
      }
    } catch (error) {
      // If no current default exists, that's fine
    }

    // Set the new default
    const status = await floatApi.patch(
      `/statuses/${params.status_id}`,
      {
        is_default: true,
      },
      statusSchema
    );

    return status;
  }
);

// Get statuses by type with default status marked
export const getStatusesByType = createTool(
  'get-statuses-by-type',
  'Get all statuses for a specific type with default status information',
  z.object({
    status_type: z.enum(['project', 'task']).describe('Type of status (project or task)'),
    active: z.number().optional().describe('Filter by active status (0=inactive, 1=active)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/statuses',
      {
        status_type: params.status_type,
        active: params.active !== undefined ? params.active : 1, // Default to active only
      },
      statusesResponseSchema
    );

    // Sort by position if available, otherwise by name
    const sortedStatuses = response.sort((a, b) => {
      if (
        a.position !== undefined &&
        a.position !== null &&
        b.position !== undefined &&
        b.position !== null
      ) {
        return a.position - b.position;
      }
      return a.name.localeCompare(b.name);
    });

    return sortedStatuses;
  }
);
