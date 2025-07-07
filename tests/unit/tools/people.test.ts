import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { PeopleTool } from '../../../src/tools/people';
import { Person } from '../../../src/types/float';

jest.mock('../../../src/services/float-api.js', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PeopleTool', () => {
  let peopleTool: PeopleTool;

  beforeEach(() => {
    peopleTool = new PeopleTool();
  });

  describe('listPeople', () => {
    it('should list people with optional filters', async () => {
      const mockPeople: Person[] = [
        {
          id: '1',
          name: 'Test Person',
          email: 'test@example.com',
          job_title: 'Developer',
          department: 'Engineering',
          contractor: false,
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          avatar_url: 'https://example.com/avatar.jpg',
          notes: 'Test person notes',
          people_type_id: '1',
          work_days_hours: 40,
          timezone: 'UTC',
        },
      ];

      floatApi.get.mockResolvedValueOnce({ people: mockPeople });

      const result = await peopleTool.listPeople();

      expect(result).toEqual(mockPeople);
      expect(floatApi.get).toHaveBeenCalledWith('/people');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(peopleTool.listPeople()).rejects.toThrow('API Error');
    });
  });

  describe('getPerson', () => {
    it('should get person details', async () => {
      const mockPerson: Person = {
        id: '1',
        name: 'Test Person',
        email: 'test@example.com',
        job_title: 'Developer',
        department: 'Engineering',
        contractor: false,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        avatar_url: 'https://example.com/avatar.jpg',
        notes: 'Test person notes',
        people_type_id: '1',
        work_days_hours: 40,
        timezone: 'UTC',
      };

      floatApi.get.mockResolvedValueOnce({ person: mockPerson });

      const result = await peopleTool.getPerson('1');

      expect(result).toEqual(mockPerson);
      expect(floatApi.get).toHaveBeenCalledWith('/people/1');
    });

    it('should handle non-existent person', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Person not found'));

      await expect(peopleTool.getPerson('999')).rejects.toThrow('Person not found');
    });
  });

  describe('createPerson', () => {
    it('should create a new person', async () => {
      const newPerson: Omit<Person, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Person',
        email: 'new@example.com',
        job_title: 'Developer',
        department: 'Engineering',
        contractor: false,
        active: true,
        avatar_url: 'https://example.com/avatar.jpg',
        notes: 'New person notes',
        people_type_id: '1',
        work_days_hours: 40,
        timezone: 'UTC',
      };

      const mockResponse: Person = {
        id: '1',
        ...newPerson,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      floatApi.post.mockResolvedValueOnce({ person: mockResponse });

      const result = await peopleTool.createPerson(newPerson);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/people', newPerson);
    });

    it('should handle validation errors', async () => {
      const invalidPerson = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        active: true,
      };

      await expect(peopleTool.createPerson(invalidPerson)).rejects.toThrow();
    });
  });

  describe('updatePerson', () => {
    it('should update an existing person', async () => {
      const updateData = {
        name: 'Updated Person',
      };

      const mockResponse: Person = {
        id: '1',
        name: 'Updated Person',
        email: 'test@example.com',
        job_title: 'Developer',
        department: 'Engineering',
        contractor: false,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        avatar_url: 'https://example.com/avatar.jpg',
        notes: 'Test person notes',
        people_type_id: '1',
        work_days_hours: 40,
        timezone: 'UTC',
      };

      floatApi.put.mockResolvedValueOnce({ person: mockResponse });

      const result = await peopleTool.updatePerson('1', updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/people/1', updateData);
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(peopleTool.updatePerson('1', { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deletePerson', () => {
    it('should delete a person', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await peopleTool.deletePerson('1');

      expect(floatApi.delete).toHaveBeenCalledWith('/people/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(peopleTool.deletePerson('1')).rejects.toThrow('Delete failed');
    });
  });
});
