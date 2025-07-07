import { z } from 'zod';

export const mockProject = {
  id: '1',
  name: 'Test Project',
  client_id: 'client1',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  notes: 'Test project notes',
  budget: 10000,
  hourly_rate: 100,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockTask = {
  id: '1',
  project_id: '1',
  name: 'Test Task',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  notes: 'Test task notes',
  estimated_hours: 40,
  actual_hours: 35,
  priority: 1,
  status: 'in_progress',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockPerson = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Developer',
  department: 'Engineering',
  hourly_rate: 100,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockResponse = <T>(data: T): { success: boolean; data: T } => ({
  success: true,
  data,
});

export const mockErrorResponse = (error: string): { success: boolean; error: string } => ({
  success: false,
  error,
});

export const validateSchema = <T>(schema: z.ZodType<T>, data: unknown): T => {
  return schema.parse(data);
};
