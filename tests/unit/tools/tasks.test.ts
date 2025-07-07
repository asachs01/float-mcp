import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../../../src/tools/tasks';
import { Task } from '../../../src/types/float';
import { FloatApi } from '../../../src/services/float-api.js';

// Mock the FloatApi class
jest.mock('../../../src/services/float-api.js', () => {
  const mockFloatApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  return {
    FloatApi: jest.fn().mockImplementation(() => mockFloatApi),
    floatApi: mockFloatApi,
  };
});

describe('Tasks Tools', () => {
  let floatApi: jest.Mocked<FloatApi>;

  beforeEach(() => {
    floatApi = new FloatApi('test-api-key') as jest.Mocked<FloatApi>;
  });

  describe('listTasks', () => {
    it('should list tasks with optional filters', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          name: 'Test Task',
          project_id: 'project1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          notes: 'Test task notes',
          hours_per_day: 8,
          total_hours: 160,
          priority: 1,
        },
      ];

      floatApi.get.mockResolvedValueOnce({ tasks: mockTasks });

      const result = await listTasks({});

      expect(result).toEqual(mockTasks);
      expect(floatApi.get).toHaveBeenCalledWith('/tasks');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(listTasks({})).rejects.toThrow('API Error');
    });
  });

  describe('getTask', () => {
    it('should get task details', async () => {
      const mockTask: Task = {
        id: '1',
        name: 'Test Task',
        project_id: 'project1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        notes: 'Test task notes',
        hours_per_day: 8,
        total_hours: 160,
        priority: 1,
      };

      floatApi.get.mockResolvedValueOnce({ task: mockTask });

      const result = await getTask({ id: '1' });

      expect(result).toEqual(mockTask);
      expect(floatApi.get).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle non-existent task', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Task not found'));

      await expect(getTask({ id: '999' })).rejects.toThrow('Task not found');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = {
        project_id: 'project1',
        name: 'New Task',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        notes: 'New task notes',
        estimated_hours: 160,
        priority: 1,
      };

      const mockResponse: Task = {
        id: '1',
        ...newTask,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        hours_per_day: 8,
        total_hours: 160,
      };

      floatApi.post.mockResolvedValueOnce({ task: mockResponse });

      const result = await createTask(newTask);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/tasks', newTask);
    });

    it('should handle validation errors', async () => {
      const invalidTask = {
        project_id: 'project1',
        name: '', // Invalid: empty name
        start_date: '2024-01-01',
      };

      await expect(createTask(invalidTask)).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateData = {
        id: '1',
        name: 'Updated Task',
      };

      const mockResponse: Task = {
        id: '1',
        name: 'Updated Task',
        project_id: 'project1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        notes: 'Test task notes',
        hours_per_day: 8,
        total_hours: 160,
        priority: 1,
      };

      floatApi.put.mockResolvedValueOnce({ task: mockResponse });

      const result = await updateTask(updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/tasks/1', { name: 'Updated Task' });
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateTask({ id: '1', name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await deleteTask({ id: '1' });

      expect(floatApi.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteTask({ id: '1' })).rejects.toThrow('Delete failed');
    });
  });
});
