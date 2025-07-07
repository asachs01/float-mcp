import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ProjectsTool } from '../../../src/tools/projects';
import { Project } from '../../../src/types/float';

jest.mock('../../../src/services/float-api.js', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ProjectsTool', () => {
  let projectsTool: ProjectsTool;

  beforeEach(() => {
    projectsTool = new ProjectsTool();
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

      floatApi.get.mockResolvedValueOnce({ projects: mockProjects });

      const result = await projectsTool.listProjects();

      expect(result).toEqual(mockProjects);
      expect(floatApi.get).toHaveBeenCalledWith('/projects');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(projectsTool.listProjects()).rejects.toThrow('API Error');
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

      floatApi.get.mockResolvedValueOnce({ project: mockProject });

      const result = await projectsTool.getProject('1');

      expect(result).toEqual(mockProject);
      expect(floatApi.get).toHaveBeenCalledWith('/projects/1');
    });

    it('should handle non-existent project', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Project not found'));

      await expect(projectsTool.getProject('999')).rejects.toThrow('Project not found');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Project',
        client_id: 'client1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        notes: 'New project notes',
        budget: 10000,
        hourly_rate: 100,
        status: 'active',
      };

      const mockResponse: Project = {
        id: '1',
        ...newProject,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      floatApi.post.mockResolvedValueOnce({ project: mockResponse });

      const result = await projectsTool.createProject(newProject);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/projects', newProject);
    });

    it('should handle validation errors', async () => {
      const invalidProject = {
        name: '', // Invalid: empty name
        client_id: 'client1',
        start_date: '2024-01-01',
        status: 'active',
      };

      await expect(projectsTool.createProject(invalidProject)).rejects.toThrow();
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const updateData = {
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

      floatApi.put.mockResolvedValueOnce({ project: mockResponse });

      const result = await projectsTool.updateProject('1', updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/projects/1', updateData);
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(projectsTool.updateProject('1', { name: 'Test' })).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await projectsTool.deleteProject('1');

      expect(floatApi.delete).toHaveBeenCalledWith('/projects/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(projectsTool.deleteProject('1')).rejects.toThrow('Delete failed');
    });
  });
});
