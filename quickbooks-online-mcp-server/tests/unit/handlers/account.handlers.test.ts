import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockQuickbooksClient, mockQuickBooksInstance, resetAllMocks } from '../../mocks/quickbooks.mock';

jest.unstable_mockModule('../../../src/clients/quickbooks-client', () => ({
  quickbooksClient: mockQuickbooksClient,
}));

const { createQuickbooksAccount } = await import('../../../src/handlers/create-quickbooks-account.handler');
const { getQuickbooksAccount } = await import('../../../src/handlers/get-quickbooks-account.handler');
const { updateQuickbooksAccount } = await import('../../../src/handlers/update-quickbooks-account.handler');
const { searchQuickbooksAccounts } = await import('../../../src/handlers/search-quickbooks-accounts.handler');

describe('Account Handlers', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createQuickbooksAccount', () => {
    it('should create an account successfully', async () => {
      const mockAccount = { Id: '1', Name: 'Office Supplies', AccountType: 'Expense' };
      mockQuickBooksInstance.createAccount.mockImplementation((_payload: any, cb: any) => cb(null, mockAccount));

      const result = await createQuickbooksAccount({ name: 'Office Supplies', type: 'Expense' });

      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccount);
    });

    it('should create an account with optional fields', async () => {
      const mockAccount = { Id: '2', Name: 'Checking', AccountType: 'Bank', AccountSubType: 'Checking', Description: 'Main account' };
      mockQuickBooksInstance.createAccount.mockImplementation((_payload: any, cb: any) => cb(null, mockAccount));

      const result = await createQuickbooksAccount({
        name: 'Checking',
        type: 'Bank',
        sub_type: 'Checking',
        description: 'Main account',
      });

      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccount);
    });

    it('should normalize field types in the payload', async () => {
      let capturedPayload: any;
      mockQuickBooksInstance.createAccount.mockImplementation((payload: any, cb: any) => {
        capturedPayload = payload;
        cb(null, { Id: '3' });
      });

      await createQuickbooksAccount({ name: 'Test', type: 'Expense' });

      expect(typeof capturedPayload.Name).toBe('string');
      expect(typeof capturedPayload.AccountType).toBe('string');
    });

    it('should handle API errors', async () => {
      mockQuickBooksInstance.createAccount.mockImplementation((_payload: any, cb: any) =>
        cb(new Error('Duplicate name'), null)
      );

      const result = await createQuickbooksAccount({ name: 'Office Supplies', type: 'Expense' });

      expect(result.isError).toBe(true);
    });

    it('should handle authentication errors', async () => {
      (mockQuickbooksClient.authenticate as any).mockRejectedValue(new Error('Auth failed'));

      const result = await createQuickbooksAccount({ name: 'Office Supplies', type: 'Expense' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Error: Auth failed');
    });
  });

  describe('getQuickbooksAccount', () => {
    it('should get an account by ID', async () => {
      const mockAccount = { Id: '1', Name: 'Office Supplies', AccountType: 'Expense' };
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) => cb(null, mockAccount));

      const result = await getQuickbooksAccount('1');

      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccount);
    });

    it('should handle API errors', async () => {
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) =>
        cb(new Error('Not found'), null)
      );

      const result = await getQuickbooksAccount('999');

      expect(result.isError).toBe(true);
    });

    it('should handle authentication errors', async () => {
      (mockQuickbooksClient.authenticate as any).mockRejectedValue(new Error('Auth failed'));

      const result = await getQuickbooksAccount('1');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Error: Auth failed');
    });
  });

  describe('updateQuickbooksAccount', () => {
    it('should update an account', async () => {
      const mockExisting = { Id: '1', Name: 'Old Name', AccountType: 'Expense', SyncToken: '0' };
      const mockUpdated = { Id: '1', Name: 'New Name', AccountType: 'Expense', SyncToken: '1' };
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) => cb(null, mockExisting));
      mockQuickBooksInstance.updateAccount.mockImplementation((_payload: any, cb: any) => cb(null, mockUpdated));

      const result = await updateQuickbooksAccount({ account_id: '1', patch: { Name: 'New Name' } });

      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockUpdated);
    });

    it('should merge existing fields with the patch', async () => {
      const mockExisting = { Id: '1', Name: 'Old Name', AccountType: 'Expense', SyncToken: '0' };
      let capturedPayload: any;
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) => cb(null, mockExisting));
      mockQuickBooksInstance.updateAccount.mockImplementation((payload: any, cb: any) => {
        capturedPayload = payload;
        cb(null, { Id: '1' });
      });

      await updateQuickbooksAccount({ account_id: '1', patch: { Name: 'New Name' } });

      expect(capturedPayload.AccountType).toBe('Expense');
      expect(capturedPayload.Name).toBe('New Name');
      expect(capturedPayload.sparse).toBe(true);
    });

    it('should normalize boolean values in patch', async () => {
      const mockExisting = { Id: '1', Name: 'Test', AccountType: 'Expense', SyncToken: '0' };
      let capturedPayload: any;
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) => cb(null, mockExisting));
      mockQuickBooksInstance.updateAccount.mockImplementation((payload: any, cb: any) => {
        capturedPayload = payload;
        cb(null, { Id: '1' });
      });

      await updateQuickbooksAccount({ account_id: '1', patch: { Active: 'false' } });

      expect(capturedPayload.Active).toBe(false);
    });

    it('should handle getAccount errors', async () => {
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) =>
        cb(new Error('Not found'), null)
      );

      const result = await updateQuickbooksAccount({ account_id: '999', patch: { Name: 'Test' } });

      expect(result.isError).toBe(true);
    });

    it('should handle updateAccount API errors', async () => {
      const mockExisting = { Id: '1', Name: 'Test', AccountType: 'Expense', SyncToken: '0' };
      mockQuickBooksInstance.getAccount.mockImplementation((_id: any, cb: any) => cb(null, mockExisting));
      mockQuickBooksInstance.updateAccount.mockImplementation((_payload: any, cb: any) =>
        cb(new Error('Update failed'), null)
      );

      const result = await updateQuickbooksAccount({ account_id: '1', patch: { Name: 'New Name' } });

      expect(result.isError).toBe(true);
    });

    it('should handle authentication errors', async () => {
      (mockQuickbooksClient.authenticate as any).mockRejectedValue(new Error('Auth failed'));

      const result = await updateQuickbooksAccount({ account_id: '1', patch: { Name: 'New Name' } });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Error: Auth failed');
    });
  });

  describe('searchQuickbooksAccounts', () => {
    it('should search accounts', async () => {
      const mockAccounts = [
        { Id: '1', Name: 'Office Supplies', AccountType: 'Expense' },
        { Id: '2', Name: 'Checking', AccountType: 'Bank' },
      ];
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(null, { QueryResponse: { Account: mockAccounts } })
      );

      const result = await searchQuickbooksAccounts({});

      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccounts);
    });

    it('should search with array criteria', async () => {
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(null, { QueryResponse: { Account: [{ Id: '1', Name: 'Checking' }] } })
      );

      const result = await searchQuickbooksAccounts([
        { field: 'AccountType', value: 'Bank', operator: '=' },
      ]);

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(1);
    });

    it('should use default empty criteria when none provided', async () => {
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(null, { QueryResponse: { Account: [] } })
      );

      const result = await searchQuickbooksAccounts();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should return totalCount for count queries', async () => {
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(null, { QueryResponse: { totalCount: 42 } })
      );

      const result = await searchQuickbooksAccounts({});

      expect(result.isError).toBe(false);
      expect(result.result).toBe(42);
    });

    it('should handle empty QueryResponse', async () => {
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(null, { QueryResponse: {} })
      );

      const result = await searchQuickbooksAccounts({});

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockQuickBooksInstance.findAccounts.mockImplementation((_criteria: any, cb: any) =>
        cb(new Error('Search failed'), null)
      );

      const result = await searchQuickbooksAccounts({});

      expect(result.isError).toBe(true);
    });

    it('should handle authentication errors', async () => {
      (mockQuickbooksClient.authenticate as any).mockRejectedValue(new Error('Auth failed'));

      const result = await searchQuickbooksAccounts({});

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Error: Auth failed');
    });
  });
});
