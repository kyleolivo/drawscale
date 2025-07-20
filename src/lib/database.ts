import { supabase } from './supabase';
import { User, CreateUserData, UpdateUserData } from '../types/user';

export class UserService {
  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a user by Apple ID token
   */
  static async getUserByAppleIdToken(appleIdToken: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('apple_id_token', appleIdToken)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by Apple ID token:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing user
   */
  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    console.log('Attempting to update user:', { id, userData });
    
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    if (!data) {
      console.error('No user found or updated for ID:', id);
      throw new Error(`User with ID ${id} not found or could not be updated`);
    }

    console.log('Successfully updated user:', data);
    return data;
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users (with optional pagination)
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async getAllUsers(page: number = 0, pageSize: number = 50): Promise<User[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search users by name (first_name or last_name)
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async searchUsersByName(searchTerm: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users by name:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get users by provider
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async getUsersByProvider(provider: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider', provider)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by provider:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get banned users
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async getBannedUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('banhammer', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching banned users:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Ban a user
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async banUser(id: string): Promise<User> {
    return this.updateUser(id, { banhammer: true });
  }

  /**
   * Unban a user
   * Note: This requires admin privileges and should only be used in admin contexts
   */
  static async unbanUser(id: string): Promise<User> {
    return this.updateUser(id, { banhammer: false });
  }
} 