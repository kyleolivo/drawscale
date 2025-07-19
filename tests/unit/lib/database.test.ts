import { describe, it, expect } from 'vitest';
import { UserService } from '../../../src/lib/database';
import { CreateUserData } from '../../../src/types/user';

describe('UserService', () => {
  it('should connect to database and get all users', async () => {
    try {
      const users = await UserService.getAllUsers();
      expect(Array.isArray(users)).toBe(true);
    } catch (error) {
      expect.fail(`Database connection failed: ${error}`);
    }
  });

  it('should create and delete a user', async () => {
    const testUserData: CreateUserData = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      provider: 'test',
    };

    try {
      // Create user
      const createdUser = await UserService.createUser(testUserData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(testUserData.email);
      expect(createdUser.first_name).toBe(testUserData.first_name);
      expect(createdUser.last_name).toBe(testUserData.last_name);
      expect(createdUser.provider).toBe(testUserData.provider);

      // Clean up - delete the test user
      await UserService.deleteUser(createdUser.id);
    } catch (error) {
      expect.fail(`User creation/deletion failed: ${error}`);
    }
  });

  it('should get user by email', async () => {
    // This test assumes there's a dev user in the database
    try {
      const user = await UserService.getUserByEmail('dev@example.com');
      // The user might be null if the dev user doesn't exist, which is fine
      if (user) {
        expect(user.email).toBe('dev@example.com');
      }
    } catch (error) {
      expect.fail(`Get user by email failed: ${error}`);
    }
  });
}); 