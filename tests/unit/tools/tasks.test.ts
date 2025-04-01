import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { TasksTool } from '../../../src/tools/tasks';
import { Task } from '../../../src/types/float';

jest.mock('../../../src/services/float-api.js', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('TasksTool', () => {
  let tasksTool: TasksTool;

  beforeEach(() => {
    tasksTool = new TasksTool();
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

      const result = await tasksTool.listTasks();

      expect(result).toEqual(mockTasks);
      expect(floatApi.get).toHaveBeenCalledWith('/tasks');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(tasksTool.listTasks()).rejects.toThrow('API Error');
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

      const result = await tasksTool.getTask('1');

      expect(result).toEqual(mockTask);
      expect(floatApi.get).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle non-existent task', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Task not found'));

      await expect(tasksTool.getTask('999')).rejects.toThrow('Task not found');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Task',
        project_id: 'project1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        notes: 'New task notes',
        hours_per_day: 8,
        total_hours: 160,
        priority: 1,
      };

      const mockResponse: Task = {
        id: '1',
        ...newTask,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      floatApi.post.mockResolvedValueOnce({ task: mockResponse });

      const result = await tasksTool.createTask(newTask);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/tasks', newTask);
    });

    it('should handle validation errors', async () => {
      const invalidTask = {
        name: '', // Invalid: empty name
        project_id: 'project1',
        start_date: '2024-01-01',
        status: 'active',
      };

      await expect(tasksTool.createTask(invalidTask)).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateData = {
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

      const result = await tasksTool.updateTask('1', updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/tasks/1', updateData);
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(tasksTool.updateTask('1', { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await tasksTool.deleteTask('1');

      expect(floatApi.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(tasksTool.deleteTask('1')).rejects.toThrow('Delete failed');
    });
  });
}); 