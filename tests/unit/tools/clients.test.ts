import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ClientsTool } from '../../../src/tools/clients';
import { Client } from '../../../src/types/float';

jest.mock('../../../src/services/float-api.js', () => ({
  floatApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ClientsTool', () => {
  let clientsTool: ClientsTool;

  beforeEach(() => {
    clientsTool = new ClientsTool();
  });

  describe('listClients', () => {
    it('should list all clients', async () => {
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Test Client',
          notes: 'Test Notes',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      floatApi.get.mockResolvedValueOnce({ clients: mockClients });

      const result = await clientsTool.listClients();

      expect(result).toEqual(mockClients);
      expect(floatApi.get).toHaveBeenCalledWith('/clients');
    });

    it('should handle API errors', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(clientsTool.listClients()).rejects.toThrow('API Error');
    });
  });

  describe('getClient', () => {
    it('should get client details', async () => {
      const mockClient: Client = {
        id: '1',
        name: 'Test Client',
        notes: 'Test Notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.get.mockResolvedValueOnce({ client: mockClient });

      const result = await clientsTool.getClient('1');

      expect(result).toEqual(mockClient);
      expect(floatApi.get).toHaveBeenCalledWith('/clients/1');
    });

    it('should handle non-existent client', async () => {
      floatApi.get.mockRejectedValueOnce(new Error('Client not found'));

      await expect(clientsTool.getClient('999')).rejects.toThrow('Client not found');
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const newClient: Omit<Client, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Client',
        notes: 'New Notes',
      };

      const mockResponse: Client = {
        id: '1',
        ...newClient,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.post.mockResolvedValueOnce({ client: mockResponse });

      const result = await clientsTool.createClient(newClient);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/clients', newClient);
    });

    it('should handle validation errors', async () => {
      const invalidClient = {
        name: '', // Invalid: empty name
      };

      await expect(clientsTool.createClient(invalidClient)).rejects.toThrow();
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const updateData = {
        name: 'Updated Client',
      };

      const mockResponse: Client = {
        id: '1',
        name: 'Updated Client',
        notes: 'Test Notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      floatApi.put.mockResolvedValueOnce({ client: mockResponse });

      const result = await clientsTool.updateClient('1', updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/clients/1', updateData);
    });

    it('should handle update errors', async () => {
      floatApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(clientsTool.updateClient('1', { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      floatApi.delete.mockResolvedValueOnce(undefined);

      await clientsTool.deleteClient('1');

      expect(floatApi.delete).toHaveBeenCalledWith('/clients/1');
    });

    it('should handle deletion errors', async () => {
      floatApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(clientsTool.deleteClient('1')).rejects.toThrow('Delete failed');
    });
  });
}); 