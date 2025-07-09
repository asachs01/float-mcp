import { config } from 'dotenv';
import { beforeAll, beforeEach, afterEach } from '@jest/globals';

// Load environment variables
config();

// Mock the FloatApi service BEFORE any other imports
jest.mock('../src/services/float-api.ts', () => {
  // Mock responses for common endpoints
  const mockResponses = {
    '/projects': [
      { 
        project_id: 1, 
        name: 'Test Project 1', 
        active: 1, 
        client_id: 1,
        project_manager: 1,
        color: '#FF0000',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      { 
        project_id: 2, 
        name: 'Test Project 2', 
        active: 1, 
        client_id: 1,
        project_manager: 1,
        color: '#00FF00',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
    ],
    '/people': [
      {
        people_id: 1,
        name: 'Test Person 1',
        active: 1,
        employee_type: 1,
        email: null,
        job_title: null,
        notes: null,
      },
      {
        people_id: 2,
        name: 'Test Person 2',
        active: 1,
        employee_type: 1,
        email: 'test2@example.com',
        job_title: 'Developer',
        notes: 'Test notes',
      },
    ],
    '/tasks': [
      {
        task_id: 1,
        name: 'Test Task 1',
        project_id: 1,
        people_id: 1,
        estimated_hours: 8,
        notes: null,
        start_date: null,
        end_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        task_id: 2,
        name: 'Test Task 2',
        project_id: 1,
        people_id: 1,
        estimated_hours: 16,
        notes: 'Task notes',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
    ],
    '/timeoffs': [
      { timeoff_id: 1, people_id: 1, start_date: '2024-01-01', end_date: '2024-01-02', status: 1 },
      { timeoff_id: 2, people_id: 1, start_date: '2024-01-03', end_date: '2024-01-04', status: 2 },
      { timeoff_id: 3, people_id: 2, start_date: '2024-01-05', end_date: '2024-01-06', status: 1 },
    ],
    '/clients': [
      { client_id: 1, name: 'Test Client 1', active: 1 },
      { client_id: 2, name: 'Test Client 2', active: 1 },
    ],
    '/allocations': [
      { allocation_id: 1, project_id: 1, people_id: 1, hours: 8 },
      { allocation_id: 2, project_id: 2, people_id: 1, hours: 6 },
    ],
    '/phases': [
      { phase_id: 1, name: 'Test Phase 1', project_id: 1, active: 1 },
      { phase_id: 2, name: 'Test Phase 2', project_id: 1, active: 1 },
    ],
    '/departments': [
      { department_id: 1, name: 'Engineering', active: 1 },
      { department_id: 2, name: 'Design', active: 1 },
    ],
    '/statuses': [
      { status_id: 1, name: 'Active', status_type: 'project', active: 1 },
      { status_id: 2, name: 'Completed', status_type: 'project', active: 1 },
    ],
    '/accounts': [
      { account_id: 1, name: 'Test Account 1', active: 1 },
      { account_id: 2, name: 'Test Account 2', active: 1 },
    ],
    '/roles': [
      { role_id: 1, name: 'Developer', active: 1 },
      { role_id: 2, name: 'Designer', active: 1 },
    ],
    '/milestones': [
      { milestone_id: 1, name: 'Test Milestone 1', project_id: 1, active: 1 },
      { milestone_id: 2, name: 'Test Milestone 2', project_id: 1, active: 1 },
    ],
    '/project_tasks': [
      { project_task_id: 1, name: 'Test Project Task 1', project_id: 1, active: 1 },
      { project_task_id: 2, name: 'Test Project Task 2', project_id: 1, active: 1 },
    ],
    '/logged-time': [
      { logged_time_id: 1, people_id: 1, project_id: 1, hours: 8, date: '2024-01-01' },
      { logged_time_id: 2, people_id: 1, project_id: 1, hours: 6, date: '2024-01-02' },
    ],
    '/team-holidays': [
      {
        team_holiday_id: 1,
        name: 'Company Holiday',
        start_date: '2024-12-25',
        end_date: '2024-12-25',
        active: 1,
      },
      {
        team_holiday_id: 2,
        name: 'New Year',
        start_date: '2024-01-01',
        end_date: '2024-01-01',
        active: 1,
      },
    ],
    '/public-holidays': [
      { public_holiday_id: 1, name: 'Christmas', date: '2024-12-25', country: 'US', active: 1 },
      { public_holiday_id: 2, name: 'New Year', date: '2024-01-01', country: 'US', active: 1 },
    ],
  };

  // Create a mock FloatApi class
    class MockFloatApi {
    private createdEntities: Record<string, any[]> = {};

    constructor() {}

    // Method to reset mock state between tests
    resetState(): void {
      this.createdEntities = {};
    }

    async getPaginated(
      url: string,
      params?: Record<string, unknown>,
      _schema?: unknown,
      _format?: string
    ): Promise<unknown[]> {
      const baseUrl = url.split('?')[0];
      const mockData = mockResponses[baseUrl];
      if (!mockData) {
        throw new Error(`No mock data found for ${url}`);
      }

      // Apply basic filtering if params provided
      let filteredData = [...mockData];

      if (params) {
        // Apply simple filtering logic
        Object.keys(params).forEach((key) => {
          if (key !== 'page' && key !== 'per-page' && params[key] !== undefined) {
            filteredData = filteredData.filter((item) => {
              const itemValue = item[key];
              const filterValue = params[key];
              return itemValue === filterValue || itemValue == filterValue;
            });
          }
        });

        // Apply pagination
        const page = params.page || 1;
        const perPage = params['per-page'] || 50;
        const startIndex = ((page as number) - 1) * (perPage as number);
        const endIndex = startIndex + (perPage as number);
        filteredData = filteredData.slice(startIndex, endIndex);
      }

      return filteredData;
    }

    async get(url: string, _schema?: unknown, _format?: string): Promise<unknown> {
      const baseUrl = url.split('?')[0];

      // For single entity requests (with ID), extract the ID and find the specific entity
      if (url.includes('/') && /\/\w+$/.test(url)) {
        const idMatch = url.match(/\/(\w+)$/);
        if (idMatch) {
          const idString = idMatch[1];
          const pathParts = url.split('/');
          const entityType = pathParts[pathParts.length - 2]; // Get the entity type before the ID
          const endpointUrl = `/${entityType}`;

          // Validate ID format - should be numeric
          if (!/^\d+$/.test(idString)) {
            const entityTypeSingular = entityType.replace(/s$/, ''); // Remove trailing 's'
            throw new Error(
              `Validation error: Invalid ${entityTypeSingular}_id format. Expected numeric value, got: ${idString}`
            );
          }

          const id = parseInt(idString, 10);

          // Combine mock data with created entities
          const mockData = mockResponses[endpointUrl] || [];
          const createdData = this.createdEntities[endpointUrl] || [];
          const allData = [...mockData, ...createdData];
          
          if (allData.length === 0) {
            throw new Error(`No mock data found for ${url}`);
          }

          // Find the entity with matching ID based on entity type
          let idField: string;
          switch (entityType) {
            case 'projects':
              idField = 'project_id';
              break;
            case 'people':
              idField = 'people_id';
              break;
            case 'tasks':
              idField = 'task_id';
              break;
            case 'clients':
              idField = 'client_id';
              break;
            case 'allocations':
              idField = 'allocation_id';
              break;
            case 'departments':
              idField = 'department_id';
              break;
            case 'statuses':
              idField = 'status_id';
              break;
            case 'accounts':
              idField = 'account_id';
              break;
            case 'roles':
              idField = 'role_id';
              break;
            case 'milestones':
              idField = 'milestone_id';
              break;
            case 'phases':
              idField = 'phase_id';
              break;
            case 'project_tasks':
              idField = 'project_task_id';
              break;
            case 'timeoffs':
              idField = 'timeoff_id';
              break;
            case 'team-holidays':
              idField = 'team_holiday_id';
              break;
            case 'public-holidays':
              idField = 'public_holiday_id';
              break;
            case 'logged-time':
              idField = 'logged_time_id';
              break;
            default: {
              // Fallback: try to find any field ending with _id
              const entity = allData[0];
              const possibleIdField = Object.keys(entity).find((key) => key.endsWith('_id'));
              idField = possibleIdField || 'id';
              break;
            }
          }

          const entity = allData.find((item: Record<string, unknown>) => item[idField] === id);
          if (!entity) {
            const entityTypeSingular = entityType.replace(/s$/, ''); // Remove trailing 's'
            throw new Error(
              `${entityTypeSingular.charAt(0).toUpperCase() + entityTypeSingular.slice(1)} not found: ${idField}=${id} does not exist`
            );
          }

          return entity;
        }
      }

      // For regular list requests
      const mockData = mockResponses[baseUrl];
      if (!mockData || mockData.length === 0) {
        throw new Error(`No mock data found for ${url}`);
      }

      return mockData;
    }

    validateCreateData(entityType: string, data: Record<string, unknown>): void {
      // Check for required fields and validate data formats
      switch (entityType) {
        case 'projects':
          if (!data.name || data.name === '') {
            throw new Error('Validation error: Missing required field name');
          }
          if (
            data.client_id &&
            typeof data.client_id === 'string' &&
            !/^\d+$/.test(data.client_id as string)
          ) {
            throw new Error('Validation error: Invalid client_id format. Expected numeric value');
          }
          if (
            data.start_date &&
            typeof data.start_date === 'string' &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)
          ) {
            throw new Error('Validation error: Invalid start_date format. Expected YYYY-MM-DD');
          }
          break;
        case 'people':
          if (!data.name || data.name === '') {
            throw new Error('Validation error: Missing required field name');
          }
          if (data.email && typeof data.email === 'string' && !data.email.includes('@')) {
            throw new Error('Validation error: Invalid email format');
          }
          break;
        case 'tasks':
          if (!data.name || data.name === '') {
            throw new Error('Validation error: Missing required field name');
          }
          if (!data.project_id) {
            throw new Error('Validation error: Missing required field project_id');
          }
          if (!data.people_id) {
            throw new Error('Validation error: Missing required field people_id');
          }
          if (
            data.project_id &&
            typeof data.project_id === 'string' &&
            !/^\d+$/.test(data.project_id as string)
          ) {
            throw new Error('Validation error: Invalid project_id format. Expected numeric value');
          }
          // Check if project_id exists in mock data
          if (data.project_id) {
            const projects = mockResponses['/projects'] || [];
            const projectExists = projects.some(
              (project: Record<string, unknown>) => project.project_id === data.project_id
            );
            if (!projectExists) {
              throw new Error('Validation error: Invalid project_id - project does not exist');
            }
          }
          if (
            data.start_date &&
            typeof data.start_date === 'string' &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)
          ) {
            throw new Error('Validation error: Invalid start_date format. Expected YYYY-MM-DD');
          }
          if (
            data.end_date &&
            typeof data.end_date === 'string' &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.end_date)
          ) {
            throw new Error('Validation error: Invalid end_date format. Expected YYYY-MM-DD');
          }
          break;
      }
    }

    async post(
      url: string,
      data: Record<string, unknown>,
      _schema?: unknown,
      _format?: string
    ): Promise<unknown> {
      // Validate input data
      const entityType = url.replace('/', '');
      this.validateCreateData(entityType, data);

      // Check for duplicate email in people (including created entities)
      if (entityType === 'people' && data.email) {
        const existingPeople = mockResponses['/people'] || [];
        const createdPeople = this.createdEntities['/people'] || [];
        const allPeople = [...existingPeople, ...createdPeople];
        
        const duplicateEmail = allPeople.some(
          (person: Record<string, unknown>) => person.email === data.email
        );
        if (duplicateEmail) {
          throw new Error('Validation error: Duplicate email address already exists');
        }
      }

      // Simulate creating a new entity
      const mockData = mockResponses[url];
      if (mockData && mockData.length > 0) {
        // Get a template entity to copy structure from
        const template = mockData[0] as Record<string, unknown>;
        
        // Create new entity with template structure and provided data
        const newEntity = { ...template, ...data };
        
        // Debug logging
        if (url === '/tasks') {

        }
        
        // Generate new ID
        const idField = Object.keys(template).find((key) => key.endsWith('_id'));
        if (idField) {
          (newEntity as Record<string, unknown>)[idField] =
            Math.max(...mockData.map((item: Record<string, unknown>) => item[idField] as number)) +
            1;
        }
        
        // Set creation timestamp if applicable
        if ('created_at' in template) {
          newEntity.created_at = new Date().toISOString();
        }
        if ('updated_at' in template) {
          newEntity.updated_at = new Date().toISOString();
        }
        
        // Store the created entity for future duplicate checks and gets
        if (!this.createdEntities[url]) {
          this.createdEntities[url] = [];
        }
        this.createdEntities[url].push(newEntity);
        
        return newEntity;
      }

      return { ...data, id: Math.floor(Math.random() * 1000) + 100 };
    }

    async put(
      url: string,
      data: Record<string, unknown>,
      _schema?: unknown,
      _format?: string
    ): Promise<unknown> {
      // Extract entity type and ID from URL for validation
      if (url.includes('/') && /\/\w+$/.test(url)) {
        const idMatch = url.match(/\/(\w+)$/);
        if (idMatch) {
          const idString = idMatch[1];
          const pathParts = url.split('/');
          const entityType = pathParts[pathParts.length - 2];
          
          if (!/^\d+$/.test(idString)) {
            const entityTypeSingular = entityType.replace(/s$/, '');
            throw new Error(
              `Validation error: Invalid ${entityTypeSingular}_id format. Expected numeric value, got: ${idString}`
            );
          }

          const id = parseInt(idString, 10);
          const baseUrl = `/${entityType}`;
          
          // Get the existing entity
          const existingEntity = await this.get(url);
          
          // Merge the updates with the existing entity
          const updatedEntity = { ...existingEntity, ...data };
          
          return updatedEntity;
        }
      }

      return { ...data, updated: true };
    }

    async patch(
      url: string,
      data: Record<string, unknown>,
      _schema?: unknown,
      _format?: string
    ): Promise<unknown> {
      // Extract entity type and ID from URL for validation
      if (url.includes('/') && /\/\w+$/.test(url)) {
        const idMatch = url.match(/\/(\w+)$/);
        if (idMatch) {
          const idString = idMatch[1];
          const pathParts = url.split('/');
          const entityType = pathParts[pathParts.length - 2];
          
          if (!/^\d+$/.test(idString)) {
            const entityTypeSingular = entityType.replace(/s$/, '');
            throw new Error(
              `Validation error: Invalid ${entityTypeSingular}_id format. Expected numeric value, got: ${idString}`
            );
          }

          const id = parseInt(idString, 10);
          const baseUrl = `/${entityType}`;
          
          // Get the existing entity
          const existingEntity = await this.get(url);
          
          // Merge the updates with the existing entity
          const updatedEntity = { ...existingEntity, ...data };
          
          return updatedEntity;
        }
      }

      return { ...data, updated: true };
    }

    async delete(_url: string, _schema?: unknown, _format?: string): Promise<unknown> {
      return { success: true };
    }

    buildQueryParams(params: Record<string, unknown>): string {
      return Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    }
  }

  const mockApiInstance = new MockFloatApi();
  
  return {
    FloatApi: MockFloatApi,
    floatApi: mockApiInstance,
    stopCleanup: (): void => {},
    FloatApiError: class FloatApiError extends Error {
      constructor(
        message: string,
        public status?: number,
        public data?: unknown,
        public code?: string
      ) {
        super(message);
        this.status = status;
        this.data = data;
        this.code = code;
      }
    },
    FloatErrorHandler: {
      formatErrorForMcp: (error: Record<string, unknown>): Record<string, unknown> => ({
        success: false,
        error: error.message,
        errorCode: error.code,
      }),
    },
    // Expose the reset method for test cleanup
    resetMockState: (): void => {
      mockApiInstance.resetState();
    },
  };
});

// Set longer timeout for tests
jest.setTimeout(10000);

// Mock fetch globally with proper responses
global.fetch = jest.fn();

beforeAll(() => {
  // Initialize any test setup
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset mock state to prevent test pollution
  const floatApiModule = require('../src/services/float-api.js');
  if (floatApiModule.resetMockState) {
    floatApiModule.resetMockState();
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});
