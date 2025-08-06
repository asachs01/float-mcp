import { z } from 'zod';
import { createTool } from '../base.js';
import { floatApi } from '../../services/float-api.js';
import { accountSchema, accountsResponseSchema } from '../../types/float.js';

// Account permissions schema for managing access rights
const accountPermissionsSchema = z.object({
  access: z.number().optional().describe('Account access level'),
  department_filter_id: z
    .number()
    .nullable()
    .optional()
    .describe('Department filter ID for restricted access'),
  view_rights: z.number().optional().describe('View permissions (0=none, 1=limited, 2=full)'),
  edit_rights: z.number().optional().describe('Edit permissions (0=none, 1=limited, 2=full)'),
});

// List accounts
export const listAccounts = createTool(
  'list-accounts',
  'Retrieve a paginated list of all user accounts with advanced filtering options. Use for user management, access control, and organizational oversight. Supports filtering by account type, active status, and department access.',
  z.object({
    active: z
      .number()
      .optional()
      .describe('Filter by active status (0=inactive/archived, 1=active)'),
    account_type: z
      .number()
      .optional()
      .describe(
        'Filter by account type (1=admin with full access, 2=member with standard access, 3=view-only with read permissions)'
      ),
    department_filter_id: z
      .number()
      .optional()
      .describe(
        'Filter by department access - shows only accounts with access to specific department'
      ),
    page: z.number().optional().describe('Page number for pagination (starts from 1)'),
    'per-page': z
      .number()
      .optional()
      .describe('Number of items per page (max 200, default varies by API configuration)'),
  }),
  async (params) => {
    const response = await floatApi.getPaginated('/accounts', params, accountsResponseSchema);
    return response;
  }
);

// Get account details
export const getAccount = createTool(
  'get-account',
  'Get comprehensive details about a specific user account including permissions, access rights, department assignments, and account settings. Essential for user management and access control.',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
  }),
  async (params) => {
    const account = await floatApi.get(`/accounts/${params.account_id}`, accountSchema);
    return account;
  }
);

// Update account
export const updateAccount = createTool(
  'update-account',
  'Update an existing user account with new information including contact details, permissions, timezone settings, and account configuration. Use for profile management and access control updates.',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
    name: z.string().optional().describe('Account holder name'),
    email: z.string().email().optional().describe('Email address'),
    timezone: z.string().optional().describe('Account timezone (e.g., America/New_York)'),
    avatar: z.string().optional().describe('Avatar URL or file path'),
    account_type: z.number().optional().describe('Account type (1=admin, 2=member, 3=view-only)'),
    access: z.number().optional().describe('Account access level'),
    department_filter_id: z
      .number()
      .nullable()
      .optional()
      .describe('Department filter ID for restricted access'),
    view_rights: z.number().optional().describe('View permissions (0=none, 1=limited, 2=full)'),
    edit_rights: z.number().optional().describe('Edit permissions (0=none, 1=limited, 2=full)'),
    active: z.number().optional().describe('Active status (1=active, 0=inactive)'),
  }),
  async (params) => {
    const { account_id, ...updateData } = params;
    const account = await floatApi.patch(`/accounts/${account_id}`, updateData, accountSchema);
    return account;
  }
);

// Manage account permissions
export const manageAccountPermissions = createTool(
  'manage-account-permissions',
  'Manage and update account permissions and access rights including view/edit permissions, department filters, and access levels. Critical for security and access control management.',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
    access: z.number().optional().describe('Account access level'),
    department_filter_id: z
      .number()
      .nullable()
      .optional()
      .describe('Department filter ID for restricted access (null for all departments)'),
    view_rights: z.number().optional().describe('View permissions (0=none, 1=limited, 2=full)'),
    edit_rights: z.number().optional().describe('Edit permissions (0=none, 1=limited, 2=full)'),
  }),
  async (params) => {
    const { account_id, ...permissionData } = params;

    // Validate permissions data
    const validatedPermissions = accountPermissionsSchema.parse(permissionData);

    const account = await floatApi.patch(
      `/accounts/${account_id}`,
      validatedPermissions,
      accountSchema
    );
    return account;
  }
);

