import { z } from 'zod';
import { logger } from '../../../src/utils/logger.ts';
import {
  projectSchema,
  personSchema,
  taskSchema,
  clientSchema,
  allocationSchema,
  departmentSchema,
  statusSchema,
  phaseSchema,
  milestoneSchema,
  timeOffSchema,
  timeOffTypeSchema,
  publicHolidaySchema,
  teamHolidaySchema,
  accountSchema,
  roleSchema,
  projectTaskSchema,
} from '../../../src/types/float.ts';

// Schema validation results
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

// Schema validator class
export class SchemaValidator {
  private static instance: SchemaValidator;

  private constructor() {}

  static getInstance(): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator();
    }
    return SchemaValidator.instance;
  }

  // Validate data against a schema
  validate<T>(data: any, schema: z.ZodSchema<T>): ValidationResult {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
          warnings: [],
          data: data,
        };
      }

      return {
        isValid: false,
        errors: [
          `Unknown validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
        data: data,
      };
    }
  }

  // Validate with warnings for optional fields
  validateWithWarnings<T>(data: any, schema: z.ZodSchema<T>): ValidationResult {
    const result = this.validate(data, schema);

    // Check for missing optional fields that might be expected
    const warnings: string[] = [];

    if (result.isValid && data) {
      // Add warnings for null values that might be unexpected
      this.checkForNullValues(data, '', warnings);
    }

    return {
      ...result,
      warnings,
    };
  }

  private checkForNullValues(obj: any, path: string, warnings: string[]): void {
    if (obj === null || obj === undefined) {
      warnings.push(`${path}: Value is null or undefined`);
      return;
    }

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;

        if (value === null) {
          warnings.push(`${newPath}: Value is null`);
        } else if (typeof value === 'object') {
          this.checkForNullValues(value, newPath, warnings);
        }
      });
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const newPath = `${path}[${index}]`;
        this.checkForNullValues(item, newPath, warnings);
      });
    }
  }

  // Validate API response structure
  validateApiResponse(response: any): ValidationResult {
    const baseResponseSchema = z.object({
      success: z.boolean().optional(),
      data: z.any().optional(),
      error: z.string().optional(),
    });

    return this.validate(response, baseResponseSchema);
  }

  // Validate paginated response
  validatePaginatedResponse(response: any): ValidationResult {
    const paginatedSchema = z.object({
      data: z.array(z.any()),
      pagination: z
        .object({
          page: z.number(),
          per_page: z.number(),
          total: z.number(),
          total_pages: z.number(),
        })
        .optional(),
    });

    return this.validate(response, paginatedSchema);
  }

  // Validate error response
  validateErrorResponse(response: any): ValidationResult {
    const errorSchema = z.object({
      error: z.string(),
      message: z.string().optional(),
      code: z.string().optional(),
      status: z.number().optional(),
    });

    return this.validate(response, errorSchema);
  }
}

// Schema validation helpers for specific entities
export class EntitySchemaValidator extends SchemaValidator {
  // Project validation
  validateProject(data: any): ValidationResult {
    return this.validateWithWarnings(data, projectSchema);
  }

  validateProjects(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(projectSchema));
  }

  // Person validation
  validatePerson(data: any): ValidationResult {
    return this.validateWithWarnings(data, personSchema);
  }

  validatePeople(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(personSchema));
  }

  // Task validation
  validateTask(data: any): ValidationResult {
    return this.validateWithWarnings(data, taskSchema);
  }

  validateTasks(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(taskSchema));
  }

  // Client validation
  validateClient(data: any): ValidationResult {
    return this.validateWithWarnings(data, clientSchema);
  }

  validateClients(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(clientSchema));
  }

  // Allocation validation
  validateAllocation(data: any): ValidationResult {
    return this.validateWithWarnings(data, allocationSchema);
  }

  validateAllocations(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(allocationSchema));
  }

  // Department validation
  validateDepartment(data: any): ValidationResult {
    return this.validateWithWarnings(data, departmentSchema);
  }

  validateDepartments(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(departmentSchema));
  }

  // Status validation
  validateStatus(data: any): ValidationResult {
    return this.validateWithWarnings(data, statusSchema);
  }

  validateStatuses(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(statusSchema));
  }

  // Phase validation
  validatePhase(data: any): ValidationResult {
    return this.validateWithWarnings(data, phaseSchema);
  }

  validatePhases(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(phaseSchema));
  }

  // Milestone validation
  validateMilestone(data: any): ValidationResult {
    return this.validateWithWarnings(data, milestoneSchema);
  }

  validateMilestones(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(milestoneSchema));
  }

  // Time Off validation
  validateTimeOff(data: any): ValidationResult {
    return this.validateWithWarnings(data, timeOffSchema);
  }

  validateTimeOffs(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(timeOffSchema));
  }

  // Time Off Type validation
  validateTimeOffType(data: any): ValidationResult {
    return this.validateWithWarnings(data, timeOffTypeSchema);
  }

  validateTimeOffTypes(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(timeOffTypeSchema));
  }

  // Public Holiday validation
  validatePublicHoliday(data: any): ValidationResult {
    return this.validateWithWarnings(data, publicHolidaySchema);
  }

  validatePublicHolidays(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(publicHolidaySchema));
  }

  // Team Holiday validation
  validateTeamHoliday(data: any): ValidationResult {
    return this.validateWithWarnings(data, teamHolidaySchema);
  }

  validateTeamHolidays(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(teamHolidaySchema));
  }

  // Account validation
  validateAccount(data: any): ValidationResult {
    return this.validateWithWarnings(data, accountSchema);
  }

  validateAccounts(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(accountSchema));
  }

  // Role validation
  validateRole(data: any): ValidationResult {
    return this.validateWithWarnings(data, roleSchema);
  }

  validateRoles(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(roleSchema));
  }

  // Project Task validation
  validateProjectTask(data: any): ValidationResult {
    return this.validateWithWarnings(data, projectTaskSchema);
  }

  validateProjectTasks(data: any): ValidationResult {
    return this.validateWithWarnings(data, z.array(projectTaskSchema));
  }
}

// Test assertion helpers
export const assertValidSchema = <T>(data: any, schema: z.ZodSchema<T>): T => {
  const validator = SchemaValidator.getInstance();
  const result = validator.validate(data, schema);

  if (!result.isValid) {
    throw new Error(`Schema validation failed:\n${result.errors.join('\n')}`);
  }

  return result.data;
};

export const assertValidEntitySchema = (entityType: string, data: any): any => {
  const validator = new EntitySchemaValidator();
  let result: ValidationResult;

  switch (entityType) {
    case 'project':
      result = validator.validateProject(data);
      break;
    case 'person':
      result = validator.validatePerson(data);
      break;
    case 'task':
      result = validator.validateTask(data);
      break;
    case 'client':
      result = validator.validateClient(data);
      break;
    case 'allocation':
      result = validator.validateAllocation(data);
      break;
    case 'department':
      result = validator.validateDepartment(data);
      break;
    case 'status':
      result = validator.validateStatus(data);
      break;
    case 'phase':
      result = validator.validatePhase(data);
      break;
    case 'milestone':
      result = validator.validateMilestone(data);
      break;
    case 'timeoff':
      result = validator.validateTimeOff(data);
      break;
    case 'account':
      result = validator.validateAccount(data);
      break;
    case 'role':
      result = validator.validateRole(data);
      break;
    case 'project-task':
      result = validator.validateProjectTask(data);
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  if (!result.isValid) {
    throw new Error(`Schema validation failed for ${entityType}:\n${result.errors.join('\n')}`);
  }

  // Log warnings
  if (result.warnings.length > 0) {
    logger.warn(`Schema validation warnings for ${entityType}:`, result.warnings);
  }

  return result.data;
};

// Export singleton instance
export const schemaValidator = SchemaValidator.getInstance();
export const entitySchemaValidator = new EntitySchemaValidator();
