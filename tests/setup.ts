import { config } from 'dotenv';
import { beforeAll, beforeEach, afterEach } from '@jest/globals';

// Load environment variables
config();

// Mock the FloatApi service BEFORE any other imports
jest.mock('../src/services/float-api.ts', () => {
  // Mock responses for common endpoints
  const mockResponses = {
    '/projects': [
      { project_id: 1, name: 'Test Project 1', active: 1, client_id: 1 },
      { project_id: 2, name: 'Test Project 2', active: 1, client_id: 1 },
    ],
    '/people': [
      { people_id: 1, name: 'Test Person 1', active: 1, employee_type: 1 },
      { people_id: 2, name: 'Test Person 2', active: 1, employee_type: 1 },
    ],
    '/tasks': [
      { task_id: 1, name: 'Test Task 1', project_id: 1, people_id: 1 },
      { task_id: 2, name: 'Test Task 2', project_id: 1, people_id: 1 },
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
      { team_holiday_id: 1, name: 'Company Holiday', start_date: '2024-12-25', end_date: '2024-12-25', active: 1 },
      { team_holiday_id: 2, name: 'New Year', start_date: '2024-01-01', end_date: '2024-01-01', active: 1 },
    ],
    '/public-holidays': [
      { public_holiday_id: 1, name: 'Christmas', date: '2024-12-25', country: 'US', active: 1 },
      { public_holiday_id: 2, name: 'New Year', date: '2024-01-01', country: 'US', active: 1 },
    ],
  };

  // Create a mock FloatApi class
  class MockFloatApi {
    constructor() {}

    async getPaginated(url: string, params?: any, schema?: any, format?: string) {
      const baseUrl = url.split('?')[0];
      const mockData = mockResponses[baseUrl];
      if (!mockData) {
        throw new Error(`No mock data found for ${url}`);
      }
      
      // Apply basic filtering if params provided
      let filteredData = [...mockData];
      
      if (params) {
        // Apply simple filtering logic
        Object.keys(params).forEach(key => {
          if (key !== 'page' && key !== 'per-page' && params[key] !== undefined) {
            filteredData = filteredData.filter(item => {
              const itemValue = item[key];
              const filterValue = params[key];
              return itemValue === filterValue || itemValue == filterValue;
            });
          }
        });
        
        // Apply pagination
        const page = params.page || 1;
        const perPage = params['per-page'] || 50;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        filteredData = filteredData.slice(startIndex, endIndex);
      }
      
      return filteredData;
    }

    async get(url: string, schema?: any, format?: string) {
      const baseUrl = url.split('?')[0];
      const mockData = mockResponses[baseUrl];
      if (!mockData || mockData.length === 0) {
        throw new Error(`No mock data found for ${url}`);
      }
      
      // For single entity requests (with ID)
      if (url.includes('/') && /\/\d+$/.test(url)) {
        return mockData[0]; // Return first item for single entity
      }
      
      return mockData;
    }

    async post(url: string, data: any, schema?: any, format?: string) {
      return { ...data, id: Math.floor(Math.random() * 1000) + 100 };
    }

    async put(url: string, data: any, schema?: any, format?: string) {
      return { ...data, updated: true };
    }

    async patch(url: string, data: any, schema?: any, format?: string) {
      return { ...data, updated: true };
    }

    async delete(url: string, schema?: any, format?: string) {
      return { success: true };
    }

    buildQueryParams(params: Record<string, any>): string {
      return Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    }
  }

  return {
    FloatApi: MockFloatApi,
    floatApi: new MockFloatApi(),
    stopCleanup: () => {},
    FloatApiError: class FloatApiError extends Error {
      constructor(message: string, public status?: number, public data?: unknown, public code?: string) {
        super(message);
        this.status = status;
        this.data = data;
        this.code = code;
      }
    },
    FloatErrorHandler: {
      formatErrorForMcp: (error: any) => ({
        success: false,
        error: error.message,
        errorCode: error.code
      })
    }
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
});

afterEach(() => {
  jest.restoreAllMocks();
});
