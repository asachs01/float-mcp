import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { personSchema, peopleResponseSchema } from '../../types/float.js';

// List people
export const listPeople = createTool(
  'list-people',
  'Retrieve a paginated list of all team members with advanced filtering options. Use for team management, resource planning, and organizational oversight. Supports filtering by department, role, and active status.',
  withFormatParam(
    z.object({
      status: z.string().optional().describe('Filter by person status'),
      department: z.string().optional().describe('Filter by department'),
      active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
      page: z.number().optional().describe('Page number for pagination'),
      'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    })
  ),
  async (params) => {
    const { format, ...apiParams } = params;
    const response = await floatApi.getPaginated(
      '/people',
      apiParams,
      peopleResponseSchema,
      format
    );
    return response;
  }
);

// Get person details
export const getPerson = createTool(
  'get-person',
  'Get comprehensive details about a specific team member including role, department, skills, contact information, and employment details. Essential for team management and resource allocation.',
  withFormatParam(
    z.object({
      people_id: z.union([z.string(), z.number()]).describe('The person ID (people_id)'),
    })
  ),
  async (params) => {
    const { format, people_id } = params;
    const person = await floatApi.get(`/people/${people_id}`, personSchema, format);
    return person;
  }
);

// Create person
export const createPerson = createTool(
  'create-person',
  'Create a new person',
  z.object({
    name: z.string().describe('Person name'),
    email: z.string().email().optional().describe('Email address'),
    job_title: z.string().optional().describe('Job title'),
    department_id: z.number().optional().describe('Department ID'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate'),
    employee_type: z.number().optional().describe('Employee type (1=full-time, 0=part-time)'),
    people_type_id: z
      .number()
      .optional()
      .describe('People type (1=employee, 2=contractor, 3=placeholder)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
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
    people_id: z.union([z.string(), z.number()]).describe('The person ID (people_id)'),
    name: z.string().optional().describe('Person name'),
    email: z.string().email().optional().describe('Email address'),
    job_title: z.string().optional().describe('Job title'),
    department_id: z.number().optional().describe('Department ID'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate'),
    employee_type: z.number().optional().describe('Employee type (1=full-time, 0=part-time)'),
    people_type_id: z
      .number()
      .optional()
      .describe('People type (1=employee, 2=contractor, 3=placeholder)'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
  }),
  async (params) => {
    const { people_id, ...updateData } = params;
    const person = await floatApi.patch(`/people/${people_id}`, updateData, personSchema);
    return person;
  }
);

// Delete person
export const deletePerson = createTool(
  'delete-person',
  'Delete a person (archives them in Float)',
  z.object({
    people_id: z.union([z.string(), z.number()]).describe('The person ID (people_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/people/${params.people_id}`);
    return { success: true, message: 'Person archived successfully' };
  }
);
