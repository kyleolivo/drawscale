# Database Setup Guide

This guide explains how to set up and use the Supabase database functionality for the users table.

## Overview

The database setup includes:
- A `users` table with the exact schema you provided
- TypeScript types for type safety
- A service layer for database operations
- React hooks for easy integration
- Row Level Security (RLS) policies for data protection
- Automatic user creation on signup

## Files Created

### Database Schema & Migration
- `supabase/migrations/20241201000000_create_users_table.sql` - Database migration

### TypeScript Types
- `src/types/user.ts` - Type definitions for User, CreateUserData, UpdateUserData

### Database Service
- `src/lib/database.ts` - UserService class with all CRUD operations

### React Integration
- User management functionality is available through the UserService class

### Testing
- `tests/unit/lib/database.test.ts` - Database connection and functionality tests

## Setup Instructions

### 1. Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run the Migration

If you're using Supabase CLI locally:

```bash
# Start Supabase locally
supabase start

# Apply the migration
supabase db push --local
```

If you're using a remote Supabase project:

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### 3. Test the Connection

You can test the database connection by running:

```bash
# Run the database tests using Vitest
npm test tests/unit/lib/database.test.ts
```

## Usage Examples

### Basic Usage with UserService

```typescript
import { UserService } from './lib/database';

// Create a new user
const newUser = await UserService.createUser({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  provider: 'email'
});

if (newUser) {
  console.log('User created:', newUser);
}
```

### Direct Service Usage

```typescript
import { UserService } from './lib/database';

// Get user by ID
const user = await UserService.getUserById('user-uuid');

// Get user by email
const user = await UserService.getUserByEmail('user@example.com');

// Create a new user
const newUser = await UserService.createUser({
  email: 'newuser@example.com',
  first_name: 'Jane',
  last_name: 'Smith',
  provider: 'google'
});

// Update user
const updatedUser = await UserService.updateUser('user-uuid', {
  first_name: 'Updated Name'
});

// Search users by name
const users = await UserService.searchUsersByName('John');

// Ban/unban users
await UserService.banUser('user-uuid');
await UserService.unbanUser('user-uuid');
```

## Database Schema

The `users` table has the following structure:

```sql
create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  email text null,
  provider text null,
  apple_id_token text null,
  first_name text null,
  last_name text null,
  banhammer boolean null,
  constraint users_pkey primary key (id)
);
```

### Indexes Created
- `users_email_idx` - For fast email lookups
- `users_provider_idx` - For provider-based queries
- `users_apple_id_token_idx` - For Apple ID token lookups
- `users_banhammer_idx` - For ban status queries
- `users_created_at_idx` - For chronological ordering

## Security Features

### Row Level Security (RLS)
- Users can only read and update their own data
- Service role has full access for admin operations
- Automatic user creation on signup via database trigger

### Policies
- `Users can view own data` - Users can only see their own records
- `Users can update own data` - Users can only update their own records
- `Service role can perform all operations` - Admin access for service role

## Available Operations

### UserService Methods
- `getUserById(id)` - Get user by UUID
- `getUserByEmail(email)` - Get user by email address
- `getUserByAppleIdToken(token)` - Get user by Apple ID token
- `createUser(userData)` - Create a new user
- `updateUser(id, userData)` - Update existing user
- `deleteUser(id)` - Delete a user
- `getAllUsers(page, pageSize)` - Get paginated list of users
- `searchUsersByName(searchTerm)` - Search users by name
- `getUsersByProvider(provider)` - Get users by authentication provider
- `getBannedUsers()` - Get all banned users
- `banUser(id)` - Ban a user
- `unbanUser(id)` - Unban a user

### UserService Features
- Full CRUD operations for user management
- Error handling with detailed error messages
- Support for pagination and search
- User ban/unban functionality

## Integration with Existing Auth

The setup includes a database trigger that automatically creates a user record when someone signs up through Supabase Auth. This ensures that every authenticated user has a corresponding record in the `users` table.

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your environment variables are correct
   - Check that your Supabase project is running
   - Ensure the migration has been applied

2. **Permission Errors**
   - Check that RLS policies are correctly configured
   - Verify the user is authenticated when accessing protected data
   - Ensure service role is used for admin operations

3. **Type Errors**
   - Make sure TypeScript is properly configured
   - Check that all type imports are correct

### Testing

Run the database tests to verify everything is working:

```typescript
import { runDatabaseTests } from './src/lib/database.test';

runDatabaseTests().then(success => {
  if (success) {
    console.log('✅ Database setup is working correctly');
  } else {
    console.log('❌ There are issues with the database setup');
  }
});
```

## Next Steps

1. **Customize the schema** - Add additional fields to the users table as needed
2. **Add more tables** - Create additional tables for your application's needs
3. **Implement caching** - Add Redis or similar for frequently accessed data
4. **Add analytics** - Track user activity and usage patterns
5. **Set up monitoring** - Monitor database performance and errors 