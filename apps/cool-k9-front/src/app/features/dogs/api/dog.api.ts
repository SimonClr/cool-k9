import { Dog } from '@models';
import { API_BASE_URL } from '@/app/constants/api.constants';
import { getAuthHeaders } from '@/utils/auth-headers.utils';

const API_URL = `${API_BASE_URL}/dogs`;

export async function apiFetchDogs(userId?: string): Promise<Dog[]> {
  const url = userId ? `${API_URL}?userId=${encodeURIComponent(userId)}` : API_URL;
  const response = await fetch(url, { headers: await getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch dogs');
  return response.json();
}

export async function apiCreateDog(name: string, birthDate: string): Promise<Dog> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: JSON.stringify({ name, birthDate }),
  });
  if (!response.ok) throw new Error('Failed to create dog');
  return response.json();
}

export async function apiUpdateDog(id: string, name: string, birthDate: string): Promise<Dog> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: JSON.stringify({ name, birthDate }),
  });
  if (!response.ok) throw new Error('Failed to update dog');
  return response.json();
}
