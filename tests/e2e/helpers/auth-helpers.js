// Shared authentication helpers for E2E tests

// Helper to create an unauthenticated state
export const setupUnauthenticated = async () => {
  // No special setup needed - the app should show login page by default in E2E environment
};

// Helper to mock Supabase authentication
export const mockAuthentication = async (page) => {
  // For now, let's try using the dev sign in flow instead of mocking
  // We'll click the dev sign in button and mock the Supabase response
  await page.addInitScript(() => {
    if (typeof window.createClient === 'undefined') {
      // Mock Supabase if not available
      window.__mockSupabaseAuth = {
        getSession: () => Promise.resolve({ 
          data: { 
            session: {
              user: {
                id: 'test-user',
                email: 'dev@example.com',
                user_metadata: { full_name: 'Dev User' }
              }
            }
          }, 
          error: null 
        }),
        onAuthStateChange: (callback) => {
          setTimeout(() => callback('SIGNED_IN', {
            user: {
              id: 'test-user',
              email: 'dev@example.com',
              user_metadata: { full_name: 'Dev User' }
            }
          }), 100);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithPassword: () => Promise.resolve({ 
          data: { 
            user: {
              id: 'test-user',
              email: 'dev@example.com',
              user_metadata: { full_name: 'Dev User' }
            },
            session: {
              user: {
                id: 'test-user',
                email: 'dev@example.com',
                user_metadata: { full_name: 'Dev User' }
              }
            }
          }, 
          error: null 
        }),
        signOut: () => Promise.resolve({ error: null })
      };
    }
  });
};