import { z } from 'zod';
import { createTool, withFormatParam } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import {
  personSchema,
  peopleResponseSchema,
  projectSchema,
  projectsResponseSchema,
  taskSchema,
  tasksResponseSchema,
  clientSchema,
  clientsResponseSchema,
  departmentSchema,
  statusSchema,
  statusesResponseSchema,
  roleSchema,
  rolesResponseSchema,
  accountSchema,
  accountsResponseSchema,
} from '../../types/float.js';

// Entity types enum for decision tree routing
const entityTypeSchema = z.enum([
  'people',
  'projects',
  'tasks',
  'clients',
  'departments',
  'roles',
  'accounts',
  'statuses',
]);

// Operation types enum for decision tree routing
const operationTypeSchema = z.enum([
  'list',
  'get',
  'create',
  'update',
  'delete',
  // Special operations
  'get-current-account',
  'deactivate-account',
  'reactivate-account',
  'update-account-timezone',
  'set-account-department-filter',
  'bulk-update-account-permissions',
  'manage-account-permissions',
  'get-default-status',
  'set-default-status',
  'get-statuses-by-type',
  'get-roles-by-permission',
  'get-role-permissions',
  'update-role-permissions',
  'get-role-hierarchy',
  'check-role-access',
]);

// Base parameters shared across operations
const baseParamsSchema = z.object({
  entity_type: entityTypeSchema.describe(
    'The type of entity to manage (people, projects, tasks, clients, departments, roles, accounts, statuses)'
  ),
  operation: operationTypeSchema.describe(
    'The operation to perform (list, get, create, update, delete, or specialized operations)'
  ),
});

// Generic list parameters with filtering
const listParamsSchema = z
  .object({
    status: z.union([z.string(), z.number()]).optional().describe('Filter by status'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
    // Entity-specific filters
    department: z.string().optional().describe('Filter by department (for people)'),
    department_id: z.number().optional().describe('Filter by department ID'),
    client_id: z.number().optional().describe('Filter by client ID (for projects)'),
    project_id: z.union([z.string(), z.number()]).optional().describe('Filter by project ID'),
    people_id: z.union([z.string(), z.number()]).optional().describe('Filter by person ID'),
    status_type: z.enum(['project', 'task']).optional().describe('Filter statuses by type'),
    permission: z.string().optional().describe('Filter roles by permission'),
  })
  .partial();

// Generic get parameters
const getParamsSchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .describe(
        'The entity ID (people_id, project_id, task_id, client_id, department_id, role_id, account_id, or status_id)'
      ),
  })
  .partial();

