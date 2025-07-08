import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { clientSchema, clientsResponseSchema } from '../../types/float.js';

// List clients
export const listClients = createTool(
  'list-clients',
  'List all clients with optional filtering',
  withFormatParam(
    z.object({
      active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
      page: z.number().optional().describe('Page number for pagination'),
      'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    })
  ),
  async (params) => {
    const { format, ...apiParams } = params;
    const response = await floatApi.getPaginated(
      '/clients',
      apiParams,
      clientsResponseSchema,
      format
    );
    return response;
  }
);

// Get client details
export const getClient = createTool(
  'get-client',
  'Get detailed information about a specific client',
  withFormatParam(
    z.object({
      client_id: z.union([z.string(), z.number()]).describe('The client ID (client_id)'),
    })
  ),
  async (params) => {
    const { format, client_id } = params;
    const client = await floatApi.get(`/clients/${client_id}`, clientSchema, format);
    return client;
  }
);

// Create client
export const createClient = createTool(
  'create-client',
  'Create a new client',
  z.object({
    name: z.string().describe('Client name'),
    notes: z.string().optional().describe('Client notes'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const client = await floatApi.post('/clients', params, clientSchema);
    return client;
  }
);

// Update client
export const updateClient = createTool(
  'update-client',
  'Update an existing client',
  z.object({
    client_id: z.union([z.string(), z.number()]).describe('The client ID (client_id)'),
    name: z.string().optional().describe('Client name'),
    notes: z.string().optional().describe('Client notes'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const { client_id, ...updateData } = params;
    const client = await floatApi.patch(`/clients/${client_id}`, updateData, clientSchema);
    return client;
  }
);

// Delete client
export const deleteClient = createTool(
  'delete-client',
  'Delete a client (archives it in Float)',
  z.object({
    client_id: z.union([z.string(), z.number()]).describe('The client ID (client_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/clients/${params.client_id}`);
    return { success: true, message: 'Client archived successfully' };
  }
);
