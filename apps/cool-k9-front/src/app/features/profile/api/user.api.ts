import { PaginatedResponse, User, UserDataExport } from '@models';
import { API_BASE_URL } from '@/app/constants/api.constants';
import { getAuthHeaders } from '@/utils/auth-headers.utils';

const API_URL = `${API_BASE_URL}/users`;

export async function apiFetchUsers(params?: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<PaginatedResponse<User>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.perPage != null) query.set('perPage', String(params.perPage));

  const url = query.toString() ? `${API_URL}?${query}` : API_URL;
  const response = await fetch(url, { headers: await getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function apiExportMyData(): Promise<UserDataExport> {
  const response = await fetch(`${API_URL}/me/export`, { headers: await getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to export user data');
  return response.json();
}

export async function apiDeleteMyAccount(): Promise<void> {
  const response = await fetch(`${API_URL}/me`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete account');
}
