import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { listAllocations, getAllocation, createAllocation, updateAllocation, deleteAllocation } from '../../../src/tools/allocations';
import { Allocation } from '../../../src/types/float';

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

describe('Allocations Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllocations', () => {
    it('should list allocations with optional filters', async () => {
      const mockAllocations: Allocation[] = [
        {
          id: '1',
          person_id: 'person1',
          project_id: 'project1',
          task_id: 'task1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          hours_per_day: 8,
          notes: 'Test allocation notes',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      (floatApi.get as jest.Mock).mockResolvedValueOnce({ allocations: mockAllocations });

      const result = await listAllocations.handler({});

      expect(result).toEqual(mockAllocations);
      expect(floatApi.get).toHaveBeenCalledWith('/allocations?', expect.any(Object));
    });

    it('should handle API errors', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(listAllocations.handler({})).rejects.toThrow('API Error');
    });
  });

  describe('getAllocation', () => {
    it('should get allocation details', async () => {
      const mockAllocation: Allocation = {
        id: '1',
        person_id: 'person1',
        project_id: 'project1',
        task_id: 'task1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        hours_per_day: 8,
        notes: 'Test allocation notes',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.get as jest.Mock).mockResolvedValueOnce(mockAllocation);

      const result = await getAllocation.handler({ id: '1' });

      expect(result).toEqual(mockAllocation);
      expect(floatApi.get).toHaveBeenCalledWith('/allocations/1', expect.any(Object));
    });

    it('should handle non-existent allocation', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('Allocation not found'));

      await expect(getAllocation.handler({ id: '999' })).rejects.toThrow('Allocation not found');
    });
  });

  describe('createAllocation', () => {
    it('should create a new allocation', async () => {
      const newAllocation = {
        person_id: 'person1',
        project_id: 'project1',
        task_id: 'task1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        hours_per_day: 8,
        notes: 'New allocation notes',
      };

      const mockResponse: Allocation = {
        id: '1',
        ...newAllocation,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createAllocation.handler(newAllocation);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/allocations', newAllocation, expect.any(Object));
    });

    it('should handle validation errors', async () => {
      const invalidAllocation = {
        person_id: '', // Invalid: empty person_id
        project_id: 'project1',
        start_date: '2024-01-01',
      };

      await expect(createAllocation.handler(invalidAllocation)).rejects.toThrow();
    });
  });

  describe('updateAllocation', () => {
    it('should update an existing allocation', async () => {
      const updateData = {
        id: '1',
        hours_per_day: 6,
      };

      const mockResponse: Allocation = {
        id: '1',
        person_id: 'person1',
        project_id: 'project1',
        task_id: 'task1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        hours_per_day: 6,
        notes: 'Test allocation notes',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateAllocation.handler(updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/allocations/1', { hours_per_day: 6 }, expect.any(Object));
    });

    it('should handle update errors', async () => {
      (floatApi.put as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateAllocation.handler({ id: '1', hours_per_day: 4 })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAllocation', () => {
    it('should delete an allocation', async () => {
      (floatApi.delete as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await deleteAllocation.handler({ id: '1' });

      expect(result).toEqual({ success: true });
      expect(floatApi.delete).toHaveBeenCalledWith('/allocations/1');
    });

    it('should handle deletion errors', async () => {
      (floatApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteAllocation.handler({ id: '1' })).rejects.toThrow('Delete failed');
    });
  });
});
