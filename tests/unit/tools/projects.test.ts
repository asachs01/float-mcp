import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../../../src/tools/projects';
import { Project } from '../../../src/types/float';

// Mock the floatApi instance
jest.mock('../../../src/services/float-api', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { floatApi } from '../../../src/services/float-api';

describe('Projects Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should list projects with optional filters', async () => {
      const mockProjects: Project[] = [
        {
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
        },
      ];

      (floatApi.get as jest.Mock).mockResolvedValueOnce({ projects: mockProjects });

      const result = await listProjects.handler({});

      expect(result).toEqual(mockProjects);
      expect(floatApi.get).toHaveBeenCalledWith('/projects?', expect.any(Object));
    });

    it('should handle API errors', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(listProjects.handler({})).rejects.toThrow('API Error');
    });
  });

  describe('getProject', () => {
    it('should get project details', async () => {
      const mockProject: Project = {
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

      (floatApi.get as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await getProject.handler({ id: '1' });

      expect(result).toEqual(mockProject);
      expect(floatApi.get).toHaveBeenCalledWith('/projects/1', expect.any(Object));
    });

    it('should handle non-existent project', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('Project not found'));

      await expect(getProject.handler({ id: '999' })).rejects.toThrow('Project not found');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProject = {
        name: 'New Project',
        client_id: 'client1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        notes: 'New project notes',
        budget: 10000,
        hourly_rate: 100,
      };

      const mockResponse: Project = {
        id: '1',
        ...newProject,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createProject.handler(newProject);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/projects', newProject, expect.any(Object));
    });

    it('should handle validation errors', async () => {
      const invalidProject = {
        name: '', // Invalid: empty name
        client_id: 'client1',
        start_date: '2024-01-01',
      };

      // This should throw a validation error from zod
      await expect(createProject.handler(invalidProject)).rejects.toThrow();
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const updateData = {
        id: '1',
        name: 'Updated Project',
      };

      const mockResponse: Project = {
        id: '1',
        name: 'Updated Project',
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

      (floatApi.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateProject.handler(updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/projects/1', { name: 'Updated Project' }, expect.any(Object));
    });

    it('should handle update errors', async () => {
      (floatApi.put as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateProject.handler({ id: '1', name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      (floatApi.delete as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await deleteProject.handler({ id: '1' });

      expect(result).toEqual({ success: true });
      expect(floatApi.delete).toHaveBeenCalledWith('/projects/1');
    });

    it('should handle deletion errors', async () => {
      (floatApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteProject.handler({ id: '1' })).rejects.toThrow('Delete failed');
    });
  });
});
