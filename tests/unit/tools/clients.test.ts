import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { listClients, getClient, createClient, updateClient, deleteClient } from '../../../src/tools/clients';
import { Client } from '../../../src/types/float';

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

describe('Clients Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listClients', () => {
    it('should list clients', async () => {
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Test Client',
          contact_email: 'client@example.com',
          contact_name: 'John Client',
          notes: 'Test client notes',
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      (floatApi.get as jest.Mock).mockResolvedValueOnce({ clients: mockClients });

      const result = await listClients.handler({});

      expect(result).toEqual(mockClients);
      expect(floatApi.get).toHaveBeenCalledWith('/clients?', expect.any(Object));
    });

    it('should handle API errors', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(listClients.handler({})).rejects.toThrow('API Error');
    });
  });

  describe('getClient', () => {
    it('should get client details', async () => {
      const mockClient: Client = {
        id: '1',
        name: 'Test Client',
        contact_email: 'client@example.com',
        contact_name: 'John Client',
        notes: 'Test client notes',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.get as jest.Mock).mockResolvedValueOnce(mockClient);

      const result = await getClient.handler({ id: '1' });

      expect(result).toEqual(mockClient);
      expect(floatApi.get).toHaveBeenCalledWith('/clients/1', expect.any(Object));
    });

    it('should handle non-existent client', async () => {
      (floatApi.get as jest.Mock).mockRejectedValueOnce(new Error('Client not found'));

      await expect(getClient.handler({ id: '999' })).rejects.toThrow('Client not found');
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const newClient = {
        name: 'New Client',
        contact_email: 'newclient@example.com',
        contact_name: 'Jane Client',
        notes: 'New client notes',
      };

      const mockResponse: Client = {
        id: '1',
        ...newClient,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createClient.handler(newClient);

      expect(result).toEqual(mockResponse);
      expect(floatApi.post).toHaveBeenCalledWith('/clients', newClient, expect.any(Object));
    });

    it('should handle validation errors', async () => {
      const invalidClient = {
        name: '', // Invalid: empty name
        contact_email: 'invalid-email', // Invalid email format
      };

      await expect(createClient.handler(invalidClient)).rejects.toThrow();
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const updateData = {
        id: '1',
        name: 'Updated Client',
      };

      const mockResponse: Client = {
        id: '1',
        name: 'Updated Client',
        contact_email: 'client@example.com',
        contact_name: 'John Client',
        notes: 'Test client notes',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (floatApi.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateClient.handler(updateData);

      expect(result).toEqual(mockResponse);
      expect(floatApi.put).toHaveBeenCalledWith('/clients/1', { name: 'Updated Client' }, expect.any(Object));
    });

    it('should handle update errors', async () => {
      (floatApi.put as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateClient.handler({ id: '1', name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      (floatApi.delete as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await deleteClient.handler({ id: '1' });

      expect(result).toEqual({ success: true });
      expect(floatApi.delete).toHaveBeenCalledWith('/clients/1');
    });

    it('should handle deletion errors', async () => {
      (floatApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteClient.handler({ id: '1' })).rejects.toThrow('Delete failed');
    });
  });
});