// Generic create/update data schemas
const createUpdateDataSchema = z
  .object({
    // People fields
    name: z.string().optional().describe('Name of the entity'),
    email: z.string().email().optional().describe('Email address'),
    job_title: z.string().optional().describe('Job title'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate'),
    employee_type: z.number().optional().describe('Employee type (1=full-time, 0=part-time)'),
    people_type_id: z
      .number()
      .optional()
      .describe('People type (1=employee, 2=contractor, 3=placeholder)'),

    // Project fields
    start_date: z.string().optional().describe('Start date in YYYY-MM-DD format'),
    end_date: z.string().optional().describe('End date in YYYY-MM-DD format'),
    notes: z.string().optional().describe('Notes or description'),
    budget: z.number().optional().describe('Budget amount'),
    hourly_rate: z.number().optional().describe('Hourly rate'),
    color: z.string().optional().describe('Color (hex code)'),
    non_billable: z.number().optional().describe('Non-billable flag (0=billable, 1=non-billable)'),
    tentative: z.number().optional().describe('Tentative flag (0=confirmed, 1=tentative)'),

    // Task fields
    estimated_hours: z.number().optional().describe('Estimated hours'),
    actual_hours: z.number().optional().describe('Actual hours'),
    priority: z.number().optional().describe('Priority level'),
    billable: z.number().optional().describe('Billable flag (0=non-billable, 1=billable)'),
    task_type: z.number().optional().describe('Task type'),
    repeat_state: z.number().optional().describe('Repeat state'),
    repeat_end: z.string().optional().describe('Repeat end date'),

    // Department fields
    parent_id: z.number().optional().describe('Parent department ID'),

    // Status fields
    status_type: z.enum(['project', 'task']).optional().describe('Type of status'),
    position: z.number().optional().describe('Position for ordering'),
    is_default: z.boolean().optional().describe('Whether this is the default status'),

    // Role fields
    description: z.string().optional().describe('Role description'),
    permissions: z.array(z.string()).optional().describe('Role permissions'),
    level: z.number().optional().describe('Role level'),
    is_system_role: z.number().optional().describe('System role flag (1=system, 0=custom)'),

    // Account fields
    timezone: z.string().optional().describe('Account timezone'),
    avatar: z.string().optional().describe('Avatar URL'),
    account_type: z.number().optional().describe('Account type'),
    access: z.number().optional().describe('Access level'),
    department_filter_id: z.number().optional().describe('Department filter ID'),
    view_rights: z.number().optional().describe('View rights'),
    edit_rights: z.number().optional().describe('Edit rights'),

    // Additional special operation parameters
    permissions_data: z
      .record(z.any())
      .optional()
      .describe('Permissions data for account management'),
    default_status_id: z.number().optional().describe('Default status ID to set'),
    permission_name: z.string().optional().describe('Permission name to check'),
    role_permissions: z.array(z.string()).optional().describe('Role permissions to update'),
  })
  .partial();

// Main schema combining all parameters
const manageEntitySchema = withFormatParam(
  baseParamsSchema.extend({
    ...listParamsSchema.shape,
    ...getParamsSchema.shape,
    ...createUpdateDataSchema.shape,
  })
);

export const manageEntity = createTool(
  'manage-entity',
  'Consolidated tool for managing all core Float entities (people, projects, tasks, clients, departments, roles, accounts, statuses). Supports all CRUD operations and specialized functions through a decision-tree approach. Use entity_type to specify the entity and operation to specify the action.',
  manageEntitySchema,
  async (params) => {
    const { format, entity_type, operation, id, ...restParams } = params;

    // Route based on entity type and operation
    switch (entity_type) {
      case 'people':
        return handlePeopleOperations(operation, { id, ...restParams }, format);
      case 'projects':
        return handleProjectOperations(operation, { id, ...restParams }, format);
      case 'tasks':
        return handleTaskOperations(operation, { id, ...restParams }, format);
      case 'clients':
        return handleClientOperations(operation, { id, ...restParams }, format);
      case 'departments':
        return handleDepartmentOperations(operation, { id, ...restParams }, format);
      case 'roles':
        return handleRoleOperations(operation, { id, ...restParams }, format);
      case 'accounts':
        return handleAccountOperations(operation, { id, ...restParams }, format);
      case 'statuses':
        return handleStatusOperations(operation, { id, ...restParams }, format);
      default:
        throw new Error(`Unsupported entity type: ${entity_type}`);
    }
  }
);

// People operations handler
async function handlePeopleOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/people', otherParams, peopleResponseSchema, format);
    case 'get':
      return floatApi.get(`/people/${id}`, personSchema, format);
    case 'create':
      return floatApi.post('/people', otherParams, personSchema, format);
    case 'update':
      return floatApi.patch(`/people/${id}`, otherParams, personSchema, format);
    case 'delete':
      await floatApi.delete(`/people/${id}`, undefined, format);
      return { success: true, message: 'Person archived successfully' };
    default:
      throw new Error(`Unsupported people operation: ${operation}`);
  }
}

// Project operations handler
async function handleProjectOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/projects', otherParams, projectsResponseSchema, format);
    case 'get':
      return floatApi.get(`/projects/${id}`, projectSchema, format);
    case 'create':
      return floatApi.post('/projects', otherParams, projectSchema, format);
    case 'update':
      return floatApi.patch(`/projects/${id}`, otherParams, projectSchema, format);
    case 'delete':
      await floatApi.delete(`/projects/${id}`, undefined, format);
      return { success: true, message: 'Project archived successfully' };
    default:
      throw new Error(`Unsupported project operation: ${operation}`);
  }
}

// Task operations handler (allocations in Float API)
async function handleTaskOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/tasks', otherParams, tasksResponseSchema, format);
    case 'get':
      return floatApi.get(`/tasks/${id}`, taskSchema, format);
    case 'create':
      return floatApi.post('/tasks', otherParams, taskSchema, format);
    case 'update':
      return floatApi.patch(`/tasks/${id}`, otherParams, taskSchema, format);
    case 'delete':
      await floatApi.delete(`/tasks/${id}`, undefined, format);
      return { success: true, message: 'Task deleted successfully' };
    default:
      throw new Error(`Unsupported task operation: ${operation}`);
  }
}

// Client operations handler
async function handleClientOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/clients', otherParams, clientsResponseSchema, format);
    case 'get':
      return floatApi.get(`/clients/${id}`, clientSchema, format);
    case 'create':
      return floatApi.post('/clients', otherParams, clientSchema, format);
    case 'update':
      return floatApi.patch(`/clients/${id}`, otherParams, clientSchema, format);
    case 'delete':
      await floatApi.delete(`/clients/${id}`, undefined, format);
      return { success: true, message: 'Client archived successfully' };
    default:
      throw new Error(`Unsupported client operation: ${operation}`);
  }
}

// Department operations handler
async function handleDepartmentOperations(operation: string, params: any, format: any) {
  const { id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/departments', otherParams, z.array(departmentSchema), format);
    case 'get':
      return floatApi.get(`/departments/${id}`, departmentSchema, format);
    case 'create':
      return floatApi.post('/departments', otherParams, departmentSchema, format);
    case 'update':
      return floatApi.patch(`/departments/${id}`, otherParams, departmentSchema, format);
    case 'delete':
      await floatApi.delete(`/departments/${id}`, undefined, format);
      return { success: true, message: 'Department deleted successfully' };
    default:
      throw new Error(`Unsupported department operation: ${operation}`);
  }
}

