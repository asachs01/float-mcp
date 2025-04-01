import { BaseTool } from './base.js';
import { Allocation, allocationSchema, AllocationsResponse } from '../types/float.js';

export class AllocationsTool extends BaseTool {
  async listAllocations(): Promise<Allocation[]> {
    try {
      const response = await this.api.get<AllocationsResponse>('/allocations');
      return response.allocations;
    } catch (error) {
      this.logger.error('Error in list-allocations tool:', error);
      throw error;
    }
  }

  async getAllocation(id: string): Promise<Allocation> {
    try {
      const response = await this.api.get<{ allocation: Allocation }>(`/allocations/${id}`);
      return response.allocation;
    } catch (error) {
      this.logger.error('Error in get-allocation tool:', error);
      throw error;
    }
  }

  async createAllocation(data: Omit<Allocation, 'id' | 'created_at' | 'updated_at'>): Promise<Allocation> {
    try {
      const validatedData = allocationSchema.omit({ id: true, created_at: true, updated_at: true }).parse(data);
      const response = await this.api.post<{ allocation: Allocation }>('/allocations', validatedData);
      return response.allocation;
    } catch (error) {
      this.logger.error('Error in create-allocation tool:', error);
      throw error;
    }
  }

  async updateAllocation(id: string, data: Partial<Omit<Allocation, 'id' | 'created_at' | 'updated_at'>>): Promise<Allocation> {
    try {
      const validatedData = allocationSchema.omit({ id: true, created_at: true, updated_at: true }).partial().parse(data);
      const response = await this.api.put<{ allocation: Allocation }>(`/allocations/${id}`, validatedData);
      return response.allocation;
    } catch (error) {
      this.logger.error('Error in update-allocation tool:', error);
      throw error;
    }
  }

  async deleteAllocation(id: string): Promise<void> {
    try {
      await this.api.delete(`/allocations/${id}`);
    } catch (error) {
      this.logger.error('Error in delete-allocation tool:', error);
      throw error;
    }
  }
} 