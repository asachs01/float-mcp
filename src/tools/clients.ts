import { BaseTool } from './base.js';
import { Client, clientSchema, ClientsResponse } from '../types/float.js';

export class ClientsTool extends BaseTool {
  async listClients(): Promise<Client[]> {
    try {
      const response = await this.api.get<ClientsResponse>('/clients');
      return response.clients;
    } catch (error) {
      this.logger.error('Error in list-clients tool:', error);
      throw error;
    }
  }

  async getClient(id: string): Promise<Client> {
    try {
      const response = await this.api.get<{ client: Client }>(`/clients/${id}`);
      return response.client;
    } catch (error) {
      this.logger.error('Error in get-client tool:', error);
      throw error;
    }
  }

  async createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    try {
      const validatedData = clientSchema.omit({ id: true, created_at: true, updated_at: true }).parse(data);
      const response = await this.api.post<{ client: Client }>('/clients', validatedData);
      return response.client;
    } catch (error) {
      this.logger.error('Error in create-client tool:', error);
      throw error;
    }
  }

  async updateClient(id: string, data: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> {
    try {
      const validatedData = clientSchema.omit({ id: true, created_at: true, updated_at: true }).partial().parse(data);
      const response = await this.api.put<{ client: Client }>(`/clients/${id}`, validatedData);
      return response.client;
    } catch (error) {
      this.logger.error('Error in update-client tool:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await this.api.delete(`/clients/${id}`);
    } catch (error) {
      this.logger.error('Error in delete-client tool:', error);
      throw error;
    }
  }
} 