import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { roleSchema, rolesResponseSchema, Role } from '../../types/float.js';

// List roles with optional filtering
export const listRoles = createTool(
  'list-roles',
  'List all roles with optional filtering by status, department, or active status',
  z.object({
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
    department_id: z.number().optional().describe('Filter by department ID'),
    level: z.number().optional().describe('Filter by role level/hierarchy'),
    page: z.number().optional().describe('Page number for pagination'),
    'per-page': z.number().optional().describe('Number of items per page (max 200)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/roles', params, rolesResponseSchema);
    return response;
  }
);

// Get role details
export const getRole = createTool(
  'get-role',
  'Get detailed information about a specific role',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
  }),
  async (params) => {
    const role = await floatApi.get(`/roles/${params.role_id}`, roleSchema);
    return role;
  }
);

// Create role
export const createRole = createTool(
  'create-role',
  'Create a new role with permissions and settings',
  z.object({
    name: z.string().describe('Role name (required)'),
    description: z.string().optional().describe('Role description'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate for this role'),
    permissions: z.array(z.string()).optional().describe('List of permissions for this role'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
    department_id: z.number().optional().describe('Department ID if role is department-specific'),
    level: z.number().optional().describe('Role level/hierarchy'),
    is_system_role: z
      .number()
      .optional()
      .describe('Whether this is a system role (1=system, 0=custom)'),
  }),
  async (params) => {
    const role = await floatApi.post('/roles', params, roleSchema);
    return role;
  }
);

// Update role
export const updateRole = createTool(
  'update-role',
  'Update an existing role with new information or permissions',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
    name: z.string().optional().describe('Role name'),
    description: z.string().optional().describe('Role description'),
    default_hourly_rate: z.string().optional().describe('Default hourly rate for this role'),
    permissions: z.array(z.string()).optional().describe('List of permissions for this role'),
    active: z.number().optional().describe('Active status (1=active, 0=archived)'),
    department_id: z.number().optional().describe('Department ID if role is department-specific'),
    level: z.number().optional().describe('Role level/hierarchy'),
    is_system_role: z
      .number()
      .optional()
      .describe('Whether this is a system role (1=system, 0=custom)'),
  }),
  async (params) => {
    const { role_id, ...updateData } = params;
    const role = await floatApi.patch(`/roles/${role_id}`, updateData, roleSchema);
    return role;
  }
);

// Delete role
export const deleteRole = createTool(
  'delete-role',
  'Delete a role (archives it in Float). Note: Roles assigned to users should be reassigned first.',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
  }),
  async (params) => {
    await floatApi.delete(`/roles/${params.role_id}`);
    return { success: true, message: 'Role deleted successfully' };
  }
);

// Role-based access control helper tools

// Get roles by permission
export const getRolesByPermission = createTool(
  'get-roles-by-permission',
  'Get all roles that have a specific permission',
  z.object({
    permission: z.string().describe('The permission to search for'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
  }),
  async (params) => {
    // First get all roles
    const roles = await floatApi.getPaginated(
      '/roles',
      { active: params.active },
      rolesResponseSchema
    );

    // Filter roles that have the specified permission
    const filteredRoles = roles.filter(
      (role) => role.permissions && role.permissions.includes(params.permission)
    );

    return filteredRoles;
  }
);

// Get role permissions
export const getRolePermissions = createTool(
  'get-role-permissions',
  'Get all permissions for a specific role',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
  }),
  async (params) => {
    const role = await floatApi.get(`/roles/${params.role_id}`, roleSchema);
    return {
      role_id: role.role_id,
      role_name: role.name,
      permissions: role.permissions || [],
      active: role.active,
    };
  }
);

// Update role permissions
export const updateRolePermissions = createTool(
  'update-role-permissions',
  'Update permissions for a specific role',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
    permissions: z.array(z.string()).describe('New list of permissions for this role'),
    replace: z
      .boolean()
      .optional()
      .describe('Whether to replace all permissions (true) or merge with existing (false)'),
  }),
  async (params) => {
    const { role_id, permissions, replace = true } = params;

    let finalPermissions = permissions;

    if (!replace) {
      // Get current permissions and merge
      const currentRole = await floatApi.get(`/roles/${role_id}`, roleSchema);
      const currentPermissions = currentRole.permissions || [];
      // Remove duplicates and merge
      const permissionSet = new Set([...currentPermissions, ...permissions]);
      finalPermissions = Array.from(permissionSet);
    }

    const role = await floatApi.patch(
      `/roles/${role_id}`,
      { permissions: finalPermissions },
      roleSchema
    );
    return role;
  }
);

// Get role hierarchy
export const getRoleHierarchy = createTool(
  'get-role-hierarchy',
  'Get roles organized by hierarchy levels',
  z.object({
    department_id: z.number().optional().describe('Filter by department ID'),
    active: z.number().optional().describe('Filter by active status (0=archived, 1=active)'),
  }),
  async (params) => {
    const roles = await floatApi.getPaginated('/roles', params, rolesResponseSchema);

    // Group roles by level
    const hierarchy = roles.reduce(
      (acc, role) => {
        const level = role.level || 0;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(role);
        return acc;
      },
      {} as Record<number, Role[]>
    );

    return hierarchy;
  }
);

// Check role access
export const checkRoleAccess = createTool(
  'check-role-access',
  'Check if a role has specific permissions (useful for RBAC implementation)',
  z.object({
    role_id: z.union([z.string(), z.number()]).describe('The role ID (role_id)'),
    required_permissions: z.array(z.string()).describe('List of permissions to check for'),
    require_all: z
      .boolean()
      .optional()
      .describe('Whether all permissions are required (true) or just one (false)'),
  }),
  async (params) => {
    const { role_id, required_permissions, require_all = true } = params;

    const role = await floatApi.get(`/roles/${role_id}`, roleSchema);
    const rolePermissions = role.permissions || [];

    let hasAccess: boolean;

    if (require_all) {
      hasAccess = required_permissions.every((perm) => rolePermissions.includes(perm));
    } else {
      hasAccess = required_permissions.some((perm) => rolePermissions.includes(perm));
    }

    return {
      role_id: role.role_id,
      role_name: role.name,
      has_access: hasAccess,
      role_permissions: rolePermissions,
      required_permissions,
      missing_permissions: required_permissions.filter((perm) => !rolePermissions.includes(perm)),
    };
  }
);
