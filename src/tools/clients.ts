import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { clientSchema, clientsResponseSchema } from '../types/float.js';

// List clients
export const listClients = createTool(
  'list-clients',
  'List all clients',
  z.object({}),
  async () => {
    const response = await floatApi.get('/clients', clientsResponseSchema);
    return response.clients;
  }
);

// Get client details
export const getClient = createTool(
  'get-client',
  'Get detailed information about a specific client',
  z.object({
    id: z.string().describe('The client ID'),
  }),
  async (params) => {
    const client = await floatApi.get(`/clients/${params.id}`, clientSchema);
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
    id: z.string().describe('The client ID'),
    name: z.string().optional().describe('Client name'),
    notes: z.string().optional().describe('Client notes'),
  }),
  async (params) => {
    const { id, ...updateData } = params;
    const client = await floatApi.put(`/clients/${id}`, updateData, clientSchema);
    return client;
  }
);

// Delete client
export const deleteClient = createTool(
  'delete-client',
  'Delete a client',
  z.object({
    id: z.string().describe('The client ID'),
  }),
  async (params) => {
    await floatApi.delete(`/clients/${params.id}`);
    return { success: true };
  }
);