// Create account (if supported by Float API)
export const createAccount = createTool(
  'create-account',
  'Create a new account (if supported by your Float plan)',
  z.object({
    name: z.string().describe('Account holder name'),
    email: z.string().email().describe('Email address'),
    timezone: z.string().optional().describe('Account timezone (e.g., America/New_York)'),
    account_type: z.number().optional().describe('Account type (1=admin, 2=member, 3=view-only)'),
    access: z.number().optional().describe('Account access level'),
    department_filter_id: z
      .number()
      .nullable()
      .optional()
      .describe('Department filter ID for restricted access'),
    view_rights: z.number().optional().describe('View permissions (0=none, 1=limited, 2=full)'),
    edit_rights: z.number().optional().describe('Edit permissions (0=none, 1=limited, 2=full)'),
    active: z.number().optional().describe('Active status (1=active, 0=inactive)'),
  }),
  async (params) => {
    const account = await floatApi.post('/accounts', params, accountSchema);
    return account;
  }
);

// Deactivate account
export const deactivateAccount = createTool(
  'deactivate-account',
  'Deactivate an account (sets active status to 0)',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
  }),
  async (params) => {
    const account = await floatApi.patch(
      `/accounts/${params.account_id}`,
      { active: 0 },
      accountSchema
    );
    return account;
  }
);

// Reactivate account
export const reactivateAccount = createTool(
  'reactivate-account',
  'Reactivate an account (sets active status to 1)',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
  }),
  async (params) => {
    const account = await floatApi.patch(
      `/accounts/${params.account_id}`,
      { active: 1 },
      accountSchema
    );
    return account;
  }
);

// Get current account info
export const getCurrentAccount = createTool(
  'get-current-account',
  'Get information about the current authenticated account',
  z.object({}),
  async () => {
    const account = await floatApi.get('/accounts/me', accountSchema);
    return account;
  }
);

// Update account timezone
export const updateAccountTimezone = createTool(
  'update-account-timezone',
  'Update the timezone for a specific account',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
    timezone: z
      .string()
      .describe('Timezone identifier (e.g., America/New_York, Europe/London, Asia/Tokyo)'),
  }),
  async (params) => {
    const { account_id, timezone } = params;
    const account = await floatApi.patch(`/accounts/${account_id}`, { timezone }, accountSchema);
    return account;
  }
);

// Set department filter for account
export const setAccountDepartmentFilter = createTool(
  'set-account-department-filter',
  'Set department filter to restrict account access to specific departments',
  z.object({
    account_id: z.union([z.string(), z.number()]).describe('The account ID (account_id)'),
    department_filter_id: z
      .number()
      .nullable()
      .describe('Department ID to filter by, or null to remove filter'),
  }),
  async (params) => {
    const { account_id, department_filter_id } = params;
    const account = await floatApi.patch(
      `/accounts/${account_id}`,
      { department_filter_id },
      accountSchema
    );
    return account;
  }
);

// Bulk update account permissions
export const bulkUpdateAccountPermissions = createTool(
  'bulk-update-account-permissions',
  'Update permissions for multiple accounts at once',
  z.object({
    account_ids: z
      .array(z.union([z.string(), z.number()]))
      .describe('Array of account IDs to update'),
    permissions: z
      .object({
        access: z.number().optional().describe('Account access level'),
        department_filter_id: z
          .number()
          .nullable()
          .optional()
          .describe('Department filter ID for restricted access'),
        view_rights: z.number().optional().describe('View permissions (0=none, 1=limited, 2=full)'),
        edit_rights: z.number().optional().describe('Edit permissions (0=none, 1=limited, 2=full)'),
      })
      .describe('Permissions to apply to all specified accounts'),
  }),
  async (params) => {
    const { account_ids, permissions } = params;
    const validatedPermissions = accountPermissionsSchema.parse(permissions);

    const results = await Promise.allSettled(
      account_ids.map(async (account_id) => {
        return await floatApi.patch(`/accounts/${account_id}`, validatedPermissions, accountSchema);
      })
    );

    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<z.infer<typeof accountSchema>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason);

    return {
      successful,
      failed,
      total: account_ids.length,
      success_count: successful.length,
      failure_count: failed.length,
    };
  }
);
