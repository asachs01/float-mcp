import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { publicHolidaySchema, publicHolidaysResponseSchema } from '../../types/float.js';

// List public holidays
export const listPublicHolidays = createTool(
  'list-public-holidays',
  'List all public holidays with optional filtering by date range, region, and status',
  z.object({
    start_date: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
    region: z.string().optional().describe('Filter by region or country code'),
    country: z.string().optional().describe('Filter by country name'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    moveable: z.number().optional().describe('Filter by moveable status (0=fixed, 1=moveable)'),
    recurring: z
      .number()
      .optional()
      .describe('Filter by recurring status (0=one-time, 1=recurring)'),
    year: z.number().optional().describe('Filter by year'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated(
      '/public-holidays',
      params,
      publicHolidaysResponseSchema
    );
    return response;
  }
);

// Get public holiday details
export const getPublicHoliday = createTool(
  'get-public-holiday',
  'Get detailed information about a specific public holiday',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The public holiday ID'),
  }),
  async (params) => {
    const holiday = await floatApi.get(
      `/public-holidays/${params.holiday_id}`,
      publicHolidaySchema
    );
    return holiday;
  }
);

// Create public holiday
export const createPublicHoliday = createTool(
  'create-public-holiday',
  'Create a new public holiday',
  z.object({
    name: z.string().describe('Holiday name'),
    date: z.string().describe('Holiday date (YYYY-MM-DD)'),
    region: z.string().optional().describe('Region or country code'),
    country: z.string().optional().describe('Country name'),
    type: z.string().optional().describe('Holiday type (bank_holiday, observed, etc.)'),
    moveable: z.number().optional().describe('Moveable status (0=fixed, 1=moveable)'),
    recurring: z.number().optional().describe('Recurring status (0=one-time, 1=recurring)'),
    year: z.number().optional().describe('Year for the holiday'),
    notes: z.string().optional().describe('Additional notes'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const holiday = await floatApi.post('/public-holidays', params, publicHolidaySchema);
    return holiday;
  }
);

// Update public holiday
export const updatePublicHoliday = createTool(
  'update-public-holiday',
  'Update an existing public holiday',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The public holiday ID'),
    name: z.string().optional().describe('Holiday name'),
    date: z.string().optional().describe('Holiday date (YYYY-MM-DD)'),
    region: z.string().optional().describe('Region or country code'),
    country: z.string().optional().describe('Country name'),
    type: z.string().optional().describe('Holiday type (bank_holiday, observed, etc.)'),
    moveable: z.number().optional().describe('Moveable status (0=fixed, 1=moveable)'),
    recurring: z.number().optional().describe('Recurring status (0=one-time, 1=recurring)'),
    year: z.number().optional().describe('Year for the holiday'),
    notes: z.string().optional().describe('Additional notes'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const { holiday_id, ...updateData } = params;
    const holiday = await floatApi.patch(
      `/public-holidays/${holiday_id}`,
      updateData,
      publicHolidaySchema
    );
    return holiday;
  }
);

// Delete public holiday
export const deletePublicHoliday = createTool(
  'delete-public-holiday',
  'Delete a public holiday (archives it in Float)',
  z.object({
    holiday_id: z.union([z.string(), z.number()]).describe('The public holiday ID'),
  }),
  async (params) => {
    await floatApi.delete(`/public-holidays/${params.holiday_id}`);
    return { success: true, message: 'Public holiday deleted successfully' };
  }
);
