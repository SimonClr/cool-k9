import { supabase } from '@authentication';

const API_URL = 'http://localhost:3000/api/users';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class UserService {
  static async getUsers(): Promise<AppUser[]> {
    const response = await fetch(API_URL, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
}
