import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { timeOffTypeSchema, timeOffTypesResponseSchema } from '../../types/float.js';

// List time off types
export const listTimeOffTypes = createTool(
  'list-time-off-types',
  'List all time off types with optional filtering by active status',
  z.object({
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/timeoff-types',
      params,
      timeOffTypesResponseSchema
    );
    return response;
  }
);

// Get time off type details
export const getTimeOffType = createTool(
  'get-time-off-type',
  'Get detailed information about a specific time off type',
  z.object({
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .describe('The time off type ID (timeoff_type_id)'),
  }),
  async (params) => {
    const timeOffType = await floatApi.get(
      `/timeoff-types/${params.timeoff_type_id}`,
      timeOffTypeSchema
    );
    return timeOffType;
  }
);

// Create time off type
export const createTimeOffType = createTool(
  'create-time-off-type',
  'Create a new time off type (e.g., vacation, sick leave, personal time)',
  z.object({
    name: z
      .string()
      .describe('Time off type name (e.g., "Vacation", "Sick Leave", "Personal Time")'),
    active: z.number().optional().describe('Active status (1=active, 0=archived) - defaults to 1'),
    is_default: z
      .number()
      .optional()
      .describe('Default status (1=default, 0=not default) - defaults to 0'),
    color: z.string().optional().describe('Hex color code for UI display (e.g., "#FF5733")'),
  }),
  async (params) => {
    // Set default values for active and is_default if not provided
    const createData = {
      ...params,
      active: params.active ?? 1,
      is_default: params.is_default ?? 0,
    };

    const timeOffType = await floatApi.post('/timeoff-types', createData, timeOffTypeSchema);
    return timeOffType;
  }
);

// Update time off type
export const updateTimeOffType = createTool(
  'update-time-off-type',
  'Update an existing time off type',
  z.object({
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .describe('The time off type ID (timeoff_type_id)'),
    name: z.string().optional().describe('Time off type name'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
    is_default: z.number().optional().describe('Default status (1=default, 0=not default)'),
    color: z.string().optional().describe('Hex color code for UI display'),
  }),
  async (params) => {
    const { timeoff_type_id, ...updateData } = params;

    // Validate that only one time off type can be default at a time
    if (updateData.is_default === 1) {
      // Note: This is a business logic constraint that should be handled by the Float API
      // but we're documenting it here for clarity
      console.warn(
        'Setting time off type as default. Float API will handle ensuring only one default exists.'
      );
    }

    const timeOffType = await floatApi.patch(
      `/timeoff-types/${timeoff_type_id}`,
      updateData,
      timeOffTypeSchema
    );
    return timeOffType;
  }
);

// Delete time off type
export const deleteTimeOffType = createTool(
  'delete-time-off-type',
  'Delete a time off type (archives it in Float). Cannot delete if time off entries exist for this type.',
  z.object({
    timeoff_type_id: z
      .union([z.string(), z.number()])
      .describe('The time off type ID (timeoff_type_id)'),
  }),
  async (params) => {
    try {
      await floatApi.delete(`/timeoff-types/${params.timeoff_type_id}`);
      return {
        success: true,
        message: 'Time off type deleted successfully',
        note: 'Time off type has been archived and can no longer be used for new time off entries',
      };
    } catch (error) {
      // Handle common deletion errors
      if (error instanceof Error && error.message.includes('cannot be deleted')) {
        return {
          success: false,
          error:
            'Cannot delete time off type - it may have existing time off entries or be a default type',
          suggestion:
            'Consider archiving the time off type by setting active=0 instead of deleting',
        };
      }
      throw error;
    }
  }
);
