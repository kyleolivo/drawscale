export interface User {
  id: string;
  created_at: string;
  email: string | null;
  provider: string | null;
  apple_id_token: string | null;
  first_name: string | null;
  last_name: string | null;
  banhammer: boolean | null;
}

export interface CreateUserData {
  email?: string;
  provider?: string;
  apple_id_token?: string;
  first_name?: string;
  last_name?: string;
  banhammer?: boolean;
}

export interface UpdateUserData {
  email?: string;
  provider?: string;
  apple_id_token?: string;
  first_name?: string;
  last_name?: string;
  banhammer?: boolean;
}
