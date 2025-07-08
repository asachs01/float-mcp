import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { personSchema, peopleResponseSchema } from '../types/float.js';

// List people
export const listPeople = createTool(
  'list-people',
  'List all people with optional filtering by status or department',
  z.object({
    status: z.string().optional().describe('Filter by person status'),
    department: z.string().optional().describe('Filter by department'),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);

    const response = await floatApi.get(
      `/people?${queryParams.toString()}`,
      peopleResponseSchema
    );
    return response;
  }
);

// Get person details
export const getPerson = createTool(
  'get-person',
  'Get detailed information about a specific person',
  z.object({
    id: z.string().describe('The person ID'),
  }),
  async (params) => {
    const person = await floatApi.get(`/people/${params.id}`, personSchema);
    return person;
  }
);

// Create person
export const createPerson = createTool(
  'create-person',
  'Create a new person',
  z.object({
    name: z.string().describe('Person name'),
    email: z.string().email().describe('Email address'),
    role: z.string().describe('Role or job title'),
    department: z.string().optional().describe('Department'),
    hourly_rate: z.number().optional().describe('Hourly rate'),
  }),
  async (params) => {
    const person = await floatApi.post('/people', params, personSchema);
    return person;
  }
);

// Update person
export const updatePerson = createTool(
  'update-person',
  'Update an existing person',
  z.object({
    id: z.string().describe('The person ID'),
    name: z.string().optional().describe('Person name'),
    email: z.string().email().optional().describe('Email address'),
    role: z.string().optional().describe('Role or job title'),
    department: z.string().optional().describe('Department'),
    hourly_rate: z.number().optional().describe('Hourly rate'),
    status: z.string().optional().describe('Person status'),
  }),
  async (params) => {
    const { id, ...updateData } = params;
    const person = await floatApi.put(`/people/${id}`, updateData, personSchema);
    return person;
  }
);

// Delete person
export const deletePerson = createTool(
  'delete-person',
  'Delete a person',
  z.object({
    id: z.string().describe('The person ID'),
  }),
  async (params) => {
    await floatApi.delete(`/people/${params.id}`);
    return { success: true };
  }
);