// Role operations handler
async function handleRoleOperations(operation: string, params: any, format: any) {
  const { id, permission, role_permissions, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/roles', otherParams, rolesResponseSchema, format);
    case 'get':
      return floatApi.get(`/roles/${id}`, roleSchema, format);
    case 'create':
      return floatApi.post('/roles', otherParams, roleSchema, format);
    case 'update':
      return floatApi.patch(`/roles/${id}`, otherParams, roleSchema, format);
    case 'delete':
      await floatApi.delete(`/roles/${id}`, undefined, format);
      return { success: true, message: 'Role deleted successfully' };
    case 'get-roles-by-permission':
      return floatApi.getPaginated('/roles', { permission }, rolesResponseSchema, format);
    case 'get-role-permissions': {
      const role = await floatApi.get(`/roles/${id}`, roleSchema, format);
      return { permissions: role.permissions || [] };
    }
    case 'update-role-permissions':
      return floatApi.patch(`/roles/${id}`, { permissions: role_permissions }, roleSchema, format);
    case 'get-role-hierarchy': {
      const roles = await floatApi.getPaginated('/roles', {}, rolesResponseSchema, format);
      return roles.sort((a, b) => (a.level || 0) - (b.level || 0));
    }
    case 'check-role-access': {
      const targetRole = await floatApi.get(`/roles/${id}`, roleSchema, format);
      return {
        has_permission: targetRole.permissions?.includes(permission) || false,
        permissions: targetRole.permissions || [],
      };
    }
    default:
      throw new Error(`Unsupported role operation: ${operation}`);
  }
}

// Account operations handler
async function handleAccountOperations(operation: string, params: any, format: any) {
  const { id, permissions_data, timezone, department_filter_id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/accounts', otherParams, accountsResponseSchema, format);
    case 'get':
      return floatApi.get(`/accounts/${id}`, accountSchema, format);
    case 'create':
      return floatApi.post('/accounts', otherParams, accountSchema, format);
    case 'update':
      return floatApi.patch(`/accounts/${id}`, otherParams, accountSchema, format);
    case 'delete':
      await floatApi.delete(`/accounts/${id}`, undefined, format);
      return { success: true, message: 'Account deleted successfully' };
    case 'get-current-account':
      return floatApi.get('/accounts/current', accountSchema, format);
    case 'deactivate-account':
      return floatApi.patch(`/accounts/${id}`, { active: 0 }, accountSchema, format);
    case 'reactivate-account':
      return floatApi.patch(`/accounts/${id}`, { active: 1 }, accountSchema, format);
    case 'update-account-timezone':
      return floatApi.patch(`/accounts/${id}`, { timezone }, accountSchema, format);
    case 'set-account-department-filter':
      return floatApi.patch(`/accounts/${id}`, { department_filter_id }, accountSchema, format);
    case 'manage-account-permissions':
      return floatApi.patch(`/accounts/${id}`, permissions_data, accountSchema, format);
    case 'bulk-update-account-permissions': {
      // Bulk operation - expects array of account updates
      const results = [];
      const errors = [];
      const accounts = otherParams.accounts || [];

      for (let index = 0; index < accounts.length; index++) {
        const accountUpdate = accounts[index];
        try {
          const result = await floatApi.patch(
            `/accounts/${accountUpdate.account_id}`,
            accountUpdate.permissions,
            accountSchema,
            format
          );
          results.push({ index, success: true, data: result });
        } catch (error) {
          errors.push({
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            account: accountUpdate,
          });
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors,
        summary: {
          total: accounts.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    }
    default:
      throw new Error(`Unsupported account operation: ${operation}`);
  }
}

// Status operations handler
async function handleStatusOperations(operation: string, params: any, format: any) {
  const { id, status_type, default_status_id, ...otherParams } = params;

  switch (operation) {
    case 'list':
      return floatApi.getPaginated('/statuses', otherParams, statusesResponseSchema, format);
    case 'get':
      return floatApi.get(`/statuses/${id}`, statusSchema, format);
    case 'create':
      return floatApi.post('/statuses', otherParams, statusSchema, format);
    case 'update':
      return floatApi.patch(`/statuses/${id}`, otherParams, statusSchema, format);
    case 'delete':
      await floatApi.delete(`/statuses/${id}`, undefined, format);
      return { success: true, message: 'Status deleted successfully' };
    case 'get-default-status': {
      const statuses = await floatApi.getPaginated(
        '/statuses',
        { status_type },
        statusesResponseSchema,
        format
      );
      const defaultStatus = statuses.find((s) => s.is_default);
      return defaultStatus || null;
    }
    case 'set-default-status':
      return floatApi.patch(
        `/statuses/${default_status_id}`,
        { is_default: true },
        statusSchema,
        format
      );
    case 'get-statuses-by-type':
      return floatApi.getPaginated('/statuses', { status_type }, statusesResponseSchema, format);
    default:
      throw new Error(`Unsupported status operation: ${operation}`);
  }
}
