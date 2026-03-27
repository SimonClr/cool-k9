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

export interface UsersPage {
  users: AppUser[];
  total: number;
  page: number;
  perPage: number;
}

export class UserService {
  static async getUsers(params?: {
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<UsersPage> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.perPage != null) query.set('perPage', String(params.perPage));

    const url = query.toString() ? `${API_URL}?${query}` : API_URL;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
}
