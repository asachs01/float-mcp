import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { listPeople, getPerson, createPerson, updatePerson, deletePerson } from '../../../src/tools/people';
import { Person } from '../../../src/types/float';

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

describe('People Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listPeople', () => {
    it('should list people with optional filters', async () => {
      const mockPeople: Person[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          department_id: 'dept1',
          role: 'Developer',
          auto_email: true,
          employee_type: 'employee',
          active: true,
          start_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      (floatApi.get as jest.Mock).mockResolvedValueOnce({ people: mockPeople });

      const result = await listPeople.handler({});

      expect(result).toEqual(mockPeople);
      expect(floatApi.get).toHaveBeenCalledWith('/people?', expect.any(Object));
    });

    it('should handle API errors', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(listPeople.handler({})).rejects.toThrow('API Error');
    });
  });

  describe('getPerson', () => {
    it('should get person details', async () => {
      const mockPerson: Person = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        department_id: 'dept1',
        role: 'Developer',
        auto_email: true,
        employee_type: 'employee',
        active: true,
        start_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.get as jest.Mock).mockResolvedValueOnce(mockPerson);

      const result = await getPerson.handler({ id: '1' });

      expect(result).toEqual(mockPerson);
      expect(floatApi.get).toHaveBeenCalledWith('/people/1', expect.any(Object));
    });

    it('should handle non-existent person', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('Person not found'));

      await expect(getPerson.handler({ id: '999' })).rejects.toThrow('Person not found');
    });
  });

  describe('createPerson', () => {
    it('should create a new person', async () => {
      const newPerson = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        department_id: 'dept1',
        role: 'Designer',
        employee_type: 'employee' as const,
        start_date: '2024-01-01',
      };

      const mockResponse: Person = {
        id: '1',
        ...newPerson,
        auto_email: true,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createPerson.handler(newPerson);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/people', newPerson, expect.any(Object));
    });

    it('should handle validation errors', async () => {
      const invalidPerson = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        employee_type: 'employee',
      };

      await expect(createPerson.handler(invalidPerson)).rejects.toThrow();
    });
  });

  describe('updatePerson', () => {
    it('should update an existing person', async () => {
      const updateData = {
        id: '1',
        name: 'John Smith',
      };

      const mockResponse: Person = {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        department_id: 'dept1',
        role: 'Developer',
        auto_email: true,
        employee_type: 'employee',
        active: true,
        start_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updatePerson.handler(updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/people/1', { name: 'John Smith' }, expect.any(Object));
    });

    it('should handle update errors', async () => {
      (floatApi.put as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await expect(updatePerson.handler({ id: '1', name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deletePerson', () => {
    it('should delete a person', async () => {
      (floatApi.delete as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await deletePerson.handler({ id: '1' });

      expect(result).toEqual({ success: true });
      expect(floatApi.delete).toHaveBeenCalledWith('/people/1');
    });

    it('should handle deletion errors', async () => {
      (floatApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deletePerson.handler({ id: '1' })).rejects.toThrow('Delete failed');
    });
  });
});
