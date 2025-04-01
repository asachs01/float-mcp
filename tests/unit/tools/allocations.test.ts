import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { AllocationsTool } from '../../../src/tools/allocations';
import { Allocation } from '../../../src/types/float';

jest.mock('../../../src/services/float-api.js', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AllocationsTool', () => {
  let allocationsTool: AllocationsTool;

  beforeEach(() => {
    allocationsTool = new AllocationsTool();
  });

  describe('listAllocations', () => {
    it('should list all allocations', async () => {
      const mockAllocations: Allocation[] = [
        {
          id: '1',
          project_id: 'p1',
          person_id: 'per1',
          task_id: 't1',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          hours: 40,
          notes: 'Test Notes',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      floatApi.get.mockResolvedValueOnce({ allocations: mockAllocations });

      const result = await allocationsTool.listAllocations();

      expect(result).toEqual(mockAllocations);
      expect(floatApi.get).toHaveBeenCalledWith('/allocations');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(allocationsTool.listAllocations()).rejects.toThrow('API Error');
    });
  });

  describe('getAllocation', () => {
    it('should get allocation details', async () => {
      const mockAllocation: Allocation = {
        id: '1',
        project_id: 'p1',
        person_id: 'per1',
        task_id: 't1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        hours: 40,
        notes: 'Test Notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.get.mockResolvedValueOnce({ allocation: mockAllocation });

      const result = await allocationsTool.getAllocation('1');

      expect(result).toEqual(mockAllocation);
      expect(floatApi.get).toHaveBeenCalledWith('/allocations/1');
    });

    it('should handle non-existent allocation', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Allocation not found'));

      await expect(allocationsTool.getAllocation('999')).rejects.toThrow('Allocation not found');
    });
  });

  describe('createAllocation', () => {
    it('should create a new allocation', async () => {
      const newAllocation: Omit<Allocation, 'id' | 'created_at' | 'updated_at'> = {
        project_id: 'p1',
        person_id: 'per1',
        task_id: 't1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        hours: 40,
        notes: 'Test Notes',
      };

      const mockResponse: Allocation = {
        id: '1',
        ...newAllocation,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.post.mockResolvedValueOnce({ allocation: mockResponse });

      const result = await allocationsTool.createAllocation(newAllocation);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/allocations', newAllocation);
    });

    it('should handle validation errors', async () => {
      const invalidAllocation = {
        project_id: 'p1',
        person_id: 'per1',
        task_id: 't1',
        start_date: '2024-01-01',
        hours: -1, // Invalid: negative hours
      };

      await expect(allocationsTool.createAllocation(invalidAllocation)).rejects.toThrow();
    });
  });

  describe('updateAllocation', () => {
    it('should update an existing allocation', async () => {
      const updateData = {
        hours: 45,
      };

      const mockResponse: Allocation = {
        id: '1',
        project_id: 'p1',
        person_id: 'per1',
        task_id: 't1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        hours: 45,
        notes: 'Test Notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.put.mockResolvedValueOnce({ allocation: mockResponse });

      const result = await allocationsTool.updateAllocation('1', updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/allocations/1', updateData);
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(allocationsTool.updateAllocation('1', { hours: 45 })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAllocation', () => {
    it('should delete an allocation', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await allocationsTool.deleteAllocation('1');

      expect(floatApi.delete).toHaveBeenCalledWith('/allocations/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(allocationsTool.deleteAllocation('1')).rejects.toThrow('Delete failed');
    });
  });
}); 