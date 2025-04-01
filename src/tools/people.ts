import { z } from 'zod';
import { createTool } from './base.js';
import { floatApi } from '../services/float-api.js';
import { personSchema, peopleResponseSchema, Person } from '../types/float.js';

// List people
export const listPeople = createTool(
  'list-people',
  z.object({
    status: z.string().optional(),
    department: z.string().optional(),
  }),
  async (params) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);

    const response = await floatApi.get(
      `/people?${queryParams.toString()}`,
      peopleResponseSchema
    );
    return response.people;
  }
);

// Get person details
export const getPerson = createTool(
  'get-person',
  z.object({
    id: z.string(),
  }),
  async (params) => {
    const person = await floatApi.get(`/people/${params.id}`, personSchema);
    return person;
  }
);

// Create person
export const createPerson = createTool(
  'create-person',
  z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
    department: z.string().optional(),
    hourly_rate: z.number().optional(),
  }),
  async (params) => {
    const person = await floatApi.post('/people', params, personSchema);
    return person;
  }
);

// Update person
export const updatePerson = createTool(
  'update-person',
  z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    department: z.string().optional(),
    hourly_rate: z.number().optional(),
    status: z.string().optional(),
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
  z.object({
    id: z.string(),
  }),
  async (params) => {
    await floatApi.delete(`/people/${params.id}`);
    return { success: true };
  }
); 